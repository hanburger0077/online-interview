/**
 * HTTP 客户端封装
 * 统一处理请求、响应和错误
 */
import axios from 'axios'

// 创建 axios 实例
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 * 在发送请求之前做些什么
 */
httpClient.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token（如果有）
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 可以在这里添加请求日志
    if (import.meta.env.DEV) {
      console.log('📤 请求发送:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data
      })
    }

    return config
  },
  (error) => {
    // 请求错误时的处理
    console.error('❌ 请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 对响应数据做点什么
 */
httpClient.interceptors.response.use(
  (response) => {
    // 可以在这里添加响应日志
    if (import.meta.env.DEV) {
      console.log('📥 响应接收:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      })
    }

    // 统一处理响应数据结构
    // 如果后端返回的数据结构是 { code, data, message }
    if (response.data && typeof response.data === 'object') {
      // 可以根据实际后端返回格式调整
      return response.data
    }

    return response.data
  },
  (error) => {
    // 统一错误处理
    return handleError(error)
  }
)

/**
 * 统一错误处理函数
 * @param {Error} error - 错误对象
 * @returns {Promise} 返回拒绝的 Promise
 */
function handleError(error) {
  let errorMessage = '请求失败，请稍后重试'
  let errorCode = 'UNKNOWN_ERROR'

  // 处理不同类型的错误
  if (error.response) {
    // 服务器返回了错误状态码
    const { status, data } = error.response
    errorCode = status

    switch (status) {
      case 400:
        errorMessage = data?.message || '请求参数错误'
        break
      case 401:
        errorMessage = '未授权，请重新登录'
        // 清除 token 并跳转到登录页
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
        break
      case 403:
        errorMessage = '拒绝访问，权限不足'
        break
      case 404:
        errorMessage = '请求的资源不存在'
        break
      case 500:
        errorMessage = '服务器内部错误'
        break
      case 502:
        errorMessage = '网关错误'
        break
      case 503:
        errorMessage = '服务不可用'
        break
      default:
        errorMessage = data?.message || `请求失败 (${status})`
    }
  } else if (error.request) {
    // 请求已发出，但没有收到响应
    errorCode = 'NETWORK_ERROR'
    errorMessage = '网络连接失败，请检查网络设置'
  } else {
    // 在设置请求时触发了错误
    errorCode = 'REQUEST_ERROR'
    errorMessage = error.message || '请求配置错误'
  }

  // 开发环境输出详细错误信息
  if (import.meta.env.DEV) {
    console.error('❌ 请求失败:', {
      code: errorCode,
      message: errorMessage,
      error: error
    })
  }

  // 显示错误提示
  // 使用全局 toast 函数（在 main.js 中初始化）
  if (typeof window !== 'undefined' && window.showErrorToast) {
    window.showErrorToast({
      title: '请求失败',
      description: errorMessage,
      variant: 'destructive'
    })
  }

  // 返回统一的错误格式
  return Promise.reject({
    code: errorCode,
    message: errorMessage,
    originalError: error
  })
}

/**
 * HTTP 请求方法封装
 */
export const http = {
  /**
   * GET 请求
   * @param {string} url - 请求地址
   * @param {object} params - 查询参数
   * @param {object} config - 额外配置
   * @returns {Promise}
   */
  get(url, params = {}, config = {}) {
    return httpClient.get(url, { params, ...config })
  },

  /**
   * POST 请求
   * @param {string} url - 请求地址
   * @param {any} data - 请求体数据
   * @param {object} config - 额外配置
   * @returns {Promise}
   */
  post(url, data = {}, config = {}) {
    return httpClient.post(url, data, config)
  },

  /**
   * PUT 请求
   * @param {string} url - 请求地址
   * @param {any} data - 请求体数据
   * @param {object} config - 额外配置
   * @returns {Promise}
   */
  put(url, data = {}, config = {}) {
    return httpClient.put(url, data, config)
  },

  /**
   * DELETE 请求
   * @param {string} url - 请求地址
   * @param {object} config - 额外配置
   * @returns {Promise}
   */
  delete(url, config = {}) {
    return httpClient.delete(url, config)
  },

  /**
   * PATCH 请求
   * @param {string} url - 请求地址
   * @param {any} data - 请求体数据
   * @param {object} config - 额外配置
   * @returns {Promise}
   */
  patch(url, data = {}, config = {}) {
    return httpClient.patch(url, data, config)
  },

  /**
   * 文件上传
   * @param {string} url - 请求地址
   * @param {FormData} formData - 表单数据
   * @param {Function} onProgress - 上传进度回调
   * @returns {Promise}
   */
  upload(url, formData, onProgress) {
    return httpClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      }
    })
  },

  /**
   * 文件下载
   * @param {string} url - 请求地址
   * @param {string} filename - 下载文件名
   * @returns {Promise}
   */
  download(url, filename) {
    return httpClient.get(url, {
      responseType: 'blob'
    }).then((response) => {
      const blob = new Blob([response])
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(link.href)
    })
  }
}

// 导出 axios 实例（如果需要直接使用）
export default httpClient

