
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getDailyReport,
    getMonthToDateReport,
    getMonthlyReport,
} from "../services/reportService";

const SLOT_LABELS = {
    MORNING: "Morning (Fasting)",
    AFTER_BREAKFAST: "After breakfast",
    AFTER_LUNCH: "After lunch",
    AFTER_DINNER: "After dinner",
};

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
}

function Reports() {
    const { token, logout } = useAuth();

    const [reportType, setReportType] = useState("daily");
    const [selectedDate, setSelectedDate] = useState(getTodayDate());

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleGenerateReport(event) {
        event.preventDefault();

        setError("");
        setReport(null);

        try {
            setLoading(true);

            let response;

            if (reportType === "daily") {
                response = await getDailyReport(selectedDate, token);
            } else if (reportType === "month-to-date") {
                response = await getMonthToDateReport(selectedDate, token);
            } else {
                response = await getMonthlyReport(selectedDate, token);
            }

            setReport(response.data);
        } catch (error) {
            setError(error.message || "Unable to generate report.");
        } finally {
            setLoading(false);
        }
    }

    const statistics = report?.statistics;

    const cards = [
        {
            title: "Highest",
            value: statistics?.highest,
            color: "text-orange-600",
            background: "bg-orange-50",
        },
        {
            title: "Lowest",
            value: statistics?.lowest,
            color: "text-blue-600",
            background: "bg-blue-50",
        },
        {
            title: "Average",
            value: statistics?.average,
            color: "text-emerald-700",
            background: "bg-emerald-50",
        },
        {
            title: "Total Readings",
            value: statistics?.count ?? 0,
            color: "text-purple-600",
            background: "bg-purple-50",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
                    <Link to="/dashboard" className="text-2xl font-bold text-emerald-700">
                        ♥ Sweety
                    </Link>

                    <button
                        onClick={logout}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-5 py-10">

                {/* Heading */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">
                        Glucose Reports
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Understand your glucose trends across different periods.
                    </p>
                </div>

                {/* Report Filters */}
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">

                    <h3 className="text-xl font-semibold text-slate-800 mb-6">
                        Generate Report
                    </h3>

                    <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        <div>
                            <label htmlFor="reportType" className="block text-sm font-medium text-slate-700 mb-2">
                                Report Type
                            </label>

                            <select
                                id="reportType"
                                value={reportType}
                                onChange={(event) => setReportType(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            >
                                <option value="daily">Daily Report</option>
                                <option value="month-to-date">Month-to-Date Report</option>
                                <option value="monthly">Previous Monthly Report</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="selectedDate" className="block text-sm font-medium text-slate-700 mb-2">
                                Select Date
                            </label>

                            <input
                                id="selectedDate"
                                type="date"
                                value={selectedDate}
                                max={getTodayDate()}
                                onChange={(event) => setSelectedDate(event.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading || !selectedDate}
                                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-6 py-3 transition"
                            >
                                {loading ? "Generating..." : "Generate Report"}
                            </button>
                        </div>

                    </form>

                    {error && (
                        <div role="alert" className="mt-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </section>

                {/* Report Results */}
                {report && (
                    <section className="space-y-8">

                        <div>
                            <h3 className="text-xl font-semibold text-slate-800">
                                Report Summary
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                {formatDate(report.period.start_date)}
                                {" — "}
                                {formatDate(report.period.end_date)}
                            </p>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                            {cards.map((card) => (
                                <div
                                    key={card.title}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                                >
                                    <p className="text-sm font-medium text-slate-500">
                                        {card.title}
                                    </p>

                                    <p className={`text-3xl font-bold mt-5 ${card.color}`}>
                                        {card.value === null || card.value === undefined
                                            ? "--"
                                            : card.value}

                                        {card.title !== "Total Readings" && (
                                            <span className="text-sm font-medium text-slate-400 ml-2">
                                                mg/dL
                                            </span>
                                        )}
                                    </p>
                                </div>
                            ))}

                        </div>

                        {/* Report Readings */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

                            <h3 className="text-xl font-semibold text-slate-800 mb-6">
                                Reading Details
                            </h3>

                            {report.readings.length === 0 ? (
                                <p className="text-center text-slate-500 py-10">
                                    No glucose readings found for this period.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-sm text-slate-500">
                                                <th className="py-4 pr-4 font-medium">Date</th>
                                                <th className="py-4 pr-4 font-medium">Time Slot</th>
                                                <th className="py-4 pr-4 font-medium">Glucose Value</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {report.readings.map((reading) => (
                                                <tr key={reading.id} className="border-b border-slate-100 last:border-0">
                                                    <td className="py-4 pr-4 text-slate-700">
                                                        {formatDate(reading.reading_date)}
                                                    </td>

                                                    <td className="py-4 pr-4 text-slate-700">
                                                        {SLOT_LABELS[reading.time_slot] || reading.time_slot}
                                                    </td>

                                                    <td className="py-4 pr-4 font-semibold text-emerald-700">
                                                        {reading.glucose_value} mg/dL
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </section>
                )}

            </main>
        </div>
    );
}

export default Reports;
