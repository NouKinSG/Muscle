<template>
  <div class="daily-recommendation-container">
    <h1 class="page-title">每日一题推荐</h1>
    
    <div class="cards-container">
      <!-- 今日推荐题目 -->
      <div class="card-section">
        <h2 class="section-title">今日推荐</h2>
        <DailyQuestionCard 
          :question="todayQuestion" 
          :motivational-quote="todayQuote"
        />
      </div>
      
      <!-- 历史推荐题目 -->
      <div class="card-section">
        <h2 class="section-title">历史推荐</h2>
        <el-carousel 
          :interval="4000" 
          type="card" 
          height="300px" 
          indicator-position="outside"
          class="history-carousel"
        >
          <el-carousel-item v-for="(item, index) in historyQuestions" :key="index">
            <DailyQuestionCard 
              :question="item.question" 
              :motivational-quote="item.quote"
            />
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
    
    <!-- 学习进度统计 -->
    <div class="stats-container">
      <h2 class="section-title">今日学习进度</h2>
      <el-row :gutter="24">
        <el-col :span="24">
          <el-card class="stat-card">
            <template #header>
              <div class="stat-header">
                <el-icon class="stat-icon"><Calendar /></el-icon>
                <span>刷题进度</span>
              </div>
            </template>
            <div class="stat-value">{{ stats.completedTasks }}/{{ stats.totalTasks }} 题</div>
            <el-progress :percentage="stats.streakPercentage" :format="format" />
          </el-card>
        </el-col>
        <!-- <el-col :span="8">
          <el-card class="stat-card">
            <template #header>
              <div class="stat-header">
                <el-icon class="stat-icon"><Check /></el-icon>
                <span>本周完成</span>
              </div>
            </template>
            <div class="stat-value">{{ stats.weeklyCompleted }}/7 题</div>
            <el-progress :percentage="stats.weeklyPercentage" :format="format" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <template #header>
              <div class="stat-header">
                <el-icon class="stat-icon"><Trophy /></el-icon>
                <span>总计完成</span>
              </div>
            </template>
            <div class="stat-value">{{ stats.totalCompleted }} 题</div>
            <el-progress :percentage="100" status="success" :format="format" />
          </el-card>
        </el-col> -->
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DailyQuestionCard from '@/components/DailyQuestionCard.vue';
import { Calendar, Check, Trophy } from '@element-plus/icons-vue';
import { getDailyTasks } from '@/api/practice';



// 今日推荐题目
const todayQuestion = ref({
  id: 1036,
  title: '腐烂的橘子',
  difficulty: 'Medium',
});

const todayQuote = ref('坚持每日刷题，算法能力稳步提升');

// 历史推荐题目
const historyQuestions = ref([
  {
    question: {
      id: 51,
      title: 'N 皇后',
      difficulty: 'Hard',
      time:'6',
    },
    quote: '解决问题的能力来自于不断的练习'
  },
  {
    question: {
      id: 84,
      title: '柱状图中最大的矩形',
      difficulty: 'Hard',
      time:'5',
    },
    quote: '编程能力是日积月累的结果'
  },
  {
    question: {
      id: 21,
      title: '合并两个有序链表',
      difficulty: 'Easy',
      time:'4',
    },
    quote: '简单的题目也能有深刻的思考'
  },
]);

// 学习统计数据
const stats = ref({
  streak: 5,
  streakPercentage: 0,
  weeklyCompleted: 0,
  weeklyPercentage: 0,
  totalCompleted: 0,
  completedTasks: 0,
  totalTasks: 0
});

// 获取每日任务数据并计算完成比例
const fetchDailyTasks = async () => {
  try {
    const response = await getDailyTasks();
    if (response) {
      const tasks = response.tasks;
      const totalTasks = tasks.length;
      // 明确筛选status为'done'的任务
      const completedTasks = tasks.filter(task => task.status && task.status.toLowerCase() === 'done').length;
      
      stats.value.totalTasks = totalTasks;
      stats.value.completedTasks = completedTasks;
      // 确保百分比计算正确，并限制在0-100范围内
      const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      stats.value.streakPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
      
      console.log('任务数据:', {
        总任务数: totalTasks,
        已完成任务数: completedTasks,
        完成百分比: stats.value.streakPercentage
      });
    }
  } catch (error) {
    console.error('获取每日任务失败:', error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchDailyTasks();
});

// 进度条格式化函数
const format = (percentage) => {
  return percentage === 100 ? '满' : `${percentage}%`;
};
</script>

<style scoped>
.daily-recommendation-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.cards-container {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .cards-container {
    flex-direction: column;
  }
}

.card-section {
  flex: 1;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #606266;
}

.history-carousel {
  margin-top: 20px;
}

.stats-container {
  margin-top: 30px;
}

.stat-card {
  height: 100%;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  font-size: 18px;
  color: #409EFF;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
  text-align: center;
}

/* 自定义 Element Plus 轮播图样式 */
:deep(.el-carousel__item) {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-carousel__item--card) {
  border-radius: 12px;
  overflow: hidden;
}
</style>