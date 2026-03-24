import { motion } from "framer-motion";

interface ScoreDialProps {
  score: number;
  passingScore?: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreDial({ score, passingScore = 70, size = 200, strokeWidth = 16 }: ScoreDialProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const isPassing = score >= passingScore;
  const colorClass = isPassing ? "text-success" : "text-destructive";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/10"
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
          className={colorClass}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center"
        >
          <span className="text-4xl md:text-5xl font-display font-bold tracking-tighter">
            {Math.round(score)}%
          </span>
          <span className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
            Score
          </span>
          <span className={`mt-2 font-medium px-3 py-1 rounded-full text-xs bg-opacity-20 ${
            isPassing ? 'bg-success text-success' : 'bg-destructive text-destructive'
          }`}>
            {isPassing ? 'PASSED' : 'FAILED'}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
