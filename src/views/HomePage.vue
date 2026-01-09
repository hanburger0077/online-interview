<template>
  <div class="min-h-screen w-full bg-background flex flex-col">
    <Header />
    <main class="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 animate-in">
        <div class="text-center">
          <h1 class="mb-6 font-semibold">在线面试系统</h1>
          <p class="text-lg text-muted-foreground mb-10">
            体验简洁高效的远程面试解决方案
          </p>
        </div>
        
        <Sched />
        
        <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            @click="createroom"
            class="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            创建面试房间
          </button>
          <button 
            @click="test"
            class="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            加入面试
          </button>
        </div>
      </div>
    </main>
    
    <footer class="py-6 text-center text-sm text-muted-foreground">
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