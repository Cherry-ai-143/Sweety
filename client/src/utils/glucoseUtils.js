export const SLOT_LABELS = {
  MORNING: "Morning (Fasting)",
  AFTER_BREAKFAST: "After Breakfast",
  AFTER_LUNCH: "After Lunch",
  AFTER_DINNER: "After Dinner",
};

export const SLOT_SHORT_LABELS = {
  MORNING: "Morning",
  AFTER_BREAKFAST: "Breakfast",
  AFTER_LUNCH: "Lunch",
  AFTER_DINNER: "Dinner",
};

export const SLOT_ORDER = ["MORNING", "AFTER_BREAKFAST", "AFTER_LUNCH", "AFTER_DINNER"];

// Get today's local date as YYYY-MM-DD
export function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Convert any date value into YYYY-MM-DD
export function toDateInputValue(dateInput) {
  if (!dateInput) return getTodayDate();
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return getTodayDate();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format date for display: "Sun, 8 Nov 2026" or "8 Nov 2026"
export function formatDate(date, { includeWeekday = false } = {}) {
  if (!date) return "--";
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);

  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  if (includeWeekday) {
    options.weekday = "short";
  }
  return d.toLocaleDateString("en-IN", options);
}

// Evaluate glucose status based on slot and value
export function getGlucoseStatus(value, slot = "MORNING") {
  const num = Number(value);
  if (!num || isNaN(num)) {
    return {
      label: "Unknown",
      category: "unknown",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      dotClass: "bg-slate-400",
      pillClass: "bg-slate-50 text-slate-700 border border-slate-200",
    };
  }

  const isFasting = slot === "MORNING";

  if (num < 70) {
    return {
      label: "Low (Hypo)",
      category: "low",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
      pillClass: "bg-rose-50 text-rose-700 border border-rose-200",
      textClass: "text-rose-600",
    };
  }

  if (isFasting) {
    if (num <= 99) {
      return {
        label: "Normal",
        category: "normal",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotClass: "bg-emerald-500",
        pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        textClass: "text-emerald-600",
      };
    }
    if (num <= 125) {
      return {
        label: "Elevated",
        category: "elevated",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        dotClass: "bg-amber-500",
        pillClass: "bg-amber-50 text-amber-700 border border-amber-200",
        textClass: "text-amber-600",
      };
    }
    return {
      label: "High",
      category: "high",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
      pillClass: "bg-rose-50 text-rose-700 border border-rose-200",
      textClass: "text-rose-600",
    };
  } else {
    // Post-meal
    if (num < 140) {
      return {
        label: "Normal",
        category: "normal",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotClass: "bg-emerald-500",
        pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        textClass: "text-emerald-600",
      };
    }
    if (num <= 199) {
      return {
        label: "Elevated",
        category: "elevated",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        dotClass: "bg-amber-500",
        pillClass: "bg-amber-50 text-amber-700 border border-amber-200",
        textClass: "text-amber-600",
      };
    }
    return {
      label: "High",
      category: "high",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
      pillClass: "bg-rose-50 text-rose-700 border border-rose-200",
      textClass: "text-rose-600",
    };
  }
}

// Export readings as a downloadable CSV
export function exportReadingsToCSV(readings = [], filename = "sweety-glucose-readings.csv") {
  if (!readings || readings.length === 0) return;

  const headers = ["Reading Date", "Time Slot", "Glucose Value (mg/dL)", "Status", "Created At"];
  const rows = readings.map((r) => {
    const status = getGlucoseStatus(r.glucose_value, r.time_slot);
    return [
      `"${toDateInputValue(r.reading_date)}"`,
      `"${SLOT_LABELS[r.time_slot] || r.time_slot}"`,
      r.glucose_value,
      `"${status.label}"`,
      `"${r.created_at || ""}"`,
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

