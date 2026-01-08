/**
 * 路由配置文件
 * 集中管理所有路由信息，便于维护和扩展
 */

// 路由组件懒加载
const LoginPage = () => import('@/views/LoginPage.vue')
const InterviewPage = () => import('@/views/InterviewPage.vue')
const PageForInterviewee = () => import('@/views/PageForInterviewee.vue')
const PageForInterviewer = () => import('@/views/PageForInterviewer.vue')
const NewCreateInterviewPage = () => import('@/views/NewCreateInterview.vue')
const InterviewResultPage = () => import('@/views/InterviewResult.vue')
const ScorePage = () => import('@/views/ScorePage.vue')
const HomePage = () => import('@/views/HomePage.vue')

/**
 * 路由配置
 * @type {Array<Object>}
 */
export const routeConfig = [
  {
    path: '/',
    name: 'login',
    component: LoginPage,
    meta: {
      title: '登录',
      requiresAuth: false,
      layout: 'default'
    }
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: {
      title: '首页',
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/interview',
    name: 'interview',
    component: InterviewPage,
    meta: {
      title: '面试',
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/interviewee',
    name: 'interviewee',
    component: PageForInterviewee,
    meta: {
      title: '面试者页面',
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/interviewer',
    name: 'interviewer',
    component: PageForInterviewer,
    meta: {
      title: '面试官页面',
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/create',
    name: 'create',
    component: NewCreateInterviewPage,
    meta: {
      title: '创建面试',
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/result',
    name: 'result',
    component: InterviewResultPage,
    meta: {
      title: '面试结果',
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/score',
    name: 'score',
    component: ScorePage,
    meta: {
      title: '评分页面',
      requiresAuth: true,
      layout: 'default'
    }
  }
]

/**
 * 路由名称常量
 * 便于在代码中引用，避免硬编码字符串
 */
export const RouteNames = {
  LOGIN: 'login',
  HOME: 'home',
  INTERVIEW: 'interview',
  INTERVIEWEE: 'interviewee',
  INTERVIEWER: 'interviewer',
  CREATE: 'create',
  RESULT: 'result',
  SCORE: 'score'
}

/**
 * 路由路径常量
 */
export const RoutePaths = {
  LOGIN: '/',
  HOME: '/home',
  INTERVIEW: '/interview',
  INTERVIEWEE: '/interviewee',
  INTERVIEWER: '/interviewer',
  CREATE: '/create',
  RESULT: '/result',
  SCORE: '/score'
}

/**
 * 获取需要认证的路由
 * @returns {Array<Object>}
 */
export const getAuthRequiredRoutes = () => {
  return routeConfig.filter(route => route.meta?.requiresAuth === true)
}

/**
 * 根据名称获取路由配置
 * @param {string} name - 路由名称
 * @returns {Object|null}
 */
export const getRouteByName = (name) => {
  return routeConfig.find(route => route.name === name) || null
}

/**
 * 根据路径获取路由配置
 * @param {string} path - 路由路径
 * @returns {Object|null}
 */
export const getRouteByPath = (path) => {
  return routeConfig.find(route => route.path === path) || null
}

export default routeConfig

