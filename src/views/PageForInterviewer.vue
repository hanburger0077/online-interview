<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// 使用 ref 创建一个响应式变量来存储输入的房间号
const roomNumber = ref('')
const router = useRouter()
// 使用 ref 创建一个响应式变量来存储 interviewerId
const interviewerId = ref('')

// 在组件挂载时初始化 interviewerId
onMounted(() => {
  // 假设 interviewerId 是从 localStorage 获取
  interviewerId.value = localStorage.getItem('interviewerId') || '未定义'
})

// 处理创建面试房间的函数
const createInterviewRoom = () => {
  // 假设面试官 ID 是从 localStorage 获取
  const interviewerId = localStorage.getItem('interviewerId')
  // 重定向到创建房间的界面
  router.push(`/create?interviewer=${interviewerId}`)
}

// 处理加入面试房间的函数
const joinInterviewRoom = () => {
  if (roomNumber.value.trim() !== '') {
    const interviewerId = localStorage.getItem('interviewerId')
    const interviewId = roomNumber.value
    
    // 重定向到包含面试官 ID 和面试 ID 的面试界面
    router.push(`/interview?interviewId=${interviewId}&interviewer=${interviewerId}`)
  } else {
    // 提示用户输入房间号
    alert('请输入提供的房间号')
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-semibold tracking-tight">面试官中心</h1>
        <p class="text-muted-foreground mt-2">欢迎，面试官 {{interviewerId}}</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 创建面试卡片 -->
        <div class="bg-card rounded-xl border p-6">
          <div class="flex flex-col items-center text-center mb-6">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold">创建面试</h2>
            <p class="text-sm text-muted-foreground mt-1">创建新的面试房间</p>
          </div>
          
          <div class="space-y-4">
            <Button @click="createInterviewRoom" class="w-full py-5 rounded-full text-base font-medium">
              创建面试房间
            </Button>
          </div>
        </div>
        
        <!-- 加入面试卡片 -->
        <div class="bg-card rounded-xl border p-6">
          <div class="flex flex-col items-center text-center mb-6">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold">加入面试</h2>
            <p class="text-sm text-muted-foreground mt-1">加入现有的面试房间</p>
          </div>
          
          <form @submit.prevent="joinInterviewRoom" class="space-y-4">
            <div>
              <label for="roomNumber" class="block text-sm font-medium mb-2">房间号</label>
              <Input 
                v-model="roomNumber" 
                id="roomNumber" 
                placeholder="请输入提供的房间号" 
                class="py-5"
              />
            </div>
            
            <Button type="submit" class="w-full py-5 rounded-full text-base font-medium">
              加入面试房间
            </Button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>