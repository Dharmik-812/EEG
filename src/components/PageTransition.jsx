import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.995,
    filter: "blur(2px)"
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)"
  },
  out: {
    opacity: 0,
    y: -14,
    scale: 1.005,
    filter: "blur(2px)"
  }
}

const pageTransition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.45
}

const PageTransition = ({ children, className = "" }) => {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState("in")

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("out")
    }
  }, [location, displayLocation])

  return (
    <motion.div
      className={`min-h-[50vh] will-change-transform ${className}`}
      key={displayLocation.pathname}
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
      onAnimationComplete={(definition) => {
        if (definition === "out") {
          setDisplayLocation(location)
          setTransitionStage("in")
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition