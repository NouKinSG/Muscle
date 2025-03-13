<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <div class="logo">
          <img src="@/assets/images/logo.png" alt="Logo" class="logo-img" />
          <h1 class="logo-title">Muscle</h1>
        </div>
        <p class="subtitle">算法刷题助手</p>
      </div>
      
      <div class="register-form">
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="0">
          <el-form-item prop="username">
            <el-input 
              v-model="registerForm.username" 
              placeholder="用户名" 
              prefix-icon="el-icon-user"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input 
              v-model="registerForm.email" 
              placeholder="邮箱" 
              prefix-icon="el-icon-message"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="密码" 
              prefix-icon="el-icon-lock"
              show-password
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword" 
              type="password" 
              placeholder="确认密码" 
              prefix-icon="el-icon-lock"
              show-password
            ></el-input>
          </el-form-item>
          
          <div class="agreement">
            <el-checkbox v-model="agreement">我已阅读并同意</el-checkbox>
            <a href="javascript:;" class="agreement-link">《用户协议》</a>
            <a href="javascript:;" class="agreement-link">《隐私政策》</a>
          </div>
          
          <el-button type="primary" class="register-button" @click="handleRegister" :disabled="!agreement">注册</el-button>
          
          <div class="login-link">
            已有账号? <router-link to="/login">立即登录</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const registerFormRef = ref(null)

// 注册表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 用户协议同意选项
const agreement = ref(false)

// 注册处理
const handleRegister = () => {
  registerFormRef.value.validate(valid => {
    if (valid) {
      // 模拟注册请求
      setTimeout(() => {
        // 注册成功后跳转到登录页
        router.push('/login')
      }, 1000)
    }
  })
}
</script>

<style lang="scss" scoped>
.register-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.register-box {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-header {
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

.register-form {
  .agreement {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    font-size: 14px;
    color: var(--text-regular);
    
    .agreement-link {
      color: var(--primary-color);
      text-decoration: none;
      margin-left: 5px;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .register-button {
    width: 100%;
    padding: 12px 0;
    font-size: 16px;
    margin-bottom: 20px;
  }
  
  .login-link {
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