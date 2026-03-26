import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext";
import ProtectedRoute    from "./components/layout/ProtectedRoute";
import DashboardLayout   from "./components/layout/DashboardLayout";
import LoginPage         from "./pages/auth/LoginPage";
import OwnerOverview     from "./pages/owner/OwnerOverview";
import OwnerTrips        from "./pages/owner/OwnerTrips";
import OwnerPayments     from "./pages/owner/OwnerPayments";
import OwnerDrivers      from "./pages/owner/OwnerDrivers";
import OwnerCustomers    from "./pages/owner/OwnerCustomers";
import OwnerReports      from "./pages/owner/OwnerReports";
import DriverToday       from "./pages/driver/DriverToday";
import DriverEarnings    from "./pages/driver/DriverEarnings";
import DriverHistory     from "./pages/driver/DriverHistory";
import { C } from "./constants";

function NotFound() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", gap:12, background:C.bg }}>
      <div style={{ fontSize:72, fontWeight:900, color:C.border }}>404</div>
      <div style={{ fontSize:18, fontWeight:700, color:C.sub }}>Page not found</div>
      <div style={{ fontSize:13, color:C.mute }}>Shrinath Water Distributors</div>
      <a href="/login" style={{ marginTop:8, color:C.blue, fontWeight:600, fontSize:14 }}>← Back to Login</a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Owner portal */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute role="owner">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index            element={<OwnerOverview  />} />
          <Route path="trips"     element={<OwnerTrips     />} />
          <Route path="payments"  element={<OwnerPayments  />} />
          <Route path="drivers"   element={<OwnerDrivers   />} />
          <Route path="customers" element={<OwnerCustomers />} />
          <Route path="reports"   element={<OwnerReports   />} />
        </Route>

        {/* Driver portal */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute role="driver">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index             element={<DriverToday    />} />
          <Route path="earnings"   element={<DriverEarnings />} />
          <Route path="history"    element={<DriverHistory  />} />
        </Route>

        {/* Root redirect */}
        <Route path="/"  element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
