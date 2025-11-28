import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeatureCard3DProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

const FeatureCard3D = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient,
  delay = 0 
}: FeatureCard3DProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="group relative overflow-hidden glass-premium border-0 p-6 h-full hover-lift">
        {/* Gradient background on hover */}
        <div 
          className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`}
        />
        
        {/* Icon container with animation */}
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center mb-4 relative`}
        >
          <Icon className="w-8 h-8 text-white" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity" 
               style={{ background: 'inherit' }} 
          />
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Bottom accent line */}
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${gradient}`}
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: delay + 0.3 }}
        />
      </Card>
    </motion.div>
  );
};

export default FeatureCard3D;
