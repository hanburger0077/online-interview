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

const df = new DateFormatter('zh-CN', {
  dateStyle: 'long',
})

const formSchema = toTypedSchema(
  z.object({
    interviewType: z.string().refine(v => v, { message: '请选择面试形式' }),
    interviewDate: z.string().refine(v => v, { message: '请选择面试日期' }),
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
  set: (val) => val,
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

const onSubmit = handleSubmit((values) => {
  // 生成一个新的房间号（可以使用随机数或其他逻辑）
  const newRoomNumber = Math.random().toString(36).substring(2, 8)
  const interviewDate = df.format(new Date(value.value.year, value.value.month - 1, value.value.day))
  const candidates = values.candidates.join(', ')
  const description = `${values.interviewType}面试已创建成功，房间号为：${newRoomNumber}，时间：${interviewDate}，面试者：${candidates}`

  toast({
    title: '创建成功',
    description,
  })
  // 等待 2 秒后重定向
  setTimeout(() => {
    // 假设面试官 ID 是从 localStorage 获取
    const interviewerId = localStorage.getItem('interviewerId')
    // 重定向到包含面试官 ID 和新房间号的面试界面
    router.push(`/interview?interviewId=${newRoomNumber}&interviewer=${interviewerId}`)
  }, 2000)
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <Header />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-semibold tracking-tight">创建面试</h1>
        <p class="text-muted-foreground mt-2">配置面试参数并选择面试者</p>
      </div>
      
      <form @submit="onSubmit" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 面试者信息展示区域 -->
          <div class="lg:col-span-2">
            <h2 class="text-xl font-semibold mb-4">面试者信息</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="interviewee in interviewees" 
                :key="interviewee.id"
                class="border rounded-xl p-4 transition-all duration-300 hover:shadow-md"
              >
                <div class="flex items-center space-x-4">
                  <img 
                    class="w-12 h-12 rounded-full object-cover"
                    :src="`https://avatars.dicebear.com/api/avataaars/${interviewee.name}.svg`"
                    :alt="interviewee.name" 
                  />
                  <div>
                    <h3 class="font-medium">{{ interviewee.name }}</h3>
                    <p class="text-sm text-muted-foreground">{{ interviewee.profile }}</p>
                    <p class="text-sm font-medium mt-1">笔试分数：{{ interviewee.score }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 配置表单区域 -->
          <div class="lg:col-span-1">
            <div class="bg-card rounded-xl border p-6">
              <h2 class="text-xl font-semibold mb-6">面试配置</h2>
              
              <div class="space-y-6">
                <!-- 面试类型 -->
                <FormField name="interviewType">
                  <FormItem>
                    <FormLabel class="font-medium">面试类型</FormLabel>
                    <FormControl>
                      <Select v-model="selectedInterviewType">
                        <SelectTrigger class="py-3">
                          <SelectValue placeholder="选择面试类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="type in interviewTypes" :key="type.value" :value="type.value">
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
                    <FormLabel class="font-medium">面试日期</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger as-child>
                          <Button variant="outline" class="w-full justify-start text-left font-normal py-3">
                            <span>
                              {{ value ? df.format(new Date(value.year, value.month - 1, value.day)) : '请选择面试日期' }}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-0">
                          <Calendar 
                            v-model:placeholder="placeholder" 
                            v-model="value" 
                            calendar-label="选择面试日期"
                            @update:model-value="(v) => {
                              if (v) {
                                setFieldValue('interviewDate', v.toString())
                              }
                              else {
                                setFieldValue('interviewDate', undefined)
                              }
                            }" 
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
                    <FormLabel class="font-medium">面试者</FormLabel>
                    <FormControl>
                      <div class="space-y-2 max-h-60 overflow-y-auto p-1">
                        <div 
                          v-for="interviewee in interviewees" 
                          :key="interviewee.id"
                          class="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors duration-200 cursor-pointer"
                          :class="{ 'bg-accent border-primary': selectedInterviewee.includes(interviewee.name) }"
                          @click="toggleCandidate(interviewee.name)"
                        >
                          <div class="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              :checked="selectedInterviewee.includes(interviewee.name)" 
                              class="h-4 w-4 rounded-full border-input text-primary focus:ring-primary absolute opacity-0 peer"
                              @change="toggleCandidate(interviewee.name)"
                            >
                            <div class="h-4 w-4 rounded-full border border-input peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center">
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
                              <span class="text-sm font-medium">{{ interviewee.name }}</span>
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
              
              <Button type="submit" class="w-full mt-8 py-4 rounded-full text-base">创建面试</Button>
            </div>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>