/**
 * API 接口统一导出
 * 按模块组织 API 请求
 */
import { http } from './http'

/**
 * 面试相关 API
 */
export const interviewApi = {
  /**
   * 创建面试房间
   * @param {any} data - 房间数据
   * @returns {Promise}
   */
  createRoom(data = 1) {
    return http.post('/api/interview/createroom', data)
  },

  /**
   * 获取面试元数据
   * @param {string} interviewId - 面试ID
   * @returns {Promise}
   */
  getInterviewMetadata(interviewId) {
    return http.get(`/api/interview/${interviewId}`)
  }
}

/**
 * 面试者相关 API
 */
export const intervieweeApi = {
  /**
   * 获取所有面试者
   * @returns {Promise}
   */
  getAll() {
    return http.get('/interviewee/showAll')
  },

  /**
   * 根据ID获取面试者信息
   * @param {string} id - 面试者ID
   * @returns {Promise}
   */
  getById(id) {
    return http.get(`/interviewee/${id}`)
  }
}

/**
 * 评估相关 API
 */
export const evaluationApi = {
  /**
   * 添加评估记录
   * @param {object} data - 评估数据
   * @returns {Promise}
   */
  add(data) {
    return http.post('/evaluation/add', data)
  },

  /**
   * 搜索评估记录
   * @param {string} pageSize - 每页大小
   * @param {string} interviewId - 面试ID
   * @returns {Promise}
   */
  search(pageSize, interviewId) {
    return http.get(`/evaluation/search/${pageSize}/${interviewId}`)
  },

  /**
   * 根据面试者ID获取评估列表
   * @param {string} pageSize - 每页大小
   * @param {string} intervieweeId - 面试者ID
   * @returns {Promise}
   */
  selectByInterviewee(pageSize, intervieweeId) {
    return http.get(`/evaluation/select/${pageSize}/${intervieweeId}`)
  }
}

// 统一导出
export default {
  interview: interviewApi,
  interviewee: intervieweeApi,
  evaluation: evaluationApi
}

