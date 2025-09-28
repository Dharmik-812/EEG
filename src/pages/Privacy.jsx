import { motion } from 'framer-motion'
import SEO from '../components/SEO'

export default function Privacy() {
  return (
    <>
      <SEO title="Privacy Policy" description="Privacy policy for AverSoltix environmental education platform." />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12"
          >
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4">
                Information We Collect
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                participate in our environmental education programs, or contact us for support.
              </p>
              
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4">
                How We Use Your Information
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We use the information we collect to provide, maintain, and improve our services, 
                process transactions, and communicate with you about our environmental education programs.
              </p>
              
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4">
                Data Security
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mt-8 mb-4">
                Contact Us
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                If you have any questions about this Privacy Policy, please contact us at 
                <a href="mailto:privacy@aversoltix.com" className="text-emerald-500 hover:text-emerald-600">
                  privacy@aversoltix.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
