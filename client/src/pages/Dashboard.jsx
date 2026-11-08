
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDailyReport } from "../services/reportService";
import { getReadings } from "../services/readingService";

const SLOT_LABELS = {
    MORNING: "Morning (Fasting)",
    AFTER_BREAKFAST: "After breakfast",
    AFTER_LUNCH: "After lunch",
    AFTER_DINNER: "After dinner",
};

function Dashboard() {
    const { user, token, logout } = useAuth();

    const [statistics, setStatistics] = useState({
        highest: null,
        lowest: null,
        average: null,
        count: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Recent Readings State
    const [recentReadings, setRecentReadings] = useState([]);
    const [readingsLoading, setReadingsLoading] = useState(true);

    // Get today's date in YYYY-MM-DD format.
    function getTodayDate() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    // Format date for display.
    function formatDate(date) {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        });
    }

    // Fetch Dashboard Statistics and Recent Readings
    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                setReadingsLoading(true);
                setError("");

                const [reportResponse, readingsResponse] = await Promise.all([
                    getDailyReport(getTodayDate(), token),
                    getReadings(token),
                ]);

                // Update today's statistics
                setStatistics(reportResponse.data.statistics);

                // Sort readings by date, newest first
                const sortedReadings = [...readingsResponse.data].sort(
                    (a, b) =>
                        new Date(b.reading_date) -
                        new Date(a.reading_date)
                );

                // Display the latest five readings
                setRecentReadings(sortedReadings.slice(0, 5));

            } catch (error) {
                setError(
                    error.message || "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
                setReadingsLoading(false);
            }
        }

        if (token) {
            fetchDashboardData();
        } else {
            setLoading(false);
            setReadingsLoading(false);
        }
    }, [token]);

    // Statistics Cards
    const cards = [
        {
            title: "Highest",
            value: statistics.highest,
            icon: "↑",
            color: "text-orange-600",
            background: "bg-orange-50",
        },
        {
            title: "Lowest",
            value: statistics.lowest,
            icon: "↓",
            color: "text-blue-600",
            background: "bg-blue-50",
        },
        {
            title: "Average",
            value: statistics.average,
            icon: "↔",
            color: "text-emerald-700",
            background: "bg-emerald-50",
        },
        {
            title: "Total Readings",
            value: statistics.count,
            icon: "#",
            color: "text-purple-600",
            background: "bg-purple-50",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

                    <h1 className="text-2xl font-bold text-emerald-700">
                        ♥ Sweety
                    </h1>

                    <button
                        onClick={logout}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Logout
                    </button>

                </div>
            </nav>

            {/* Dashboard Content */}
            <main className="max-w-7xl mx-auto px-5 py-10">

                {/* Welcome */}
                <section className="mb-8">

                    <h2 className="text-3xl font-bold text-slate-800">
                        Welcome back, {user?.name || "User"}!
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Here's your glucose summary for today.
                    </p>

                </section>

                {/* Statistics */}
                <section>

                    <h3 className="text-lg font-semibold text-slate-800 mb-5">
                        Today's Overview
                    </h3>

                    {loading ? (
                        <p className="text-slate-500">
                            Loading your glucose statistics...
                        </p>
                    ) : error ? (
                        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-600">
                            {error}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                            {cards.map((card) => (
                                <div
                                    key={card.title}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                                >

                                    <div className="flex items-center justify-between">

                                        <p className="text-sm font-medium text-slate-500">
                                            {card.title}
                                        </p>

                                        <span
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold ${card.background} ${card.color}`}
                                        >
                                            {card.icon}
                                        </span>

                                    </div>

                                    <p className="text-3xl font-bold text-slate-800 mt-5">

                                        {card.value === null
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
                    )}

                </section>

                {/* Quick Actions */}
                <section className="mt-10 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

                    <h3 className="text-lg font-semibold text-slate-800">
                        Quick Actions
                    </h3>

                    <p className="text-sm text-slate-500 mt-2 mb-5">
                        Manage your glucose readings and health reports.
                    </p>

                    <div className="flex flex-wrap gap-3">

                        <Link
                            to="/readings"
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-3 transition"
                        >
                            View Readings
                        </Link>

                        <Link
                            to="/reports"
                            className="rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-medium px-5 py-3 transition"
                        >
                            View Reports
                        </Link>

                    </div>

                </section>

                {/* Recent Glucose Readings */}
                <section className="mt-10 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

                    <div className="flex items-center justify-between mb-6">

                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">
                                Recent Glucose Readings
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Your latest five glucose records.
                            </p>
                        </div>

                        <Link
                            to="/readings"
                            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                            View All
                        </Link>

                    </div>

                    {readingsLoading ? (
                        <p className="text-slate-500 py-5">
                            Loading recent readings...
                        </p>
                    ) : error ? (
                        <p className="text-sm text-red-600 py-5">
                            Unable to load recent readings.
                        </p>
                    ) : recentReadings.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">
                            No glucose readings available yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full text-left">

                                <thead>
                                    <tr className="border-b border-slate-200 text-sm text-slate-500">

                                        <th className="py-3 pr-4 font-medium">
                                            Date
                                        </th>

                                        <th className="py-3 pr-4 font-medium">
                                            Time Slot
                                        </th>

                                        <th className="py-3 pr-4 font-medium">
                                            Glucose Value
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {recentReadings.map((reading) => (
                                        <tr
                                            key={reading.id}
                                            className="border-b border-slate-100 last:border-0"
                                        >

                                            <td className="py-4 pr-4 text-slate-700 whitespace-nowrap">
                                                {formatDate(reading.reading_date)}
                                            </td>

                                            <td className="py-4 pr-4 text-slate-700 whitespace-nowrap">
                                                {SLOT_LABELS[reading.time_slot] ||
                                                    reading.time_slot}
                                            </td>

                                            <td className="py-4 pr-4 font-semibold text-emerald-700 whitespace-nowrap">
                                                {reading.glucose_value} mg/dL
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </main>

        </div>
    );
}

export default Dashboard;
