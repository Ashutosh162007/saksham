import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ConfirmProvider } from './components/feedback/ConfirmDialog'
import { ToastProvider } from './components/feedback/Toast'
import { DashboardPage } from './pages/Dashboard'
import { ApplicationsPage } from './pages/Applications'
import { ApplicationDetailPage } from './pages/ApplicationDetail'
import { WorkflowPage } from './pages/Workflow'
import { EvcPage } from './pages/Evc'
import { CompliancePage } from './pages/Compliance'
import { ComplianceDetailPage } from './pages/ComplianceDetail'
import { DocumentsPage } from './pages/Documents'
import { DocumentDetailPage } from './pages/DocumentDetail'
import { NotificationsPage } from './pages/Notifications'
import { AuditPage } from './pages/Audit'
import { SettingsPage } from './pages/Settings'
import { DemoProvider } from './store/demo-store'

export default function App() {
  return (
    <DemoProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
                <Route path="/workflow" element={<WorkflowPage />} />
                <Route path="/evc" element={<EvcPage />} />
                <Route path="/compliance" element={<CompliancePage />} />
                <Route path="/compliance/:id" element={<ComplianceDetailPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/documents/:id" element={<DocumentDetailPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </DemoProvider>
  )
}
