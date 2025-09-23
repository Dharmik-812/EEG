import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: "blur(4px)"
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)"
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    filter: "blur(4px)"
  }
}

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.6
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
      className={`min-h-[50vh] ${className}`}
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