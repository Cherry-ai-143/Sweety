import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import {
  getTodayDate,
  toDateInputValue,
  SLOT_LABELS,
  getGlucoseStatus,
} from "../../utils/glucoseUtils";
import { createReading, updateReading } from "../../services/readingService";
import { useAuth } from "../../context/AuthContext";

export default function ReadingModal({
  isOpen,
  onClose,
  initialData = null,
  onSaved,
}) {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    reading_date: getTodayDate(),
    time_slot: "MORNING",
    glucose_value: "",
  });

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(initialData && initialData.id);

  useEffect(() => {
    if (initialData) {
      setFormData({
        reading_date: toDateInputValue(initialData.reading_date),
        time_slot: initialData.time_slot || "MORNING",
        glucose_value: String(initialData.glucose_value || ""),
      });
    } else {
      setFormData({
        reading_date: getTodayDate(),
        time_slot: "MORNING",
        glucose_value: "",
      });
    }
    setFormError("");
  }, [initialData, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  }

  function validate() {
    if (!formData.reading_date) {
      setFormError("Please select a date.");
      return false;
    }
    if (formData.reading_date > getTodayDate()) {
      setFormError("Reading date cannot be in the future.");
      return false;
    }
    if (!formData.time_slot) {
      setFormError("Please select a time slot.");
      return false;
    }
    const val = Number(formData.glucose_value);
    if (!formData.glucose_value || isNaN(val) || !Number.isInteger(val)) {
      setFormError("Please enter a valid whole number for blood glucose.");
      return false;
    }
    if (val < 40 || val > 600) {
      setFormError("Blood glucose value must be between 40 and 600 mg/dL.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setFormError("");

      const payload = {
        reading_date: formData.reading_date,
        time_slot: formData.time_slot,
        glucose_value: Number(formData.glucose_value),
      };

      let result;
      if (isEditing) {
        result = await updateReading(initialData.id, payload, token);
      } else {
        result = await createReading(payload, token);
      }

      if (onSaved) {
        onSaved(result.data, isEditing);
      }
      onClose();
    } catch (err) {
      setFormError(err.message || "Failed to save reading. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const glucosePreview =
    formData.glucose_value && !isNaN(Number(formData.glucose_value))
      ? getGlucoseStatus(formData.glucose_value, formData.time_slot)
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Glucose Reading" : "Log Glucose Reading"}
      subtitle={
        isEditing
          ? "Update this recorded measurement"
          : "Record a new blood glucose level in mg/dL"
      }
      maxWidth="max-w-md"
      icon={
        <svg className="w-5 h-5 text-[#0A387E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        {/* Date Input */}
        <Input
          label="Measurement Date"
          id="reading_date"
          name="reading_date"
          type="date"
          value={formData.reading_date}
          max={getTodayDate()}
          onChange={handleChange}
          required
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        {/* Time Slot Select */}
        <Select
          label="Time Slot"
          id="time_slot"
          name="time_slot"
          value={formData.time_slot}
          onChange={handleChange}
          required
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          {Object.entries(SLOT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>

        {/* Glucose Value Input */}
        <div>
          <Input
            label="Blood Glucose Value (mg/dL)"
            id="glucose_value"
            name="glucose_value"
            type="number"
            min="40"
            max="600"
            step="1"
            placeholder="e.g. 105"
            value={formData.glucose_value}
            onChange={handleChange}
            required
            helperText="Standard range: 70 - 140 mg/dL"
            icon={
              <svg className="w-4 h-4 text-[#09778F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            }
          />

          {/* Real-time Category Preview Indicator */}
          {glucosePreview && (
            <div className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F0F7FE] border border-[#D5E8F8]">
              <span className="text-xs text-[#556987]">Estimated Classification:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${glucosePreview.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${glucosePreview.dotClass}`} />
                {glucosePreview.label}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEF4FA]">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            iconRight={
              !loading && (
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )
            }
          >
            {isEditing ? "Update Reading" : "Save Reading"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

