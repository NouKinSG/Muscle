<template>
  <div class="plan-container">
    <div class="header-actions">
      <h1>{{ currentYear }}年{{ currentMonth + 1 }}月</h1>
      <div class="month-navigation">
        <el-button-group>
          <el-button @click="prevMonth">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <el-button @click="nextMonth">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </el-button-group>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="showCreatePlanDialog = true">
          <el-icon><Plus /></el-icon>新建计划
        </el-button>
        <el-button @click="showPracticeDialog = true">
          <el-icon><Edit /></el-icon>速记
        </el-button>
      </div>
    </div>

    <div class="calendar-container">
      <div class="weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="calendar-day"
          :class="{
            'current-month': day.currentMonth,
            'today': isToday(day.date),
            'has-tasks': day.tasks && day.tasks.length > 0
          }"
          @click="openDayDetail(day)"
        >
          <div class="day-header">
            <span class="day-number">{{ new Date(day.date).getDate() }}</span>
            <el-icon v-if="day.weather === 'sunny'">
              <Sunny />
            </el-icon>
            <el-icon v-else-if="day.weather === 'cloudy'">
              <Cloudy />
            </el-icon>
          </div>
          <div class="day-content">
            <!-- Visual indicator for tasks -->
            <div v-if="day.tasks && day.tasks.length > 0" class="task-indicator-container">
              <span class="task-indicator"></span>
              <span v-if="day.tasks.length > 1" class="task-count">+{{ day.tasks.length -1 }}</span>
            </div>
            <div v-if="day.tasks && day.tasks.length > 0" class="task-list-summary">
              <div v-for="task in day.tasks.slice(0, 2)" :key="task.task_id" class="task-summary-item">
                {{ task.title.length > 5 ? task.title.substring(0, 5) + '...' : task.title }}
              </div>
            </div>
            <div v-else class="no-tasks-placeholder"></div> <!-- Placeholder for alignment -->
          </div>
        </div>
      </div>
    </div>

    <!-- 知识学习度雷达图 -->
    <div class="knowledge-radar">
      <h3>知识掌握度</h3>
      <div class="radar-chart" ref="radarChart"></div>
    </div>

    <!-- 今日练习记录 -->
    <div class="today-practice">
      <h3>今日练习记录</h3>
      <div class="practice-list">
        <div class="practice-time">09:00</div>
        <div class="practice-item">
          <div class="practice-title">新题 - 二叉树的最大深度</div>
          <div class="practice-status">提交成功 / 测试用例 x/5</div>
        </div>
      </div>
    </div>

    <!-- 复习周期 -->
    <div class="review-cycle">
      <h3>复习周期</h3>
      <div class="cycle-item">
        <span>二叉树遍历</span>
        <el-progress :percentage="60" :format="format" />
        <span class="progress-text">已复习 3/5</span>
        <el-button type="success" size="small" plain>继续</el-button>
      </div>
    </div>

    <!-- 当天任务详情弹窗 -->
    <el-dialog
      v-model="showDayDetailDialog"
      :title="`${selectedDate} 的任务详情`"
      width="500px"
    >
      <div v-if="selectedDateTasks.length > 0">
        <el-timeline>
          <el-timeline-item
            v-for="task in selectedDateTasks"
            :key="task.task_id"
            :timestamp="task.title"
            placement="top"
          >
            <el-card>
              <h4>{{ task.title }}</h4>
              <p>状态: {{ task.status === 'todo' ? '待完成' : '已完成' }}</p>
              <p>重复次数: {{ task.repeat_index }}</p>
              <el-button type="primary" size="small" @click="goToPractice(task)">去练习</el-button>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div v-else>
        <el-empty description="当天没有任务安排"></el-empty>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDayDetailDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新建计划对话框 -->
    <el-dialog
      v-model="showCreatePlanDialog"
      title="新建计划"
      width="600px"
      @open="handleCreatePlanDialogOpen"
    >
      <el-form :model="createPlanForm" label-width="100px">
        <el-form-item label="计划名称" required>
          <el-input v-model="createPlanForm.plan_name" placeholder="请输入计划名称"></el-input>
        </el-form-item>

        <el-form-item label="开始日期" required>
          <el-date-picker
            v-model="createPlanForm.start_date"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="重复策略" required>
          <el-select v-model="createPlanForm.repeat_strategy_key" placeholder="请选择重复策略">
            <el-option
              v-for="strategy in repeatStrategies"
              :key="strategy.key"
              :label="strategy.name"
              :value="strategy.key"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="题目来源" required>
          <el-radio-group v-model="createPlanForm.source_type">
            <el-radio label="topic_set">题单导入</el-radio>
            <el-radio label="manual">自选题目</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="createPlanForm.source_type === 'topic_set'" label="选择题单">
          <el-select v-model="createPlanForm.source_id" placeholder="请选择题单">
            <el-option
              v-for="set in questionSets"
              :key="set.id"
              :label="set.name"
              :value="set.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="createPlanForm.source_type === 'manual'" label="选择题目">
          <el-select
            v-model="createPlanForm.question_ids"
            multiple
            placeholder="请选择题目"
          >
            <el-option
              v-for="question in libraryQuestions"
              :key="question.id"
              :label="question.title"
              :value="question.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreatePlanDialog = false">取消</el-button>
          <el-button type="primary" :loading="createPlanLoading" @click="handleCreatePlan">创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ArrowLeft, ArrowRight, Plus, Edit, Sunny, Cloudy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCalendarTasks, getDayPlan, getRepeatStrategies, getQuestionSetList, getQuestionSetDetail, getLibraryQuestions, importPlan } from '@/api/plan'

const router = useRouter()
const radarChart = ref(null)
const showCreatePlanDialog = ref(false)
const showPracticeDialog = ref(false)
const showDayDetailDialog = ref(false)
const selectedDateTasks = ref([])
const selectedDate = ref('')

// 新建计划相关数据
const createPlanForm = ref({
  plan_name: '',
  source_type: 'manual', // manual 或 topic_set
  start_date: '',
  repeat_strategy_key: '',
  source_id: '',
  question_ids: []
})
const repeatStrategies = ref([])
const questionSets = ref([])
const libraryQuestions = ref([])
const createPlanLoading = ref(false)

// 获取重复策略列表
const fetchRepeatStrategies = async () => {
  try {
    const res = await getRepeatStrategies()
    repeatStrategies.value = res || []
  } catch (error) {
    console.error('获取重复策略失败:', error)
    ElMessage.error('获取重复策略失败')
  }
}

// 获取题单列表
const fetchQuestionSets = async () => {
  try {
    const res = await getQuestionSetList({
       page: 1,
       page_size: 20
     })
     questionSets.value = res.sets || []
  } catch (error) {
    console.error('获取题单列表失败:', error)
    ElMessage.error('获取题单列表失败')
  }
}

// 获取题库题目列表
const fetchLibraryQuestions = async () => {
  try {
    const res = await getLibraryQuestions({})
    libraryQuestions.value = res || []
  } catch (error) {
    console.error('获取题库列表失败:', error)
    ElMessage.error('获取题库列表失败')
  }
}

// 创建计划
const handleCreatePlan = async () => {
  if (!createPlanForm.value.plan_name) {
    ElMessage.warning('请输入计划名称')
    return
  }
  if (!createPlanForm.value.start_date) {
    ElMessage.warning('请选择开始日期')
    return
  }
  if (!createPlanForm.value.repeat_strategy_key) {
    ElMessage.warning('请选择重复策略')
    return
  }

  createPlanLoading.value = true
  try {
    await importPlan({
      plan_name: createPlanForm.value.plan_name,
      source_type: createPlanForm.value.source_type,
      start_date: createPlanForm.value.start_date,
      repeat_strategy_key: createPlanForm.value.repeat_strategy_key,
      source_id: createPlanForm.value.source_type === 'topic_set' ? createPlanForm.value.source_id : undefined,
      question_ids: createPlanForm.value.source_type === 'manual' ? createPlanForm.value.question_ids : undefined
    })
    ElMessage.success('计划创建成功')
    showCreatePlanDialog.value = false
    fetchCalendarTasks() // 刷新日历数据
  } catch (error) {
    console.error('创建计划失败:', error)
    ElMessage.error('创建计划失败')
  } finally {
    createPlanLoading.value = false
  }
}

// 监听对话框打开
const handleCreatePlanDialogOpen = () => {
  createPlanForm.value = {
    plan_name: '',
    source_type: 'manual',
    start_date: '',
    repeat_strategy_key: '',
    source_id: '',
    question_ids: []
  }
  fetchRepeatStrategies()
  fetchQuestionSets()
  fetchLibraryQuestions()
}

// 日历相关数据
const currentDate = ref(new Date())
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const calendarDays = ref([])
const tasksMap = ref({})

// 计算属性
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

// 方法
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
  generateCalendar()
  fetchCalendarTasks()
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
  generateCalendar()
  fetchCalendarTasks()
}

const isToday = (date) => {
  const today = new Date()
  return date === today.toISOString().split('T')[0]
}

const generateCalendar = () => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  
  // 填充上个月的日期
  const prevMonthDays = firstDay.getDay()
  const prevMonth = new Date(year, month - 1, 0)
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i)
    days.push({
      date: date.toISOString().split('T')[0],
      currentMonth: false,
      tasks: tasksMap.value[date.toISOString().split('T')[0]] || []
    })
  }
  
  // 填充当前月的日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      date: date.toISOString().split('T')[0],
      currentMonth: true,
      tasks: tasksMap.value[date.toISOString().split('T')[0]] || []
    })
  }
  
  // 填充下个月的日期
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date: date.toISOString().split('T')[0],
      currentMonth: false,
      tasks: tasksMap.value[date.toISOString().split('T')[0]] || []
    })
  }
  
  calendarDays.value = days
}

const fetchCalendarTasks = async () => {
  try {
    const startDate = new Date(currentYear.value, currentMonth.value, 1)
    const endDate = new Date(currentYear.value, currentMonth.value + 1, 0)
    
    const data = await getCalendarTasks({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    })

    // 将任务按日期分组
    const newTasksMap = {}
    if (Array.isArray(data)) {
      data.forEach(group => {
        newTasksMap[group.date] = group.tasks
      })
    }
    tasksMap.value = newTasksMap
    generateCalendar()
  } catch (error) {
    console.error('获取任务失败:', error)
    ElMessage.error('获取任务失败')
  }
}

const goToPractice = (task) => {
  router.push(`/layout/practice/${task.question_id}`)
}

const initRadarChart = () => {
  if (!radarChart.value) return
  
  const chart = echarts.init(radarChart.value)
  const option = {
    radar: {
      indicator: [
        { name: '算法', max: 100 },
        { name: '数据结构', max: 100 },
        { name: '编程能力', max: 100 },
        { name: '解题思路', max: 100 },
        { name: '代码质量', max: 100 },
        { name: '效率优化', max: 100 }
      ]
    },
    series: [{
      type: 'radar',
      data: [{
        value: [80, 70, 85, 75, 90, 65],
        name: '能力评估'
      }]
    }]
  }
  chart.setOption(option)
}

onMounted(() => {
  generateCalendar()
  fetchCalendarTasks()
  initRadarChart()
})

const openDayDetail = async (day) => {
  selectedDate.value = day.date
  try {
    const res = await getDayPlan({ date: day.date })
    selectedDateTasks.value = res.tasks || []
    showDayDetailDialog.value = true
  } catch (error) {
    console.error('获取当天任务详情失败:', error)
    ElMessage.error('获取当天任务详情失败')
    selectedDateTasks.value = [] // 清空以防显示旧数据
  }
}
</script>

<style scoped>
.plan-container {
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-gap: 20px;
}

.header-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.month-navigation {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.calendar-container {
  grid-column: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  /* height: 600px; */ /* Removed fixed height to allow content to define height */
}

.calendar-day {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
  min-height: 80px; /* Adjusted min-height for a more compact look */
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Align date number to top and indicator to bottom */
  position: relative; /* For positioning task indicators */
}

.calendar-day:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.day-number {
  font-weight: bold;
}

.day-content {
  /* height: calc(100% - 30px); */ /* Adjusted to allow flex to manage height */
  /* overflow-y: auto; */ /* Not needed if content is summarized */
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Align summary to bottom, above indicator */
  flex-grow: 1; /* Allow content to take available space */
}

.task-indicator-container {
  position: absolute;
  bottom: 5px;
  right: 5px;
  display: flex;
  align-items: center;
}

.task-indicator {
  width: 8px;
  height: 8px;
  background-color: #409eff;
  border-radius: 50%;
  margin-right: 4px;
}

.task-count {
  font-size: 0.75em; /* Slightly increased font size for task count */
  color: #409eff;
}

.task-list-summary {
  font-size: 1em; /* Increased font size */
  line-height: 1.3; /* Adjusted line height */
  text-align: left;
  overflow: hidden;
  max-height: 2.6em; /* Adjusted max height for new font size */
  margin-bottom: 2px; /* Space between summary and indicator if both present */
}

.task-summary-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-tasks-placeholder {
  min-height: 1.2em; /* Placeholder to maintain alignment with task summary */
}

/* Removed .task-list, .task-item, .task-info, .task-title, .no-tasks as they are replaced */

.current-month {
  background: #fff;
}

.today {
  background: #ecf5ff;
  border-color: #409eff;
}

/* .has-tasks removed, using indicator now */

/* 右侧面板样式 */
.knowledge-radar,
.today-practice,
.review-cycle {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.radar-chart {
  height: 300px;
}

.practice-list {
  margin-top: 10px;
}

.practice-item {
  padding: 10px;
  border-radius: 4px;
  background: #f5f7fa;
  margin-bottom: 10px;
}

.practice-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.practice-status {
  font-size: 12px;
  color: #909399;
}

.cycle-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
}
</style>
