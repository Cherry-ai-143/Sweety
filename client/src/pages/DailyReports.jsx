import { useEffect, useState, useCallback } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDailyReport } from "../services/reportService";
import {
  getTodayDate,
  formatDate,
  SLOT_LABELS,
  getGlucoseStatus,
} from "../utils/glucoseUtils";
import StatCard from "../components/dashboard/StatCard";
import DailyGlucoseChart from "../components/charts/DailyGlucoseChart";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import ReadingModal from "../components/readings/ReadingModal";

export default function DailyReports() {
  const { token } = useAuth();
  const outletContext = useOutletContext();
  const refreshTrigger = outletContext?.refreshTrigger || 0;

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchDailyReport = useCallback(
    async (dateToFetch) => {
      if (!token) return;
      try {
        setLoading(true);
        setError("");
        const response = await getDailyReport(dateToFetch, token);
        setReport(response.data);
      } catch (err) {
        setError(err.message || "Failed to retrieve daily report.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchDailyReport(selectedDate);
  }, [fetchDailyReport, selectedDate, refreshTrigger]);

  function handleDateChange(e) {
    setSelectedDate(e.target.value);
  }

  function handleQuickDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
  }

  const statistics = report?.statistics || {
    highest: null,
    lowest: null,
    average: null,
    count: 0,
  };

  const readings = report?.readings || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1B4F] tracking-tight">
            Daily Glucose Report
          </h2>
          <p className="text-xs sm:text-sm text-[#556987] mt-1">
            Detailed 24-hour glucose monitoring and slot distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/monthly-reports">
            <Button variant="outline" size="md">
              Switch to Monthly Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Date Selector Card with Quick Shortcuts */}
      <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="w-full max-w-xs">
            <Input
              label="Selected Report Date"
              id="reportDate"
              type="date"
              value={selectedDate}
              max={getTodayDate()}
              onChange={handleDateChange}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>

          {/* Quick Date Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#8598B0] mr-1">
              Jump to:
            </span>
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
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load daily report"
          message={error}
          onRetry={() => fetchDailyReport(selectedDate)}
        />
      )}

      {/* Loading */}
      {loading ? (
        <LoadingSpinner message="Generating daily glucose report..." />
      ) : (
        <>
          {/* Daily Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard
              title="Daily Highest"
              value={statistics.highest}
              colorScheme="amber"
              badgeText={statistics.highest ? "Peak measurement" : "None"}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />

            <StatCard
              title="Daily Lowest"
              value={statistics.lowest}
              colorScheme="cyan"
              badgeText={statistics.lowest ? "Minimum measurement" : "None"}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              }
            />

            <StatCard
              title="Daily Average"
              value={statistics.average}
              colorScheme="blue"
              badgeText={statistics.average ? "Target: 70–140 mg/dL" : "None"}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />

            <StatCard
              title="Logged Readings"
              value={statistics.count}
              unit="of 4 slots"
              colorScheme="emerald"
              badgeText={`${statistics.count} / 4 slots logged`}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Daily Glucose Chart */}
          <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#EEF4FA]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B1B4F]">
                  24-Hour Glucose Curve
                </h3>
                <p className="text-xs sm:text-[13px] text-[#556987]">
                  Glucose progression for {formatDate(selectedDate, { includeWeekday: true })}
                </p>
              </div>

              {readings.length > 0 && (
                <span className="text-xs font-bold text-[#0A387E] bg-[#EAF4FE] px-3 py-1 rounded-full border border-[#BFD9EE]">
                  {readings.length} Slot{readings.length > 1 ? "s" : ""} Recorded
                </span>
              )}
            </div>

            <DailyGlucoseChart readings={readings} />
          </div>

          {/* Detailed Readings Table */}
          <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#EEF4FA]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B1B4F]">
                  Slot Breakdown for {formatDate(selectedDate)}
                </h3>
                <p className="text-xs sm:text-[13px] text-[#556987]">
                  Measurement times, raw values, and medical classifications
                </p>
              </div>

              {readings.length < 4 && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setAddModalOpen(true)}
                  icon={
                    <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Log Missing Slot
                </Button>
              )}
            </div>

            {readings.length === 0 ? (
              <EmptyState
                title={`No readings recorded for ${formatDate(selectedDate)}`}
                description="You haven't logged any blood glucose readings for this date yet."
                actionLabel="Log a Reading for this Date"
                onAction={() => setAddModalOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#EEF4FA] text-[11px] font-bold text-[#8598B0] uppercase tracking-wider">
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Glucose Level</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Clinical Guidance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF4FA]">
                    {readings.map((reading) => {
                      const status = getGlucoseStatus(
                        reading.glucose_value,
                        reading.time_slot
                      );
                      const isFasting = reading.time_slot === "MORNING";
                      return (
                        <tr
                          key={reading.id}
                          className="hover:bg-[#F8FBFE] transition-colors"
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-[#0B1B4F]">
                              {SLOT_LABELS[reading.time_slot] ||
                                reading.time_slot}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-base font-extrabold text-[#0A387E]">
                              {reading.glucose_value}
                            </span>
                            <span className="text-xs text-[#8598B0] ml-1.5 font-medium">
                              mg/dL
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.badgeClass}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}
                              />
                              {status.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-xs text-[#556987]">
                            {isFasting
                              ? "Fasting target is 70–99 mg/dL."
                              : "Post-prandial target is < 140 mg/dL."}
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

      {/* Reading Modal to easily log directly from the report */}
      <ReadingModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        initialData={{ reading_date: selectedDate }}
        onSaved={() => fetchDailyReport(selectedDate)}
      />
    </div>
  );
}

