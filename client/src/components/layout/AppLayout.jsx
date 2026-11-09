import { Outlet } from "react-router-dom";
import TopNavbar from "./TopNavbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#EEF6FC] text-[#0F172A] flex flex-col font-sans selection:bg-[#0A387E] selection:text-white">
      {/* Full-width Horizontal Top Navigation Bar */}
      <TopNavbar />

      {/* Main Content Area: Occupies 100% of available viewport width */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
