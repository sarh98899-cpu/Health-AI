import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import HealthProfilePage from "@/react-app/pages/HealthProfile";
import MedicalTestPage from "@/react-app/pages/MedicalTest";
import ConsultationPage from "@/react-app/pages/Consultation";
import PreventivePlanPage from "@/react-app/pages/PreventivePlan";
import MedicalHistoryPage from "@/react-app/pages/MedicalHistory";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<HealthProfilePage />} />
          <Route path="/medical-test" element={<MedicalTestPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/preventive-plan" element={<PreventivePlanPage />} />
          <Route path="/history" element={<MedicalHistoryPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
