/**
 * 学习计划生成器
 * 基于艾宾浩斯记忆曲线的学习计划系统
 * 核心思想："宁一题十遍，不十题一遍"
 */

// 复习周期定义
const REVIEW_CYCLES = [
  {
    cycle: 1,
    name: '第一遍',
    activityType: '学会+独立解出',
    description: '初次接触，确保理解并能独立解题',
    interval: 0, // 初次学习，无间隔
    timeSlot: '8:00~9:00',
    note: ''
  },
  {
    cycle: 2,
    name: '第二遍',
    activityType: '思路重复',
    description: '加深对题目解法的理解',
    interval: 0, // 同一天内复习
    timeSlot: '9:30~10:00',
    note: ''
  },
  {
    cycle: 3,
    name: '第三遍',
    activityType: '代码重复',
    description: '编写代码，巩固解题思路',
    interval: 2, // 2小时后
    timeSlot: '12:00~14:00',
    note: ''
  },
  {
    cycle: 4,
    name: '第四遍',
    activityType: '白板重复',
    description: '在白板上重现解题过程',
    interval: 4, // 4小时后
    timeSlot: '18:00~19:00',
    note: ''
  },
  {
    cycle: 5,
    name: '第五遍',
    activityType: '模拟重复',
    description: '模拟面试环境下解题',
    interval: 6, // 6小时后
    timeSlot: '21:00~23:00',
    note: ''
  },
  {
    cycle: 6,
    name: '第六遍',
    activityType: '手写重复',
    description: '手写代码，加深记忆',
    interval: 24, // 1天后
    timeSlot: '新题入库之前',
    note: ''
  },
  {
    cycle: 7,
    name: '第七遍',
    activityType: '周期重复',
    description: '第一周期复习，加强记忆痕迹',
    interval: 120, // 5天后
    timeSlot: '当天题目模拟前',
    note: ''
  },
  {
    cycle: 8,
    name: '第八遍',
    activityType: '周期重复',
    description: '第二周期复习，巩固知识点',
    interval: 240, // 10天后
    timeSlot: '',
    note: '正在试验，先10天看效果'
  },
  {
    cycle: 9,
    name: '第九遍',
    activityType: '抽样重复',
    description: '抽取第一周期首尾题目进行复习',
    interval: 360, // 15天后
    timeSlot: '',
    note: '随机抽两道题题目'
  },
  {
    cycle: 10,
    name: '第十遍',
    activityType: '集体重复',
    description: '集中测试第一周期的题目（1h 5题）',
    interval: 480, // 20天后
    timeSlot: '',
    note: ''
  }
];

// LeetCode Hot 100题目列表
const HOT_100_PROBLEMS = [
  // 数组
  { id: 1, title: '两数之和', difficulty: '简单', category: '数组', url: 'https://leetcode.cn/problems/two-sum/' },
  { id: 42, title: '接雨水', difficulty: '困难', category: '数组', url: 'https://leetcode.cn/problems/trapping-rain-water/' },
  { id: 53, title: '最大子数组和', difficulty: '简单', category: '数组', url: 'https://leetcode.cn/problems/maximum-subarray/' },
  { id: 238, title: '除自身以外数组的乘积', difficulty: '中等', category: '数组', url: 'https://leetcode.cn/problems/product-of-array-except-self/' },
  { id: 283, title: '移动零', difficulty: '简单', category: '数组', url: 'https://leetcode.cn/problems/move-zeroes/' },
  
  // 链表
  { id: 2, title: '两数相加', difficulty: '中等', category: '链表', url: 'https://leetcode.cn/problems/add-two-numbers/' },
  { id: 19, title: '删除链表的倒数第 N 个结点', difficulty: '中等', category: '链表', url: 'https://leetcode.cn/problems/remove-nth-node-from-end-of-list/' },
  { id: 21, title: '合并两个有序链表', difficulty: '简单', category: '链表', url: 'https://leetcode.cn/problems/merge-two-sorted-lists/' },
  { id: 141, title: '环形链表', difficulty: '简单', category: '链表', url: 'https://leetcode.cn/problems/linked-list-cycle/' },
  { id: 206, title: '反转链表', difficulty: '简单', category: '链表', url: 'https://leetcode.cn/problems/reverse-linked-list/' },
  
  // 字符串
  { id: 3, title: '无重复字符的最长子串', difficulty: '中等', category: '字符串', url: 'https://leetcode.cn/problems/longest-substring-without-repeating-characters/' },
  { id: 5, title: '最长回文子串', difficulty: '中等', category: '字符串', url: 'https://leetcode.cn/problems/longest-palindromic-substring/' },
  { id: 20, title: '有效的括号', difficulty: '简单', category: '字符串', url: 'https://leetcode.cn/problems/valid-parentheses/' },
  { id: 49, title: '字母异位词分组', difficulty: '中等', category: '字符串', url: 'https://leetcode.cn/problems/group-anagrams/' },
  { id: 76, title: '最小覆盖子串', difficulty: '困难', category: '字符串', url: 'https://leetcode.cn/problems/minimum-window-substring/' },
  
  // 二叉树
  { id: 94, title: '二叉树的中序遍历', difficulty: '简单', category: '二叉树', url: 'https://leetcode.cn/problems/binary-tree-inorder-traversal/' },
  { id: 98, title: '验证二叉搜索树', difficulty: '中等', category: '二叉树', url: 'https://leetcode.cn/problems/validate-binary-search-tree/' },
  { id: 101, title: '对称二叉树', difficulty: '简单', category: '二叉树', url: 'https://leetcode.cn/problems/symmetric-tree/' },
  { id: 104, title: '二叉树的最大深度', difficulty: '简单', category: '二叉树', url: 'https://leetcode.cn/problems/maximum-depth-of-binary-tree/' },
  { id: 236, title: '二叉树的最近公共祖先', difficulty: '中等', category: '二叉树', url: 'https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/' },
  
  // 动态规划
  { id: 70, title: '爬楼梯', difficulty: '简单', category: '动态规划', url: 'https://leetcode.cn/problems/climbing-stairs/' },
  { id: 121, title: '买卖股票的最佳时机', difficulty: '简单', category: '动态规划', url: 'https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/' },
  { id: 139, title: '单词拆分', difficulty: '中等', category: '动态规划', url: 'https://leetcode.cn/problems/word-break/' },
  { id: 300, title: '最长递增子序列', difficulty: '中等', category: '动态规划', url: 'https://leetcode.cn/problems/longest-increasing-subsequence/' },
  { id: 322, title: '零钱兑换', difficulty: '中等', category: '动态规划', url: 'https://leetcode.cn/problems/coin-change/' },
];

/**
 * 生成学习计划
 * @param {Date} startDate - 开始日期
 * @param {Date} endDate - 结束日期
 * @param {Number} dailyNewProblems - 每日新题数量
 * @param {Array} selectedCategories - 选择的题目类别
 * @param {String} planType - 计划类型：'template'(模板计划), 'wrong'(错题复习), 'recommend'(智能推荐)
 * @returns {Object} 学习计划对象
 */
function generateStudyPlan(startDate, endDate, dailyNewProblems = 1, selectedCategories = [], planType = 'template') {
  // 计算计划总天数
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  // 根据类别筛选题目
  let availableProblems = [...HOT_100_PROBLEMS];
  if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
    availableProblems = HOT_100_PROBLEMS.filter(problem => 
      selectedCategories.includes(problem.category));
  }
  
  // 如果可用题目不足，则重复使用
  if (availableProblems.length < totalDays * dailyNewProblems) {
    const repeatTimes = Math.ceil((totalDays * dailyNewProblems) / availableProblems.length);
    const originalProblems = [...availableProblems];
    for (let i = 1; i < repeatTimes; i++) {
      availableProblems = [...availableProblems, ...originalProblems];
    }
  }
  
  // 随机打乱题目顺序
  availableProblems = shuffleArray(availableProblems);
  
  // 生成每日计划
  const dailyPlans = [];
  const reviewQueue = []; // 复习队列
  
  for (let day = 0; day < totalDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    
    // 当日新题
    const newProblems = [];
    for (let i = 0; i < dailyNewProblems; i++) {
      if (day * dailyNewProblems + i < availableProblems.length) {
        const problem = availableProblems[day * dailyNewProblems + i];
        newProblems.push({
          ...problem,
          reviewCycle: 1, // 第一遍学习
          reviewInfo: REVIEW_CYCLES[0]
        });
        
        // 将后续复习计划加入队列
        for (let cycleIndex = 1; cycleIndex < REVIEW_CYCLES.length; cycleIndex++) {
          const cycle = REVIEW_CYCLES[cycleIndex];
          const reviewDate = new Date(currentDate);
          
          // 计算复习日期
          if (cycle.interval < 24) {
            // 当天复习，以小时计
            reviewDate.setHours(reviewDate.getHours() + cycle.interval);
          } else {
            // 跨天复习，以天计
            reviewDate.setDate(reviewDate.getDate() + Math.floor(cycle.interval / 24));
          }
          
          reviewQueue.push({
            problem: { ...problem },
            reviewDate,
            reviewCycle: cycleIndex + 1,
            reviewInfo: cycle
          });
        }
      }
    }
    
    // 当日复习题目
    const reviewProblems = reviewQueue
      .filter(item => isSameDay(item.reviewDate, currentDate))
      .map(item => ({
        ...item.problem,
        reviewCycle: item.reviewCycle,
        reviewInfo: item.reviewInfo
      }));
    
    // 从复习队列中移除已安排的题目
    reviewQueue.forEach((item, index) => {
      if (isSameDay(item.reviewDate, currentDate)) {
        reviewQueue.splice(index, 1);
      }
    });
    
    // 添加到每日计划中
    dailyPlans.push({
      date: formatDate(currentDate),
      newProblems,
      reviewProblems,
      totalProblems: newProblems.length + reviewProblems.length
    });
  }
  
  return {
    name: `Hot 100 学习计划 (${formatDate(startDate)} ~ ${formatDate(endDate)})`,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    totalDays,
    dailyNewProblems,
    selectedCategories,
    planType,
    dailyPlans
  };
}

/**
 * 判断两个日期是否为同一天
 * @param {Date} date1 - 日期1
 * @param {Date} date2 - 日期2
 * @returns {Boolean} 是否为同一天
 */
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {Date} date - 日期对象
 * @returns {String} 格式化后的日期字符串
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 随机打乱数组
 * @param {Array} array - 需要打乱的数组
 * @returns {Array} 打乱后的数组
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 生成默认的学习计划
 * 从当前日期开始，持续30天，每天1道新题
 * @returns {Object} 默认学习计划
 */
function generateDefaultPlan() {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 29); // 30天计划
  
  return generateStudyPlan(startDate, endDate, 1, [], 'template');
}

/**
 * 生成示例计划表（类似于图片中的表格）
 * @param {Date} startDate - 开始日期
 * @returns {Array} 计划表数据
 */
function generatePlanTable(startDate = new Date()) {
  const planTable = [];
  const currentDate = new Date(startDate);
  
  // 生成30天的计划表
  for (let day = 0; day < 30; day++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + day);
    
    // 当天的新题和复习题
    const dayPlan = {
      date: formatDate(date),
      firstRound: [],  // 第一次学习的题目
      secondRound: [], // 第二轮复习的题目
      thirdRound: []   // 第三轮复习的题目
    };
    
    // 添加到计划表
    planTable.push(dayPlan);
  }
  
  // 填充计划表
  // 假设每天学习一道新题
  for (let day = 0; day < planTable.length; day++) {
    // 新题（第一轮）
    if (day < HOT_100_PROBLEMS.length) {
      planTable[day].firstRound.push({
        ...HOT_100_PROBLEMS[day],
        reviewCycle: 1
      });
      
      // 第二轮复习（当天）
      planTable[day].secondRound.push({
        ...HOT_100_PROBLEMS[day],
        reviewCycle: 2
      });
      
      // 第三轮复习（2小时后，同一天）
      planTable[day].thirdRound.push({
        ...HOT_100_PROBLEMS[day],
        reviewCycle: 3
      });
      
      // 第四轮复习（1天后）
      if (day + 1 < planTable.length) {
        planTable[day + 1].firstRound.push({
          ...HOT_100_PROBLEMS[day],
          reviewCycle: 4
        });
      }
      
      // 第五轮复习（5天后）
      if (day + 5 < planTable.length) {
        planTable[day + 5].secondRound.push({
          ...HOT_100_PROBLEMS[day],
          reviewCycle: 5
        });
      }
      
      // 第六轮复习（10天后）
      if (day + 10 < planTable.length) {
        planTable[day + 10].thirdRound.push({
          ...HOT_100_PROBLEMS[day],
          reviewCycle: 6
        });
      }
      
      // 第七轮复习（15天后）
      if (day + 15 < planTable.length) {
        planTable[day + 15].firstRound.push({
          ...HOT_100_PROBLEMS[day],
          reviewCycle: 7
        });
      }
      
      // 第八轮复习（20天后）
      if (day + 20 < planTable.length) {
        planTable[day + 20].secondRound.push({
          ...HOT_100_PROBLEMS[day],
          reviewCycle: 8
        });
      }
    }
  }
  
  return planTable;
}

// 导出模块
export {
  REVIEW_CYCLES,
  HOT_100_PROBLEMS,
  generateStudyPlan,
  generateDefaultPlan,
  generatePlanTable
};