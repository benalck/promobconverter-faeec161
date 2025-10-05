import { motion } from "framer-motion"
import AppLayout from "@/components/AppLayout"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { ActivityChart } from "@/components/dashboard/ActivityChart"
import { OnboardingTour } from "@/components/onboarding/OnboardingTour"

const Dashboard = () => {
  return (
    <AppLayout>
      <OnboardingTour />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 pb-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-muted-foreground"
          >
            Visão geral das suas conversões e otimizações
          </motion.p>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <div data-tour="quick-actions">
          <QuickActions />
        </div>

        {/* Activity Chart */}
        <ActivityChart />
      </motion.div>
    </AppLayout>
  )
}

export default Dashboard
