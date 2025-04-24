<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <img src="@/assets/images/logo.png" alt="Logo" class="logo-img" />
          <h1 class="logo-title">Muscle</h1>
        </div>
        <p class="subtitle">算法刷题助手</p>
      </div>
      
      <div class="login-form">
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
          <el-form-item prop="email">
            <el-input 
              v-model="loginForm.email" 
              placeholder="邮箱" 
              prefix-icon="el-icon-message"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="密码" 
              prefix-icon="el-icon-lock"
              show-password
            ></el-input>
          </el-form-item>
          
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <a href="javascript:;" class="forget-password">忘记密码?</a>
          </div>
          
          <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading">登录</el-button>
          
          <div class="register-link">
            还没有账号? <router-link to="/register">立即注册</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'

const router = useRouter()
const loginFormRef = ref(null)

// 登录表单数据
const loginForm = reactive({
  email: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 记住我选项
const rememberMe = ref(localStorage.getItem('rememberMe') === 'true')

// 加载状态
const loading = ref(false)

// 初始化函数
const initForm = () => {
  // 如果之前勾选了记住我，则自动填充邮箱
  if (rememberMe.value) {
    loginForm.email = localStorage.getItem('email') || ''
  }
}

// 页面加载时初始化表单
initForm()

// 登录处理
const handleLogin = () => {
  loginFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      login(loginForm)
        .then(res => {
          // ✅ res 是后端返回的 data：包含 user 和 token
          ElMessage.success('登录成功')

          // 存储 token
          localStorage.setItem('token', res.token)

          // 存储邮箱（可选）
          if (rememberMe.value) {
            localStorage.setItem('email', res.user.email)
          }

          // 跳转页面
          router.push('/layout/plan')
        })
        .catch(error => {
          ElMessage.error(error.message || '登录失败，请检查邮箱和密码')
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    
    .logo-img {
      width: 40px;
      height: 40px;
      margin-right: 10px;
    }
    
    .logo-title {
      font-size: 28px;
      font-weight: bold;
      color: var(--primary-color);
      margin: 0;
    }
  }
  
  .subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;
  }
}

.login-form {
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .forget-password {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 14px;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .login-button {
    width: 100%;
    padding: 12px 0;
    font-size: 16px;
    margin-bottom: 20px;
  }
  
  .register-link {
    text-align: center;
    font-size: 14px;
    color: var(--text-regular);
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>

<!-- 

-->