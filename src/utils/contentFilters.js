// Content filtering utilities for role-based access control

/**
 * Filter content based on user role and institution
 */
export function filterContentByRole(content, user) {
  if (!user) return content.filter(item => item.isPublic === true)
  
  return content.filter(item => {
    // Admin can see everything
    if (user.role === 'admin') return true
    
    // If content is public, everyone can see it
    if (item.isPublic) return true
    
    // If content has no institution restriction, everyone can see it
    if (!item.institutionId && !item.restrictedToInstitution) return true
    
    // If user has no institution, they can only see public content
    if (!user.institution) return item.isPublic
    
    // Check if content belongs to user's institution
    if (item.institutionId === user.institution.id) return true
    if (item.restrictedToInstitution === user.institution.id) return true
    
    // Role-based filtering
    const userLevel = getRoleLevel(user.role)
    const requiredLevel = getRoleLevel(item.minimumRole || 'visitor')
    
    return userLevel >= requiredLevel
  })
}

/**
 * Get role hierarchy level (higher number = more permissions)
 */
function getRoleLevel(role) {
  const levels = {
    'visitor': 0,
    'school-student': 1,
    'college-student': 1,
    'school-teacher': 2,
    'college-teacher': 2,
    'admin': 10
  }
  return levels[role] || 0
}

/**
 * Check if user can access specific content
 */
export function canUserAccessContent(content, user) {
  if (!user) return content.isPublic === true
  
  if (user.role === 'admin') return true
  if (content.isPublic) return true
  
  if (!user.institution && !content.isPublic) return false
  
  if (content.institutionId && content.institutionId !== user.institution?.id) {
    return false
  }
  
  const userLevel = getRoleLevel(user.role)
  const requiredLevel = getRoleLevel(content.minimumRole || 'visitor')
  
  return userLevel >= requiredLevel
}

/**
 * Get content categories available to user
 */
export function getAvailableCategories(user) {
  const baseCategories = ['general', 'environment', 'climate-change', 'renewable-energy']
  
  if (!user) return baseCategories.slice(0, 2) // Only general and environment for visitors
  
  if (user.role === 'admin') {
    return [...baseCategories, 'advanced', 'research', 'institutional']
  }
  
  if (user.role.includes('teacher')) {
    return [...baseCategories, 'teacher-resources', 'curriculum']
  }
  
  if (user.role.includes('college')) {
    return [...baseCategories, 'advanced', 'research']
  }
  
  return baseCategories
}

/**
 * Filter quizzes based on user permissions
 */
export function filterQuizzes(quizzes, user) {
  return filterContentByRole(quizzes.map(quiz => ({
    ...quiz,
    isPublic: quiz.difficulty === 'beginner' || quiz.isPublic,
    minimumRole: quiz.difficulty === 'advanced' ? 'college-student' : 'visitor'
  })), user)
}

/**
 * Filter challenges based on user permissions  
 */
export function filterChallenges(challenges, user) {
  return filterContentByRole(challenges.map(challenge => ({
    ...challenge,
    isPublic: challenge.level <= 2 || challenge.isPublic,
    minimumRole: challenge.level >= 4 ? 'college-student' : 
                 challenge.level >= 3 ? 'school-student' : 'visitor'
  })), user)
}

/**
 * Filter games based on user permissions
 */
export function filterGames(games, user) {
  return filterContentByRole(games.map(game => ({
    ...game,
    isPublic: game.complexity === 'simple' || game.isPublic,
    minimumRole: game.complexity === 'complex' ? 'college-student' : 'visitor'
  })), user)
}

/**
 * Get institution-specific content for dashboard
 */
export function getInstitutionContent(user) {
  if (!user?.institution) return null
  
  return {
    institutionName: user.institution.name,
    institutionType: user.institution.type,
    canCreateContent: user.role.includes('teacher') || user.role === 'admin',
    canManageUsers: user.role === 'admin',
    showAdvancedFeatures: user.role.includes('teacher') || user.role === 'admin'
  }
}

/**
 * Generate personalized learning path based on role and institution
 */
export function generateLearningPath(user) {
  const basePath = [
    { id: 'intro', title: 'Environmental Basics', required: true },
    { id: 'climate', title: 'Climate Change Fundamentals', required: true }
  ]
  
  if (!user) return basePath
  
  if (user.role.includes('student')) {
    basePath.push(
      { id: 'action', title: 'Environmental Action', required: true },
      { id: 'project', title: 'School Project Ideas', required: false }
    )
  }
  
  if (user.role === 'college-student' || user.role.includes('teacher')) {
    basePath.push(
      { id: 'research', title: 'Environmental Research Methods', required: false },
      { id: 'policy', title: 'Environmental Policy', required: false }
    )
  }
  
  if (user.role.includes('teacher')) {
    basePath.push(
      { id: 'pedagogy', title: 'Teaching Environmental Science', required: false },
      { id: 'resources', title: 'Classroom Resources', required: false }
    )
  }
  
  return basePath
}