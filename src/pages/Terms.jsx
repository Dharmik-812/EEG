import { motion } from 'framer-motion'
import SEO from '../components/SEO'

export default function Terms() {
  return (
    <>
      <SEO title="Terms of Service" description="Terms of service for AverSoltix environmental education platform." />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12"
          >
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-8">
              Terms of Service
            </h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4">
                Acceptance of Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                By accessing and using AverSoltix, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
              
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4">
                Use License
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Permission is granted to temporarily download one copy of AverSoltix for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
              
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4">
                Environmental Education Focus
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Our platform is dedicated to environmental education and sustainability. 
                Users are encouraged to use the platform responsibly and in alignment with our 
                environmental mission.
              </p>
              
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4">
                Contact Information
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                If you have any questions about these Terms of Service, please contact us at 
                <a href="mailto:legal@aversoltix.com" className="text-emerald-500 hover:text-emerald-600">
                  legal@aversoltix.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
