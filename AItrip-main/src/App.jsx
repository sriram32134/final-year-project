import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { notificationService, tripService } from './services/index.js';
import { Navbar } from './components/navigation/Navbar.jsx';
import { MobileBottomNav } from './components/navigation/MobileBottomNav.jsx';
import { NotificationDrawer } from './components/notifications/NotificationDrawer.jsx';
import { ReplanModal } from './components/notifications/ReplanModal.jsx';
import { ScrollToTop } from './components/common/ScrollToTop.jsx';

import { LandingPage } from './pages/Landing.jsx';
import { ExplorePage } from './pages/Explore.jsx';
import { PlannerPage } from './pages/Planner.jsx';
import { GenerationPage } from './pages/Generation.jsx';
import { TripDetailsPage } from './pages/TripDetails.jsx';
import { ExecutionCenterPage } from './pages/ExecutionCenter.jsx';
import { MemoryPage } from './pages/Memory.jsx';
import { ProfilePage } from './pages/Profile.jsx';
import { HistoryPage } from './pages/History.jsx';
import { LoginPage } from './pages/Login.jsx';
import { SignupPage } from './pages/Signup.jsx';

import { ThemeProvider } from './context/ThemeContext.jsx';
import { PaletteSwitcher } from './components/common/PaletteSwitcher.jsx';

export function App() {
  const [notifications, setNotifications] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [replanModalOpen, setReplanModalOpen] = useState(false);
  const [selectedNotifForReplan, setSelectedNotifForReplan] = useState(null);

  useEffect(() => {
    notificationService.getNotifications().then(setNotifications);
  }, []);

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    const updated = await notificationService.getNotifications();
    setNotifications(updated);
  };

  const handleOpenReplan = (notif) => {
    setSelectedNotifForReplan(notif);
    setDrawerOpen(false);
    setReplanModalOpen(true);
  };

  const handleAcceptReplan = async () => {
    await tripService.applyReplan('trip-goa-4d');
    if (selectedNotifForReplan) {
      await notificationService.markAsRead(selectedNotifForReplan.id);
      const updated = await notificationService.getNotifications();
      setNotifications(updated);
    }
  };

  const handleTriggerDelaySim = (flightCode) => {
    const delayNotif = notifications.find((n) => n.id === 'notif-flight-delay');
    if (delayNotif) {
      setSelectedNotifForReplan(delayNotif);
      setReplanModalOpen(true);
    }
  };

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen text-slate-100 flex flex-col font-sans transition-colors duration-500" style={{ backgroundColor: 'var(--bg-main, #000000)' }}>
          {/* Global Floating Navigation */}
          <Navbar
            notifications={notifications}
            onOpenNotifications={() => setDrawerOpen(true)}
          />

          {/* Color Palette Switcher Widget */}
          <PaletteSwitcher />

          {/* Global Notification Drawer */}
          <NotificationDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllAsRead}
            onOpenReplanModal={handleOpenReplan}
          />

          {/* Dynamic Replanning Conflict Modal */}
          <ReplanModal
            isOpen={replanModalOpen}
            notification={selectedNotifForReplan}
            onClose={() => setReplanModalOpen(false)}
            onAcceptReplan={handleAcceptReplan}
          />

          {/* App Content Routing */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/generate" element={<GenerationPage />} />
              <Route path="/trips" element={<HistoryPage />} />
              <Route path="/plans" element={<HistoryPage />} />
              <Route path="/my-plans" element={<HistoryPage />} />
              <Route
                path="/trips/:id"
                element={<TripDetailsPage onTriggerDelaySim={handleTriggerDelaySim} />}
              />
              <Route
                path="/trip/:id"
                element={<TripDetailsPage onTriggerDelaySim={handleTriggerDelaySim} />}
              />
              <Route path="/execution" element={<ExecutionCenterPage />} />
              <Route path="/memory" element={<MemoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
