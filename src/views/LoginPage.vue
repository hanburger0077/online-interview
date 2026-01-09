<script setup>
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from '@/components/ui/toast'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

const router = useRouter()

const formSchema = toTypedSchema(z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  accountType: z.enum(['interviewer', 'interviewee'], {
    required_error: 'You need to select an account type.',
  }),
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    email: '',
    password: '',
    accountType: undefined,
  },
})

const onSubmit = form.handleSubmit((values) => {
  if (values.accountType === 'interviewer') {
    localStorage.setItem('interviewerId', values.email)
    localStorage.setItem('role', 'interviewer')
    router.push('/interviewer?interviewerId=' + values.email)
  } else if (values.accountType === 'interviewee') {
    localStorage.setItem('intervieweeId', values.email)
    localStorage.setItem('role', 'interviewee')
    // 重定向到特定的面试者页面
    router.push('/interviewee?intervieweeId=' + values.email)
  }
})
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-12 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-semibold tracking-tight mb-2">面试系统</h1>
        <p class="text-muted-foreground">输入您的信息以继续</p>
      </div>
      
      <div class="bg-card rounded-2xl shadow-sm border p-8">
        <form @submit.prevent="onSubmit" class="space-y-6">
          <FormField v-slot="{ field }" name="email">
            <FormItem>
              <FormLabel class="font-medium">邮箱/用户名</FormLabel>
              <FormControl>
                <Input v-bind="field" placeholder="请输入您的邮箱或用户名" class="py-5" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ field }" name="password">
            <FormItem>
              <FormLabel class="font-medium">密码</FormLabel>
              <FormControl>
                <Input type="password" v-bind="field" placeholder="请输入密码" class="py-5" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ field }" name="accountType">
            <FormItem class="space-y-3">
              <FormLabel class="font-medium">选择身份</FormLabel>
              <FormControl>
                <RadioGroup v-bind="field" class="grid grid-cols-2 gap-4">
                  <div class="relative">
                    <RadioGroupItem value="interviewer" id="interviewer" class="peer sr-only" />
                    <Label 
                      htmlFor="interviewer" 
                      class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    >
                      <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      <span>面试官</span>
                    </Label>
                  </div>
                  <div class="relative">
                    <RadioGroupItem value="interviewee" id="interviewee" class="peer sr-only" />
                    <Label 
                      htmlFor="interviewee" 
                      class="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    >
                      <svg class="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                      <span>面试者</span>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>
      </div>
      
      <div class="text-center pt-4">
        <Button type="submit" @click="onSubmit" class="w-full max-w-xs py-6 text-base rounded-full" size="lg">
          登录
        </Button>
      </div>
    </div>
  </div>
</template>