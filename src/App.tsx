import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PrintJobsPage from "@/pages/PrintJobsPage";
import FilamentsPage from "@/pages/FilamentsPage";
import CostCalculatorPage from "@/pages/CostCalculatorPage";
import CustomersPage from "@/pages/CustomersPage";
import OrdersPage from "@/pages/OrdersPage";
import ShowcasePage from "@/pages/ShowcasePage";
import FailuresPage from "@/pages/FailuresPage";
import AssistantPage from "@/pages/AssistantPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import EquipmentPage from "@/pages/EquipmentPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jobs" element={<PrintJobsPage />} />
          <Route path="/filaments" element={<FilamentsPage />} />
          <Route path="/cost" element={<CostCalculatorPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/failures" element={<FailuresPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
