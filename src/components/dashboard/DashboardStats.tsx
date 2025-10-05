import { motion } from "framer-motion"
import { FileText, TrendingUp, Clock, DollarSign, LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  trend?: number
  delay?: number
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="industrial-card p-6 relative overflow-hidden group"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {trend && (
            <div className={`flex items-center text-sm ${trend > 0 ? 'text-accent' : 'text-destructive'}`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span className="font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function DashboardStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Conversões Hoje"
        value={12}
        subtitle="8 a mais que ontem"
        icon={FileText}
        trend={24}
        delay={0}
      />
      <StatCard
        title="Tempo Médio"
        value="2.4s"
        subtitle="15% mais rápido"
        icon={Clock}
        trend={15}
        delay={0.1}
      />
      <StatCard
        title="Economia Gerada"
        value="R$ 1.2k"
        subtitle="Este mês"
        icon={DollarSign}
        trend={32}
        delay={0.2}
      />
      <StatCard
        title="Taxa de Sucesso"
        value="98.5%"
        subtitle="Últimos 30 dias"
        icon={TrendingUp}
        trend={2}
        delay={0.3}
      />
    </div>
  )
}
