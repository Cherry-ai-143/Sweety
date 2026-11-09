import { useEffect, useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getReadings,
  deleteReading,
} from "../services/readingService";
import {
  formatDate,
  toDateInputValue,
  SLOT_LABELS,
  SLOT_SHORT_LABELS,
  getGlucoseStatus,
} from "../utils/glucoseUtils";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Pagination from "../components/common/Pagination";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import ReadingModal from "../components/readings/ReadingModal";
import ConfirmationModal from "../components/common/ConfirmationModal";

const PAGE_SIZE = 10;

export default function Readings() {
  const { token } = useAuth();
  const outletContext = useOutletContext();
  const refreshTrigger = outletContext?.refreshTrigger || 0;

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filters
  const [filterSlot, setFilterSlot] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReadings = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const response = await getReadings(token);
      setReadings(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load glucose readings.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings, refreshTrigger]);

  // Filtered & Sorted Readings
  const filteredReadings = useMemo(() => {
    let result = [...readings];

    if (filterSlot !== "ALL") {
      result = result.filter((r) => r.time_slot === filterSlot);
    }

    if (filterDate) {
      result = result.filter(
        (r) => toDateInputValue(r.reading_date) === filterDate
      );
    }

    // Sort newest first
    result.sort(
      (a, b) => new Date(b.reading_date) - new Date(a.reading_date)
    );

    return result;
  }, [readings, filterSlot, filterDate]);

  // Quick statistics calculated from filtered or total readings
  const summaryStats = useMemo(() => {
    if (readings.length === 0) return null;
    const values = readings.map((r) => Number(r.glucose_value)).filter(Boolean);
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count: values.length,
      average: Math.round((sum / values.length) * 10) / 10,
      highest: Math.max(...values),
      lowest: Math.min(...values),
    };
  }, [readings]);

  // Pagination slices
  const totalPages = Math.ceil(filteredReadings.length / PAGE_SIZE) || 1;
  const paginatedReadings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReadings.slice(start, start + PAGE_SIZE);
  }, [filteredReadings, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSlot, filterDate]);

  function handleOpenAdd() {
    setEditingReading(null);
    setModalOpen(true);
  }

  function handleOpenEdit(reading) {
    setEditingReading(reading);
    setModalOpen(true);
  }

  function handleReadingSaved(savedReading, isEdit) {
    setSuccessMessage(
      isEdit
        ? "Glucose reading updated successfully!"
        : "Glucose reading logged successfully!"
    );
    setTimeout(() => setSuccessMessage(""), 4000);
    fetchReadings();
  }

  function handleRequestDelete(reading) {
    setReadingToDelete(reading);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!readingToDelete) return;
    try {
      setDeleting(true);
      await deleteReading(readingToDelete.id, token);
      setSuccessMessage("Glucose reading deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
      setDeleteConfirmOpen(false);
      setReadingToDelete(null);
      fetchReadings();
    } catch (err) {
      setError(err.message || "Failed to delete reading.");
    } finally {
      setDeleting(false);
    }
  }

  function handleResetFilters() {
    setFilterSlot("ALL");
    setFilterDate("");
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1B4F] tracking-tight">
            Blood Glucose Readings
          </h2>
          <p className="text-xs sm:text-sm text-[#556987] mt-1">
            Log, inspect, and manage your full blood sugar measurement history
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            icon={
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Reading
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-800 flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <ErrorState
          title="Error loading readings"
          message={error}
          onRetry={fetchReadings}
        />
      )}

      {/* Summary Statistics Strip */}
      {summaryStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-[#E2EBF4] p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-[#8598B0] uppercase tracking-wider">
              Total Logged
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-[#0B1B4F] mt-1">
              {summaryStats.count}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2EBF4] p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-[#8598B0] uppercase tracking-wider">
              Overall Average
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-[#0A387E] mt-1">
              {summaryStats.average}{" "}
              <span className="text-xs font-normal text-[#8598B0]">mg/dL</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2EBF4] p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-[#8598B0] uppercase tracking-wider">
              Highest
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">
              {summaryStats.highest}{" "}
              <span className="text-xs font-normal text-[#8598B0]">mg/dL</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2EBF4] p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-[#8598B0] uppercase tracking-wider">
              Lowest
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-[#09778F] mt-1">
              {summaryStats.lowest}{" "}
              <span className="text-xs font-normal text-[#8598B0]">mg/dL</span>
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-end">
          {/* Time Slot Filter */}
          <Select
            label="Filter by Time Slot"
            id="filterSlot"
            name="filterSlot"
            value={filterSlot}
            onChange={(e) => setFilterSlot(e.target.value)}
            icon={
              <svg className="w-4 h-4 text-[#0A387E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            }
          >
            <option value="ALL">All Time Slots</option>
            <option value="MORNING">Morning (Fasting)</option>
            <option value="AFTER_BREAKFAST">After Breakfast</option>
            <option value="AFTER_LUNCH">After Lunch</option>
            <option value="AFTER_DINNER">After Dinner</option>
          </Select>

          {/* Date Filter */}
          <Input
            label="Filter by Date"
            id="filterDate"
            name="filterDate"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />

          {/* Reset Action */}
          <div className="flex items-center gap-2">
            {(filterSlot !== "ALL" || filterDate) && (
              <Button
                variant="outline"
                size="md"
                onClick={handleResetFilters}
                className="w-full text-xs"
              >
                Clear Filters
              </Button>
            )}
            <div className="text-xs text-[#8598B0] font-medium ml-auto sm:ml-0 self-center">
              Found:{" "}
              <span className="font-bold text-[#0B1B4F]">
                {filteredReadings.length}
              </span>{" "}
              record{filteredReadings.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table / Card Content */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2EBF4] shadow-[0_10px_30px_rgba(10,56,126,0.05)] p-5 sm:p-7">
        {loading ? (
          <LoadingSpinner message="Retrieving glucose readings..." />
        ) : filteredReadings.length === 0 ? (
          <EmptyState
            title={
              filterSlot !== "ALL" || filterDate
                ? "No matching readings found"
                : "No readings logged yet"
            }
            description={
              filterSlot !== "ALL" || filterDate
                ? "Try clearing the active filters to see all recorded entries."
                : "Start monitoring your diabetes or health goals by recording your blood glucose."
            }
            actionLabel={
              filterSlot !== "ALL" || filterDate
                ? "Clear Filters"
                : "Log First Reading"
            }
            onAction={
              filterSlot !== "ALL" || filterDate
                ? handleResetFilters
                : handleOpenAdd
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#EEF4FA] text-[11px] font-bold text-[#8598B0] uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Glucose Level</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF4FA]">
                  {paginatedReadings.map((reading) => {
                    const status = getGlucoseStatus(
                      reading.glucose_value,
                      reading.time_slot
                    );
                    return (
                      <tr
                        key={reading.id}
                        className="hover:bg-[#F8FBFE] transition-colors group"
                      >
                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-[#0B1B4F]">
                            {formatDate(reading.reading_date, {
                              includeWeekday: true,
                            })}
                          </span>
                        </td>

                        {/* Slot */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 text-sm text-[#334155]">
                            <span className="w-2 h-2 rounded-full bg-[#0A387E]/30" />
                            {SLOT_LABELS[reading.time_slot] || reading.time_slot}
                          </span>
                        </td>

                        {/* Glucose Value */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-base font-extrabold text-[#0A387E]">
                            {reading.glucose_value}
                          </span>
                          <span className="text-xs text-[#8598B0] ml-1.5 font-medium">
                            mg/dL
                          </span>
                        </td>

                        {/* Status Badge */}
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

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(reading)}
                              className="p-1.5 rounded-xl text-[#556987] hover:text-[#0A387E] hover:bg-[#EAF4FE] transition-colors cursor-pointer"
                              title="Edit Reading"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRequestDelete(reading)}
                              className="p-1.5 rounded-xl text-[#556987] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Reading"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {paginatedReadings.map((reading) => {
                const status = getGlucoseStatus(
                  reading.glucose_value,
                  reading.time_slot
                );
                return (
                  <div
                    key={reading.id}
                    className="p-4 rounded-2xl border border-[#E2EBF4] bg-[#FAFDFE] shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-[#0B1B4F]">
                          {formatDate(reading.reading_date, {
                            includeWeekday: true,
                          })}
                        </p>
                        <p className="text-xs text-[#556987] mt-0.5">
                          {SLOT_SHORT_LABELS[reading.time_slot] ||
                            reading.time_slot}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${status.badgeClass}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}
                        />
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EEF4FA]">
                      <div>
                        <span className="text-xl font-extrabold text-[#0A387E]">
                          {reading.glucose_value}
                        </span>
                        <span className="text-xs text-[#8598B0] ml-1">
                          mg/dL
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(reading)}
                          className="h-8 px-3 text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="dangerOutline"
                          size="sm"
                          onClick={() => handleRequestDelete(reading)}
                          className="h-8 px-3 text-xs"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredReadings.length}
              pageSize={PAGE_SIZE}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Reading Modal */}
      <ReadingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingReading}
        onSaved={handleReadingSaved}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Glucose Reading?"
        message={`Are you sure you want to delete the ${readingToDelete?.glucose_value} mg/dL reading for ${
          readingToDelete ? formatDate(readingToDelete.reading_date) : ""
        }? This action cannot be undone.`}
        confirmText="Delete Reading"
      />
    </div>
  );
}
