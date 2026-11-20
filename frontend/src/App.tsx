import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import MessageToasts from './components/chat/MessageToasts'
import AuthGate from './components/common/AuthGate'
import AuthProvider from './context/AuthProvider'
import ToastProvider from './context/ToastProvider'
import WalletProvider from './context/WalletProvider'
import WebSocketProvider from './context/WebSocketProvider'
import DashboardPage from './pages/DashboardPage'
import ExplorePage from './pages/ExplorePage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import MessagesPage from './pages/MessagesPage'
import NotFoundPage from './pages/NotFoundPage'
import OnboardingPage from './pages/OnboardingPage'
import SessionsPage from './pages/SessionsPage'
import SettingsPage from './pages/SettingsPage'
import UserProfilePage from './pages/UserProfilePage'
import WalletPage from './pages/WalletPage'

// A data router rather than <BrowserRouter>, because Settings needs useBlocker to warn about
// unsaved changes. The routes themselves are unchanged.
const router = createBrowserRouter([
  {
    // Pathless layout route: adds no URL segment. Auth wraps everything (the landing needs it to
    // redirect members home), while the gate and wallet wrap only the app, so the landing stays public.
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: '/', element: <LandingPage /> },
      // The sign-in route. AuthGate sends signed-out visitors here with the URL they wanted,
      // and the page sends signed-in visitors straight on, so it never shows a member the form.
      { path: '/login', element: <LoginPage /> },
      // Unknown URLs show the 404 page. It sits beside the landing, outside the gate, so a
      // signed-out visitor sees it too instead of being asked to sign in to a page that doesn't exist.
      { path: '*', element: <NotFoundPage /> },
      {
        element: (
          <AuthGate>
            <WalletProvider>
              <Outlet />
              <MessageToasts />
            </WalletProvider>
          </AuthGate>
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
        ],
      },
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
