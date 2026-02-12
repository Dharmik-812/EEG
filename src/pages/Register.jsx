import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useAdminRequestStore } from '../store/adminRequestStore'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Eye, EyeOff, Stars, Globe, Award, Gamepad2, Users, GraduationCap, School, User, BookOpen, Sprout, ShieldQuestion } from 'lucide-react'
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
  const { submitAdminRequest } = useAdminRequestStore()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('visitor')
  const [institution, setInstitution] = useState({ name: '', code: '', location: '', type: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [adminScope, setAdminScope] = useState('class')
  const [adminReason, setAdminReason] = useState('')
  const navigate = useNavigate()

  const isTeacher = role === 'school-teacher' || role === 'college-teacher'
  const needsInstitution = role !== 'visitor'

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
      if (needsInstitution) {
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
        institution: needsInstitution && institution.name ? { 
          ...institution, 
          type: role.includes('school') ? 'school' : 'college' 
        } : null
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

      <section className="min-h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center relative px-4 sm:px-6 lg:px-8">
        {/* Left Side - Benefits Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="order-2 lg:order-1"
        >
          <Card>
            <div className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              <div className="relative">
                <Stars className="text-emerald-500 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <span className="hidden sm:inline">Join the AverSoltix Community</span>
              <span className="sm:hidden">Join AverSoltix</span>
            </div>
            <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              Start your journey towards environmental literacy. Create games, earn badges, and make a positive impact on our planet!
            </p>

            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Unlock your potential:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
                >
                  <Award className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Earn XP & Badges</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20"
                >
                  <Users className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span>Join Leaderboards</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                >
                  <Gamepad2 className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  <span>Build Eco-Games</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                >
                  <Globe className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Learn with Friends</span>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right Side - Registration Form */}
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
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 sm:px-4 py-3 text-base bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 touch-manipulation" 
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
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 sm:px-4 py-3 text-base bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 touch-manipulation" 
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
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 sm:px-4 py-3 pr-12 text-base bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 touch-manipulation" 
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
                          className="absolute inset-y-0 right-3 flex items-center p-1 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                        >
                          {showPwd ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500"/> : <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500"/>}
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
              <div className="flex gap-3 sm:gap-4 pt-4">
                {step > 1 && (
                  <motion.button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 px-4 sm:px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-base min-h-[48px] touch-manipulation"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                )}
                
                <motion.button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-base min-h-[48px] touch-manipulation" 
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

              {/* Admin application CTA for teachers */}
              {isTeacher && step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-2 rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/20 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-emerald-500/90 p-2 text-white shadow-sm">
                      <ShieldQuestion className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-100">
                        Interested in becoming an administrator?
                      </p>
                      <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-100/80">
                        Apply for elevated permissions to manage your class or entire institution on AverSoltix.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-emerald-900/70 dark:text-emerald-100/70">
                      Your request goes to the platform admin panel under <span className="font-semibold">Pending Admin Approvals</span>.
                    </p>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowAdminDialog(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-400/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 dark:bg-slate-900/80 dark:text-emerald-200"
                    >
                      <ShieldQuestion className="h-3.5 w-3.5" />
                      Apply to be an administrator
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-green-900/20 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <p className="text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                  By creating an account, you agree to join our mission of environmental education and sustainability.
                  <span className="flex items-center justify-center gap-1.5 mt-1">
                    <span>Let's build a greener future together!</span>
                    <Sprout className="h-4 w-4 text-emerald-600" />
                  </span>
                </p>
              </motion.div>
            </form>

            {/* Admin application dialog */}
            <AnimatePresence>
              {showAdminDialog && (
                <motion.div
                  className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 16, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 16, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="max-w-lg w-full mx-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-emerald-100/70 dark:border-emerald-800/60 shadow-2xl"
                  >
                    <div className="border-b border-slate-200/70 dark:border-slate-800/70 px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                          <ShieldQuestion className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            Apply to become an administrator
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            This request will be reviewed by an existing admin.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAdminDialog(false)}
                        className="rounded-full px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Esc
                      </button>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            Why do you want to become an administrator?
                          </label>
                          <textarea
                            value={adminReason}
                            onChange={e => setAdminReason(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            placeholder="Describe how you’ll use admin tools to support your class or institution."
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              Admin scope
                            </label>
                            <div className="grid grid-cols-1 gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => setAdminScope('class')}
                                className={`rounded-xl border px-3 py-2 text-left transition-all ${
                                  adminScope === 'class'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <div className="font-semibold">My class / section</div>
                                <div className="mt-0.5 text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
                                  Manage quizzes and games just for your own classes.
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdminScope('institution')}
                                className={`rounded-xl border px-3 py-2 text-left transition-all ${
                                  adminScope === 'institution'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <div className="font-semibold">
                                  Entire {role.includes('school') ? 'school' : 'college'}
                                </div>
                                <div className="mt-0.5 text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
                                  Institution-wide visibility and management tools.
                                </div>
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              This will be sent as:
                            </label>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              <div className="font-semibold">{name || 'Your name'}</div>
                              <div>{email || 'your-email@example.com'}</div>
                              {institution?.name && (
                                <div className="mt-1 text-[10px] text-slate-500">
                                  {institution.name} • {role.includes('school') ? 'School' : 'College'} teacher
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 dark:border-slate-800/70 px-5 py-3">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        You can always request again later if this is declined.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAdminDialog(false)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!adminReason.trim()) {
                              toast.error('Please tell us why you want admin access.')
                              return
                            }
                            try {
                              submitAdminRequest({
                                userId: email,
                                userName: name,
                                userEmail: email,
                                role,
                                institution: needsInstitution && institution.name ? {
                                  ...institution,
                                  type: role.includes('school') ? 'school' : 'college'
                                } : null,
                                scope: adminScope,
                                reason: adminReason.trim(),
                              })
                              toast.success('Admin request submitted for review.')
                              setShowAdminDialog(false)
                              setAdminReason('')
                              setAdminScope('class')
                            } catch (err) {
                              toast.error('Unable to submit request right now.')
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                        >
                          Submit request
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </section>
    </>
  )
}