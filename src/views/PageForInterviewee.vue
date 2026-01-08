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
<div class="h-screen w-full flex items-center justify-center">
  <Card class="w-[400px] h-[200px] space-y-1 scale-125">
    <CardHeader>
      <CardTitle class="text-center">你好！面试者 {{intervieweeId}}</CardTitle>
      <!-- <CardDescription>请选择</CardDescription> -->
    </CardHeader>
    <form @submit.prevent="joinInterviewRoom">
    <CardContent>
      <div>
        <Input v-model="roomNumber" id="name" placeholder="请输入面试官提供的房间号" />
      </div>
    </CardContent>
    <CardFooter class="flex flex-row items-center justify-between">
      <Button type="submit" class="w-full mr-2">加入面试房间</Button>
      <Sheet>
        <SheetTrigger as-child>
          <Button variant="secondary">
            查看历史面试结果
          </Button>
        </SheetTrigger>
        <SheetContent class = "w-[400px]">
          <SheetHeader>
            <SheetTitle>历史面试</SheetTitle>
            <SheetDescription>
              您可以在这里查看已经公布的面试结果
            </SheetDescription>
          </SheetHeader>
          <div class="grid gap-4 py-4">
            <div v-for="result in interviewResults" :key="result.interviewId" class="grid grid-cols-4 items-center gap-4">
              <div class="col-span-1">{{ result.interviewId }}</div>
              <div class="col-span-1">{{ result.position }}</div>
              <div class="col-span-1">{{ result.updatedAt }}</div>
              <div class="col-span-1">{{ result.result }}</div>
              <div class="col-span-1">
                <Button @click="viewInterviewDetail(result.interviewId)">查看详情</Button>
              </div>
            </div>
          </div>
          <SheetFooter>
            <SheetClose as-child>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </CardFooter>
  </form>
  </Card>
</div>
</template>