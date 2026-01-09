<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
    <div class="container flex h-16 items-center justify-between px-4 md:px-6">
      <div 
        class="text-2xl font-semibold cursor-pointer transition-colors duration-300 hover:text-primary"
        @click="returntohome"
      >
        面试系统
      </div>
      
      <div v-if="username" class="flex items-center space-x-4">
        <div class="relative">
          <div class="flex items-center space-x-2 cursor-pointer">
            <span class="text-sm font-medium">{{ username }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          
          <div class="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg py-1 hidden group-hover:block z-50 border">
            <button 
              @click="changeToUserData" 
              class="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
            >
              个人资料
            </button>
            <button 
              @click="logout" 
              class="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')

const returntohome = () => {
  const currentRoute = router.currentRoute.value.path
  if (currentRoute !== "/home") {
    router.push("/home")
  }
}

const changeToUserData = () => {
  const currentRoute = router.currentRoute.value.path 
  if (currentRoute !== "/userdata") {
    router.push("/userdata")
  }
}

const logout = () => {
  const storedUsername = localStorage.getItem("username")
  if (!storedUsername) {
    alert("当前未登录")
    const currentRoute = router.currentRoute.value.path
    if (currentRoute !== "/login") {
      router.push("/login")
    }
  } else {
    localStorage.setItem("username", "")
    router.push("/login")
    location.reload()
  }
}

onMounted(() => {
  username.value = localStorage.getItem('username')
})
</script>

<style>
#xiala{
    /* margin-top: 16px; */
    cursor: pointer;
}
</style>