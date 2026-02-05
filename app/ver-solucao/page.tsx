"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DemoSidebar } from "./components/demo-sidebar"
import { DemoHeader } from "./components/demo-header"
import { DemoDashboard } from "./components/demo-dashboard"
import { DemoCompanies } from "./components/demo-companies"
import { DemoDemands } from "./components/demo-demands"
import { DemoESocial } from "./components/demo-esocial"
import { DemoReports } from "./components/demo-reports"
import { DemoDocuments } from "./components/demo-documents"
import { DemoSettings } from "./components/demo-settings"

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Function to render content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DemoDashboard />
      case "companies": return <DemoCompanies />
      case "demands": return <DemoDemands />
      case "esocial": return <DemoESocial />
      case "reports": return <DemoReports />
      case "documents": return <DemoDocuments />
      case "settings": return <DemoSettings />
      default: return <DemoDashboard />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-primary selection:text-white">
      {/* Sidebar */}
      <DemoSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        <DemoHeader />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
