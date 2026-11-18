import Layout from '../../modules/layout/Layout'
import PublicOnlyRoute from '../../modules/layout/PublicOnlyRoute'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import HomePage from '../../modules/pages/HomePage'
import FAQPage from '../../modules/pages/FAQPage'
import AboutPage from '../../modules/pages/AboutPage'
import TermsPage from '../../modules/pages/TermsPage'
import PrivacyPage from '../../modules/pages/PrivacyPage'
import VerifyJourneyPage from '../../modules/pages/VerifyJourneyPage'
import LoginPage from '../../modules/pages/LoginPage'
import ProtectedRoute from '../../modules/panel/ProtectedRoute'
import PanelLayout from '../../modules/panel/layout/PanelLayout'
import PanelHomePage from '../../modules/panel/pages/PanelHomePage'
import HistoryPage from '../../modules/panel/pages/HistoryPage'
import TrashPage from '../../modules/panel/pages/TrashPage'
import AiPage from '../../modules/panel/pages/AiPage'
import SettingsPage from '../../modules/panel/pages/SettingsPage'
import WizardPage from '../../modules/calculator/pages/WizardPage'
import { CALCULATOR_DEFAULT_PATH } from '../../modules/calculator/config/calculatorSteps.config'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicOnlyRoute>
        <Layout />
      </PublicOnlyRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'faq', element: <FAQPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'verificar', element: <VerifyJourneyPage /> },
      { path: 'verificar/:code', element: <VerifyJourneyPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: '/panel',
    element: (
      <ProtectedRoute>
        <PanelLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PanelHomePage /> },
      { path: 'calculadora', element: <Navigate to={CALCULATOR_DEFAULT_PATH} replace /> },
      { path: 'calculadora/:step', element: <WizardPage /> },
      { path: 'historial', element: <HistoryPage /> },
      { path: 'papelera', element: <TrashPage /> },
      { path: 'ia', element: <AiPage /> },
      { path: 'ajustes', element: <SettingsPage /> },
    ],
  },
])
