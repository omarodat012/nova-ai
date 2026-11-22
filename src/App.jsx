import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute.jsx';
import Layout from './components/layout/Layout.jsx';
import AchievementDetail from './pages/AchievementDetail.jsx';
import Feedback from './pages/Feedback.jsx';
import Home from './pages/Home.jsx';
import Join from './pages/Join.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import SubTeam from './pages/SubTeam.jsx';

// Only admins ever open the dashboard, so its code is loaded on demand.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));

function PageLoader() {
  return (
    <div className="grid min-h-svh place-items-center">
      <LoaderCircle className="size-9 animate-spin text-logo-blue" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="subteam/:id" element={<SubTeam />} />
        <Route path="achievements/:id" element={<AchievementDetail />} />
        <Route path="join" element={<Join />} />
        <Route path="profile" element={<Profile />} />
        <Route path="feedback" element={<Feedback />} />
        <Route
          path="admin"
          element={
            <ProtectedAdminRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
