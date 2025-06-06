// src/api/practice.js
import request from '@/utils/request';

// 提交代码
export const submitCode = (data) => {
  return request({
    url: '/algo/v1/practice/submit',
    method: 'post',
    data
  });
};

// 获取每日任务列表
export const getDailyTasks = () => {
  return request({
    url: '/algo/v1/practice/daily-tasks',
    method: 'get'
  });
};


// 获取题目详情 (如果题目详情接口也属于练习模块)
export const getProblemDetail = (id) => {
  return request({
    url: `/algo/v1/practice/questions/${id}`,
    method: 'get'
  });
};

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
    url: '/algo/v1/practice/previous-accepted/list', // Changed from /algo/v1/practice/last-accepted
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
    url: '/algo/v1/practice/previous-submissions',
    method: 'get',
    params
  })
}