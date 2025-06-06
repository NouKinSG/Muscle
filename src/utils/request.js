import axios from 'axios'
import { ElMessage } from 'element-plus'
import logger from './logger'

// 创建axios实例
const service = axios.create({
  baseURL: '/', // 后端服务地址, 修改为相对路径以配合代理
  timeout: 10000, // 请求超时时间
  withCredentials: true, // 确保携带凭证
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      // 设置请求头携带token
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    logger.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // ✅ 如果返回的 code 不是 0，说明后端认为出错了
    if (res.code !== 0) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      // ✅ 正常返回 data 字段
      return res.data
    }
  },
  error => {
    logger.error('响应错误:', error)
    ElMessage({
      message: error.message || '请求失败',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service