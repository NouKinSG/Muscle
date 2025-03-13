<template>
  <div class="practice-container">
    <!-- 左侧练习区域 -->
    <div class="practice-main">
      <!-- 顶部导航栏 -->
      <div class="practice-header">
        <div class="header-filters">
          <div class="difficulty-filter">
            <el-radio-group v-model="selectedDifficulty" size="small">
              <el-radio-button label="simple">简单</el-radio-button>
              <el-radio-button label="medium">中等</el-radio-button>
              <el-radio-button label="hard">困难</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="category-filter">
            <el-select v-model="selectedCategory" placeholder="算法分类" size="small">
              <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
        </div>
        
        <div class="search-box">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索题目编号/关键词" 
            prefix-icon="el-icon-search"
            size="small"
            clearable
          ></el-input>
        </div>
      </div>
      
      <!-- 题目内容区 -->
      <div class="problem-container">
        <!-- 题目标题和元信息 -->
        <div class="problem-header">
          <div class="problem-title-wrapper">
            <h2 class="problem-title">两数之和</h2>
            <div class="problem-meta">
              <el-tag size="small" type="success" effect="light">简单</el-tag>
              <span class="pass-rate">通过率: 45%</span>
            </div>
          </div>
          <div class="problem-actions">
            <el-button size="small" icon="el-icon-star-off" circle></el-button>
            <el-button size="small" icon="el-icon-document" circle></el-button>
            <el-button size="small" icon="el-icon-share" circle></el-button>
          </div>
        </div>
        
        <!-- 题目描述和代码编辑区 -->
        <div class="problem-content">
          <!-- 题目描述 -->
          <div class="description-panel">
            <div class="description-content">
              <h3 class="section-title">题目描述</h3>
              <p>给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找和为目标值 target 的那两个整数，并返回它们的数组下标。你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。</p>
              
              <h3 class="section-title">示例</h3>
              <div class="example">
                <div class="example-card">
                  <p><strong>输入:</strong> nums = [2,7,11,15], target = 9</p>
                  <p><strong>输出:</strong> [0,1]</p>
                  <p><strong>解释:</strong> 因为 nums[0] + nums[1] == 9，返回 [0, 1]</p>
                </div>
              </div>
              
              <h3 class="section-title">提示</h3>
              <div class="constraints">
                <ul>
                  <li>2 <= nums.length <= 104</li>
                  <li>-109 <= nums[i] <= 109</li>
                  <li>-109 <= target <= 109</li>
                  <li>只会存在一个有效答案</li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- 代码编辑区 -->
          <div class="code-panel">
            <div class="editor-header">
              <el-select v-model="selectedLanguage" placeholder="选择语言" size="small">
                <el-option label="JavaScript" value="javascript"></el-option>
                <el-option label="Python" value="python"></el-option>
                <el-option label="Java" value="java"></el-option>
                <el-option label="C++" value="cpp"></el-option>
              </el-select>
              
              <div class="editor-actions">
                <el-button size="small" @click="runCode">运行</el-button>
                <el-button size="small" type="primary" @click="submitCode">提交</el-button>
              </div>
            </div>
            
            <div class="editor-body">
              <div id="code-mirror-editor" class="code-mirror-container"></div>
            </div>
            
            <!-- 运行结果 -->
            <div class="run-result" v-if="showResult">
              <div class="result-header">
                <h3>运行结果</h3>
                <el-tag :type="resultStatus === 'success' ? 'success' : 'danger'">
                  {{ resultStatus === 'success' ? '通过' : '失败' }}
                </el-tag>
              </div>
              
              <div class="result-content">
                <div class="test-cases">
                  <div class="test-case" v-for="(testCase, index) in testCases" :key="index">
                    <div class="test-case-header">
                      <span class="test-case-title">测试用例 {{ index + 1 }}</span>
                      <el-tag size="small" :type="testCase.status === 'success' ? 'success' : 'danger'">
                        {{ testCase.status === 'success' ? '通过' : '失败' }}
                      </el-tag>
                    </div>
                    
                    <div class="test-case-detail">
                      <div class="test-input"><strong>输入:</strong> {{ testCase.input }}</div>
                      <div class="test-output"><strong>输出:</strong> {{ testCase.output }}</div>
                      <div class="test-expected" v-if="testCase.status === 'fail'">
                        <strong>期望:</strong> {{ testCase.expected }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="performance-metrics">
                  <div class="metric">
                    <span class="metric-label">执行用时:</span>
                    <span class="metric-value">{{ executionTime }}ms</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">内存消耗:</span>
                    <span class="metric-value">{{ memoryUsage }}MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧辅助功能区 -->
    <div class="practice-sidebar">
      <!-- 计时器模块 -->
      <div class="sidebar-card timer-module">
        <div class="card-header">
          <h3>计时器</h3>
          <div class="timer-controls">
            <el-button size="mini" :icon="timerRunning ? 'el-icon-video-pause' : 'el-icon-video-play'" circle @click="toggleTimer"></el-button>
            <el-button size="mini" icon="el-icon-refresh" circle @click="resetTimer"></el-button>
          </div>
        </div>
        <div class="timer-display">{{ formatTime(currentTime) }}</div>
        <div class="timer-stats">
          <div class="stat-item">
            <span class="stat-label">平均耗时:</span>
            <span class="stat-value">{{ formatTime(averageTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最快记录:</span>
            <span class="stat-value">{{ formatTime(bestTime) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 解题进度追踪 -->
      <div class="sidebar-card progress-tracker">
        <div class="card-header">
          <h3>今日进度</h3>
        </div>
        <div class="progress-bar-container">
          <div class="progress-text">{{ completedCount }}/{{ dailyTarget }}</div>
          <el-progress :percentage="(completedCount / dailyTarget) * 100" :format="() => ''"></el-progress>
        </div>
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">连续打卡:</span>
            <span class="stat-value">{{ streakDays }}天</span>
          </div>
        </div>
        <div class="coverage-chart">
          <h4>知识点覆盖</h4>
          <div id="coverage-pie-chart" class="pie-chart"></div>
        </div>
      </div>
      
      <!-- 重复训练面板 -->
      <div class="sidebar-card review-panel">
        <div class="card-header">
          <h3>待复习题目</h3>
        </div>
        <div class="review-progress">
          <div class="progress-text">{{ reviewCompleted }}/{{ reviewTotal }}</div>
          <el-progress :percentage="reviewProgress" :format="() => ''"></el-progress>
        </div>
        <div class="review-list">
          <div class="review-item" v-for="(item, index) in reviewItems" :key="index">
            <div class="review-item-title">{{ item.title }}</div>
            <div class="review-item-meta">
              <el-tag size="mini" :type="getReviewTagType(item.cycle)" effect="plain">
                {{ getReviewCycleName(item.cycle) }}
              </el-tag>
              <span class="review-date">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { basicSetup } from 'codemirror'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'

// 难度选择
const selectedDifficulty = ref('simple')

// 算法分类
const categories = [
  { label: '全部', value: 'all' },
  { label: '数组', value: 'array' },
  { label: '链表', value: 'linked-list' },
  { label: '哈希表', value: 'hash-table' },
  { label: '字符串', value: 'string' },
  { label: '动态规划', value: 'dynamic-programming' },
  { label: '二叉树', value: 'binary-tree' },
  { label: '贪心', value: 'greedy' },
  { label: '回溯', value: 'backtracking' },
  { label: '深度优先搜索', value: 'dfs' },
  { label: '广度优先搜索', value: 'bfs' }
]
const selectedCategory = ref('all')

// 搜索关键词
const searchKeyword = ref('')

// 编程语言选择
const selectedLanguage = ref('javascript')

// 代码编辑器实例
let editorView = null

// 初始代码模板
const codeTemplates = {
  javascript: `function twoSum(nums, target) {
  // 在这里编写你的代码
}`,
  python: `def twoSum(nums, target):
    # 在这里编写你的代码
    pass`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // 在这里编写你的代码
        return null;
    }
}`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // 在这里编写你的代码
        return {};
    }
};`
}

// 运行结果
const showResult = ref(false)
const resultStatus = ref('success')
const testCases = ref([
  {
    input: 'nums = [2,7,11,15], target = 9',
    output: '[0,1]',
    expected: '[0,1]',
    status: 'success'
  },
  {
    input: 'nums = [3,2,4], target = 6',
    output: '[1,2]',
    expected: '[1,2]',
    status: 'success'
  }
])
const executionTime = ref(5)
const memoryUsage = ref(39.5)

// 计时器
const currentTime = ref(0)
const averageTime = ref(129)
const bestTime = ref(89)
const timerRunning = ref(false)
let timerInterval = null

// 进度追踪
const completedCount = ref(3)
const dailyTarget = ref(5)
const streakDays = ref(7)

// 复习进度
const reviewCompleted = ref(3)
const reviewTotal = ref(5)
const reviewProgress = computed(() => (reviewCompleted.value / reviewTotal.value) * 100)

// 待复习题目
const reviewItems = ref([
  { title: '合并两个有序链表', cycle: 1, date: '今天' },
  { title: '二叉树的最大深度', cycle: 2, date: '今天' }
])

// 初始化编辑器
onMounted(() => {
  initCodeEditor()
  initCoverageChart()
  // 不再自动启动计时器
})

function initCodeEditor() {
  const editorContainer = document.getElementById('code-mirror-editor')
  if (!editorContainer) return
  
  const startState = EditorState.create({
    doc: codeTemplates[selectedLanguage.value],
    extensions: [
      basicSetup,
      javascript(),
      EditorView.lineWrapping,
      keymap.of([])
    ]
  })

  editorView = new EditorView({
    state: startState,
    parent: editorContainer
  })
}

// 初始化覆盖率图表
function initCoverageChart() {
  const chartDom = document.getElementById('coverage-pie-chart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: [
          { value: 40, name: '数组' },
          { value: 30, name: '链表' },
          { value: 20, name: '哈希表' },
          { value: 10, name: '动态规划' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  myChart.setOption(option)
}

// 计时器相关函数
function startTimer() {
  if (!timerRunning.value) {
    timerRunning.value = true
    timerInterval = setInterval(() => {
      currentTime.value++
    }, 1000)
  }
}

function stopTimer() {
  if (timerRunning.value) {
    timerRunning.value = false
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function toggleTimer() {
  if (timerRunning.value) {
    stopTimer()
  } else {
    startTimer()
  }
}

function resetTimer() {
  stopTimer()
  currentTime.value = 0
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

// 复习标签相关函数
function getReviewTagType(cycle) {
  const types = ['', 'warning', 'danger']
  return types[cycle] || 'info'
}

function getReviewCycleName(cycle) {
  const names = ['', '首轮', '二轮', '三轮']
  return names[cycle] || `第${cycle}轮`
}

// 运行和提交代码
function runCode() {
  showResult.value = true
  // 这里添加实际的代码运行逻辑
}

function submitCode() {
  showResult.value = true
  // 这里添加实际的代码提交逻辑
}
</script>
<style lang="scss" scoped>
.practice-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
  overflow: hidden;
}

.practice-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
  padding-right: 8px;
}

.practice-sidebar {
  width: 300px;
  padding: 16px;
  padding-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  
  .header-filters {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .search-box {
    width: 240px;
  }
}

.problem-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.problem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  
  .problem-title-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .problem-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }
  
  .problem-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .pass-rate {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .problem-actions {
    display: flex;
    gap: 8px;
  }
}

.problem-content {
  display: flex;
  height: calc(100% - 70px);
  overflow: hidden;
}

.description-panel {
  width: 40%;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
  
  .description-content {
    padding: 16px;
    
    .section-title {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    p {
      margin-bottom: 16px;
      line-height: 1.6;
      color: #606266;
    }
    
    .example {
      margin-bottom: 20px;
      
      .example-card {
        padding: 12px;
        background-color: #f8f8f9;
        border-radius: 4px;
        border-left: 4px solid #409eff;
        
        p {
          margin: 8px 0;
          font-family: 'Courier New', monospace;
        }
      }
    }
    
    .constraints {
      ul {
        padding-left: 20px;
        
        li {
          margin-bottom: 8px;
          color: #606266;
          font-family: 'Courier New', monospace;
        }
      }
    }
  }
}

.code-panel {
  width: 60%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
  padding-right: 8px;
  
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
    
    .editor-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .editor-body {
    flex: 1;
    overflow: hidden;
    
    .code-mirror-container {
      height: 100%;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 14px;
    }
  }
  
  .run-result {
    border-top: 1px solid #dcdfe6;
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: #f5f7fa;
      
      h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
    }
    
    .result-content {
      padding: 12px;
      max-height: 200px;
      overflow-y: auto;
      
      .test-cases {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
        
        .test-case {
          border: 1px solid #ebeef5;
          border-radius: 4px;
          overflow: hidden;
          
          .test-case-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background-color: #f5f7fa;
            
            .test-case-title {
              font-weight: 600;
              color: #303133;
              font-size: 13px;
            }
          }
          
          .test-case-detail {
            padding: 10px 12px;
            
            div {
              margin-bottom: 6px;
              font-family: 'Courier New', monospace;
              font-size: 13px;
              
              &:last-child {
                margin-bottom: 0;
              }
            }
            
            .test-expected {
              color: #f56c6c;
            }
          }
        }
      }
      
      .performance-metrics {
        display: flex;
        gap: 20px;
        
        .metric {
          display: flex;
          align-items: center;
          gap: 6px;
          
          .metric-label {
            font-weight: 600;
            color: #606266;
            font-size: 13px;
          }
          
          .metric-value {
            color: #409eff;
            font-family: 'Courier New', monospace;
            font-size: 13px;
          }
        }
      }
    }
  }
}

.sidebar-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.timer-module {
  .timer-controls {
    display: flex;
    gap: 8px;
  }
  
  .timer-display {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px 0;
    font-size: 28px;
    font-weight: 700;
    color: #409eff;
    font-family: 'Courier New', monospace;
  }
  
  .timer-stats {
    padding: 0 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .stat-label {
        color: #606266;
        font-size: 13px;
      }
      
      .stat-value {
        font-family: 'Courier New', monospace;
        color: #409eff;
        font-size: 13px;
      }
    }
  }
}

.progress-tracker {
  .progress-bar-container {
    padding: 16px 16px 8px;
    position: relative;
    
    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: 600;
      color: #409eff;
      font-size: 13px;
    }
  }
  
  .progress-stats {
    padding: 0 16px 16px;
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .stat-label {
        color: #606266;
        font-size: 13px;
      }
      
      .stat-value {
        font-weight: 600;
        color: #409eff;
        font-size: 13px;
      }
    }
  }
  
  .coverage-chart {
    padding: 0 16px 16px;
    
    h4 {
      margin: 0 0 12px;
      font-size: 14px;
      color: #606266;
    }
    
    .pie-chart {
      height: 160px;
      width: 100%;
    }
  }
}

.review-panel {
  .review-progress {
    padding: 16px 16px 8px;
    position: relative;
    
    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-weight: 600;
      color: #409eff;
      font-size: 13px;
    }
  }
  
  .review-list {
    padding: 8px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 200px;
    overflow-y: auto;
    
    .review-item {
      padding: 8px;
      border-radius: 4px;
      background-color: #f8f8f9;
      
      .review-item-title {
        font-weight: 600;
        margin-bottom: 6px;
        color: #303133;
        font-size: 14px;
      }
      
      .review-item-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .review-date {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
