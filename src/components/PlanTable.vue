<template>
  <div class="plan-table-container">
    <h3 class="plan-table-title">艾宾浩斯记忆曲线学习计划表</h3>
    <div class="plan-description">
      <p>核心思想：<strong>"宁一题十遍，不十题一遍"</strong></p>
    </div>
    
    <el-table :data="planData" border style="width: 100%" :header-cell-style="headerStyle">
      <el-table-column prop="date" label="日期" width="100" fixed></el-table-column>
      <el-table-column label="第一次入库" width="180">
        <template #default="scope">
          <div v-for="(problem, index) in scope.row.firstRound" :key="index" class="problem-item">
            <el-tag :type="getTagType(problem.reviewCycle)" size="small" effect="plain" class="review-tag">
              {{ getReviewCycleName(problem.reviewCycle) }}
            </el-tag>
            {{ problem.title }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="复习内容（按时间顺序）" width="350">
        <template #default="scope">
          <div v-for="(problem, index) in scope.row.secondRound" :key="index" class="problem-item">
            <el-tag :type="getTagType(problem.reviewCycle)" size="small" effect="plain" class="review-tag">
              {{ getReviewCycleName(problem.reviewCycle) }}
            </el-tag>
            {{ problem.title }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="第一轮回顾" width="180">
        <template #default="scope">
          <div v-for="(problem, index) in scope.row.firstRound.filter(p => p.reviewCycle === 4)" :key="index" class="problem-item">
            <el-tag :type="getTagType(problem.reviewCycle)" size="small" effect="plain" class="review-tag">
              {{ getReviewCycleName(problem.reviewCycle) }}
            </el-tag>
            {{ problem.title }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="时间段" width="120">
        <template #default="scope">
          <div v-if="scope.row.timeSlot" class="time-slot">
            {{ scope.row.timeSlot }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="第二轮回顾" width="180">
        <template #default="scope">
          <div v-for="(problem, index) in scope.row.secondRound.filter(p => p.reviewCycle === 5)" :key="index" class="problem-item">
            <el-tag :type="getTagType(problem.reviewCycle)" size="small" effect="plain" class="review-tag">
              {{ getReviewCycleName(problem.reviewCycle) }}
            </el-tag>
            {{ problem.title }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="时间段" width="120">
        <template #default="scope">
          <div v-if="scope.row.timeSlot2" class="time-slot">
            {{ scope.row.timeSlot2 }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="第三轮回顾" width="180">
        <template #default="scope">
          <div v-for="(problem, index) in scope.row.thirdRound.filter(p => p.reviewCycle >= 6)" :key="index" class="problem-item">
            <el-tag :type="getTagType(problem.reviewCycle)" size="small" effect="plain" class="review-tag">
              {{ getReviewCycleName(problem.reviewCycle) }}
            </el-tag>
            {{ problem.title }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="预计用时" width="100">
        <template #default="scope">
          <div class="estimated-time">
            {{ calculateEstimatedTime(scope.row) }}分钟
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="review-cycles-info">
      <h4>复习周期详情</h4>
      <el-table :data="reviewCycles" border style="width: 100%">
        <el-table-column prop="cycle" label="复习遍数" width="100"></el-table-column>
        <el-table-column prop="activityType" label="活动类型" width="150"></el-table-column>
        <el-table-column prop="description" label="详细描述" width="250"></el-table-column>
        <el-table-column label="间隔时间" width="120">
          <template #default="scope">
            <span v-if="scope.row.interval === 0">-</span>
            <span v-else-if="scope.row.interval < 24">{{ scope.row.interval }} 小时后</span>
            <span v-else>{{ Math.floor(scope.row.interval / 24) }} 天后</span>
          </template>
        </el-table-column>
        <el-table-column prop="timeSlot" label="示例时间" width="150"></el-table-column>
        <el-table-column prop="note" label="备注"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { REVIEW_CYCLES, generatePlanTable } from '@/utils/studyPlanGenerator'

// 复习周期信息
const reviewCycles = ref(REVIEW_CYCLES)

// 计划表数据
const planData = ref([])

// 表头样式
const headerStyle = {
  backgroundColor: '#f5f7fa',
  color: '#606266',
  fontWeight: 'bold'
}

// 获取标签类型
function getTagType(cycle) {
  const typeMap = {
    1: 'primary',  // 第一遍
    2: 'success',  // 第二遍
    3: 'warning',  // 第三遍
    4: 'danger',   // 第四遍
    5: 'info',     // 第五遍
    6: '',         // 第六遍
    7: 'primary',  // 第七遍
    8: 'success',  // 第八遍
    9: 'warning',  // 第九遍
    10: 'danger'   // 第十遍
  }
  return typeMap[cycle] || 'primary'
}

// 获取复习周期名称
function getReviewCycleName(cycle) {
  return `第${cycle}遍`
}

// 计算预计用时
function calculateEstimatedTime(dayPlan) {
  // 新题：20分钟，复习题：10分钟
  const newProblemsCount = dayPlan.firstRound.filter(p => p.reviewCycle === 1).length
  const reviewProblemsCount = (
    dayPlan.firstRound.filter(p => p.reviewCycle > 1).length +
    dayPlan.secondRound.length +
    dayPlan.thirdRound.length
  )
  
  return newProblemsCount * 20 + reviewProblemsCount * 10
}

// 初始化计划表
onMounted(() => {
  // 生成从今天开始的计划表
  planData.value = generatePlanTable(new Date())
  
  // 添加时间段信息
  planData.value.forEach(day => {
    // 根据当天的复习内容设置时间段
    if (day.firstRound.some(p => p.reviewCycle === 1)) {
      day.timeSlot = '8:00~9:00'
    }
    
    if (day.secondRound.some(p => p.reviewCycle === 2)) {
      day.timeSlot = '9:30~10:00'
    }
    
    if (day.secondRound.some(p => p.reviewCycle === 5)) {
      day.timeSlot2 = '18:00~19:00'
    }
    
    if (day.thirdRound.some(p => p.reviewCycle >= 6)) {
      day.timeSlot2 = '21:00~23:00'
    }
  })
})
</script>

<style scoped>
.plan-table-container {
  padding: 20px;
}

.plan-table-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #303133;
}

.plan-description {
  margin-bottom: 20px;
  color: #606266;
}

.problem-item {
  margin: 5px 0;
  display: flex;
  align-items: center;
}

.review-tag {
  margin-right: 8px;
  min-width: 45px;
  text-align: center;
}

.time-slot {
  color: #606266;
  font-weight: 500;
}

.estimated-time {
  color: #409EFF;
  font-weight: 500;
}

.review-cycles-info {
  margin-top: 30px;
}
</style>