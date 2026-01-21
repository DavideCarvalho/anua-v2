import { motion } from 'framer-motion'

export function HeroIllustration() {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Background circle with gradient */}
      <motion.circle
        cx="200"
        cy="200"
        r="180"
        fill="url(#heroGradient)"
        opacity="0.1"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      {/* Laptop */}
      <motion.g
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <rect
          x="80"
          y="180"
          width="240"
          height="140"
          rx="8"
          stroke="hsl(262.1 83.3% 57.8%)"
          strokeWidth="3"
          fill="white"
        />
        <rect
          x="90"
          y="190"
          width="220"
          height="110"
          rx="4"
          fill="hsl(262.1 83.3% 57.8%)"
          opacity="0.1"
        />
        {/* Screen content - lines */}
        <line
          x1="100"
          y1="210"
          x2="180"
          y2="210"
          stroke="hsl(262.1 83.3% 57.8%)"
          strokeWidth="2"
          opacity="0.6"
        />
        <line
          x1="100"
          y1="230"
          x2="200"
          y2="230"
          stroke="hsl(262.1 83.3% 57.8%)"
          strokeWidth="2"
          opacity="0.6"
        />
        <line
          x1="100"
          y1="250"
          x2="160"
          y2="250"
          stroke="hsl(262.1 83.3% 57.8%)"
          strokeWidth="2"
          opacity="0.6"
        />
        {/* Keyboard base */}
        <path
          d="M 60 320 L 340 320 L 320 340 L 80 340 Z"
          fill="hsl(262.1 83.3% 57.8%)"
          opacity="0.8"
        />
      </motion.g>

      {/* Floating books */}
      <motion.g
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        <rect x="40" y="120" width="50" height="60" rx="4" fill="hsl(173 58% 39%)" opacity="0.8" />
        <rect x="45" y="125" width="40" height="4" fill="white" opacity="0.3" />
      </motion.g>

      {/* Floating book 2 */}
      <motion.g
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      >
        <rect x="310" y="100" width="45" height="55" rx="4" fill="hsl(197 37% 24%)" opacity="0.8" />
        <rect x="315" y="105" width="35" height="4" fill="white" opacity="0.3" />
      </motion.g>

      {/* Cloud elements */}
      <motion.g
        animate={{
          x: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        <circle cx="300" cy="60" r="20" fill="hsl(262.1 83.3% 57.8%)" opacity="0.15" />
        <circle cx="320" cy="65" r="25" fill="hsl(262.1 83.3% 57.8%)" opacity="0.15" />
        <circle cx="340" cy="60" r="18" fill="hsl(262.1 83.3% 57.8%)" opacity="0.15" />
      </motion.g>

      {/* Stars/sparkles */}
      <motion.g
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        <path
          d="M 60 60 L 62 66 L 68 68 L 62 70 L 60 76 L 58 70 L 52 68 L 58 66 Z"
          fill="hsl(43 74% 66%)"
        />
      </motion.g>

      <motion.g
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          delay: 0.8,
        }}
      >
        <path
          d="M 350 140 L 352 146 L 358 148 L 352 150 L 350 156 L 348 150 L 342 148 L 348 146 Z"
          fill="hsl(43 74% 66%)"
        />
      </motion.g>

      {/* Gradients */}
      <defs>
        <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(262.1 83.3% 57.8%)" />
          <stop offset="50%" stopColor="hsl(263.4 70% 50.4%)" />
          <stop offset="100%" stopColor="hsl(197 37% 24%)" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}
