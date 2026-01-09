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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { evaluationApi } from '@/api'

// 使用 ref 创建一个响应式变量来存储输入的房间号
const roomNumber = ref('')
const router = useRouter()
// 使用 ref 创建一个响应式变量来存储 interviewerId
const intervieweeId = ref('')
// 使用 ref 创建一个响应式变量来存储面试结果
const interviewResults = ref([])

// 在组件挂载时初始化 interviewerId
onMounted(() => {
  // 假设 interviewerId 是从 localStorage 获取
  intervieweeId.value = localStorage.getItem('intervieweeId')
  
  fetchInterviewResults()
})

// 处理加入面试房间的函数
const joinInterviewRoom = () => {
  if (roomNumber.value.trim() !== '') {
    // 面试者 ID 是获取当前的localStorage中的 intervieweeId
    // 面试房间号是输入的房间号
    const intervieweeId = localStorage.getItem('intervieweeId')
    const interviewId = roomNumber.value
    
    // 重定向到包含面试者 ID 和面试 ID 的面试界面
    router.push(`/interview?interviewId=${interviewId}&intervieweeId=${intervieweeId}`)
  } else {
    // 提示用户输入房间号
    alert('请输入面试官提供的房间号')
  }
}

// 获取面试结果的函数
const fetchInterviewResults = async () => {
  try {
    const response = await evaluationApi.selectByInterviewee('5', intervieweeId.value)
    // 保持与原来一致：response.data 是后端返回的完整对象 { code, data, message }
    // response.data.data.records 是实际的记录列表
    interviewResults.value = response?.data?.data?.records || response?.data?.records || response?.records || []

    if (import.meta.env.DEV) {
      console.log('Interview results:', interviewResults.value)
    }
  } catch (error) {
    // 错误已在拦截器中统一处理
  }
}

// 查看面试详情的函数
const viewInterviewDetail = (interviewId) => {
  router.push(`/score?interviewId=${interviewId}`)
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
    </div>
    
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1">
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">面试者中心</h1>
        <p class="text-lg text-muted-foreground mt-2">欢迎，面试者 {{intervieweeId}}</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 加入面试卡片 -->
        <div class="glass-effect rounded-2xl border border-white/20 p-6 transition-all duration-300 hover:shadow-xl">
          <h2 class="text-2xl font-semibold mb-6 text-foreground">加入面试</h2>
          
          <form @submit.prevent="joinInterviewRoom" class="space-y-6">
            <div>
              <label for="roomNumber" class="block text-sm font-medium mb-2 text-foreground">房间号</label>
              <Input 
                v-model="roomNumber" 
                id="roomNumber" 
                placeholder="请输入面试官提供的房间号" 
                class="py-5 bg-white/5 border border-white/20 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:ring-2 transition-all neon-border"
              />
            </div>
            
            <Button 
              type="submit" 
              class="w-full py-5 rounded-xl text-lg font-semibold neon-border transition-all duration-300 hover:shadow-primary/30 hover:shadow-xl active:scale-95 relative overflow-hidden group"
              variant="default"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span class="relative z-10 flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                加入面试房间
              </span>
            </Button>
          </form>
        </div>
        
        <!-- 历史面试结果 -->
        <div class="glass-effect rounded-2xl border border-white/20 p-6 transition-all duration-300 hover:shadow-xl">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-foreground">历史面试</h2>
            <Sheet>
              <SheetTrigger as-child>
                <Button variant="outline" class="rounded-xl neon-border">
                  查看全部
                </Button>
              </SheetTrigger>
              <SheetContent class="sm:max-w-md bg-card border border-white/20 text-foreground">
                <SheetHeader>
                  <SheetTitle class="text-foreground">历史面试结果</SheetTitle>
                  <SheetDescription class="text-muted-foreground">
                    您可以在这里查看已经公布的面试结果
                  </SheetDescription>
                </SheetHeader>
                <div class="py-4">
                  <div 
                    v-for="result in interviewResults" 
                    :key="result.interviewId" 
                    class="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                  >
                    <div class="flex-1">
                      <div class="font-medium text-foreground">{{ result.position }}</div>
                      <div class="text-sm text-muted-foreground">{{ result.interviewId }}</div>
                    </div>
                    <div class="flex items-center space-x-3">
                      <span class="text-sm font-medium text-foreground">{{ result.comprehensiveScore || result.result }}</span>
                      <Button 
                        @click="viewInterviewDetail(result.interviewId)"
                        size="sm"
                        class="h-8 neon-border"
                      >
                        查看
                      </Button>
                    </div>
                  </div>
                  
                  <div v-if="interviewResults.length === 0" class="text-center py-8 text-muted-foreground">
                    暂无面试记录
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose as-child>
                    <Button type="button" variant="outline" class="rounded-xl neon-border">
                      关闭
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(result, index) in interviewResults.slice(0, 3)" 
              :key="result.interviewId" 
              v-show="index < 3"
              class="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:bg-primary/10 transition-colors glass-effect"
            >
              <div>
                <div class="font-medium text-foreground">{{ result.position }}</div>
                <div class="text-sm text-muted-foreground">{{ result.interviewId }}</div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-foreground">{{ result.comprehensiveScore || result.result }}</span>
                <Button 
                  @click="viewInterviewDetail(result.interviewId)"
                  size="sm"
                  variant="ghost"
                  class="h-8 neon-border"
                >
                  详情
                </Button>
              </div>
            </div>
            
            <div v-if="interviewResults.length === 0" class="text-center py-6 text-muted-foreground">
              暂无面试记录
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>