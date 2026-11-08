
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getReadings,
    createReading,
} from "../services/readingService";

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

// Format API dates using Indian Standard Time
function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
}

function Readings() {
    const { token, logout } = useAuth();

    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Add Reading Form State
    const [formData, setFormData] = useState({
        reading_date: getTodayDate(),
        time_slot: "MORNING",
        glucose_value: "",
    });

    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [saving, setSaving] = useState(false);

    // Fetch Existing Readings
    useEffect(() => {
        async function fetchReadings() {
            try {
                setLoading(true);
                setError("");

                const response = await getReadings(token);
                setReadings(response.data);
            } catch (error) {
                setError(error.message || "Unable to load readings.");
            } finally {
                setLoading(false);
            }
        }

        fetchReadings();
    }, [token]);

    // Handle Form Changes
    function handleFormChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFormError("");
        setSuccessMessage("");
    }

    // Add New Glucose Reading
    async function handleAddReading(event) {
        event.preventDefault();

        setFormError("");
        setSuccessMessage("");

        if (!formData.reading_date || !formData.glucose_value) {
            setFormError("Please enter a date and glucose value.");
            return;
        }

        if (formData.reading_date > getTodayDate()) {
            setFormError("Reading date cannot be in the future.");
            return;
        }

        const glucoseValue = Number(formData.glucose_value);

        if (
            !Number.isInteger(glucoseValue) ||
            glucoseValue < 40 ||
            glucoseValue > 600
        ) {
            setFormError("Value must be between 40 and 600 mg/dL.");
            return;
        }

        try {
            setSaving(true);

            const response = await createReading(
                {
                    ...formData,
                    glucose_value: glucoseValue,
                },
                token
            );

            setReadings((previous) => [
                response.data,
                ...previous,
            ]);

            setFormData((previous) => ({
                ...previous,
                glucose_value: "",
            }));

            setSuccessMessage("Glucose reading added successfully!");
        } catch (error) {
            setFormError(error.message || "Unable to add reading.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

                    <Link
                        to="/dashboard"
                        className="text-2xl font-bold text-emerald-700"
                    >
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

            {/* Page Content */}
            <main className="max-w-7xl mx-auto px-5 py-10">

                {/* Page Heading */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">
                            Glucose Readings
                        </h2>

                        <p className="text-slate-500 mt-2">
                            View and manage your glucose history.
                        </p>
                    </div>

                    <Link
                        to="/dashboard"
                        className="rounded-xl border border-emerald-200 px-5 py-3 text-emerald-700 font-medium hover:bg-emerald-50"
                    >
                        Back to Dashboard
                    </Link>

                </div>

                {/* Add Reading Form */}
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">

                    <h3 className="text-xl font-semibold text-slate-800 mb-6">
                        Add Glucose Reading
                    </h3>

                    <form
                        onSubmit={handleAddReading}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5"
                    >

                        {/* Reading Date */}
                        <div>
                            <label
                                htmlFor="reading_date"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Reading Date
                            </label>

                            <input
                                id="reading_date"
                                type="date"
                                name="reading_date"
                                value={formData.reading_date}
                                onChange={handleFormChange}
                                max={getTodayDate()}
                                required
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            />
                        </div>

                        {/* Time Slot */}
                        <div>
                            <label
                                htmlFor="time_slot"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Time Slot
                            </label>

                            <select
                                id="time_slot"
                                name="time_slot"
                                value={formData.time_slot}
                                onChange={handleFormChange}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            >
                                <option value="MORNING">
                                    Morning (Fasting)
                                </option>

                                <option value="AFTER_BREAKFAST">
                                    After breakfast
                                </option>

                                <option value="AFTER_LUNCH">
                                    After lunch
                                </option>

                                <option value="AFTER_DINNER">
                                    After dinner
                                </option>
                            </select>
                        </div>

                        {/* Glucose Value */}
                        <div>
                            <label
                                htmlFor="glucose_value"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Glucose Value (mg/dL)
                            </label>

                            <input
                                id="glucose_value"
                                type="number"
                                name="glucose_value"
                                min="40"
                                max="600"
                                step="1"
                                placeholder="e.g. 120"
                                value={formData.glucose_value}
                                onChange={handleFormChange}
                                required
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                            />
                        </div>

                        {/* Form Error */}
                        {formError && (
                            <div
                                role="alert"
                                className="md:col-span-3 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600"
                            >
                                {formError}
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div
                                role="status"
                                className="md:col-span-3 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700"
                            >
                                {successMessage}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="md:col-span-3">

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-6 py-3 transition"
                            >
                                {saving ? "Saving..." : "+ Add Reading"}
                            </button>

                        </div>

                    </form>
                </section>

                {/* Readings List */}
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

                    <div className="flex items-center justify-between mb-6">

                        <h3 className="text-xl font-semibold text-slate-800">
                            All Readings
                        </h3>

                        <span className="text-sm text-slate-500">
                            {readings.length} records
                        </span>

                    </div>

                    {loading ? (
                        <p className="text-slate-500 py-8 text-center">
                            Loading your readings...
                        </p>
                    ) : error ? (
                        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-600">
                            {error}
                        </div>
                    ) : readings.length === 0 ? (
                        <div className="text-center py-12">

                            <p className="text-lg font-medium text-slate-700">
                                No readings yet
                            </p>

                            <p className="text-sm text-slate-500 mt-2">
                                Your glucose readings will appear here.
                            </p>

                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full text-left">

                                <thead>
                                    <tr className="border-b border-slate-200 text-sm text-slate-500">

                                        <th className="py-4 pr-4 font-medium">
                                            Date
                                        </th>

                                        <th className="py-4 pr-4 font-medium">
                                            Time Slot
                                        </th>

                                        <th className="py-4 pr-4 font-medium">
                                            Glucose Value
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>
                                    {readings.map((reading) => (
                                        <tr
                                            key={reading.id}
                                            className="border-b border-slate-100 last:border-0"
                                        >

                                            <td className="py-4 pr-4 text-slate-700">
                                                {formatDate(reading.reading_date)}
                                            </td>

                                            <td className="py-4 pr-4 text-slate-700">
                                                {SLOT_LABELS[reading.time_slot] || reading.time_slot}
                                            </td>

                                            <td className="py-4 pr-4">
                                                <span className="font-semibold text-emerald-700">
                                                    {reading.glucose_value} mg/dL
                                                </span>
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

export default Readings;
