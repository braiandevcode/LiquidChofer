import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { CalculatorProvider } from '../../../core/context/CalculatorContext'
import { UserSettingsProvider } from '../../../core/context/UserSettingsContext'
import { ChatProvider } from '../context/ChatContext'
import PanelSidebar from './PanelSidebar'
import PanelMobileNav from './PanelMobileNav'
import PanelBreadcrumb from './PanelBreadcrumb'

const PanelLayout = (): ReactNode => {
  return (
    <UserSettingsProvider>
      <CalculatorProvider>
        <ChatProvider>
          <div className="flex h-dvh min-h-0 overflow-hidden bg-bg-deep">
            <PanelSidebar />
            <div className="flex min-w-0 min-h-0 flex-1 flex-col">
              <PanelMobileNav />
              <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-8">
                <PanelBreadcrumb />
                <Outlet />
              </main>
            </div>
          </div>
        </ChatProvider>
      </CalculatorProvider>
    </UserSettingsProvider>
  )
}

export default PanelLayout