import { useEffect, useState, useCallback } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMonthToDateReport,
  getMonthlyReport,
} from "../services/reportService";
import {
  getTodayDate,
  formatDate,
  SLOT_LABELS,
  getGlucoseStatus,
} from "../utils/glucoseUtils";
import { downloadGlucoseReportPDF } from "../utils/pdfGenerator";
import StatCard from "../components/dashboard/StatCard";
import MonthlyGlucoseChart from "../components/charts/MonthlyGlucoseChart";
import CustomSelect from "../components/common/CustomSelect";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

function getRecentMonths(count = 4) {
  const months = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth() - i, 1));
    const yearMonth = d.toISOString().slice(0, 7);
    const label = new Intl.DateTimeFormat("en-IN", {
      timeZone: "UTC",
      month: "short",
      year: "numeric",
    }).format(d);
    months.push({
      value: yearMonth,
      label,
      subtitle: i === 0 ? "Current" : i === 1 ? "Previous" : "",
    });
  }
  return months;
}

export default function MonthlyReports() {
  const { token, user } = useAuth();
  const outletContext = useOutletContext();
  const refreshTrigger = outletContext?.refreshTrigger || 0;

  const [mode, setMode] = useState("monthly"); // 'monthly' (Month-wise) | 'month-to-date' | 'previous-month'
  const [selectedMonth, setSelectedMonth] = useState(getTodayDate().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const fetchMonthlyReport = useCallback(
    async (currentMode, dateVal, monthVal) => {
      if (!token) return;
      try {
        setLoading(true);
        setError("");

        let response;
        if (currentMode === "month-to-date") {
          response = await getMonthToDateReport(dateVal, token);
        } else if (currentMode === "previous-month") {
          response = await getMonthlyReport(dateVal, token, "previous");
        } else {
          // 'monthly' -> Month-wise for selected month
          response = await getMonthlyReport(monthVal, token, "selected");
        }
        setReport(response.data);
      } catch (err) {
        setError(err.message || "Failed to retrieve monthly report.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchMonthlyReport(mode, selectedDate, selectedMonth);
  }, [fetchMonthlyReport, mode, selectedDate, selectedMonth, refreshTrigger]);

  function handleQuickDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
  }

  async function handleDownloadPDF() {
    try {
      setDownloadingPdf(true);
      setDownloadError("");

      let readingsData = report?.readings;
      let periodData = report?.period;
      const targetParam = mode === "monthly" ? selectedMonth : selectedDate;

      if (!report) {
        let response;
        if (mode === "month-to-date") {
          response = await getMonthToDateReport(targetParam, token);
        } else if (mode === "previous-month") {
          response = await getMonthlyReport(targetParam, token, "previous");
        } else {
          response = await getMonthlyReport(targetParam, token, "selected");
        }
        readingsData = response.data?.readings || [];
        periodData = response.data?.period;
      }

      await downloadGlucoseReportPDF({
        reportType: mode === "previous-month" ? "previous-month" : mode,
        selectedDate: targetParam,
        readings: readingsData || [],
        period: periodData,
        userName: user?.name || user?.email || "Sweety User",
      });
    } catch (err) {
      setDownloadError(
        err.message || "Failed to generate Report PDF."
      );
    } finally {
      setDownloadingPdf(false);
    }
  }

  const statistics = report?.statistics || {
    highest: null,
    lowest: null,
    average: null,
    count: 0,
  };

  const readings = report?.readings || [];
  const period = report?.period;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1B4F] tracking-tight">
            Monthly Glucose Reports
          </h2>
          <p className="text-xs sm:text-sm text-[#556987] mt-1">
            Longitudinal trend analysis and monthly blood sugar stability
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={handleDownloadPDF}
            disabled={downloadingPdf || loading}
            icon={
              downloadingPdf ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )
            }
          >
            {downloadingPdf ? "Generating PDF..." : "Download PDF"}
          </Button>

          <Link to="/daily-reports">
            <Button variant="outline" size="md">
              Daily Report
            </Button>
          </Link>
        </div>
      </div>

      {/* PDF Download Error Banner */}
      {downloadError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{downloadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadError("")}
            className="text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mode & Date Controls */}
      <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          {/* Report Horizon Dropdown */}
          <div className="w-full sm:max-w-xs">
            <CustomSelect
              label="Report Horizon"
              id="reportMode"
              name="reportMode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={[
                { value: "monthly", label: "Monthly (Select Month)" },
                { value: "month-to-date", label: "Month-to-Date (Current)" },
                { value: "previous-month", label: "Previous Calendar Month" },
              ]}
              icon={
                <svg className="w-4 h-4 text-[#0A387E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>

          {/* Month or Date Picker depending on Mode */}
          {mode === "monthly" ? (
            <div className="w-full sm:max-w-xs">
              <Input
                label="Select Month"
                id="selectedMonth"
                type="month"
                value={selectedMonth}
                max={getTodayDate().slice(0, 7)}
                onChange={(e) => setSelectedMonth(e.target.value)}
                helperText="Select any calendar month to view full report"
                icon={
                  <svg className="w-4 h-4 text-[#0A387E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>
          ) : (
            <div className="w-full sm:max-w-xs">
              <Input
                label="Reference Date"
                id="selectedDate"
                type="date"
                value={selectedDate}
                max={getTodayDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
                helperText="Determines the target reporting window"
                icon={
                  <svg className="w-4 h-4 text-[#0A387E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>
          )}
        </div>

        {/* Quick Month / Date Pills */}
        <div className="mt-4 pt-3.5 border-t border-[#EEF4FA] flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#8598B0] mr-1">
            Jump to:
          </span>
          {mode === "monthly" ? (
            getRecentMonths().map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setSelectedMonth(m.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedMonth === m.value
                    ? "bg-[#0A387E] text-white shadow-xs"
                    : "bg-[#F0F6FC] text-[#556987] hover:bg-[#E2EDF9] hover:text-[#0B1B4F]"
                }`}
              >
                {m.label} {m.subtitle ? `(${m.subtitle})` : ""}
              </button>
            ))
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleQuickDate(0)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === getTodayDate()
                    ? "bg-[#0A387E] text-white shadow-xs"
                    : "bg-[#F0F6FC] text-[#556987] hover:bg-[#E2EDF9] hover:text-[#0B1B4F]"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(1)}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#F0F6FC] text-[#556987] hover:bg-[#E2EDF9] hover:text-[#0B1B4F] transition-all cursor-pointer"
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(2)}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#F0F6FC] text-[#556987] hover:bg-[#E2EDF9] hover:text-[#0B1B4F] transition-all cursor-pointer"
              >
                2 Days Ago
              </button>
            </>
          )}
        </div>

        {/* Reporting Period Chip */}
        {period && (
          <div className="mt-3.5 pt-3 border-t border-[#EEF4FA] flex items-center gap-2 text-xs text-[#556987]">
            <span className="font-semibold text-[#0B1B4F]">Active Interval:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F0F6FC] font-medium text-[#0A387E] border border-[#D5E8F8]">
              {formatDate(period.start_date)} — {formatDate(period.end_date)}
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Monthly report error"
          message={error}
          onRetry={() => fetchMonthlyReport(mode, selectedDate)}
        />
      )}

      {/* Loading */}
      {loading ? (
        <LoadingSpinner message="Calculating monthly health metrics..." />
      ) : (
        <>
          {/* Monthly Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard
              title="Total Monthly Readings"
              value={statistics.count}
              unit="readings"
              colorScheme="emerald"
              badgeText={`${statistics.count} measurements`}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <StatCard
              title="Monthly Average"
              value={statistics.average}
              colorScheme="blue"
              badgeText={statistics.average ? "Target: 70–140 mg/dL" : "No readings"}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />

            <StatCard
              title="Monthly Peak"
              value={statistics.highest}
              colorScheme="amber"
              badgeText={statistics.highest ? "Maximum recorded" : "No readings"}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />

            <StatCard
              title="Monthly Low"
              value={statistics.lowest}
              colorScheme="cyan"
              badgeText={statistics.lowest ? "Minimum recorded" : "No readings"}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              }
            />
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#EEF4FA]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B1B4F]">
                  Monthly Glucose Progression
                </h3>
                <p className="text-xs sm:text-[13px] text-[#556987]">
                  All recorded readings across the selected interval with average baseline
                </p>
              </div>

              {statistics.average && (
                <span className="text-xs font-bold text-[#0A387E] bg-[#EAF4FE] px-3 py-1 rounded-full border border-[#BFD9EE]">
                  Avg: {statistics.average} mg/dL
                </span>
              )}
            </div>

            <MonthlyGlucoseChart readings={readings} average={statistics.average} />
          </div>

          {/* Detailed Readings History for the Month */}
          <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#EEF4FA]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B1B4F]">
                  Monthly Log History ({readings.length} Total)
                </h3>
                <p className="text-xs sm:text-[13px] text-[#556987]">
                  Complete list of readings captured during this period
                </p>
              </div>
            </div>

            {readings.length === 0 ? (
              <EmptyState
                title="No readings found for this month"
                description="There are no blood glucose records matching the selected monthly interval."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#EEF4FA] text-[11px] font-bold text-[#8598B0] uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Glucose Value</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF4FA]">
                    {readings.map((reading) => {
                      const status = getGlucoseStatus(
                        reading.glucose_value,
                        reading.time_slot
                      );
                      return (
                        <tr
                          key={reading.id}
                          className="hover:bg-[#F8FBFE] transition-colors"
                        >
                          <td className="py-3 px-4 whitespace-nowrap text-sm font-bold text-[#0B1B4F]">
                            {formatDate(reading.reading_date, {
                              includeWeekday: true,
                            })}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-sm text-[#556987]">
                            {SLOT_LABELS[reading.time_slot] ||
                              reading.time_slot}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap font-extrabold text-[#0A387E]">
                            {reading.glucose_value}{" "}
                            <span className="text-xs text-[#8598B0] font-normal">
                              mg/dL
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${status.badgeClass}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}
                              />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

