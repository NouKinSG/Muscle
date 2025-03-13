<template>
  <div class="plan-container">
    <!-- 日历视图区域 -->
    <div class="calendar-section" v-if="!showPlanTable">
      <!-- 日历头部 -->
      <div class="calendar-header">
        <div class="calendar-title">
          <h2>{{ currentYear }}年{{ currentMonth }}月</h2>
          <div class="calendar-nav">
            <el-button icon="ArrowLeft" circle @click="prevMonth">《</el-button>
            <el-button icon="ArrowRight" circle @click="nextMonth">》</el-button>
          </div>
        </div>
        <div class="calendar-actions">
          <el-button type="primary" icon="Plus" @click="showNewPlanDialog">新建计划</el-button>
          <el-button icon="Edit" @click="showNoteDialog">速记</el-button>
        </div>
      </div>
      
      <!-- 日历主体 -->
      <div class="calendar-body">
      <!-- 星期标题行 -->
      <div class="calendar-weekdays">
        <div class="weekday">周日</div>
        <div class="weekday">周一</div>
        <div class="weekday">周二</div>
        <div class="weekday">周三</div>
        <div class="weekday">周四</div>
        <div class="weekday">周五</div>
        <div class="weekday">周六</div>
      </div>
      
      <!-- 日期网格 -->
      <div class="calendar-grid">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index" 
          class="calendar-day" 
          :class="{ 'current-month': day.currentMonth, 'today': day.isToday, 'selected': isSelectedDay(day) }"
          @click="selectDay(day, index)"
        >
          <!-- 日期单元格顶部 -->
          <div class="day-header">
            <span class="day-number">{{ day.date }}</span>
            <span v-if="day.weather" :class="`weather-icon ${day.weather}`"></span>
          </div>
          
          <!-- 日期单元格内容 -->
          <div class="day-content">
            <!-- 完成题量徽章 -->
            <div v-if="day.completedCount" class="completed-badge">
              {{ day.completedCount }}
            </div>
            
            <!-- 知识点标签 -->
            <div class="tag-cloud">
              <span 
                v-for="(tag, tagIndex) in day.tags" 
                :key="tagIndex" 
                class="algorithm-tag"
                :style="{ backgroundColor: getTagColor(tag) }"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          
          <!-- 日期单元格底部 -->
          <div class="day-footer">
            <!-- 学习时长进度条 -->
            <div v-if="day.studyTime" class="study-progress">
              <div 
                class="progress-bar" 
                :style="{ width: `${Math.min(day.studyTime / targetStudyTime * 100, 100)}%` }"
              ></div>
            </div>
            
            <!-- 错误率警告 -->
            <div v-if="day.errorRate > 0.5" class="error-warning">
              <el-icon><Warning /></el-icon>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    
    <!-- 艾宾浩斯记忆曲线学习计划表 -->
    <div class="plan-table-section" v-if="showPlanTable">
      <div class="plan-table-header">
        <h2>艾宾浩斯记忆曲线学习计划</h2>
        <el-button @click="showPlanTable = false">
          <el-icon><ArrowLeft /></el-icon>
          返回日历视图
        </el-button>
      </div>
      <PlanTable />
    </div>
    
    <!-- 右侧工具面板 -->
    <div class="tools-panel">
      <!-- 知识掌握度雷达图 -->
      <div class="radar-chart-container card">
        <h3>知识掌握度</h3>
        <div id="radar-chart" class="radar-chart"></div>
      </div>
      
      <!-- 今日练习记录 -->
      <div class="today-records card">
        <h3>今日练习记录</h3>
        <div class="record-list">
          <div class="record-item" v-for="(record, index) in todayRecords" :key="index">
            <div class="record-time">{{ record.time }}</div>
            <div class="record-content">
              <div class="record-title">{{ record.title }}</div>
              <div class="record-detail">{{ record.detail }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 复习周期 -->
      <div class="review-cycles card">
        <h3>复习周期</h3>
        <div class="cycle-items">
          <div class="cycle-item" v-for="(cycle, index) in reviewCycles" :key="index">
            <div class="cycle-info">
              <div class="cycle-name">{{ cycle.name }}</div>
              <div class="cycle-progress">第 {{ cycle.current }} 天/共 {{ cycle.total }} 天</div>
            </div>
            <div class="progress">
              <div 
                class="progress-bar" 
                :style="{ width: `${(cycle.current / cycle.total) * 100}%` }"
              ></div>
            </div>
            <div class="cycle-status">
              {{ cycle.status }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 新建计划对话框 -->
    <el-dialog
      title="新建学习计划"
      v-model="newPlanDialogVisible"
      width="500px"
    >
      <el-form :model="newPlanForm" label-width="80px">
        <el-form-item label="计划名称">
          <el-input v-model="newPlanForm.name" placeholder="请输入计划名称"></el-input>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="newPlanForm.startDate" type="date" placeholder="选择开始日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="newPlanForm.endDate" type="date" placeholder="选择结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="计划类型">
          <el-select v-model="newPlanForm.type" placeholder="请选择计划类型">
            <el-option label="模板计划" value="template"></el-option>
            <el-option label="历史错题" value="wrong"></el-option>
            <el-option label="智能推荐" value="recommend"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="每日题量">
          <el-input-number v-model="newPlanForm.dailyCount" :min="1" :max="20"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="newPlanDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createNewPlan">创建</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 速记对话框 -->
    <el-dialog
      title="今日速记"
      v-model="noteDialogVisible"
      width="600px"
    >
      <div class="markdown-editor">
        <el-input
          type="textarea"
          v-model="noteContent"
          :rows="10"
          placeholder="支持 Markdown 格式..."
        ></el-input>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="noteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNote">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 日期详情对话框 -->
    <el-dialog
      :title="selectedDayTitle"
      v-model="dayDetailDialogVisible"
      width="600px"
    >
      <div class="day-detail-content" v-if="selectedDay">
        <div class="day-summary">
          <div class="summary-item">
            <div class="summary-label">完成题量</div>
            <div class="summary-value">{{ selectedDay.completedCount || 0 }} 题</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">学习时长</div>
            <div class="summary-value">{{ selectedDay.studyTime || 0 }} 分钟</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">错误率</div>
            <div class="summary-value" :class="{ 'error-text': selectedDay.errorRate > 0.5 }">
              {{ Math.round((selectedDay.errorRate || 0) * 100) }}%
            </div>
          </div>
        </div>
        
        <div class="day-tags" v-if="selectedDay.tags && selectedDay.tags.length > 0">
          <h4>知识点标签</h4>
          <div class="tag-list">
            <el-tag 
              v-for="(tag, index) in selectedDay.tags" 
              :key="index"
              :color="getTagColor(tag)"
              effect="dark"
              class="day-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <div class="day-actions">
          <h4>可执行操作</h4>
          <div class="action-buttons">
            <el-button type="primary" @click="addPlanForSelectedDay">添加计划</el-button>
            <el-button @click="viewProblemsForSelectedDay">查看题目</el-button>
            <el-button @click="addNoteForSelectedDay">添加笔记</el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dayDetailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { ArrowLeft, ArrowRight, Plus, Edit, Warning } from '@element-plus/icons-vue'
import PlanTable from '@/components/PlanTable.vue'

// 当前日期相关数据
const currentDate = ref(dayjs())
const currentYear = computed(() => currentDate.value.year())
const currentMonth = computed(() => currentDate.value.month() + 1)

// 是否显示计划表
const showPlanTable = ref(false)

// 目标学习时间（分钟）
const targetStudyTime = 120

// 选中的日期
const selectedDayIndex = ref(null)
const selectedDay = ref(null)
const dayDetailDialogVisible = ref(false)

// 选中日期的标题
const selectedDayTitle = computed(() => {
  if (!selectedDay.value) return '日期详情'
  
  const dayObj = dayjs()
    .year(currentYear.value)
    .month(currentMonth.value - 1)
    .date(selectedDay.value.date)
  
  return `${dayObj.format('YYYY年MM月DD日')} 详情`
})

// 选择日期
function selectDay(day, index) {
  selectedDayIndex.value = index
  selectedDay.value = day
  dayDetailDialogVisible.value = true
}

// 判断是否为选中的日期
function isSelectedDay(day) {
  return selectedDay.value && selectedDay.value === day
}

// 为选中日期添加计划
function addPlanForSelectedDay() {
  // 预填充日期
  const selectedDayObj = dayjs()
    .year(currentYear.value)
    .month(currentMonth.value - 1)
    .date(selectedDay.value.date)
  
  newPlanForm.value.startDate = selectedDayObj.toDate()
  newPlanForm.value.endDate = selectedDayObj.add(7, 'day').toDate()
  
  // 关闭当前对话框，打开计划对话框
  dayDetailDialogVisible.value = false
  newPlanDialogVisible.value = true
}

// 查看选中日期的题目
function viewProblemsForSelectedDay() {
  console.log('查看日期题目:', selectedDay.value)
  // 这里可以实现查看题目的逻辑
}

// 为选中日期添加笔记
function addNoteForSelectedDay() {
  // 关闭当前对话框，打开笔记对话框
  dayDetailDialogVisible.value = false
  noteDialogVisible.value = true
}

// 日历数据生成
const calendarDays = computed(() => {
  const days = []
  const firstDayOfMonth = currentDate.value.startOf('month')
  const lastDayOfMonth = currentDate.value.endOf('month')
  
  // 获取当月第一天是星期几（0是星期日）
  const firstDayWeekday = firstDayOfMonth.day()
  
  // 添加上个月的日期
  const prevMonthLastDay = firstDayOfMonth.subtract(1, 'day')
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = prevMonthLastDay.subtract(i, 'day')
    days.push({
      date: day.date(),
      currentMonth: false,
      isToday: day.isSame(dayjs(), 'day'),
      weather: null,
      completedCount: 0,
      tags: [],
      studyTime: 0,
      errorRate: 0
    })
  }
  
  // 添加当月的日期
  for (let i = 0; i < lastDayOfMonth.date(); i++) {
    const day = firstDayOfMonth.add(i, 'day')
    days.push({
      date: i + 1,
      currentMonth: true,
      isToday: day.isSame(dayjs(), 'day'),
      weather: null,
      completedCount: 0,
      tags: [],
      studyTime: 0,
      errorRate: 0
    })
  }
  
  // 添加下个月的日期以填满网格（6行7列）
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      currentMonth: false,
      isToday: false,
      weather: null,
      completedCount: 0,
      tags: [],
      studyTime: 0,
      errorRate: 0
    })
  }
  
  return days
})

// 随机生成天气图标
function getRandomWeather() {
  const weathers = ['sunny', 'cloudy', 'rainy', null]
  return weathers[Math.floor(Math.random() * weathers.length)]
}

// 随机生成算法标签
function getRandomTags() {
  const allTags = ['DP', '贪心', '回溯', '排序', '二分', '树', '图', '哈希', '双指针', '滑窗']
  const count = Math.floor(Math.random() * 3)
  const tags = []
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allTags.length)
    if (!tags.includes(allTags[randomIndex])) {
      tags.push(allTags[randomIndex])
    }
  }
  
  return tags
}

// 获取标签颜色
function getTagColor(tag) {
  const colorMap = {
    'DP': '#409EFF',
    '贪心': '#67C23A',
    '回溯': '#E6A23C',
    '排序': '#F56C6C',
    '二分': '#909399',
    '树': '#8E44AD',
    '图': '#16A085',
    '哈希': '#2980B9',
    '双指针': '#C0392B',
    '滑窗': '#D35400'
  }
  
  return colorMap[tag] || '#409EFF'
}

// 月份导航
function prevMonth() {
  currentDate.value = currentDate.value.subtract(1, 'month')
}

function nextMonth() {
  currentDate.value = currentDate.value.add(1, 'month')
}

// 今日练习记录
const todayRecords = ref([
  {
    time: '09:00',
    title: '新题 - 二叉树的最大深度',
    detail: '独立完成 / 完成度 3/3'
  },
  {
    time: '14:30',
    title: '复习 - 二叉树遍历',
    detail: '总结要点 2/2 / 代码复现 4/1'
  },
  {
    time: '21:30',
    title: '当日检验',
    detail: '自我测验 - 通过'
  }
])

// 复习周期数据
const reviewCycles = ref([
  {
    name: '二叉树遍历',
    current: 3,
    total: 5,
    status: '已复习 3/5'
  },
  {
    name: '动态规划基础',
    current: 1,
    total: 7,
    status: '进行中 2/5'
  }
])

// 新建计划对话框
const newPlanDialogVisible = ref(false)
const newPlanForm = ref({
  name: '',
  startDate: '',
  endDate: '',
  type: 'template',
  dailyCount: 5
})

function showNewPlanDialog() {
  newPlanDialogVisible.value = true
}

// 创建新计划
function createNewPlan() {
  // 这里添加创建计划的逻辑
  console.log('创建新计划:', newPlanForm.value)
  
  // 如果是模板计划，显示计划表
  if (newPlanForm.value.type === 'template') {
    showPlanTable.value = true
  }
  
  // 模拟API调用
  setTimeout(() => {
    newPlanDialogVisible.value = false
    // 重置表单
    newPlanForm.value = {
      name: '',
      startDate: '',
      endDate: '',
      type: 'template',
      dailyCount: 5
    }
  }, 1000)
}

// 速记功能
const noteDialogVisible = ref(false)
const noteContent = ref('')

function showNoteDialog() {
  noteDialogVisible.value = true
}

function saveNote() {
  // 这里添加保存笔记的逻辑
  console.log('保存笔记:', noteContent.value)
  // 模拟API调用
  setTimeout(() => {
    noteDialogVisible.value = false
    // 重置内容
    noteContent.value = ''
  }, 1000)
}

// 初始化雷达图
onMounted(() => {
  initRadarChart()
})

function initRadarChart() {
  const chartDom = document.getElementById('radar-chart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  const option = {
    radar: {
      indicator: [
        { name: '数组', max: 100 },
        { name: '链表', max: 100 },
        { name: '树', max: 100 },
        { name: '图', max: 100 },
        { name: '动态规划', max: 100 },
        { name: '贪心', max: 100 }
      ]
    },
    series: [{
      type: 'radar',
      data: [{
        value: [85, 65, 90, 50, 75, 80],
        name: '掌握度',
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.6)'
        },
        lineStyle: {
          color: '#409EFF'
        },
        itemStyle: {
          color: '#409EFF'
        }
      }]
    }]
  }
  
  myChart.setOption(option)
}
</script>

<style scoped>
.plan-container {
  --primary-color: #409EFF;
  --danger-color: #F56C6C;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-lighter: #EBEEF5;
  
  display: flex;
  height: calc(100vh - 60px);
  padding: 20px;
  gap: 20px;
}

.plan-table-section {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 20px;
}

.plan-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.plan-table-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

/* 日历部分样式 */
.calendar-section {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.calendar-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-title {
  display: flex;
  align-items: center;
}

.calendar-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  margin-right: 16px;
}

.calendar-nav {
  display: flex;
  gap: 8px;
}

.calendar-actions {
  display: flex;
  gap: 12px;
}

.calendar-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f5f7fa;
  border-bottom: 1px solid var(--border-lighter);
}

.weekday {
  padding: 12px 0;
  text-align: center;
  font-weight: 500;
  color: var(--text-regular);
  font-size: 14px;
}

.calendar-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  overflow: auto;
}

.calendar-day {
  border-right: 1px solid var(--border-lighter);
  border-bottom: 1px solid var(--border-lighter);
  padding: 8px;
  display: flex;
  flex-direction: column;
  min-height: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.calendar-day:hover {
  background-color: #f5f7fa;
}

.calendar-day.selected {
  background-color: rgba(64, 158, 255, 0.1);
  box-shadow: inset 0 0 0 2px var(--primary-color);
}

.calendar-day.current-month {
  background-color: #fff;
}

.calendar-day:not(.current-month) {
  background-color: #f9f9f9;
  color: var(--text-secondary);
}

.calendar-day.today {
  background-color: rgba(64, 158, 255, 0.05);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.day-number {
  font-weight: 500;
  font-size: 16px;
}

.calendar-day.today .day-number {
  background-color: var(--primary-color);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-icon {
  width: 20px;
  height: 20px;
  background-size: contain;
  background-repeat: no-repeat;
}

.weather-icon.sunny {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23F39C12"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>');
}

.weather-icon.cloudy {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233498DB"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>');
}

.weather-icon.rainy {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233498DB"><path d="M16 13v8M8 13v8M12 15v8M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>');
}

.day-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.completed-badge {
  background-color: var(--primary-color);
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  align-self: flex-start;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.algorithm-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
  white-space: nowrap;
}

.day-footer {
  margin-top: auto;
}

.study-progress {
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
}

.error-warning {
  color: var(--danger-color);
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

/* 工具面板样式 */
.tools-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.card h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 雷达图样式 */
.radar-chart {
  height: 200px;
}

/* 今日记录样式 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-lighter);
}

.record-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.record-time {
  font-weight: 500;
  color: var(--text-regular);
  min-width: 50px;
}

.record-content {
  flex: 1;
}

.record-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.record-detail {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 复习周期样式 */
.cycle-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cycle-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cycle-info {
  display: flex;
  justify-content: space-between;
}

.cycle-name {
  font-weight: 500;
}

.cycle-progress {
  font-size: 12px;
  color: var(--text-secondary);
}

.progress {
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.cycle-status {
  font-size: 12px;
  color: var(--text-regular);
}

/* 日期详情对话框样式 */
.day-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.day-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.summary-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.error-text {
  color: var(--danger-color);
}

.day-tags {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-tags h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.day-tag {
  margin-right: 0;
}

.day-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-actions h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 12px;
}
</style>