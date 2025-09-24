import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Eye, EyeOff, Stars, TreePine, Leaf, Globe, Award, Gamepad2, Users, GraduationCap, School, User, BookOpen } from 'lucide-react'
import SEO from '../components/SEO.jsx'

const USER_ROLES = [
  {
    value: 'visitor',
    label: 'Visitor',
    description: 'Explore and learn about environmental topics',
    icon: User,
    color: 'from-slate-500 to-gray-600'
  },
  {
    value: 'school-student',
    label: 'School Student',
    description: 'Access school-specific content and competitions',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    value: 'school-teacher',
    label: 'School Teacher',
    description: 'Create and manage content for your school',
    icon: School,
    color: 'from-emerald-500 to-green-600'
  },
  {
    value: 'college-student',
    label: 'College Student',
    description: 'Advanced environmental challenges and research',
    icon: GraduationCap,
    color: 'from-purple-500 to-violet-600'
  },
  {
    value: 'college-teacher',
    label: 'College Teacher',
    description: 'Design advanced curriculum and research projects',
    icon: Award,
    color: 'from-orange-500 to-red-600'
  },
]

export default function Register() {
  const { register } = useAuthStore(s => ({ register: s.register }))
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [institution, setInstitution] = useState({ name: '', code: '', location: '' })
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  const isTeacher = role === 'school-teacher' || role === 'college-teacher'
  const needsInstitution = role !== 'visitor' && role !== ''

  function handleNext(e) {
    e.preventDefault()
    if (step === 1) {
      if (!name || !email || !password) {
        toast.error('Please fill in all fields')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!role) {
        toast.error('Please select your role')
        return
      }
      if (needsInstitution && role !== 'visitor') {
        setStep(3)
      } else {
        handleSubmit()
      }
    } else {
      handleSubmit()
    }
  }

  function handleSubmit() {
    try {
      const userData = {
        name,
        email,
        password,
        role,
        institution: needsInstitution && institution.name ? institution : null
      }
      register(userData)
      toast.success(`Welcome to AverSoltix, ${name}! 🎉`)
      navigate('/')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <>
      <SEO title="Register" description="Create an AverSoltix account to unlock challenges, badges, leaderboards, and the 2D game editor." />
      
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
    <section className="min-h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative">
      <motion.div 
        initial={{ opacity: 0, x: -30 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }} 
        className="order-2 lg:order-1"
      >
        <Card>
          <div className="flex items-center gap-3 text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            <div className="relative">
              <Stars className="text-emerald-500 animate-pulse"/> 
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            Join the AverSoltix Community
          </div>
          <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">
            Start your journey towards environmental literacy. Create games, earn badges, and make a positive impact on our planet!
          </p>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Rocket className="h-5 w-5"/>
              Unlock your potential:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
              >
                <Award className="h-5 w-5 text-emerald-500 flex-shrink-0"/>
                <span>Earn XP & Badges</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20"
              >
                <Users className="h-5 w-5 text-blue-500 flex-shrink-0"/>
                <span>Join Leaderboards</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
              >
                <Gamepad2 className="h-5 w-5 text-purple-500 flex-shrink-0"/>
                <span>Build Eco-Games</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
              >
                <Globe className="h-5 w-5 text-green-500 flex-shrink-0"/>
                <span>Learn with Friends</span>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 30 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }} 
        className="order-1 lg:order-2"
      >
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Start Your Journey</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Create your AverSoltix account</p>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNum
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                  animate={step >= stepNum ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {stepNum}
                </motion.div>
                {stepNum < 3 && (
                  <div className={`w-12 h-1 mx-2 rounded ${
                    step > stepNum ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleNext} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input 
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                      placeholder="Enter your full name" 
                      type="text"
                      value={name} 
                      onChange={e=>setName(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input 
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                      placeholder="Enter your email" 
                      type="email"
                      value={email} 
                      onChange={e=>setEmail(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <div className="relative">
                      <input 
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 pr-12 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                        placeholder="Create a secure password" 
                        type={showPwd ? 'text' : 'password'} 
                        value={password} 
                        onChange={e=>setPassword(e.target.value)}
                        required
                      />
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button" 
                        aria-label="Toggle password visibility" 
                        onClick={() => setShowPwd(s=>!s)} 
                        className="absolute inset-y-0 right-3 flex items-center p-1 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                      >
                        {showPwd ? <EyeOff className="h-5 w-5 text-slate-500"/> : <Eye className="h-5 w-5 text-slate-500"/>}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Role Selection */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Choose Your Role</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Select the option that best describes you</p>
                  </div>
                  
                  <div className="grid gap-3">
                    {USER_ROLES.map((roleOption) => {
                      const Icon = roleOption.icon
                      return (
                        <motion.label
                          key={roleOption.value}
                          className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            role === roleOption.value
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={roleOption.value}
                            checked={role === roleOption.value}
                            onChange={(e) => setRole(e.target.value)}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${roleOption.color} text-white mr-4`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">{roleOption.label}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{roleOption.description}</p>
                          </div>
                          {role === roleOption.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="w-2 h-2 bg-white rounded-full"
                              />
                            </motion.div>
                          )}
                        </motion.label>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Institution Details */}
              {step === 3 && needsInstitution && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {isTeacher ? 'Setup Your Institution' : 'Institution Details'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {isTeacher 
                        ? 'Add your school/college to create custom content'
                        : 'Enter your institution details to access relevant content'
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {role?.includes('school') ? 'School Name' : 'College Name'}
                      </label>
                      <input 
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                        placeholder={`Enter your ${role?.includes('school') ? 'school' : 'college'} name`}
                        type="text"
                        value={institution.name} 
                        onChange={e=>setInstitution({...institution, name: e.target.value})} 
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Institution Code (Optional)</label>
                      <input 
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                        placeholder="e.g., MIT2024, NHS001"
                        type="text"
                        value={institution.code} 
                        onChange={e=>setInstitution({...institution, code: e.target.value})} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                      <input 
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                        placeholder="City, State/Country"
                        type="text"
                        value={institution.location} 
                        onChange={e=>setInstitution({...institution, location: e.target.value})} 
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <motion.button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
              )}
              
              <motion.button 
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2" 
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.25)" }} 
                whileTap={{ scale: 0.98 }}
              >
                {step === 3 || (step === 2 && role === 'visitor') ? (
                  <>
                    <Rocket className="h-5 w-5"/> 
                    Create Account
                  </>
                ) : (
                  'Next Step'
                )}
              </motion.button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5 }}
              className="text-center pt-4"
            >
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account? {' '}
                <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors">
                  Sign in here
                </Link>
              </p>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </section>
    </>
  )
}

