<template>
  <div class="practice-page-container">
    <el-row :gutter="16" class="main-layout-row">
      <!-- Left Panel: Problem List (Placeholder for now) -->
      <el-col :xs="24" :sm="6" :md="5" :lg="4" class="problem-list-col">
        <el-card class="box-card problem-list-card">
          <template #header>
            <div class="clearfix">
              <span>Daily Tasks</span>
            </div>
          </template>
          <el-menu class="problem-menu" style="max-height: 300px; overflow-y: auto;">
            <el-menu-item 
              v-for="task in dailyTasks" 
              :key="task.id" 
              :index="String(task.question_id)"
              @click="navigateToProblem(task.question_id)"
            >
              <div class="task-item">
                <span class="task-title">{{ task.title }}</span>
                <div class="task-meta">
                  <el-tag :type="difficultyTagType(task.difficulty)" size="small" effect="light">{{ task.difficulty }}</el-tag>
                  <el-tag v-if="task.status === 'done'" type="success" size="small" effect="plain" class="task-status-tag">Done</el-tag>
                  <el-tag v-else-if="task.status === 'todo'" type="info" size="small" effect="plain" class="task-status-tag">Todo</el-tag>
                </div>
              </div>
            </el-menu-item>
          </el-menu>
          <el-empty v-if="dailyTasks.length === 0" description="No tasks for today" :image-size="80"></el-empty>
          <div v-if="dailyTasks.length > 0" style="margin-top: 20px; text-align: center;">
            <el-progress type="circle" :percentage="dailyTaskCompletionPercentage">
              <template #default="{ percentage }">
                <span class="percentage-value">{{ percentage }}%</span>
                <div class="percentage-label">已完成</div>
              </template>
            </el-progress>
            <div style="margin-top: 10px; font-size: 14px; color: #606266;">
              {{ completedTasksCount }} / {{ totalTasksCount }} 个任务
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Middle Panel: Problem Description and Code Editor -->
      <el-col :xs="24" :sm="18" :md="19" :lg="20" class="problem-content-col">
        <el-card class="box-card problem-description-card" v-if="problem">
          <template #header>
            <div class="problem-title-bar">
              <h2 class="problem-title">{{ problem.title }}</h2>
              <el-tag :type="difficultyTagType(problem.difficulty)" size="medium" effect="light">{{ problem.difficulty }}</el-tag>
            </div>
          </template>
          <div v-html="problem.content" class="problem-content-html"></div>
          <div v-if="problem.hints">
            <el-divider content-position="left">Hints</el-divider>
            <div v-html="problem.hints" class="problem-hints-html"></div>
          </div>
          <div v-if="problem.test_cases && problem.test_cases.length > 0">
            <el-divider content-position="left">Examples</el-divider>
            <div v-for="(tc, index) in problem.test_cases" :key="index" class="example-case-item">
              <p><strong>Example {{ index + 1 }}:</strong></p>
              <pre class="example-pre"><strong>Input:</strong> {{ tc.input }}
<strong>Output:</strong> {{ tc.output }}</pre>
            </div>
          </div>
        </el-card>
        <el-skeleton :rows="10" animated v-else />

        <el-card class="box-card code-editor-card" v-loading="submitting" element-loading-text="Submitting...">
          <template #header>
            <div class="editor-controls">
              <el-select v-model="selectedLanguage" placeholder="Language" size="small" @change="onLanguageChange" style="width: 150px;">
                <el-option
                  v-for="lang in availableLanguages"
                  :key="lang.value"
                  :label="lang.label"
                  :value="lang.value">
                </el-option>
              </el-select>
              <el-button-group>
                <el-tooltip content="重置代码" placement="top">
                  <el-button size="default" @click="resetCode" type="primary"><el-icon><Refresh /></el-icon></el-button>
                </el-tooltip>
                <el-tooltip content="加载上次通过的代码" placement="top">
                  <el-button size="default" @click="loadLastAcceptedCode" type="primary"><el-icon><Upload /></el-icon></el-button>
                </el-tooltip>
              </el-button-group>
            </div>
          </template>
          <div class="editor-wrapper">
            <code-mirror
              v-model="code"
              placeholder="Write your code here..."
              :style="{ height: '400px' }"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="cmExtensions"
              @ready="handleCmReady"
            />
          </div>
          <div class="editor-actions">
            <el-button @click="runCode" :loading="runningCode" icon="VideoPlay">Run Code</el-button> 
            <el-button type="primary" @click="handleSubmitCode" :loading="submitting" icon="Upload">Submit</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Submission Result Dialog -->
    <el-dialog
      v-model="submissionResultDialogVisible"
      title="提交结果"
      width="50%"
      :close-on-click-modal="false"
    >
      <div v-if="submissionResult">
        <p><strong>状态:</strong> 
          <el-tag :type="submissionResult.status === 'Accepted' ? 'success' : (submissionResult.status === 'Error' ? 'danger' : 'warning')">
            {{ submissionResult.status }}
          </el-tag>
        </p>
        <p v-if="submissionResult.message"><strong>信息:</strong> {{ submissionResult.message }}</p>
        <p v-if="submissionResult.runtime"><strong>运行时间:</strong> {{ submissionResult.runtime }} ms</p>
        <p v-if="submissionResult.memory"><strong>内存消耗:</strong> {{ submissionResult.memory }} MB</p>
        <div v-if="submissionResult.status !== 'Accepted' && submissionResult.status !== 'Error' && submissionResult.compile_error">
          <p><strong>编译错误:</strong></p>
          <pre>{{ submissionResult.compile_error }}</pre>
        </div>
        <div v-if="submissionResult.status !== 'Accepted' && submissionResult.status !== 'Error' && submissionResult.error_test_case">
          <p><strong>失败的测试用例:</strong></p>
          <pre>{{ submissionResult.error_test_case }}</pre>
        </div>
        <div v-if="submissionResult.status === 'Accepted' && submissionResult.lastAcceptedSubmissionData">
          <el-divider content-position="left">上次正确提交</el-divider>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="提交ID">{{ submissionResult.lastAcceptedSubmissionData.submissionId }}</el-descriptions-item>
            <el-descriptions-item label="语言">{{ submissionResult.lastAcceptedSubmissionData.language }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag type="success">{{ submissionResult.lastAcceptedSubmissionData.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="运行时间">{{ submissionResult.lastAcceptedSubmissionData.runtime }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ submissionResult.lastAcceptedSubmissionData.submitTime }}</el-descriptions-item>
          </el-descriptions>
          <p style="margin-top: 10px;"><strong>代码:</strong></p>
          <div class="editor-wrapper" style="margin-top: 5px;">
            <code-mirror
              :modelValue="submissionResult.lastAcceptedSubmissionData.codeContent"
              :style="{ height: '200px' }"
              :extensions="cmExtensions"
              :disabled="true"
            />
          </div>
        </div>
        <div v-else-if="submissionResult.status === 'Accepted' && submissionResult.lastAcceptedCode && !submissionResult.lastAcceptedSubmissionData">
          <el-divider content-position="left">上次正确提交 (旧版)</el-divider>
          <p><strong>语言:</strong> {{ submissionResult.lastAcceptedLanguage }}</p>
          <p><strong>代码:</strong></p>
          <div class="editor-wrapper" style="margin-top: 10px;">
            <code-mirror
              :modelValue="submissionResult.lastAcceptedCode"
              :style="{ height: '200px' }"
              :extensions="cmExtensions"
              :disabled="true"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="submissionResultDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>


<script setup>
import { ref, onMounted, watch, shallowRef, computed } from 'vue';
import { ElDialog } from 'element-plus'; // Import ElDialog
import CodeMirror from 'vue-codemirror6';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror'; // basicSetup includes line numbers and other essentials
// import { oneDark } from '@codemirror/theme-one-dark'; // Removing dark theme
// For a light theme, we can use the default theme provided by basicSetup or import a specific one.
// If basicSetup's default isn't sufficient, we might need to find another theme like githubLight.
import { useRoute } from 'vue-router';
import { Refresh, Upload } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getProblemDetail, submitCode, getLastAcceptedSubmission, getDailyTasks } from '@/api/practice';
import { updateTaskStatus } from '@/api/plan';

const route = useRoute();
const problem = ref(null);
const code = ref(`def hello_world():\n    print("Hello, world!")\n\nif __name__ == "__main__":\n    hello_world()`);
const selectedLanguage = ref('python'); // Default language
const availableLanguages = ref([
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  // Add more languages as supported by backend and editor
]);
const submitting = ref(false);
const submissionResultDialogVisible = ref(false);
const submissionResult = ref(null);
const cmView = shallowRef();
const handleCmReady = (payload) => {
  cmView.value = payload.view;
};

const cmExtensions = computed(() => {
  const langExtension = selectedLanguage.value === 'python' ? python() : javascript();
  return [
    basicSetup, // Includes line numbers, highlighting, etc.
    langExtension,
    EditorView.lineWrapping, // Enable line wrapping
    // oneDark, // Removed dark theme
    // Add a light theme here if basicSetup's default is not desired
  ];
});
const dailyTasks = ref([]); // Added for daily tasks
const questionId = ref(null);
const runningCode = ref(false); // Added for run code functionality
let originalCode = ''; // To store original code for reset

const completedTasksCount = computed(() => {
  return dailyTasks.value.filter(task => task.status === 'done').length;
});

const totalTasksCount = computed(() => {
  return dailyTasks.value.length;
});

const dailyTaskCompletionPercentage = computed(() => {
  if (totalTasksCount.value === 0) {
    return 0;
  }
  return Math.round((completedTasksCount.value / totalTasksCount.value) * 100);
});

const fetchDailyTasks = async () => {
  try {
    console.log('Fetching daily tasks...'); // Log start
    const res = await getDailyTasks(); 
    console.log('Response from getDailyTasks API:', JSON.stringify(res, null, 2)); // Log the full response with formatting

    // Check if 'res' itself is the array of tasks, or if tasks are in 'res.tasks'
    // This depends on how getDailyTasks() and the interceptor are structured.
    // Let's assume 'res' is an object and 'res.tasks' is the array based on previous context.
    if (res && res.tasks && Array.isArray(res.tasks)) {
      console.log('Tasks array found in res.tasks:', JSON.stringify(res.tasks, null, 2));
      dailyTasks.value = res.tasks;
      console.log('dailyTasks.value updated:', JSON.stringify(dailyTasks.value, null, 2));
      if (dailyTasks.value.length === 0) {
        console.log('Daily tasks array is empty after update.');
        ElMessage.info('No daily tasks found for today.');
      }
    } else if (res && Array.isArray(res)) { // Fallback if res itself is the array of tasks
      console.log('Response from getDailyTasks is directly an array:', JSON.stringify(res, null, 2));
      dailyTasks.value = res;
      console.log('dailyTasks.value updated directly from response array:', JSON.stringify(dailyTasks.value, null, 2));
      if (dailyTasks.value.length === 0) {
        console.log('Daily tasks array is empty after update from direct array.');
        ElMessage.info('No daily tasks found for today.');
      }
    } else {
      dailyTasks.value = [];
      console.warn('Failed to parse tasks. `res.tasks` is not an array or `res` is not an array. Full response:', JSON.stringify(res, null, 2));
      ElMessage.info('No daily tasks found or failed to load.');
    }
    console.log('Final dailyTasks.value after fetchDailyTasks:', JSON.stringify(dailyTasks.value, null, 2));
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    ElMessage.error('Failed to load daily tasks. Check console for details.');
    dailyTasks.value = [];
  }
};

const difficultyTagType = (difficulty) => {
  if (!difficulty) return '';
  const lowerDifficulty = difficulty.toLowerCase();
  if (lowerDifficulty === 'easy') return 'success';
  if (lowerDifficulty === 'medium') return 'warning';
  if (lowerDifficulty === 'hard') return 'danger';
  return '';
};

const fetchProblem = async (id) => {
  if (!id) return;
  try {
    const res = await getProblemDetail(id);
    problem.value = res; 
    // Load initial code for the selected language if available
    if (res.initial_code && res.initial_code[selectedLanguage.value]) {
      code.value = res.initial_code[selectedLanguage.value];
    } else if (selectedLanguage.value === 'python') {
      code.value = `def hello_world():\n    print("Hello, world!")\n\nif __name__ == "__main__":\n    hello_world()`;
    } else {
      code.value = `// Start coding in ${selectedLanguage.value}`;
    }
  } catch (error) {
    console.error('Failed to fetch problem details:', error);
    ElMessage.error('Failed to load problem. Please try again.');
    problem.value = { title: 'Error', content: 'Could not load problem details.' };
  }
  // Store the initial code for reset functionality
  if (problem.value && problem.value.initial_code && problem.value.initial_code[selectedLanguage.value]) {
    originalCode = problem.value.initial_code[selectedLanguage.value];
  } else if (selectedLanguage.value === 'python') {
    originalCode = `def hello_world():\n    print("Hello, world!")\n\nif __name__ == "__main__":\n    hello_world()`;
  } else {
    originalCode = `// Start coding in ${selectedLanguage.value}`;
  }
};

const onLanguageChange = () => {
  if (problem.value && problem.value.initial_code && problem.value.initial_code[selectedLanguage.value]) {
    code.value = problem.value.initial_code[selectedLanguage.value];
  } else {
    code.value = `// Start coding in ${selectedLanguage.value}`;
  }
  // submissionResult.value = null; // Clear previous submission result on language change
  if (problem.value && problem.value.initial_code && problem.value.initial_code[selectedLanguage.value]) {
    originalCode = problem.value.initial_code[selectedLanguage.value];
  } else if (selectedLanguage.value === 'python') {
    originalCode = `def hello_world():\n    print("Hello, world!")\n\nif __name__ == "__main__":\n    hello_world()`;
  } else {
    originalCode = `// Start coding in ${selectedLanguage.value}`;
  }
};

const handleSubmitCode = async () => {
  if (!code.value.trim()) {
    ElMessage.warning('Code cannot be empty.');
    return;
  }
  if (!questionId.value) {
    ElMessage.error('Question ID is missing.');
    return;
  }

  submitting.value = true;
  // submissionResult.value = null; // Clear previous result
  try {
    // Assuming task_id might be needed, if not, backend should handle it or API needs adjustment
    // For now, let's try to get task_id from route query params if plan module passes it, or default to null/undefined
    const taskIdFromRoute = route.query.taskId ? parseInt(route.query.taskId) : undefined;

    const res = await submitCode({
      question_id: questionId.value,
      task_id: taskIdFromRoute, // Pass task_id if available
      code_content: code.value,
      language: selectedLanguage.value
    });
    // submissionResult.value = res; // No longer displaying detailed results here
    // Simulate a random longer loading time before showing results
    const randomSuccessDelay = Math.random() * 1000 + 500; // Delay between 0.5s and 1.5s
    await new Promise(resolve => setTimeout(resolve, randomSuccessDelay));
    submissionResult.value = { ...res }; // Store submission result
    if (res && res.status === 'Accepted') {
      try {
        const lastAcceptedResponse = await getLastAcceptedSubmission({ question_id: questionId.value, limit: 1 });
        // Assuming the API returns an array and we need the first element
        if (lastAcceptedResponse && Array.isArray(lastAcceptedResponse) && lastAcceptedResponse.length > 0) {
          submissionResult.value.lastAcceptedSubmissionData = lastAcceptedResponse[0];
        } else if (lastAcceptedResponse && lastAcceptedResponse.codeContent) { // Fallback for old structure or single object response
           // This is a fallback if the API directly returns the object instead of an array
          submissionResult.value.lastAcceptedSubmissionData = lastAcceptedResponse; 
        }
      } catch (e) {
        console.error('Failed to fetch last accepted submission for dialog:', e);
        // Optionally, inform user that last accepted code couldn't be fetched
      }

      // If submission is accepted and it's a daily task, update its status
      const currentTask = dailyTasks.value.find(task => task.question_id === parseInt(questionId.value));
      console.log('[ handleSubmitCode ] Checking conditions to update task status:');
      console.log('[ handleSubmitCode ] submissionResult.value.status:', submissionResult.value.status);
      console.log('[ handleSubmitCode ] questionId.value (from route):', questionId.value);
      console.log('[ handleSubmitCode ] dailyTasks.value:', JSON.parse(JSON.stringify(dailyTasks.value)));
      console.log('[ handleSubmitCode ] currentTask found:', currentTask ? JSON.parse(JSON.stringify(currentTask)) : 'Not found');
      if (currentTask) {
        console.log('[ handleSubmitCode ] currentTask.id:', currentTask.id);
      }

      if (submissionResult.value.status === 'Accepted' && currentTask && currentTask.id) {
        console.log(`[ handleSubmitCode ] Conditions met. Calling updateTaskStatus for task ID: ${currentTask.id}, status: 'done', duration: ${submissionResult.value.runtime}`);
        await updateTaskStatus(currentTask.id, 'done', submissionResult.value.runtime);
        ElMessage.success('每日任务状态更新成功！');
        fetchDailyTasks(); // Refresh daily tasks
      } else {
        console.log('[ handleSubmitCode ] Conditions NOT met. Skipping task status update.');
      }
    }
    submissionResultDialogVisible.value = true;
  } catch (error) {
    console.error('Failed to submit code:', error);
    // Simulate a random longer loading time even on error
    const randomErrorDelay = Math.random() * 600 + 200; // Delay between 0.2s and 0.8s
    await new Promise(resolve => setTimeout(resolve, randomErrorDelay));
    submissionResult.value = { status: 'Error', message: error.message || 'Submission failed' };
    submissionResultDialogVisible.value = true;
  } finally {
    submitting.value = false;
  }
};

const loadLastAcceptedCode = async () => {
  if (!questionId.value) {
    ElMessage.error('Question ID is missing.');
    return;
  }
  try {
    // Assuming userId is needed and can be retrieved (e.g., from store or auth context)
    // For now, this might fail if userId is not correctly handled/passed.
    // The API doc in practice.js shows `userId` as a param for getLastAcceptedSubmission
    // The API doc in NinePhoenixsAllAPI.md shows `userId` in the query string for this endpoint.
    // Let's assume for now the API gateway or backend infers user_id from the token.
    // If not, this part needs adjustment based on how user_id is managed.
    const res = await getLastAcceptedSubmission({ question_id: questionId.value, limit: 1 }); 
    if (res && res.codeContent) {
      code.value = res.codeContent;
      selectedLanguage.value = res.language || 'javascript'; // Set language from submission
      ElMessage.success('Last accepted code loaded.');
    } else {
      ElMessage.info('No previously accepted submission found for this problem.');
    }
  } catch (error) {
    console.error('Failed to load last accepted code:', error);
    ElMessage.error('Failed to load last accepted code.');
  }
};

const resetCode = () => {
  code.value = originalCode;
  ElMessage.info('Code has been reset to its initial state.');
};

const runCode = async () => {
  // Placeholder for run code logic
  // This would typically involve sending the code and test cases to a backend service
  // that executes the code in a sandboxed environment and returns the output.
  if (!code.value.trim()) {
    ElMessage.warning('Code cannot be empty to run.');
    return;
  }
  runningCode.value = true;
  ElMessage.info('Running code... (Placeholder - No actual execution)');
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  runningCode.value = false;
  // Display mock results or integrate with actual run API
  // For now, we can just show a message or log the mock output
  console.log(`Mock output for code:\n${code.value.substring(0,100)}...`);
  ElMessage.info('Code run (mock) completed. Check console for mock output.');
  // submissionResult.value = {
//   status: 'Ran (Mock)',
//   runtime: 'N/A',
//   memory: 'N/A',
//   output: `Mock output for code:\n${code.value.substring(0,100)}...` 
// };
};



onMounted(() => {
  const idFromRoute = route.params.questionId;
  if (idFromRoute) {
    questionId.value = parseInt(idFromRoute);
    fetchProblem(questionId.value);
  } else {
    ElMessage.error('No question ID provided in the route.');
    // Optionally, redirect or show an error message component
    problem.value = { title: 'Error', content: 'No question ID specified.' };
  }
  fetchDailyTasks(); // Fetch daily tasks when component mounts
});

// Watch for route changes if the component is reused for different problems
watch(() => route.params.questionId, (newId) => {
  if (newId && parseInt(newId) !== questionId.value) {
    questionId.value = parseInt(newId);
    problem.value = null; // Reset problem state
    // submissionResult.value = null; // Reset submission result
    fetchProblem(questionId.value);
  }
});

const navigateToProblem = (qId) => {
  if (qId) {
    // Assuming your route for practice problems is like '/practice/:questionId'
    // You might need to adjust this based on your actual router configuration
    // For example, if using named routes: router.push({ name: 'PracticeProblem', params: { questionId: qId } });
    // Or if your path structure is different.
    // For now, let's assume a simple path change which will trigger the watcher.
    if (route.params.questionId !== String(qId)) {
         window.location.href = `/layout/practice/${qId}`; // Full page reload to ensure watcher triggers if component isn't destroyed/recreated
    } else {
        // If already on the same problem page, maybe just ensure it's loaded or give feedback
        ElMessage.info('You are already viewing this problem.');
    }
  }
};

</script>

<style scoped>
.editor-wrapper ::v-deep(.cm-editor) {
  height: 400px; /* Or your desired height */
  font-size: 14px; /* Ensure a readable font size */
}

/* Remove custom gutter styles if oneDark theme is used, as it provides its own styling */
/* If specific overrides are still needed, they can be added here, but start minimal */

.editor-wrapper ::v-deep(.cm-lineNumbers .cm-gutterElement) {
  padding: 0 3px 0 5px; /* Basic padding for line numbers */
  min-width: 20px; /* Ensure enough space for line numbers */
  text-align: right;
  white-space: nowrap;
}
.practice-container {
  padding: 20px;
  background-color: #f4f7f9;
  min-height: calc(100vh - 60px); /* Adjust based on your layout's header/navbar height */
}

.problem-card, .editor-card, .output-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.problem-content {
  line-height: 1.8;
  font-size: 15px;
}

.problem-content ::v-deep(pre) {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
}

.problem-content ::v-deep(code) {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95em;
}

.example-case pre {
  background-color: #f8f9fa;
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  white-space: pre-wrap; /* Allow wrapping for long example lines */
  word-break: break-all;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-editor-textarea {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.code-editor-textarea ::v-deep(textarea) {
  resize: vertical; /* Allow vertical resize, disable horizontal */
}

.action-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.output-card p {
  margin-bottom: 8px;
}

.output-card .el-tag {
  margin-left: 5px;
}

/* Add specific styles for problem content elements if needed */
.problem-content ::v-deep(h1), .problem-content ::v-deep(h2), .problem-content ::v-deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.problem-content ::v-deep(ul), .problem-content ::v-deep(ol) {
  padding-left: 20px;
}

.problem-content ::v-deep(p) {
  margin-bottom: 1em;
}

.problem-menu {
  border-right: none; /* Remove default border from el-menu */
}

.problem-menu .el-menu-item {
  height: auto; /* Adjust height to fit content */
  line-height: normal;
  padding: 10px 15px !important; /* Override default padding */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 1px solid #f0f0f0; /* Separator for items */
}

.problem-menu .el-menu-item:last-child {
  border-bottom: none;
}

.problem-menu .el-menu-item.is-active {
  background-color: #ecf5ff !important; /* Highlight active item */
  color: #409EFF !important;
}

.task-item {
  width: 100%;
}

.task-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 12px;
}

.task-status-tag {
  margin-left: 8px;
}

.problem-list-item-placeholder {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.problem-list-item-placeholder:last-child {
  border-bottom: none;
}

.el-empty {
  padding: 20px 0;
}

</style>
<style scoped>
.editor-wrapper ::v-deep(.cm-editor) {
  height: 400px; /* Or your desired height */
  font-size: 14px; /* Ensure a readable font size */
}

/* Remove custom gutter styles if oneDark theme is used, as it provides its own styling */
/* If specific overrides are still needed, they can be added here, but start minimal */

.editor-wrapper ::v-deep(.cm-lineNumbers .cm-gutterElement) {
  padding: 0 3px 0 5px; /* Basic padding for line numbers */
  min-width: 20px; /* Ensure enough space for line numbers */
  text-align: right;
  white-space: nowrap;
}
.editor-wrapper.with-line-numbers {
  position: relative;
  display: flex;
}

.line-numbers-gutter {
  padding: 11px 10px 11px 0; /* Match el-input's textarea padding */
  background-color: #f5f7fa;
  color: #909399;
  text-align: right;
  font-size: 14px; /* Match textarea font-size */
  line-height: 1.5; /* Match textarea line-height */
  border-right: 1px solid #dcdfe6;
  user-select: none;
  overflow-y: hidden; /* Hide its own scrollbar, sync with textarea */
  font-family: 'Courier New', Courier, monospace;
  white-space: pre;
  box-sizing: border-box;
}

.line-numbers-gutter span {
  display: block;
}

.code-input-textarea {
  flex-grow: 1;
  /* Ensure textarea padding doesn't create misalignment */
}

.code-input-textarea ::v-deep(textarea) {
  padding-left: 10px !important; /* Adjust if gutter padding changes */
}

.practice-page-container {
  padding: 20px;
  background-color: #f4f7f9;
  min-height: calc(100vh - 70px); /* Adjust based on your header height */
}

.main-layout-row {
  height: 100%;
}

.box-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  height: 100%; /* Make cards in a row take full height of their container */
  display: flex;
  flex-direction: column;
}

.problem-list-col,
.problem-content-col {
  display: flex;
  flex-direction: column;
}



.problem-list-card,
.problem-description-card,
.code-editor-card {
    flex-grow: 1; /* Allow cards to grow and fill available space */
}



.problem-description-card .el-card__body,
.code-editor-card .el-card__body {
  flex-grow: 1;
  overflow-y: auto; /* Add scroll for content overflow */
}



.problem-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.problem-title {
  margin: 0;
  font-size: 1.6em;
  color: #303133;
}

.problem-content-html :deep(p),
.problem-content-html :deep(ul),
.problem-content-html :deep(pre) {
  font-size: 14px;
  line-height: 1.6;
  color: #454545;
}

.problem-content-html :deep(code) {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}

.problem-content-html :deep(pre) {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  border: 1px solid #e0e0e0;
}

.example-case-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fdfdfd;
  border: 1px solid #eee;
  border-radius: 4px;
}

.example-pre {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  white-space: pre-wrap; 
  word-break: break-all;
}

.editor-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px; /* Add some space below controls */
}

.editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden; /* Ensures the textarea fits within the border */
}

.code-input-textarea :deep(textarea) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  background-color: #ffffff; /* White background */
  color: #003366; /* Dark blue text color */
  border: 1px solid #dcdfe6; /* Light gray border, consistent with El-Input */
  border-radius: 4px; /* Consistent with El-Input */
  resize: none; /* Disable manual resize */
  padding: 10px 15px; /* Adjusted padding */
  caret-color: #003366; /* Dark blue cursor color */
}

.code-input-textarea :deep(textarea::placeholder) {
  color: #a8abb2; /* Element Plus placeholder color */
}

.code-input-textarea :deep(textarea:focus) {
  outline: none; /* Remove focus outline */
  border-color: #409eff; /* Element Plus focus border color */
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2); /* Element Plus focus shadow */
}

/* Optional: Style for selected text, if desired */
.code-input-textarea :deep(textarea::selection) {
  background-color: #cfe9ff; /* Light blue selection background */
  color: #003366; /* Ensure text color contrasts with selection */
}

.editor-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.editor-actions .el-button {
  margin-left: 10px;
}

/* Styles for removed right panel elements */
/*
.submission-result-card .result-details p {
  margin: 8px 0;
  font-size: 14px;
}

.submission-result-card .error-message {
  color: #f56c6c;
  white-space: pre-wrap; 
}

.timer-placeholder,
.stats-placeholder,
.history-placeholder {
  padding: 10px;
  color: #909399;
  text-align: center;
}
*/

.problem-list-item-placeholder {
    margin-bottom: 10px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .problem-list-col {
    display: none; /* Hide side panels on smaller screens for now */
  }
  /* .submission-stats-col {
    display: none; 
  } */
  .problem-content-col {
    flex-basis: 100%;
    max-width: 100%;
  }
  .problem-title {
    font-size: 1.3em;
  }
  .code-input-textarea :deep(textarea) {
    font-size: 13px;
  }
}

.clearfix::before,
.clearfix::after {
  display: table;
  content: "";
}
.clearfix::after {
  clear: both
}

</style>