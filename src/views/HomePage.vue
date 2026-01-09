<template>
  <div class="min-h-screen w-full bg-background flex flex-col relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
    </div>
    
    <Header />
    
    <main class="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative z-10">
      <div class="max-w-2xl w-full space-y-10 animate-in">
        <div class="text-center">
          <h1 class="mb-6 font-bold text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            在线面试系统
          </h1>
          <p class="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            体验简洁高效的远程面试解决方案
          </p>
        </div>
        
        <div class="glass-effect p-6 rounded-2xl border backdrop-blur-sm bg-white/5 shadow-2xl">
          <Sched />
        </div>
        
        <div class="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            @click="createroom"
            class="neon-border px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-primary/30 hover:shadow-xl active:scale-95 relative overflow-hidden group"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span class="relative z-10 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              创建面试房间
            </span>
          </button>
          <button 
            @click="test"
            class="neon-border px-8 py-4 bg-transparent border border-secondary text-secondary-foreground rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-secondary/20 hover:shadow-secondary/20 hover:shadow-xl active:scale-95 relative overflow-hidden group"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-secondary to-muted opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span class="relative z-10 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              加入面试
            </span>
          </button>
        </div>
      </div>
    </main>
    
    <footer class="py-6 text-center text-sm text-muted-foreground relative z-10">
      <p>© {{ new Date().getFullYear() }} 在线面试系统. 保留所有权利.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { interviewApi } from '@/api'
import { toast } from '@/components/ui/toast'
import Sched from '../components/sched.vue'

const router = useRouter()
const roomnumber = ref('')

function test() {
  router.push('/interview')
}

async function createroom() {
  try {
    const response = await interviewApi.createRoom(1)
    // 保持与原来一致：response.data 是后端返回的完整对象 { code, data, message }
    // response.data.data 是实际的房间号数据
    localStorage.setItem('reply', JSON.stringify(response))
    roomnumber.value = response?.data?.data || response?.data || ''
    
    if (roomnumber.value) {
      navigator.clipboard.writeText(roomnumber.value)
      toast({
        title: '创建成功',
        description: `房间号已复制到粘贴板：${roomnumber.value}`
      })
      setTimeout(() => {
        router.push('/interview')
      }, 3000)
    }
  } catch (error) {
    // 错误已在拦截器中统一处理
  }
}
</script>

<style scoped>
.app-container {
  background-color: #ffeeaf;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
#MainPage {
  text-align: center;
  padding: 20px;
}
.buttons {
  margin-top: 20px;
}
</style>