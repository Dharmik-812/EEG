import SEO from '../components/SEO.jsx'

export default function About() {
  return (
    <>
      <SEO title="About" description="Learn about AverSoltix's mission to teach environmental science through play and inspire action for a sustainable future." />
    <section>
      <div className="card p-8">
        <h2 className="text-2xl font-bold">Our Mission</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          AverSoltix empowers students to learn environmental science through play. By blending interactive content with gamification, we spark curiosity and inspire action for a sustainable future.
        </p>
        <h3 className="mt-8 text-xl font-semibold">Vision</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          A world where every learner becomes a steward of the planet—understanding climate change, protecting biodiversity, and accelerating the transition to renewable energy.
        </p>
      </div>
    </section>
    </>
  )
}

