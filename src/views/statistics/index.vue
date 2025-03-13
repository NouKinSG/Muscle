<template>
  <div class="statistics-container">
    <!-- 顶部数据概览 -->
    <div class="overview-section">
      <div class="overview-card" v-for="(item, index) in overviewData" :key="index">
        <div class="card-icon" :class="item.iconClass">
          <i :class="item.icon"></i>
        </div>
        <div class="card-content">
          <div class="card-value">{{ item.value }}</div>
          <div class="card-title">{{ item.title }}</div>
        </div>
        <div class="card-trend" :class="item.trendClass">
          <span>{{ item.trend }}</span>
          <i :class="item.trendIcon"></i>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 学习进度图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>学习进度</h3>
          <div class="chart-actions">
            <el-radio-group v-model="progressTimeRange" size="small">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="year">全年</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div id="progress-chart" class="chart-container"></div>
      </div>
      
      <!-- 正确率分析图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>正确率分析</h3>
          <div class="chart-actions">
            <el-select v-model="accuracyCategory" size="small" placeholder="算法分类">
              <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
        </div>
        <div id="accuracy-chart" class="chart-container"></div>
      </div>
    </div>
    
    <!-- 详细数据表格 -->
    <div class="data-table-section">
      <div class="table-header">
        <h3>刷题记录</h3>
        <div class="table-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索题目"
            prefix-icon="el-icon-search"
            size="small"
            clearable
            class="search-input"
          ></el-input>
          <el-button type="primary" size="small" @click="exportData">导出数据</el-button>
        </div>
      </div>
      
      <el-table :data="filteredTableData" style="width: 100%" border stripe>
        <el-table-column prop="date" label="日期" width="120"></el-table-column>
        <el-table-column prop="title" label="题目" width="250"></el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag size="small" :type="getCategoryTagType(scope.row.category)">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="scope">
            <el-tag size="small" :type="getDifficultyTagType(scope.row.difficulty)">{{ scope.row.difficulty }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="耗时" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag size="small" :type="scope.row.status === '通过' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="attempts" label="尝试次数" width="100"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="mini" type="text" @click="viewDetail(scope.row)">查看</el-button>
            <el-button size="mini" type="text" @click="reviewProblem(scope.row)">复习</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="totalItems"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'

// 顶部概览数据
const overviewData = [
  {
    title: '总刷题量',
    value: '256',
    icon: 'el-icon-s-data',
    iconClass: 'blue-icon',
    trend: '+12% 同比上周',
    trendIcon: 'el-icon-top',
    trendClass: 'up-trend'
  },
  {
    title: '本周刷题',
    value: '32',
    icon: 'el-icon-s-order',
    iconClass: 'green-icon',
    trend: '+5% 同比昨日',
    trendIcon: 'el-icon-top',
    trendClass: 'up-trend'
  },
  {
    title: '平均正确率',
    value: '78%',
    icon: 'el-icon-s-claim',
    iconClass: 'orange-icon',
    trend: '+3% 同比上周',
    trendIcon: 'el-icon-top',
    trendClass: 'up-trend'
  },
  {
    title: '连续打卡',
    value: '15天',
    icon: 'el-icon-s-flag',
    iconClass: 'purple-icon',
    trend: '个人最佳',
    trendIcon: 'el-icon-star-on',
    trendClass: 'special-trend'
  }
]

// 学习进度时间范围
const progressTimeRange = ref('week')

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
const accuracyCategory = ref('all')

// 表格数据
const tableData = ref([
  {
    date: '2024-01-15',
    title: '两数之和',
    category: '数组',
    difficulty: '简单',
    time: '5分钟',
    status: '通过',
    attempts: 1
  },
  {
    date: '2024-01-15',
    title: '三数之和',
    category: '数组',
    difficulty: '中等',
    time: '15分钟',
    status: '通过',
    attempts: 2
  },
  {
    date: '2024-01-14',
    title: '合并两个有序链表',
    category: '链表',
    difficulty: '简单',
    time: '8分钟',
    status: '通过',
    attempts: 1
  },
  {
    date: '2024-01-14',
    title: '最长回文子串',
    category: '字符串',
    difficulty: '中等',
    time: '25分钟',
    status: '失败',
    attempts: 3
  },
  {
    date: '2024-01-13',
    title: '二叉树的最大深度',
    category: '二叉树',
    difficulty: '简单',
    time: '7分钟',
    status: '通过',
    attempts: 1
  },
  {
    date: '2024-01-13',
    title: '爬楼梯',
    category: '动态规划',
    difficulty: '简单',
    time: '6分钟',
    status: '通过',
    attempts: 1
  },
  {
    date: '2024-01-12',
    title: '最大子数组和',
    category: '动态规划',
    difficulty: '简单',
    time: '10分钟',
    status: '通过',
    attempts: 2
  },
  {
    date: '2024-01-12',
    title: '买卖股票的最佳时机',
    category: '贪心',
    difficulty: '简单',
    time: '12分钟',
    status: '通过',
    attempts: 1
  },
  {
    date: '2024-01-11',
    title: '有效的括号',
    category: '栈',
    difficulty: '简单',
    time: '8分钟',
    status: '通过',
    attempts: 1
  },
  {
    date: '2024-01-11',
    title: '岛屿数量',
    category: '深度优先搜索',
    difficulty: '中等',
    time: '20分钟',
    status: '失败',
    attempts: 2
  }
])

// 搜索关键词
const searchKeyword = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(100)

// 过滤后的表格数据
const filteredTableData = computed(() => {
  if (!searchKeyword.value) return tableData.value
  
  return tableData.value.filter(item => {
    return item.title.includes(searchKeyword.value) ||
           item.category.includes(searchKeyword.value)
  })
})

// 初始化图表
onMounted(() => {
  initProgressChart()
  initAccuracyChart()
})

// 初始化学习进度图表
function initProgressChart() {
  const chartDom = document.getElementById('progress-chart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['计划题量', '完成题量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '计划题量',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [5, 5, 5, 5, 5, 3, 3],
        itemStyle: {
          color: '#91cc75'
        }
      },
      {
        name: '完成题量',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [5, 4, 5, 3, 5, 2, 3],
        itemStyle: {
          color: '#5470c6'
        }
      }
    ]
  }
  
  myChart.setOption(option)
  
  // 监听时间范围变化，更新图表数据
  watch(progressTimeRange, (newValue) => {
    let xAxisData = []
    let plannedData = []
    let completedData = []
    
    if (newValue === 'week') {
      xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      plannedData = [5, 5, 5, 5, 5, 3, 3]
      completedData = [5, 4, 5, 3, 5, 2, 3]
    } else if (newValue === 'month') {
      xAxisData = ['第1周', '第2周', '第3周', '第4周']
      plannedData = [30, 30, 30, 30]
      completedData = [28, 25, 30, 22]
    } else if (newValue === 'year') {
      xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      plannedData = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
      completedData = [95, 90, 105, 110, 100, 95, 90, 85, 100, 110, 115, 100]
    }
    
    option.xAxis.data = xAxisData
    option.series[0].data = plannedData
    option.series[1].data = completedData
    
    myChart.setOption(option)
  })
}

// 初始化正确率分析图表
function initAccuracyChart() {
  const chartDom = document.getElementById('accuracy-chart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['简单', '中等', '困难']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '简单',
        type: 'line',
        data: [90, 92, 94, 89, 95, 98],
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '中等',
        type: 'line',
        data: [75, 73, 80, 78, 82, 85],
        itemStyle: {
          color: '#E6A23C'
        }
      },
      {
        name: '困难',
        type: 'line',
        data: [60, 58, 65, 70, 68, 72],
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }
  
  myChart.setOption(option)
  
  // 监听分类变化，更新图表数据
  watch(accuracyCategory, (newValue) => {
    // 这里可以根据选择的分类更新图表数据
    console.log('分类变化:', newValue)
  })
}

// 获取分类标签类型
function getCategoryTagType(category) {
  const typeMap = {
    '数组': '',
    '链表': 'success',
    '哈希表': 'warning',
    '字符串': 'danger',
    '动态规划': 'info',
    '二叉树': '',
    '贪心': 'success',
    '回溯': 'warning',
    '深度优先搜索': 'info',
    '广度优先搜索': 'danger',
    '栈': 'info'
  }
  return typeMap[category] || ''
}

// 获取难度标签类型
function getDifficultyTagType(difficulty) {
  const typeMap = {
    '简单': 'success',
    '中等': 'warning',
    '困难': 'danger'
  }
  return typeMap[difficulty] || ''
}

// 分页处理
function handleSizeChange(size) {
  pageSize.value = size
}

function handleCurrentChange(page) {
  currentPage.value = page
}

// 导出数据
function exportData() {
  // 这里添加导出数据的逻辑
  console.log('导出数据')
}

// 查看详情
function viewDetail(row) {
  console.log('查看详情:', row)
}

// 复习题目
function reviewProblem(row) {
  console.log('复习题目:', row)
}
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

/* 顶部数据概览样式 */
.overview-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.overview-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.blue-icon {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.green-icon {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.orange-icon {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.purple-icon {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.card-title {
  font-size: 14px;
  color: #909399;
}

.card-trend {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.up-trend {
  color: #67C23A;
  background-color: rgba(103, 194, 58, 0.1);
}

.down-trend {
  color: #F56C6C;
  background-color: rgba(245, 108, 108, 0.1);
}

.special-trend {
  color: #E6A23C;
  background-color: rgba(230, 162, 60, 0.1);
}

/* 图表区域样式 */
.charts-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.chart-container {
  height: 300px;
}

/* 数据表格区域样式 */
.data-table-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 250px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>