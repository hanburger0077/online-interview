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
  <form @submit="onSubmit" class="h-screen overflow-hidden">
    <div class="flex w-full h-full p-4 gap-4">
      <Carousel class="w-[70%] scale-90">
        <CarouselContent>
          <CarouselItem v-for="interviewee in interviewees" :key="interviewee.id">
            <div class="p-1 h-[100vh]">
              <Card class="h-full">
                <CardHeader>
                  <CardTitle>{{ interviewee.name }}</CardTitle>
                </CardHeader>
                <CardContent class="flex flex-col items-center justify-center h-full p-4">
                  <img class="w-24 h-24 rounded-full"
                    :src="`https://avatars.dicebear.com/api/avataaars/${interviewee.name}.svg`"
                    :alt="interviewee.name" />
                  <p class="text-lg">{{ interviewee.name }}</p>
                  <p class="text-lg">{{ interviewee.profile }}</p>
                  <p class="text-lg">笔试分数：{{ interviewee.score }}</p>
                  <!-- 在这里添加更多简历内容 -->
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious>
          <button type="button" class="carousel-control-prev" @click.prevent>
            <Icon icon="radix-icons:chevron-left" />
          </button>
        </CarouselPrevious>
        <CarouselNext>
          <button type="button" class="carousel-control-next" @click.prevent>
            <Icon icon="radix-icons:chevron-right" />
          </button>
        </CarouselNext>
      </Carousel>
      <Card class="flex flex-col max-h-screen w-[30%]">
        <CardHeader>
          <CardTitle>创建面试房间</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6 flex-grow">
          <!-- 面试类型 -->
          <FormField name="interviewType">
            <FormItem>
              <FormLabel class="font-bold">面试类型</FormLabel>
              <FormControl>
                <Select v-model="selectedInterviewType">
                  <SelectTrigger>
                    <SelectValue placeholder="选择面试类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="type in interviewTypes" :key="type.value" :value="type.value">
                      <div>
                        <div>{{ type.label }}</div>
                      </div>
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
              <FormLabel>面试日期：</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger as-child>
                    <Button variant="outline">
                      <span>
                        {{ value ? df.format(new Date(value.year, value.month - 1, value.day)) : '请选择面试日期' }}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0">
                    <Calendar v-model:placeholder="placeholder" v-model="value" calendar-label="选择面试日期"
                      @update:model-value="(v) => {
                        if (v) {
                          setFieldValue('interviewDate', v.toString())
                        }
                        else {
                          setFieldValue('interviewDate', undefined)
                        }
                      }" class="rounded-md border bg-background" />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <!-- 面试者选择 -->
          <FormField name="candidates">
            <FormItem>
              <FormLabel class="font-bold">面试者</FormLabel>
              <FormControl>
                <ComboboxRoot v-model="selectedInterviewee" v-model:search-term="searchTerm" multiple
                  class="my-4 mx-auto relative bg-background">
                  <ComboboxAnchor
                    class="w-[400px] inline-flex items-center justify-between rounded-lg p-2 text-[13px] leading-none gap-[5px] bg-background text-grass11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-grass9 outline-none">
                    <TagsInputRoot v-slot="{ modelValue: tags }" :model-value="selectedInterviewee" delimiter=""
                      class="flex gap-2 items-center rounded-lg flex-wrap">
                      <TagsInputItem v-for="item in tags" :key="item.toString()" :value="item"
                        class="flex items-center justify-center gap-2 text-black bg-gray-200 aria-[current=true]:bg-gray-300 rounded px-2 py-1">
                        <TagsInputItemText class="text-sm">
                          {{ item }}
                        </TagsInputItemText>
                        <TagsInputItemDelete>
                          <Icon icon="lucide:x" />
                        </TagsInputItemDelete>
                      </TagsInputItem>

                      <ComboboxInput as-child>
                        <TagsInputInput placeholder="选择面试者"
                          class="focus:outline-none flex-1 rounded !bg-transparent placeholder:text-mauve10 px-1"
                          @keydown.enter.prevent />
                      </ComboboxInput>
                    </TagsInputRoot>

                    <ComboboxTrigger>
                      <Icon icon="radix-icons:chevron-down" class="h-4 w-4 text-grass11" />
                    </ComboboxTrigger>
                  </ComboboxAnchor>
                  <ComboboxContent
                    class="absolute z-10 w-full mt-2 bg-background overflow-hidden rounded shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade">
                    <ComboboxViewport class="p-[5px]">
                      <ComboboxEmpty class="text-gray-400 text-xs font-medium text-center py-2" />

                      <ComboboxGroup>
                        <ComboboxItem v-for="(interviewee, index) in interviewees" :key="index"
                          class="text-[13px] leading-none text-grass11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-grass8 data-[highlighted]:text-grass1"
                          :value="interviewee.name">
                          <ComboboxItemIndicator
                            class="absolute left-0 w-[25px] inline-flex items-center justify-center">
                            <Icon icon="radix-icons:check" />
                          </ComboboxItemIndicator>
                          <span>
                            {{ interviewee.name }}
                          </span>
                        </ComboboxItem>
                      </ComboboxGroup>
                    </ComboboxViewport>
                  </ComboboxContent>
                </ComboboxRoot>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </CardContent>
        <CardFooter class="flex justify-between px-6 pb-6">
          <Button type="submit" class="w-full">创建面试</Button>
        </CardFooter>
      </Card>
    </div>
  </form>
</template>