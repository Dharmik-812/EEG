import { motion } from 'framer-motion'
import { useFramerPreset } from '../../animations'

export function AnimatedHero({ title, description, ctaPrimary, ctaSecondary, media }: {
  title: string
  description?: string
  ctaPrimary?: React.ReactNode
  ctaSecondary?: React.ReactNode
  media?: React.ReactNode
}) {
  const hero = useFramerPreset('heroEntrance') as any

  return (
    <section className="relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[calc(100vh-6rem)]">
        <motion.div {...hero?.heading} className="md:col-span-7">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight">{title}</h1>
          {description && (
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">{description}</p>
          )}
          <div className="mt-8 flex items-center gap-3">
            {ctaPrimary}
            {ctaSecondary}
          </div>
        </motion.div>
        <motion.div {...hero?.image} className="relative md:col-span-5">
          {media}
        </motion.div>
      </div>
    </section>
  )
}

export default AnimatedHero
