import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import MessageToasts from './components/chat/MessageToasts'
import AuthGate from './components/common/AuthGate'
import AuthProvider from './context/AuthProvider'
import ToastProvider from './context/ToastProvider'
import WalletProvider from './context/WalletProvider'
import WebSocketProvider from './context/WebSocketProvider'
import DashboardPage from './pages/DashboardPage'
import ExplorePage from './pages/ExplorePage'
import MessagesPage from './pages/MessagesPage'
import OnboardingPage from './pages/OnboardingPage'
import SessionsPage from './pages/SessionsPage'
import SettingsPage from './pages/SettingsPage'
import UserProfilePage from './pages/UserProfilePage'
import WalletPage from './pages/WalletPage'

// A data router rather than <BrowserRouter>, because Settings needs useBlocker to warn about
// unsaved changes. The routes themselves are unchanged.
const router = createBrowserRouter([
  {
    // Pathless layout route: adds no URL segment. It sits inside the router so AuthGate can redirect and
    // the wallet can refresh on navigation. The wallet comes after the gate, so it only loads when signed in.
    element: (
      <AuthProvider>
        <AuthGate>
          <WalletProvider>
            <Outlet />
            <MessageToasts />
          </WalletProvider>
        </AuthGate>
      </AuthProvider>
    ),
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/explore', element: <ExplorePage /> },
      { path: '/user/:id', element: <UserProfilePage /> },
      { path: '/messages', element: <MessagesPage /> },
      { path: '/sessions', element: <SessionsPage /> },
      { path: '/wallet', element: <WalletPage /> },
      { path: '/settings', element: <SettingsPage /> },
      // The plan defines no landing or 404 page, so these fall back to the home base.
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
])

// WebSocketProvider stays outermost because WalletProvider listens to its chat events. Toasts wrap the router,
// so a failure still shows after the page that raised it navigates away.
export default function App() {
  return (
    <WebSocketProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </WebSocketProvider>
  )
}
