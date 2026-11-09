import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { SLOT_LABELS, getGlucoseStatus } from "./glucoseUtils";

/**
 * Slot chronological order index
 */
const SLOT_ORDER_MAP = {
  MORNING: 1,
  AFTER_BREAKFAST: 2,
  AFTER_LUNCH: 3,
  AFTER_DINNER: 4,
};

/**
 * Format a timestamp into Asia/Kolkata (IST) string: "09 Nov 2026, 07:52 PM"
 */
export function formatISTDateTime(dateInput) {
  if (!dateInput) return "--";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "--";

  try {
    const parts = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(d);

    const partMap = {};
    parts.forEach((p) => {
      partMap[p.type] = p.value;
    });

    const day = partMap.day;
    const month = partMap.month;
    const year = partMap.year;
    const hour = partMap.hour;
    const minute = partMap.minute;
    const dayPeriod = (partMap.dayPeriod || "").toUpperCase();

    return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
  } catch {
    return d.toLocaleString("en-IN");
  }
}

/**
 * Format date string "YYYY-MM-DD" as "15 Oct 2026"
 */
export function formatReadingDate(dateStr) {
  if (!dateStr) return "--";
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(dateObj);
  }
  return String(dateStr);
}

/**
 * Dynamically calculate the four clinical statistics from readings:
 * 1. Highest Reading (maximum)
 * 2. Lowest Reading (minimum)
 * 3. Average Reading (arithmetic mean rounded to 1 decimal place)
 * 4. Total Readings (count)
 */
export function calculateReportStatistics(readings = []) {
  if (!readings || readings.length === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      count: 0,
    };
  }

  const values = readings
    .map((r) => Number(r.glucose_value))
    .filter((v) => !isNaN(v) && v > 0);

  if (values.length === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      count: 0,
    };
  }

  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const average = Number((sum / values.length).toFixed(1));

  return {
    highest,
    lowest,
    average,
    count: readings.length,
  };
}

/**
 * Calculate title, period string, and standardized filename
 */
export function getReportPeriodAndFilename(reportType, selectedDate, period = null) {
  let reportTitle = "Daily Blood Glucose Report";
  let periodStr = "";
  let filename = "";

  if (reportType === "daily") {
    reportTitle = "Daily Blood Glucose Report";
    periodStr = formatReadingDate(selectedDate);
    filename = `Sweety_Daily_Report_${selectedDate}.pdf`;
  } else if (reportType === "month-to-date") {
    reportTitle = "Month-to-date Blood Glucose Report";
    const startDate = period?.start_date || `${selectedDate.slice(0, 7)}-01`;
    const endDate = period?.end_date || selectedDate;
    periodStr = `${formatReadingDate(startDate)} – ${formatReadingDate(endDate)}`;
    filename = `Sweety_Month_to_Date_Report_${selectedDate}.pdf`;
  } else if (reportType === "monthly" || reportType === "previous-month") {
    reportTitle = "Monthly Blood Glucose Report";
    let startDate = period?.start_date;
    let endDate = period?.end_date;

    if (!startDate || !endDate) {
      const [year, month] = selectedDate.split("-").map(Number);
      if (reportType === "previous-month") {
        const startPrev = new Date(Date.UTC(year, month - 2, 1));
        const endPrev = new Date(Date.UTC(year, month - 1, 0));
        startDate = startPrev.toISOString().slice(0, 10);
        endDate = endPrev.toISOString().slice(0, 10);
      } else {
        const startObj = new Date(Date.UTC(year, month - 1, 1));
        const endObj = new Date(Date.UTC(year, month, 0));
        startDate = startObj.toISOString().slice(0, 10);
        endDate = endObj.toISOString().slice(0, 10);
      }
    }

    periodStr = `${formatReadingDate(startDate)} – ${formatReadingDate(endDate)}`;
    const ym = startDate.slice(0, 7);
    filename = `Sweety_Monthly_Report_${ym}.pdf`;
  }

  return { reportTitle, periodStr, filename };
}

/**
 * Load Sweety logo as Base64 Data URL
 */
async function loadLogoBase64() {
  if (typeof window === "undefined") return null;

  try {
    const res = await fetch("/images/sweety-logo-cropped.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Could not load Sweety logo asset for PDF:", err);
    return null;
  }
}

/**
 * Generate and download a professional healthcare PDF report
 *
 * @param {Object} options
 * @param {'daily'|'month-to-date'|'monthly'} options.reportType - The report category
 * @param {string} options.selectedDate - Reference date YYYY-MM-DD
 * @param {Array} options.readings - Array of glucose readings
 * @param {Object} [options.period] - { start_date, end_date } optional override
 * @param {string} [options.userName] - Authenticated user name
 * @param {string} [options.customLogoBase64] - Preloaded base64 logo
 * @returns {Promise<{ success: boolean, filename: string }>}
 */
export async function downloadGlucoseReportPDF({
  reportType = "daily",
  selectedDate,
  readings = [],
  period = null,
  userName = "",
  customLogoBase64 = null,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const now = new Date();
  const timestampIST = `${formatISTDateTime(now)} IST`;

  const { reportTitle, periodStr, filename } = getReportPeriodAndFilename(
    reportType,
    selectedDate,
    period
  );

  // Compute 4 dynamic statistics
  const stats = calculateReportStatistics(readings);
  const count = stats.count;
  const highest = stats.highest;
  const lowest = stats.lowest;
  const average = stats.average;

  const marginX = 14;
  const contentWidth = 182;
  const rightX = marginX + contentWidth;

  // Load logo
  const logoDataUrl = customLogoBase64 || (await loadLogoBase64());

  // 1. Header Section
  if (logoDataUrl) {
    // 38mm x 15.35mm preserves the ~2.475:1 logo aspect ratio
    doc.addImage(logoDataUrl, "PNG", marginX, 11, 38, 15.35);
  } else {
    // Elegant fallback branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(10, 56, 126); // #0A387E
    doc.text("Sweety", marginX, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 107, 107);
    doc.text("Track • Monitor • Live Healthy", marginX, 25);
  }

  // Header Title & Metadata (Right-aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(11, 27, 79); // #0B1B4F
  doc.text(reportTitle, rightX, 16, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(10, 56, 126); // #0A387E
  doc.text(`Reporting Period: ${periodStr}`, rightX, 21.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text(`Report Generated: ${timestampIST}`, rightX, 26, { align: "right" });

  if (userName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(11, 27, 79);
    doc.text(`Patient / User: ${userName}`, rightX, 30.5, { align: "right" });
  }

  // Header Separator Line
  doc.setDrawColor(226, 235, 244);
  doc.setLineWidth(0.4);
  doc.line(marginX, 33.5, rightX, 33.5);

  // 2. Four Clinical Summary Statistics Cards
  const cardY = 37.5;
  const cardGap = 3.5;
  const cardW = (contentWidth - 3 * cardGap) / 4;
  const cardH = 21.5;

  const cards = [
    {
      title: "HIGHEST READING",
      value: highest !== null ? `${highest} mg/dL` : "N/A",
      subtitle: highest !== null ? "Peak recorded value" : "No readings",
      fill: [255, 251, 235], // Amber-50
      border: [253, 230, 138], // Amber-200
      titleColor: [180, 83, 9],
      valueColor: [146, 64, 14],
      subColor: [217, 119, 6],
    },
    {
      title: "LOWEST READING",
      value: lowest !== null ? `${lowest} mg/dL` : "N/A",
      subtitle: lowest !== null ? "Minimum recorded value" : "No readings",
      fill: [240, 253, 250], // Teal-50
      border: [204, 251, 241], // Teal-200
      titleColor: [15, 118, 110],
      valueColor: [17, 94, 89],
      subColor: [13, 148, 136],
    },
    {
      title: "AVERAGE READING",
      value: average !== null ? `${average.toFixed(1)} mg/dL` : "N/A",
      subtitle: average !== null ? "Clinical target: 70–140" : "No readings",
      fill: [239, 246, 255], // Blue-50
      border: [219, 234, 254], // Blue-200
      titleColor: [29, 78, 216],
      valueColor: [30, 58, 138],
      subColor: [37, 99, 235],
    },
    {
      title: "TOTAL READINGS",
      value: `${count}`,
      subtitle: count === 1 ? "1 recorded slot" : `${count} recorded slots`,
      fill: [240, 253, 244], // Emerald-50
      border: [220, 252, 231], // Emerald-200
      titleColor: [21, 128, 61],
      valueColor: [22, 101, 52],
      subColor: [22, 163, 74],
    },
  ];

  cards.forEach((card, index) => {
    const curX = marginX + index * (cardW + cardGap);
    doc.setFillColor(card.fill[0], card.fill[1], card.fill[2]);
    doc.setDrawColor(card.border[0], card.border[1], card.border[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(curX, cardY, cardW, cardH, 2.5, 2.5, "FD");

    // Card Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(card.titleColor[0], card.titleColor[1], card.titleColor[2]);
    doc.text(card.title, curX + 3.5, cardY + 5.5);

    // Card Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(card.valueColor[0], card.valueColor[1], card.valueColor[2]);
    doc.text(card.value, curX + 3.5, cardY + 12.2);

    // Card Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(card.subColor[0], card.subColor[1], card.subColor[2]);
    doc.text(card.subtitle, curX + 3.5, cardY + 17.5);
  });

  // 3. Table Section Heading
  const tableSectionY = 64.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(11, 27, 79);
  doc.text("Reading Details Log", marginX, tableSectionY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Chronological slot measurements and clinical status evaluations", marginX, tableSectionY + 4);

  // 4. Reading Details Table or Empty State
  if (count === 0) {
    // Empty State Box
    const emptyY = 73;
    const emptyH = 46;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 235, 244);
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, emptyY, contentWidth, emptyH, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(11, 27, 79);
    doc.text(
      "No glucose readings found for the selected reporting period.",
      105,
      emptyY + 18,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `No blood glucose records were logged between ${periodStr}.`,
      105,
      emptyY + 25,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Log your daily readings in the Sweety application to populate this clinical report.",
      105,
      emptyY + 32,
      { align: "center" }
    );
  } else {
    // Sort readings: reading_date descending, then time slot chronological
    const sortedReadings = [...readings].sort((a, b) => {
      const dateA = (a.reading_date || "").slice(0, 10);
      const dateB = (b.reading_date || "").slice(0, 10);
      if (dateA !== dateB) {
        return dateB.localeCompare(dateA);
      }
      const slotA = SLOT_ORDER_MAP[a.time_slot] || 99;
      const slotB = SLOT_ORDER_MAP[b.time_slot] || 99;
      return slotA - slotB;
    });

    const tableRows = sortedReadings.map((r) => {
      const dateFormatted = formatReadingDate(r.reading_date);
      const slotLabel = SLOT_LABELS[r.time_slot] || r.time_slot;
      const glucoseVal = String(r.glucose_value);
      const statusObj = getGlucoseStatus(r.glucose_value, r.time_slot);
      const createdAtFormatted = r.created_at ? formatISTDateTime(r.created_at) : dateFormatted;

      return [
        dateFormatted,
        slotLabel,
        glucoseVal,
        statusObj.label,
        createdAtFormatted,
      ];
    });

    autoTable(doc, {
      startY: 72,
      margin: { top: 22, bottom: 20, left: marginX, right: marginX },
      head: [["Reading Date", "Time Slot", "Glucose Value (mg/dL)", "Status", "Created At"]],
      body: tableRows,
      showHead: "everyPage",
      rowPageBreak: "avoid",
      theme: "plain",
      headStyles: {
        fillColor: [10, 56, 126], // #0A387E
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 3,
        halign: "left",
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.8,
        lineColor: [226, 235, 244],
        lineWidth: 0.1,
        textColor: [30, 41, 59],
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // #F8FAFC
      },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: "bold", halign: "left" },
        1: { cellWidth: 42, halign: "left" },
        2: { cellWidth: 36, halign: "right", fontStyle: "bold" },
        3: { cellWidth: 32, halign: "center" },
        4: { cellWidth: 40, halign: "center" },
      },
      didParseCell: (data) => {
        // Color-code the Status column
        if (data.section === "body" && data.column.index === 3) {
          const val = String(data.cell.raw || "");
          if (val === "Normal") {
            data.cell.styles.textColor = [16, 149, 106]; // Emerald-600
            data.cell.styles.fillColor = [236, 253, 245]; // Emerald-50
            data.cell.styles.fontStyle = "bold";
          } else if (val === "Elevated") {
            data.cell.styles.textColor = [194, 98, 14]; // Amber-600
            data.cell.styles.fillColor = [254, 243, 199]; // Amber-100
            data.cell.styles.fontStyle = "bold";
          } else if (val === "High" || val.includes("Hypo") || val === "Low") {
            data.cell.styles.textColor = [225, 29, 72]; // Rose-600
            data.cell.styles.fillColor = [255, 241, 242]; // Rose-50
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      didDrawPage: (data) => {
        // Multi-page subheader on subsequent pages
        if (data.pageNumber > 1) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(11, 27, 79);
          doc.text(`Sweety – ${reportTitle} (${periodStr})`, marginX, 14);

          doc.setDrawColor(226, 235, 244);
          doc.setLineWidth(0.3);
          doc.line(marginX, 17, rightX, 17);
        }
      },
    });
  }

  // 5. Professional Footer on All Pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Subtle divider line
    doc.setDrawColor(226, 235, 244);
    doc.setLineWidth(0.3);
    doc.line(marginX, 285, rightX, 285);

    // Left: Sweety – Blood Glucose Tracker
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Sweety – Blood Glucose Tracker", marginX, 290);

    // Center: Generated timestamp
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${timestampIST}`, 105, 290, { align: "center" });

    // Right: Page X of Y
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${totalPages}`, rightX, 290, { align: "right" });
  }

  // Download PDF
  doc.save(filename);

  return { success: true, filename };
}

