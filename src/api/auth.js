import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录信息 {email, password}
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册信息 {username, email, password}
 * @returns {Promise}
 */

export function register(data) {
  return request({
    url: '/api/user/register',
    method: 'post',
    data
  })
}

/**
 * 忘记密码
 * @param {Object} data - 邮箱信息 {email}
 * @returns {Promise}
 */
export function forgotPassword(data) {
  return request({
    url: '/api/v1/auth/forgot-password',
    method: 'post',
    data
  })
}

/**
 * 重置密码
 * @param {Object} data - 重置密码信息 {token, password}
 * @returns {Promise}
 */
export function resetPassword(data) {
  return request({
    url: '/api/v1/auth/reset-password',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserProfile() {
  return request({
    url: '/api/v1/user/profile',
    method: 'get'
  })
}