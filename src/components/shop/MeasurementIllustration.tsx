// SerenCare Measurement Illustration Component
import { motion } from "framer-motion";

interface MeasurementIllustrationProps {
  className?: string;
}

export function MeasurementIllustration({ className }: MeasurementIllustrationProps) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Body silhouette */}
        <motion.ellipse
          cx="100"
          cy="80"
          rx="35"
          ry="50"
          className="fill-muted stroke-border"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Head */}
        <motion.circle
          cx="100"
          cy="20"
          r="18"
          className="fill-muted stroke-border"
          strokeWidth="2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        
        {/* Waist measurement line */}
        <motion.path
          d="M 55 80 Q 100 95 145 80"
          className="stroke-primary"
          strokeWidth="3"
          strokeDasharray="6 3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        
        {/* Measurement tape wrap effect */}
        <motion.path
          d="M 55 80 Q 100 65 145 80"
          className="stroke-primary"
          strokeWidth="3"
          strokeDasharray="6 3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        />
        
        {/* Navel indicator */}
        <motion.circle
          cx="100"
          cy="75"
          r="4"
          className="fill-primary"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 1.2 }}
        />
        
        {/* Arrow left */}
        <motion.g
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        >
          <path
            d="M 45 80 L 55 75 L 55 85 Z"
            className="fill-primary"
          />
          <line
            x1="45"
            y1="80"
            x2="30"
            y2="80"
            className="stroke-primary"
            strokeWidth="2"
          />
        </motion.g>
        
        {/* Arrow right */}
        <motion.g
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        >
          <path
            d="M 155 80 L 145 75 L 145 85 Z"
            className="fill-primary"
          />
          <line
            x1="155"
            y1="80"
            x2="170"
            y2="80"
            className="stroke-primary"
            strokeWidth="2"
          />
        </motion.g>
        
        {/* Measurement label */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.6 }}
        >
          <rect
            x="70"
            y="140"
            width="60"
            height="18"
            rx="4"
            className="fill-primary"
          />
          <text
            x="100"
            y="152"
            textAnchor="middle"
            className="fill-primary-foreground text-[10px] font-semibold"
          >
            Tour de taille
          </text>
        </motion.g>
        
        {/* Animated pulse on navel */}
        <motion.circle
          cx="100"
          cy="75"
          r="8"
          className="stroke-primary fill-none"
          strokeWidth="2"
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ 
            duration: 1.5, 
            delay: 1.5,
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      </svg>
    </div>
  );
}
