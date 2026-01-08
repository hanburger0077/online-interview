import { createApp } from 'vue'
import './assets/index.css'
import App from './App.vue'
import router from './router'
import { toast } from '@/components/ui/toast'

// 初始化全局错误提示函数（供 HTTP 拦截器使用）
window.showErrorToast = (options) => {
  toast(options)
}

createApp(App).use(router).mount('#app')
