import { createRouter, createWebHistory } from 'vue-router'
import { routeConfig, RouteNames } from './routes.config'

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes: routeConfig
})

/**
 * 路由前置守卫
 * 处理认证和权限验证
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 面试系统`
  }

  // 检查是否需要认证
  const requiresAuth = to.meta?.requiresAuth
  const username = localStorage.getItem('username')

  if (requiresAuth && !username) {
    // 需要认证但未登录，重定向到登录页
    next({ 
      name: RouteNames.LOGIN,
      query: { redirect: to.fullPath } // 保存原始路径，登录后可以跳转回来
    })
  } else {
    next()
  }
})

/**
 * 路由后置守卫
 * 可以用于页面访问统计等
 */
router.afterEach((to, from) => {
  // 可以在这里添加页面访问日志等逻辑
})

/**
 * 路由错误处理
 */
router.onError((error) => {
  console.error('Router error:', error)
  // 发生错误时重定向到登录页
  router.push({ name: RouteNames.LOGIN })
})

export default router
export { RouteNames }