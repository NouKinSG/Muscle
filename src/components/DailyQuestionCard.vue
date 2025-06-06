<template>
  <div class="daily-question-card">
    <!-- 装饰性圆形元素 -->
    <div class="block-one ellipse">
      <div class="inner-ellipse"></div>
    </div>
    <div class="block-two ellipse">
      <div class="inner-ellipse"></div>
    </div>
    
    <!-- 顶部日期区域 -->
    <div class="part-top">
      <span class="current-day">{{ question?.time || currentDay }}</span>
      <span class="date">{{ currentMonth }} {{ currentYear }}</span>
    </div>
    
    <!-- 中间内容区域 -->
    <div class="part-mid">
      <div class="question-info">
        <div class="title">每日一题推荐</div>
        <div class="question-title">{{ question.title }}</div>
        <div class="question-difficulty" :class="difficultyClass">
          {{ question.difficulty }}
        </div>
        <div class="chicken-soup">
          {{ motivationalQuote }}
        </div>
      </div>
    </div>
    
    <!-- 底部操作区域 -->
    <div class="part-down">
      <el-button type="primary" @click="goToPractice" class="practice-btn">
        开始练习
      </el-button>
      <div class="tags-container">
        <el-tag v-for="tag in question.tags" :key="tag" size="small" effect="plain" class="question-tag">
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  question: {
    type: Object,
    default: () => ({
      id: 1,
      title: '两数之和',
      difficulty: 'Easy',
      tags: ['数组', '哈希表']
    })
  },
  motivationalQuote: {
    type: String,
    default: '坚持每日刷题，算法能力稳步提升'
  }
});

const router = useRouter();

// 获取当前日期
const now = new Date();
const currentDay = ref(now.getDate());
const currentMonth = ref(new Intl.DateTimeFormat('zh-CN', { month: 'short' }).format(now));
const currentYear = ref(now.getFullYear());

// 根据难度设置不同的样式类
const difficultyClass = computed(() => {
  const difficulty = props.question.difficulty.toLowerCase();
  if (difficulty === 'easy') return 'difficulty-easy';
  if (difficulty === 'medium') return 'difficulty-medium';
  if (difficulty === 'hard') return 'difficulty-hard';
  return '';
});

// 跳转到练习页面
const goToPractice = () => {
  router.push(`/layout/practice/${props.question.id}`);
};
</script>

<style scoped>
.daily-question-card {
  position: relative;
  width: 100%;
  max-width: 360px;
  height: 280px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 装饰性圆形元素 */
.ellipse {
  position: absolute;
  border-radius: 50%;
  z-index: 0;
}

.block-one {
  width: 120px;
  height: 120px;
  background: rgba(64, 158, 255, 0.1);
  top: -30px;
  right: -30px;
}

.block-two {
  width: 80px;
  height: 80px;
  background: rgba(103, 194, 58, 0.1);
  bottom: -20px;
  left: -20px;
}

.inner-ellipse {
  position: absolute;
  width: 70%;
  height: 70%;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  top: 15%;
  left: 15%;
}

/* 顶部日期区域 */
.part-top {
  display: flex;
  align-items: baseline;
  z-index: 1;
}

.current-day {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  margin-right: 8px;
}

.date {
  font-size: 16px;
  color: #606266;
}

/* 中间内容区域 */
.part-mid {
  z-index: 1;
  margin: 15px 0;
}

.question-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.question-title {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin-top: 5px;
}

.question-difficulty {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  width: fit-content;
}

.difficulty-easy {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.difficulty-medium {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.difficulty-hard {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.chicken-soup {
  font-size: 14px;
  color: #909399;
  font-style: italic;
  margin-top: 10px;
  line-height: 1.4;
}

/* 底部操作区域 */
.part-down {
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1;
}

.practice-btn {
  width: 100%;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.question-tag {
  margin-right: 5px;
}
</style>