import { motion } from "framer-motion"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"

const data = [
  { name: "Seg", conversoes: 4, economia: 240 },
  { name: "Ter", conversoes: 8, economia: 480 },
  { name: "Qua", conversoes: 12, economia: 720 },
  { name: "Qui", conversoes: 6, economia: 360 },
  { name: "Sex", conversoes: 15, economia: 900 },
  { name: "Sáb", conversoes: 3, economia: 180 },
  { name: "Dom", conversoes: 2, economia: 120 }
]

export function ActivityChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="industrial-card p-6"
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Atividade Semanal</h2>
          <p className="text-sm text-muted-foreground">Conversões e economia nos últimos 7 dias</p>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorConversoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEconomia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="conversoes"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorConversoes)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="economia"
                stroke="hsl(var(--accent))"
                fillOpacity={1}
                fill="url(#colorEconomia)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
