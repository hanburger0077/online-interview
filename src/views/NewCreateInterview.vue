<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot
} from 'radix-vue'
import { Icon } from '@iconify/vue'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from '@/components/ui/toast'
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  parseDate,
  today,
} from '@internationalized/date'
import { Calendar } from '@/components/ui/calendar'
import router from '@/router'
import { intervieweeApi } from '@/api'
import Header from '@/components/header.vue'

const df = new DateFormatter('zh-CN', {
  dateStyle: 'long',
})

const formSchema = toTypedSchema(
  z.object({
    interviewType: z.string().min(1, { message: '请选择面试形式' }),
    interviewDate: z.string().min(1, { message: '请选择面试日期' }),
    candidates: z.array(z.string()).min(1, '请选择至少一名面试者'),
  })
)

const interviewTypes = [
  {
    value: '结构化面试',
    label: '结构化面试',
  },
  {
    value: '结构化小组',
    label: '结构化小组',
  },
  {
    value: '无领导小组讨论',
    label: '无领导小组讨论',
  },
]

const interviewees = ref([
  {
    id: '1',
    name: '张三',
    profile: 'zhangsan@example.com',
    score: 80
  },
  {
    id: '2',
    name: '李四',
    profile: 'lisi@example.com',
    score: 90
  },
  {
    id: '3',
    name: '王五',
    profile: 'wangwu@example.com',
    score: 85
  },
])

const fetchInterviewees = async () => {
  try {
    const response = await intervieweeApi.getAll()
    // 保持与原来一致：response.data 是后端返回的完整对象 { code, data, message }
    // response.data.data 是实际的面试者列表数据
    if (response?.code === '0' || response?.data) {
      const data = response.data?.data || response.data || response
      const list = Array.isArray(data) ? data : (data?.records || [])
      interviewees.value = list.map((item: any) => ({
        id: item.id,
        name: item.name,
        profile: item.profile,
        // 随机分配笔试分数,70-100之间
        score: Math.floor(Math.random() * 30 + 70)
      }))
    }
  } catch (error) {
    // 错误已在拦截器中统一处理
  }
}

onMounted(() => {
  fetchInterviewees()
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    interviewType: '',
    interviewDate: '',
    candidates: [],
  },
})

const selectedInterviewee = computed({
  get: () => values.candidates,
  set: (val) => {
    setFieldValue('candidates', val)
  },
})

const placeholder = ref()

const value = computed({
  get: () => (values.interviewDate ? parseDate(values.interviewDate) : undefined),
  set: (val) => {
    if (val) {
      setFieldValue('interviewDate', `${val.year}-${String(val.month).padStart(2, '0')}-${String(val.day).padStart(2, '0')}`)
    }
  },
})

const selectedInterviewType = computed({
  get: () => values.interviewType,
  set: (val) => {
    setFieldValue('interviewType', val)
  },
})

const searchTerm = ref('')

watch(selectedInterviewee, () => {
  searchTerm.value = ''
}, { deep: true })

const toggleCandidate = (candidateName) => {
  const index = selectedInterviewee.value.indexOf(candidateName)
  if (index > -1) {
    selectedInterviewee.value.splice(index, 1)
  } else {
    selectedInterviewee.value.push(candidateName)
  }
  setFieldValue('candidates', selectedInterviewee.value)
}

const onSubmit = handleSubmit(async (values) => {
  try {
    // 生成一个新的房间号（可以使用随机数或其他逻辑）
    const newRoomNumber = Math.random().toString(36).substring(2, 8)
    const interviewDate = values.interviewDate || '未知日期'
    const candidates = values.candidates.join(', ')
    const description = `${values.interviewType}面试已创建成功，房间号为：${newRoomNumber}，时间：${interviewDate}，面试者：${candidates}`

    toast({
      title: '创建成功',
      description,
    })
    
    // 假设面试官 ID 是从 localStorage 获取
    let interviewerId = 'default-interviewer';
    try {
      interviewerId = localStorage.getItem('interviewerId') || 'default-interviewer';
    } catch (error) {
      console.warn('无法访问 localStorage:', error);
    }
    
    // 短暂延迟确保 toast 显示后再跳转
    setTimeout(() => {
      // 重定向到包含面试官 ID 和新房间号的面试界面
      router.push(`/interview?interviewId=${newRoomNumber}&interviewer=${interviewerId}`)
    }, 500);
  } catch (error) {
    console.error('创建面试失败:', error);
    toast({
      title: '创建失败',
      description: '创建面试时出现错误，请重试',
    });
  }
})
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
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1">
      <div class="mb-8">
        <h1 class="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">创建面试</h1>
        <p class="text-lg text-muted-foreground mt-2">配置面试参数并选择面试者</p>
      </div>
      
      <form @submit="onSubmit" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 面试者信息展示区域 -->
          <div class="lg:col-span-2">
            <h2 class="text-2xl font-semibold mb-4 text-foreground">面试者信息</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="interviewee in interviewees" 
                :key="interviewee.id"
                class="glass-effect rounded-2xl border border-white/20 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
              >
                <div class="flex items-center space-x-4">
                  <img 
                    class="w-12 h-12 rounded-full object-cover"
                    :src="`https://avatars.dicebear.com/api/avataaars/${interviewee.name}.svg`"
                    :alt="interviewee.name" 
                  />
                  <div>
                    <h3 class="font-medium text-foreground">{{ interviewee.name }}</h3>
                    <p class="text-sm text-muted-foreground">{{ interviewee.profile }}</p>
                    <p class="text-sm font-medium mt-1 text-primary">笔试分数：{{ interviewee.score }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 配置表单区域 -->
          <div class="lg:col-span-1">
            <div class="glass-effect rounded-2xl border border-white/20 p-6 transition-all duration-300 hover:shadow-xl">
              <h2 class="text-2xl font-semibold mb-6 text-foreground">面试配置</h2>
              
              <div class="space-y-6">
                <!-- 面试类型 -->
                <FormField name="interviewType">
                  <FormItem>
                    <FormLabel class="font-medium text-foreground">面试类型</FormLabel>
                    <FormControl>
                      <Select v-model="selectedInterviewType">
                        <SelectTrigger class="py-3 bg-white/5 border border-white/20 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:ring-2 transition-all neon-border">
                          <SelectValue placeholder="选择面试类型" />
                        </SelectTrigger>
                        <SelectContent class="bg-card border border-white/20 text-foreground">
                          <SelectItem v-for="type in interviewTypes" :key="type.value" :value="type.value" class="focus:bg-primary/10 focus:text-primary">
                            {{ type.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                
                <!-- 面试日期 -->
                <FormField name="interviewDate">
                  <FormItem>
                    <FormLabel class="font-medium text-foreground">面试日期</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger as-child>
                          <Button variant="outline" class="w-full justify-start text-left font-normal py-3 bg-white/5 border border-white/20 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:ring-2 transition-all neon-border">
                            <span>
                              {{ value ? df.format(new Date(value.year, value.month - 1, value.day)) : '请选择面试日期' }}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-0 bg-card border border-white/20 text-foreground shadow-2xl z-[100]">
                          <Calendar 
                            v-model:placeholder="placeholder" 
                            v-model="value" 
                            calendar-label="选择面试日期"
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                
                <!-- 面试者选择 -->
                <FormField name="candidates">
                  <FormItem>
                    <FormLabel class="font-medium text-foreground">面试者</FormLabel>
                    <FormControl>
                      <div class="space-y-2 max-h-60 overflow-y-auto p-1 bg-white/5 rounded-xl border border-white/10 p-2">
                        <div 
                          v-for="interviewee in interviewees" 
                          :key="interviewee.id"
                          class="flex items-center space-x-3 p-3 rounded-xl border border-white/10 hover:bg-primary/10 transition-colors duration-200 cursor-pointer glass-effect"
                          :class="{ 'bg-primary/10 border-primary/30': selectedInterviewee.includes(interviewee.name) }"
                          @click="toggleCandidate(interviewee.name)"
                        >
                          <div class="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              :checked="selectedInterviewee.includes(interviewee.name)" 
                              class="h-4 w-4 rounded-full border-input text-primary focus:ring-primary absolute opacity-0 peer"
                              @change="toggleCandidate(interviewee.name)"
                            >
                            <div class="h-4 w-4 rounded-full border border-white/30 peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                              <svg v-if="selectedInterviewee.includes(interviewee.name)" class="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div class="flex items-center space-x-3">
                            <img 
                              class="w-8 h-8 rounded-full object-cover"
                              :src="`https://avatars.dicebear.com/api/avataaars/${interviewee.name}.svg`"
                              :alt="interviewee.name" 
                            />
                            <div>
                              <span class="text-sm font-medium text-foreground">{{ interviewee.name }}</span>
                              <p class="text-xs text-muted-foreground">{{ interviewee.profile }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
              
              <Button 
                type="submit" 
                class="w-full mt-8 py-4 rounded-xl text-lg font-semibold neon-border transition-all duration-300 hover:shadow-primary/30 hover:shadow-xl active:scale-95 relative overflow-hidden group"
                variant="default"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <span class="relative z-10 flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  创建面试
                </span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>