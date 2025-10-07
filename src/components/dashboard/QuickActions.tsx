import { motion } from "framer-motion"
import { Upload, Scissors, FileSpreadsheet, Calculator, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface ActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
  delay?: number
  variant?: "primary" | "secondary"
}

const ActionCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  delay = 0,
  variant = "secondary" 
}: ActionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="outline"
        className={`
          industrial-card w-full h-auto p-6 flex flex-col items-start text-left space-y-3 
          hover:border-primary/50 transition-all duration-300
          ${variant === "primary" ? "border-primary/30 bg-primary/5" : ""}
        `}
        onClick={onClick}
      >
        <div className={`
          h-12 w-12 rounded-xl flex items-center justify-center
          ${variant === "primary" ? "bg-primary/20" : "bg-accent/20"}
        `}>
          <Icon className={`h-6 w-6 ${variant === "primary" ? "text-primary" : "text-accent"}`} />
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-base">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </Button>
    </motion.div>
  )
}

export function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    {
      title: "Converter XML",
      description: "Transforme arquivos Promob em Excel",
      icon: Upload,
      onClick: () => navigate("/"),
      variant: "primary" as const,
      delay: 0
    },
    {
      title: "Otimizar Corte",
      description: "Gere planos de corte otimizados",
      icon: Scissors,
      onClick: () => navigate("/"),
      variant: "secondary" as const,
      delay: 0.1
    },
    {
      title: "Gerar Orçamento",
      description: "Calcule custos automaticamente",
      icon: Calculator,
      onClick: () => navigate("/estimates"),
      variant: "secondary" as const,
      delay: 0.2
    },
    {
      title: "Ver Histórico",
      description: "Acesse suas conversões anteriores",
      icon: FileSpreadsheet,
      onClick: () => navigate("/"),
      variant: "secondary" as const,
      delay: 0.3
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ações Rápidas</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <ActionCard key={action.title} {...action} />
        ))}
      </div>
    </div>
  )
}
