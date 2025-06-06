import request from '@/utils/request'

/**
 * 获取日历视图任务（某段时间内所有题目）
 * @param {Object} params - 请求参数 {start_date, end_date}
 * @returns {Promise}
 */
export function getCalendarTasks(params) {
  return request({
    url: '/algo/v1/plan/calendar',
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
    url: '/algo/v1/plan/day',
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
    url: '/algo/v1/plan/import',
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
    url: '/algo/v1/plan/repeat-strategies',
    method: 'get'
  })
}

/**
 * 获取题目列表
 * @param {Object} params - 请求参数 { tag, difficulty, keyword }
 * @returns {Promise}
 */
export function getLibraryQuestions(params) {
  return request({
    url: '/algo/v1/plan/library/list',
    method: 'get',
    params
  })
}

/**
 * 获取题单列表
 * @param {Object} params - 请求参数 { page, pageSize, keyword }
 * @returns {Promise}
 */
export function getQuestionSetList(params) {
  return request({
    url: '/algo/v1/plan/question-set/list',
    method: 'get',
    params
  })
}

/**
 * 获取题单详情（含题目列表）
 * @param {Number} id - 题单ID
 * @returns {Promise}
 */
export function getQuestionSetDetail(id) {
  return request({
    url: `/algo/v1/plan/question-set/${id}`,
    method: 'get'
  })
}

/**
 * 获取题目详情
 * @param {Number} id - 题目ID
 * @returns {Promise}
 */
export function getQuestionDetail(id) {
  return request({
    url: `/algo/v1/plan/question/${id}`,
    method: 'get'
  })
}

/**
 * 更新任务状态
 * @param {Number} taskId - 任务ID
 * @param {Object} data - 请求数据 { status, duration }
 * @returns {Promise}
 */
export function updateTaskStatus(taskId, status, duration) {
  return request({
    url: `/algo/v1/plan/task/${taskId}/status`,
    method: 'put',
    data: {
      status,
      duration
    }
  })
}