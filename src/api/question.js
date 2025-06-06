import request from '@/utils/request'

/**
 * 获取题目详情（跳转练题页）
 * @param {Number} questionId - 题目ID
 * @returns {Promise}
 */
export function getQuestionDetail(questionId) {
  return request({
    url: `/algo/v1/plan/question/${questionId}`,
    method: 'get'
  })
}

/**
 * 获取题库列表（用于导入）
 * @param {Object} params - 请求参数 {tag, difficulty, keyword}
 * @returns {Promise}
 */
export function getLibraryList(params) {
  return request({
    url: '/algo/v1/plan/library-questions',
    method: 'get',
    params
  })
}

/**
 * 获取题单列表（支持分页 & 搜索）
 * @param {Object} params - 请求参数 {page, page_size, keyword}
 * @returns {Promise}
 */
export function getQuestionSetList(params) {
  return request({
    url: '/algo/v1/plan/question-set-list',
    method: 'get',
    params
  })
}

/**
 * 获取题单详情（含题目列表）
 * @param {Number} setId - 题单ID
 * @returns {Promise<{
 *   id: number,
 *   name: string,
 *   description: string,
 *   questions: Array<{
 *     question_id: number,
 *     title: string,
 *     difficulty: string,
 *     tags: string[]
 *   }>
 * }>}
 */
export function getQuestionSetDetail(setId) {
  return request({
    url: `/algo/v1/plan/question-set/${setId}`,
    method: 'get'
  })
}