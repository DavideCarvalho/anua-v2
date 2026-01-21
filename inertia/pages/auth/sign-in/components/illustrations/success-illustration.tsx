import { motion } from 'framer-motion'

export function SuccessIllustration() {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Background circle */}
      <motion.circle
        cx="100"
        cy="100"
        r="90"
        fill="url(#successGradient)"
        opacity="0.15"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
      />

      {/* Email envelope */}
      <motion.g
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Envelope body */}
        <rect
          x="50"
          y="70"
          width="100"
          height="70"
          rx="8"
          fill="white"
          stroke="hsl(262.1 83.3% 57.8%)"
          strokeWidth="3"
        />

        {/* Envelope flap */}
        <motion.path
          d="M 50 70 L 100 110 L 150 70"
          stroke="hsl(262.1 83.3% 57.8%)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />

        {/* Email content lines */}
        <line
          x1="70"
          y1="95"
          x2="130"
          y2="95"
          stroke="hsl(262.1 83.3% 57.8%)"
          strokeWidth="2"
          opacity="0.3"
        />
        <line
          x1="70"
          y1="105"
          x2="115"
          y2="105"
          stroke="hsl(262.1 83.3% 57.8%)"
          strokeWidth="2"
          opacity="0.3"
        />
      </motion.g>

      {/* Checkmark badge */}
      <motion.g
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: 'backOut' }}
      >
        <circle cx="140" cy="60" r="25" fill="hsl(142 76% 36%)" />
        <motion.path
          d="M 130 60 L 137 67 L 150 54"
          stroke="white"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        />
      </motion.g>

      {/* Sparkles around checkmark */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, delay: 0.9 }}
      >
        <path
          d="M 165 50 L 167 53 L 170 55 L 167 57 L 165 60 L 163 57 L 160 55 L 163 53 Z"
          fill="hsl(43 74% 66%)"
        />
        <path
          d="M 155 35 L 157 38 L 160 40 L 157 42 L 155 45 L 153 42 L 150 40 L 153 38 Z"
          fill="hsl(43 74% 66%)"
        />
        <path
          d="M 170 70 L 172 73 L 175 75 L 172 77 L 170 80 L 168 77 L 165 75 L 168 73 Z"
          fill="hsl(43 74% 66%)"
        />
      </motion.g>

      {/* Flying particles */}
      <motion.circle
        cx="60"
        cy="60"
        r="3"
        fill="hsl(262.1 83.3% 57.8%)"
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: -20, opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, delay: 0.7, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
      />
      <motion.circle
        cx="140"
        cy="140"
        r="3"
        fill="hsl(173 58% 39%)"
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: -25, opacity: [0, 1, 0] }}
        transition={{ duration: 1.8, delay: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(142 76% 36%)" />
          <stop offset="100%" stopColor="hsl(262.1 83.3% 57.8%)" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}
