<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Header from '@/components/header.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { evaluationApi } from '@/api'

// 面试结果数据
const interviewResult = ref({
  jobTitle: '公务员职位A123', 
  interviewDate: '2024-03-15',
  scores: {
    languageExpression: 18,
    logicalThinking: 16,
    situationalResponse: 17,
    professionalKnowledge: 15,
    personalQuality: 16,
    total: 82
  },
  status: 'passed', // 'passed' | 'failed' | 'pending'
  rank: 3, // 排名
  comments: '表现优秀，具备良好的沟通能力和专业素养',
  hiringDecision: 'accepted', // 'accepted' | 'rejected' | 'pending'
  interviewee: '张三'
})

// 获取面试结果的函数
const fetchInterviewResult = async (interviewId: any) => {
  try {
    const response = await evaluationApi.search('5', interviewId)
    // 保持与原来一致：response.data 是后端返回的完整对象 { code, data, message }
    // response.data.data.records 是实际的记录列表
    const result = response?.data?.data?.records || response?.data?.records || response?.records || []
    
    if (import.meta.env.DEV) {
      console.log('面试结果:', result[0])
    }
    
    if (Array.isArray(result) && result.length > 0) {
      const interviewData = result[0];
      // 根据实际返回数据确定录用状态
      const hiringStatus = interviewData.result?.toLowerCase() || 'pending';
      let hiringDecision = 'pending';
      if (hiringStatus.includes('录') || hiringStatus.includes('accept')) {
        hiringDecision = 'accepted';
      } else if (hiringStatus.includes('拒') || hiringStatus.includes('reject') || hiringStatus.includes('不')) {
        hiringDecision = 'rejected';
      }
      
      interviewResult.value = {
        jobTitle: interviewData.position,
        interviewDate: interviewData.updatedAt,
        scores: {
          languageExpression: interviewData.languageExpression,
          logicalThinking: interviewData.logicalThinking,
          situationalResponse: interviewData.situationalResponse,
          professionalKnowledge: interviewData.professionalKnowledge,
          personalQuality: interviewData.personalQuality,
          total: interviewData.comprehensiveScore
        },
        status: 'passed',
        rank: 3,
        comments: interviewData.comments,
        hiringDecision: hiringDecision,
        interviewee: interviewData.intervieweeId,
      }
    }
  } catch (error) {
    // 错误已在拦截器中统一处理
  }
}

// 在组件挂载时获取面试结果
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const interviewId = urlParams.get('interviewId')
  console.log('面试ID:', interviewId)
  if (interviewId) {
    fetchInterviewResult(interviewId)
    console.log('面试结果:', interviewResult.value)
  }
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-semibold tracking-tight">面试结果</h1>
        <p class="text-muted-foreground mt-2">查看详细的面试评估结果</p>
      </div>
      
      <div class="bg-card rounded-xl border p-6 mb-8">
        <div class="mb-6">
          <h2 class="text-xl font-semibold">{{ interviewResult.jobTitle }}</h2>
          <div class="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            <span>面试日期：{{ interviewResult.interviewDate }}</span>
            <span>面试者：{{ interviewResult.interviewee }}</span>
          </div>
        </div>
        
        <!-- 状态展示 -->
        <div class="flex flex-wrap gap-3 mb-8">
          <Badge :variant="interviewResult.status === 'passed' ? 'default' : 'destructive'" class="rounded-full">
            {{ interviewResult.status === 'passed' ? '面试通过' : '未通过' }}
          </Badge>
          <Badge variant="outline" class="rounded-full">
            排名: {{ interviewResult.rank }}
          </Badge>
          <Badge :variant="interviewResult.hiringDecision === 'accepted' ? 'default' : 'destructive'" class="rounded-full">
            {{ interviewResult.hiringDecision === 'accepted' ? '录用' : '未录用' }}
          </Badge>
        </div>
        
        <!-- 总分圆环图 -->
        <div class="flex justify-center mb-10">
          <div class="relative w-48 h-48">
            <svg class="w-full h-full" viewBox="0 0 100 100">
              <!-- 背景圆环 -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="hsl(var(--muted))" 
                stroke-width="8" 
              />
              <!-- 进度圆环 -->
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="hsl(var(--primary))" 
                stroke-width="8" 
                :stroke-dasharray="`${(interviewResult.scores.total / 100) * 283} 283`" 
                stroke-dashoffset="0" 
                transform="rotate(-90 50 50)" 
                class="transition-all duration-1000 ease-out"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-bold">{{ interviewResult.scores.total }}</span>
              <span class="text-sm text-muted-foreground">总分</span>
            </div>
          </div>
        </div>
        
        <!-- 分数详情 -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-6">详细得分</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex items-center justify-between p-4 rounded-lg border">
              <span>语言表达</span>
              <span class="font-medium">{{ interviewResult.scores.languageExpression }}/20</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-lg border">
              <span>逻辑思维</span>
              <span class="font-medium">{{ interviewResult.scores.logicalThinking }}/20</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-lg border">
              <span>情景应变</span>
              <span class="font-medium">{{ interviewResult.scores.situationalResponse }}/20</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-lg border">
              <span>专业知识</span>
              <span class="font-medium">{{ interviewResult.scores.professionalKnowledge }}/20</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-lg border">
              <span>个人素质</span>
              <span class="font-medium">{{ interviewResult.scores.personalQuality }}/20</span>
            </div>
            <div class="flex items-center justify-between p-4 rounded-lg bg-primary text-primary-foreground">
              <span class="font-medium">总分</span>
              <span class="font-bold">{{ interviewResult.scores.total }}/100</span>
            </div>
          </div>
        </div>
        
        <!-- 评语 -->
        <div class="bg-muted/30 rounded-xl p-6">
          <h3 class="text-xl font-semibold mb-4">面试评语</h3>
          <p class="text-foreground leading-relaxed">{{ interviewResult.comments }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh; /* Keep this to ensure minimum full height */
  width: 100vw; /* Take full viewport width */
  background-color: #f5f5f5;
  padding: 40px 80px; /* Wider padding for desktop */
  margin: 0; /* Remove any default margins */
  box-sizing: border-box; /* Include padding in width calculation */
  display: flex; /* Enable flex layout */
  flex-direction: column; /* Stack children vertically */
  overflow-x: hidden; /* Prevent horizontal scrollbar */
}

.content-container {
  flex: 1; /* Take remaining vertical space */
  width: 100%;
  max-width: 1200px; /* Wider max-width for desktop */
  margin: 0 auto;
  padding: 32px;
}

.result-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.status-section {
  display: flex;
  gap: 16px;
  margin: 24px 0;
  justify-content: flex-start;
}

.scores-section {
  margin: 32px 0;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  min-height: 64px;
}

.score-item label {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
}

.score {
  font-size: 16px;
  font-weight: 600;
  color: #2563eb;
}

.total-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: #eef2ff;
  border-radius: 6px;
  margin-top: 24px;
}

.total-score label {
  font-size: 16px;
  font-weight: 600;
}

.total-score .score {
  font-size: 20px;
  color: #1e40af;
}

.comments-section {
  margin-top: 32px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

@media (max-width: 1200px) {
  .content-container {
    max-width: 900px;
  }
}

@media (max-width: 992px) {
  .content-container {
    max-width: 100%;
    padding: 24px;
  }
  .score-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .score-grid {
    grid-template-columns: 1fr;
  }
  .content-container {
    padding: 16px;
  }
  .app-container {
    padding: 16px;
  }
}
</style>