import { useEffect, useState, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDailyReport } from "../services/reportService";
import { getReadings } from "../services/readingService";
import {
  getTodayDate,
  formatDate,
  SLOT_LABELS,
  getGlucoseStatus,
} from "../utils/glucoseUtils";
import StatCard from "../components/dashboard/StatCard";
import DailyGlucoseChart from "../components/charts/DailyGlucoseChart";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import ReadingModal from "../components/readings/ReadingModal";

export default function Dashboard() {
  const { user, token } = useAuth();
  const outletContext = useOutletContext();
  const refreshTrigger = outletContext?.refreshTrigger || 0;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todayReport, setTodayReport] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const todayStr = getTodayDate();

  // Determine greeting by time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");

      const [reportRes, readingsRes] = await Promise.all([
        getDailyReport(todayStr, token),
        getReadings(token),
      ]);

      setTodayReport(reportRes.data);

      const allReadings = readingsRes.data || [];
      const sorted = [...allReadings].sort(
        (a, b) => new Date(b.reading_date) - new Date(a.reading_date)
      );
      setRecentReadings(sorted.slice(0, 5));
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token, todayStr]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshTrigger]);

  const stats = todayReport?.statistics || {
    highest: null,
    lowest: null,
    average: null,
    count: 0,
  };

  const todayReadings = todayReport?.readings || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-r from-[#0A387E] via-[#09489E] to-[#0A387E] text-white p-6 sm:p-8 shadow-[0_15px_40px_rgba(10,56,126,0.18)]">
        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-xl" />
        <div className="absolute right-32 bottom-0 -mb-12 w-48 h-48 rounded-full bg-[#09778F]/20 pointer-events-none blur-lg" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs font-semibold text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Health Monitoring</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting}, {user?.name || "Friend"}! 👋
            </h2>

            <p className="text-sm sm:text-[15px] text-blue-100/90 leading-relaxed">
              Here is your blood glucose overview for today,{" "}
              <span className="font-semibold text-white">
                {formatDate(new Date(), { includeWeekday: true })}
              </span>
              . Every reading matters. Every day counts. ❤️
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setAddModalOpen(true)}
              className="bg-white hover:bg-blue-50 text-[#0A387E] border-transparent shadow-md"
              icon={
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Log Reading
            </Button>

            <Link to="/readings">
              <Button
                variant="outline"
                size="md"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xs"
              >
                View History
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Error state if failed */}
      {error && (
        <ErrorState
          title="Dashboard loading error"
          message={error}
          onRetry={fetchDashboardData}
        />
      )}

      {/* Loading State */}
      {loading && !todayReport && (
        <LoadingSpinner message="Loading your health summary..." />
      )}

      {!loading && (
        <>
          {/* Statistics Grid */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-base sm:text-lg font-bold text-[#0B1B4F] flex items-center gap-2">
                <span>Today's Metrics</span>
                <span className="text-xs font-normal text-[#8598B0]">
                  ({stats.count} reading{stats.count !== 1 ? "s" : ""} logged)
                </span>
              </h3>
              <span className="text-xs text-[#09778F] font-semibold">
                Daily Goal: 4 Slots
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <StatCard
                title="Highest Reading"
                value={stats.highest}
                colorScheme="amber"
                badgeText={stats.highest ? "Peak level today" : "No readings"}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />

              <StatCard
                title="Lowest Reading"
                value={stats.lowest}
                colorScheme="cyan"
                badgeText={stats.lowest ? "Minimum level today" : "No readings"}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                }
              />

              <StatCard
                title="Average Glucose"
                value={stats.average}
                colorScheme="blue"
                badgeText={stats.average ? "Target: 70–140 mg/dL" : "Awaiting data"}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />

              <StatCard
                title="Total Readings Today"
                value={stats.count}
                unit="of 4 slots"
                colorScheme="emerald"
                badgeText={stats.count === 4 ? "All slots completed! 🎉" : `${4 - stats.count} slot(s) remaining`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          </section>

          {/* Daily Glucose Chart Section */}
          <section className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#EEF4FA]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0B1B4F]">
                  Daily Glucose Curve
                </h3>
                <p className="text-xs sm:text-[13px] text-[#556987]">
                  Readings across today's measurement slots (Morning, Breakfast, Lunch, Dinner)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/daily-reports"
                  className="text-xs font-bold text-[#0A387E] hover:text-[#072B63] hover:underline flex items-center gap-1"
                >
                  <span>Detailed Daily Report</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <DailyGlucoseChart readings={todayReadings} />
          </section>

          {/* Quick Actions & Recent Readings Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Quick Actions (1 col) */}
            <section className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF4FE] text-[#0A387E] flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0B1B4F]">
                    Quick Actions
                  </h3>
                </div>
                <p className="text-xs sm:text-[13px] text-[#556987] mb-5">
                  Frequently accessed tools and tracking options.
                </p>

                <div className="space-y-3">
                  {/* Action 1: Add Reading */}
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(true)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#F0F6FC] hover:bg-[#E2EDF9] border border-[#D5E8F8] transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0A387E] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#0B1B4F] group-hover:text-[#0A387E]">
                          Log Blood Glucose
                        </p>
                        <p className="text-[11px] text-[#556987]">
                          Add a reading for today or earlier
                        </p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-[#8598B0] group-hover:text-[#0A387E] group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Action 2: Daily Report */}
                  <Link
                    to="/daily-reports"
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-[#F4F8FC] border border-[#E2EBF4] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#09778F] border border-teal-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#0B1B4F] group-hover:text-[#0A387E]">
                          Daily Report
                        </p>
                        <p className="text-[11px] text-[#556987]">
                          Review full breakdown for any date
                        </p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-[#8598B0] group-hover:text-[#0A387E] group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  {/* Action 3: Monthly Report */}
                  <Link
                    to="/monthly-reports"
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-[#F4F8FC] border border-[#E2EBF4] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#0B1B4F] group-hover:text-[#0A387E]">
                          Monthly Trends
                        </p>
                        <p className="text-[11px] text-[#556987]">
                          Long-term health insights
                        </p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-[#8598B0] group-hover:text-[#0A387E] group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Health Journey Tip Banner */}
              <div className="mt-5 p-3 rounded-2xl bg-[#EAF7FF] border border-[#D5E8F8]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#09778F] font-bold text-xs">💡 Health Tip</span>
                </div>
                <p className="text-[11px] text-[#334155] leading-relaxed">
                  Fasting glucose is best checked right after waking up, before any morning coffee or breakfast.
                </p>
              </div>
            </section>

            {/* Recent Readings (2 cols) */}
            <section className="lg:col-span-2 bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#EEF4FA]">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0B1B4F]">
                    Recent Measurements
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#556987]">
                    Your last 5 logged blood glucose readings
                  </p>
                </div>

                <Link
                  to="/readings"
                  className="text-xs font-bold text-[#0A387E] hover:text-[#072B63] hover:underline flex items-center gap-1"
                >
                  <span>View All Readings</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {recentReadings.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-semibold text-[#0B1B4F]">No readings logged yet</p>
                  <p className="text-xs text-[#556987] mt-1 mb-4">
                    Track your first blood glucose value today to see your history.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setAddModalOpen(true)}
                  >
                    Log First Reading
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#EEF4FA] text-[11px] font-bold text-[#8598B0] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Time Slot</th>
                        <th className="py-2.5 px-3">Glucose Level</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF4FA]">
                      {recentReadings.map((reading) => {
                        const status = getGlucoseStatus(
                          reading.glucose_value,
                          reading.time_slot
                        );
                        return (
                          <tr
                            key={reading.id}
                            className="hover:bg-[#F8FBFE] transition-colors"
                          >
                            <td className="py-3 px-3 text-xs sm:text-[13px] font-semibold text-[#0B1B4F] whitespace-nowrap">
                              {formatDate(reading.reading_date)}
                            </td>
                            <td className="py-3 px-3 text-xs sm:text-[13px] text-[#556987] whitespace-nowrap">
                              {SLOT_LABELS[reading.time_slot] ||
                                reading.time_slot}
                            </td>
                            <td className="py-3 px-3 text-xs sm:text-[13px] font-extrabold text-[#0A387E] whitespace-nowrap">
                              {reading.glucose_value}{" "}
                              <span className="text-[11px] font-normal text-[#8598B0]">
                                mg/dL
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${status.badgeClass}`}
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
            </section>
          </div>
        </>
      )}

      {/* Add Reading Modal */}
      <ReadingModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSaved={fetchDashboardData}
      />
    </div>
  );
}
