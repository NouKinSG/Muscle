import request from '@/utils/request'

/**
 * 获取日历视图任务（某段时间内所有题目）
 * @param {Object} params - 请求参数 {start_date, end_date}
 * @returns {Promise}
 */
export function getCalendarTasks(params) {
  return request({
    url: '/api/plan/calendar',
    method: 'get',
    params
  })
}

/**
 * 获取某日计划详情
 * @param {Object} params - 请求参数 {date}
 * @returns {Promise}
 */
export function getDayPlan(params) {
  return request({
    url: '/api/plan/day',
    method: 'get',
    params
  })
}

/**
 * 导入训练计划（支持题单导入 & 自选题导入）
 * @param {Object} data - 请求数据
 * @returns {Promise}
 */
export function importPlan(data) {
  return request({
    url: '/api/plan/import',
    method: 'post',
    data
  })
}

/**
 * 获取预设重复周期策略列表
 * @returns {Promise}
 */
export function getRepeatStrategies() {
  return request({
    url: '/api/plan/repeat-strategies',
    method: 'get'
  })
}