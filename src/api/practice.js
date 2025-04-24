import request from '@/utils/request'

/**
 * 获取当日练习题目列表
 * @param {Object} params - 请求参数 {user_id}
 * @returns {Promise<{
 *   data: Array<{
 *     question_id: number,
 *     title: string,
 *     difficulty: string,
 *     acceptance_rate: number,
 *     next_review_at: string
 *   }>
 * }>}
 */
export function getTodayPractice(params) {
  return request({
    url: '/api/practice/today',
    method: 'get',
    params
  })
}

/**
 * 获取题目详情
 * @param {number} questionId - 题目ID
 * @returns {Promise<{
 *   question_id: number,
 *   title: string,
 *   slug: string,
 *   content: string,
 *   difficulty: string,
 *   acceptance_rate: number,
 *   test_cases: Array<{
 *     input: string,
 *     output: string
 *   }>,
 *   initial_code: Object<string, string>
 * }>}
 */
export function getProblemDetail(questionId) {
  return request({
    url: `/api/problems/${questionId}`,
    method: 'get'
  })
}

/**
 * 提交题目代码
 * @param {Object} data - 提交数据
 * @param {number} data.userId - 用户ID
 * @param {number} data.question_id - 题目ID
 * @param {string} data.codeContent - 代码内容
 * @param {string} data.language - 编程语言
 * @returns {Promise<{
 *   submissionId: number,
 *   status: string,
 *   runtime: string,
 *   errorMessage: string|null
 * }>}
 */
export function submitPractice(data) {
  return request({
    url: '/api/practice/submit',
    method: 'post',
    data
  })
}

/**
 * 获取最近一次通过的提交记录
 * @param {Object} params - 请求参数
 * @param {number} params.userId - 用户ID
 * @param {number} params.question_id - 题目ID
 * @returns {Promise<{
 *   submissionId: number,
 *   codeContent: string,
 *   language: string,
 *   status: string,
 *   runtime: string,
 *   submitTime: string
 * }>}
 */
export function getLastAcceptedSubmission(params) {
  return request({
    url: '/api/practice/previous-accepted/last',
    method: 'get',
    params
  })
}

/**
 * 获取历史通过的提交记录列表
 * @param {Object} params - 请求参数
 * @param {number} params.userId - 用户ID
 * @param {number} params.question_id - 题目ID
 * @param {number} [params.limit] - 返回记录数量限制
 * @returns {Promise<Array<{
 *   submissionId: number,
 *   codeContent: string,
 *   language: string,
 *   status: string,
 *   runtime: string,
 *   submitTime: string
 * }>>}
 */
export function getAcceptedSubmissionList(params) {
  return request({
    url: '/api/practice/previous-accepted/list',
    method: 'get',
    params
  })
}