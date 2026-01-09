<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Textarea } from '@/components/ui/textarea'
import { CornerDownLeft, Paperclip, Mic } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'


const router = useRouter()
const { toast } = useToast()
const usingroomnumber = ref('')
// 此刻是否有人（自己或者对方）打开了摄像头
const isCameraOn = ref(false)
const isRemoteVideoOn = ref(false)

// 示例聊天消息
const messages = ref([
  { sender: '系统消息', timestamp: 1833028400000, text: '面试即将开始，请双方做好准备！' },
])
const getVariant = (sender: string) => {
  if (sender === '面试官') return 'outline'
  if (sender === '系统消息') return 'secondary'
  return 'default'
}
const newMessage = ref('')
const roleMapping = {
  interviewer: '面试官',
  interviewee: '面试者',
}
const mediaStream = ref<MediaStream | null>(null)
// 业务身份
const userRole = ref(roleMapping[localStorage.getItem('role')] || '未知角色')
// webrtc 单向身份，默认接收者
const webrtcRole = ref('receiver')
// const localVideoRef = ref<HTMLVideoElement | null>(null)
// const remoteVideoRef = ref<HTMLVideoElement | null>(null)

// 初始化房间号，从 url 中获得
onMounted(() => {
  usingroomnumber.value = getQueryParam('interviewId') || ''
  fetchInterviewMetadata()
  connectWebSocket()
  init()
})

const sendMessage = (message, sender) => {
  if (message.trim() !== '') {
    const now = new Date()
    const formattedDate = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-').replace(',', '')

    const messageData = {
      type: 'chat',
      content: message.trim(),
      sendAt: formattedDate,
      senderName: sender
    }

    if (websocket) {
      console.log('Sending ' + messageData.type + ' message:', messageData)
      websocket.send(JSON.stringify(messageData))
    }

    messages.value.push({
      sender: sender,
      timestamp: Date.now(),
      text: message.trim()
    })
    newMessage.value = '' // 清空输入区域
  }
}

const connectWebSocket = () => {
  console.log('Connecting to WebSocket...');
  websocket = new WebSocket('ws://localhost:8080/chat');
  websocket.onopen = () => {
    console.log('WebSocket connection opened');
  };
  websocket.onmessage = async (event) => {
    const messageData = JSON.parse(event.data);
    console.log('WebSocket message received:', messageData);
    if (messageData.type === 'chat') {
      console.log('Received chat message:', messageData);
      if (messageData.senderName !== userRole.value) {
        messages.value.push({
          sender: messageData.senderName,
          timestamp: new Date(messageData.sendAt).getTime(),
          text: messageData.content,
        });
      }
    }
  };
  websocket.onclose = () => {
    console.log('WebSocket connection closed');
  };
  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

// （面试者）开始面试函数
const startInterview = async () => {
  try {
    webrtcRole.value = 'sender'
    createOffer()
    isCameraOn.value = true
    toast({
      title: "Success",
      description: "摄像头已开启！",
      variant: "default"
    })
  } catch (error) {
    console.error('无法访问摄像头', error)
    toast({
      title: "Error",
      description: "无法访问摄像头",
      variant: "destructive"
    })
  }
}

// 停止面试函数
const stopInterview = () => {
  try {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop())
      mediaStream.value = null
    }
    // if (localVideoRef.value) {
    //   localVideoRef.value.srcObject = null
    // }
    isCameraOn.value = false

    toast({
      title: "Success",
      description: "本次面试已结束！",
      variant: "default"
    })
    if (localStorage.getItem('role') === 'interviewer') {
      redirectToInterviewResult(
        getQueryParam('interviewId') || '',
        localStorage.getItem('interviewerId') || ''
      )
    } else {
      router.push('/interviewee?intervieweeId=' + localStorage.getItem('intervieweeId'))
    }
  } catch (error) {
    console.error('无法关闭摄像头', error)
    toast({
      title: "Error",
      description: "无法关闭摄像头",
      variant: "destructive"
    })
  }
}

const redirectToInterviewResult = (interviewId: string, interviewer: string) => {
  const baseUrl = 'http://localhost:5173/result?'
  const url = new URL(baseUrl)
  url.searchParams.append('interviewId', interviewId)
  url.searchParams.append('interviewer', interviewer)

  window.location.href = url.toString()
}

function getQueryParam(param: string) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

const interviewMetadata = ref({
  interviewId: '',
  interviewer: '',
  interviewee: ''
})

function fetchInterviewMetadata() {
  interviewMetadata.value = {
    interviewId: getQueryParam('interviewId'),
    interviewer: getQueryParam('interviewer'),
    interviewee: getQueryParam('interviewee')
  }
}

const handleSubmit = () => {
  sendMessage(newMessage.value, userRole.value)
}


import { io } from 'socket.io-client';

const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.voipbuster.com ' }],
});

let localStream: MediaStream;
let remoteStream: MediaStream;


const offerSdp = ref('');
const answerSdp = ref('');
const offerSdp2 = ref('');
const answerSdp2 = ref('');
const socket = io('http://localhost:3000');
let websocket : WebSocket | null = null
const init = async () => {

  const remoteVideo = document.getElementById('remote') as HTMLVideoElement;
  socket.on('connect', () => {
    console.log('client connect!');
  });

  socket.on('getoffer', (offer) => {
    offerSdp2.value = offer;
    isCameraOn.value = true;
    createAnswer();
  });

  socket.on('getanswer', (answer) => {
    answerSdp2.value = answer;
    addAnswer();
  });

  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };
};

const createOffer = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  const localVideo = document.getElementById('local') as HTMLVideoElement;
  localVideo.srcObject = localStream;

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  pc.onicecandidate = async (event) => {
    if (event.candidate) {
      offerSdp.value = JSON.stringify(pc.localDescription);
      sendOffer(offerSdp.value);
    }
  };
};

const createAnswer = async () => {
  const offer = JSON.parse(offerSdp2.value);
  pc.onicecandidate = async (event) => {
    if (event.candidate) {
      answerSdp.value = JSON.stringify(pc.localDescription);
      sendAnswer(answerSdp.value);
    }
  };
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
};

const addAnswer = async () => {
  const answer = JSON.parse(answerSdp2.value);
  if (!pc.currentRemoteDescription) {
    pc.setRemoteDescription(answer);
  }
};

const copyToClipboard = (val: string) => {
  navigator.clipboard.writeText(val);
};

const sendOffer = async (offer: string) => {
  socket.emit('sendoffer', offer);
};

const sendAnswer = async (answer: string) => {
  socket.emit('sendanswer', answer);
};

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
      <div class="mb-6">
        <h1 class="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">视频面试</h1>
        <div class="flex flex-wrap items-center gap-4 mt-2">
          <Badge variant="outline" class="text-foreground neon-border">
            <span class="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
            房间号：{{ usingroomnumber }}
          </Badge>
          <Badge variant="outline" class="text-foreground neon-border">
            <span class="mr-2 h-2 w-2 rounded-full bg-blue-500"></span>
            角色：{{ userRole }}
          </Badge>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Video Panel -->
        <div class="glass-effect rounded-2xl border border-white/20 p-6 transition-all duration-300 hover:shadow-xl">
          <div class="mb-4">
            <h2 class="text-2xl font-semibold text-foreground">视频通话</h2>
          </div>
          
          <div class="relative aspect-video bg-muted rounded-2xl overflow-hidden mb-6 border border-white/10">
            <div v-show="isCameraOn" 
                class="absolute inset-0 flex flex-col items-center justify-center p-4">
              <video
                v-show="isCameraOn && webrtcRole === 'sender'" 
                id="local"
                autoplay 
                muted 
                playsinline 
                class="w-full h-full object-cover rounded-2xl transition-opacity duration-200"
              />
              <p v-show="isCameraOn && webrtcRole === 'sender'" class="absolute top-2 left-0 w-full text-center text-sm text-muted-foreground bg-black/20 py-1 rounded-t-2xl">
                您正在分享摄像头画面
              </p>
              <video
                v-show="isCameraOn && webrtcRole === 'receiver'" 
                id="remote" 
                autoplay 
                muted 
                playsinline 
                class="w-full h-full object-cover rounded-2xl transition-opacity duration-200"
              />
              <p v-show="isCameraOn && webrtcRole === 'receiver'" class="absolute top-2 left-0 w-full text-center text-sm text-muted-foreground bg-black/20 py-1 rounded-t-2xl">
                您正在接受对方的摄像头画面
              </p>
            </div>
            <div v-show="!isCameraOn" 
                class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <svg class="h-24 w-24 opacity-60 mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 12L18 6H30L33 12H15Z"></path>
                            <rect x="4" y="12" width="40" height="30" rx="3" stroke="currentColor" stroke-width="2" fill="none"></rect>
                            <circle cx="24" cy="27" r="8" stroke="currentColor" stroke-width="2" fill="none"></circle>
                          </svg>
              <p class="text-sm text-muted-foreground">
                摄像头未开启
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <Button 
              @click="startInterview"
              class="flex-1 rounded-xl py-5 text-lg font-semibold neon-border transition-all duration-300 hover:shadow-primary/30 hover:shadow-xl active:scale-95 relative overflow-hidden group"
              :disabled="isCameraOn"
              variant="default"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span class="relative z-10 flex items-center justify-center gap-2">
                <Mic class="mr-2 h-5 w-5" />
                开始面试
              </span>
            </Button>
            
            <Button 
              @click="stopInterview"
              class="rounded-xl py-5 text-lg font-semibold neon-border transition-all duration-300 hover:shadow-destructive/30 hover:shadow-xl active:scale-95 relative overflow-hidden group"
              variant="destructive"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-destructive to-red-700 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span class="relative z-10 flex items-center justify-center gap-2">
                结束面试
              </span>
            </Button>
          </div>
        </div>

        <!-- Chat Panel -->
        <div class="glass-effect rounded-2xl border border-white/20 flex flex-col transition-all duration-300 hover:shadow-xl">
          <div class="p-6 border-b border-white/10">
            <h2 class="text-2xl font-semibold text-foreground">对话记录</h2>
          </div>
          
          <!-- 消息显示区域 -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
            <div 
              v-for="(message, index) in messages" 
              :key="index" 
              :class="{
                'flex justify-start': message.sender !== userRole && message.sender !== '系统消息',
                'flex justify-end': message.sender === userRole && message.sender !== '系统消息',
                'flex justify-center': message.sender === '系统消息'
              }"
            >
              <div 
                :class="{
                  'max-w-[80%]': message.sender !== '系统消息',
                  'w-fit': message.sender === '系统消息'
                }"
              >
                <div 
                  :class="{
                    'text-xs text-muted-foreground mb-1': message.sender !== '系统消息',
                    'text-center text-xs text-muted-foreground mb-1': message.sender === '系统消息'
                  }"
                >
                  <span v-if="message.sender !== '系统消息'">
                    {{ message.sender }} • {{ new Date(message.timestamp).toLocaleTimeString() }}
                  </span>
                  <span v-else>
                    {{ new Date(message.timestamp).toLocaleString() }}
                  </span>
                </div>
                <div 
                  :class="{
                    'inline-block rounded-2xl px-4 py-2 bg-primary text-primary-foreground': message.sender === userRole,
                    'inline-block rounded-2xl px-4 py-2 bg-white/10 text-foreground': message.sender !== userRole && message.sender !== '系统消息',
                    'inline-block rounded-2xl px-4 py-2 bg-secondary text-secondary-foreground text-center': message.sender === '系统消息'
                  }"
                >
                  {{ message.text }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 消息输入区域 -->
          <div class="p-4 border-t border-white/10">
            <form @submit.prevent="handleSubmit" class="flex flex-col gap-3">
              <Textarea
                v-model="newMessage"
                placeholder="输入消息，友好交流..."
                class="min-h-[100px] resize-none rounded-xl border border-white/20 bg-white/5 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:ring-2 transition-all"
             />
              <Button type="submit" class="w-full rounded-xl py-5 text-lg font-semibold neon-border transition-all duration-300 hover:shadow-primary/30 hover:shadow-xl active:scale-95 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <span class="relative z-10 flex items-center justify-center gap-2">
                  发送消息
                  <CornerDownLeft class="ml-2 h-5 w-5" />
                </span>
              </Button> 
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
:deep(.resizable-handle) {
  width: 4px;
  background-color: #e5e7eb;
  transition: all 0.2s;
}

:deep(.resizable-handle:hover) {
  background-color: #d1d5db;
}

.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}
.text-center {
  text-align: center;
}
</style>