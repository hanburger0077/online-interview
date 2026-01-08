<template>
  <div class="app-container">
    <div id="shouye">
      <h1>欢迎使用面试系统</h1>
      <Sched />
      <Header></Header>
      <div class="buttons">
        <el-button type="primary" @click="createroom">创建房间</el-button>
        <el-button type="primary" @click="test">加入面试</el-button>
      </div>
    </div>
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