# Muscle - 算法刷题助手

<div align="center">
  <h3>让算法学习更高效，让面试准备更轻松</h3>
</div>

## 📖 项目介绍

Muscle 是一个专注于算法刷题的 Web 应用，旨在帮助用户系统性地学习和复习算法题目。通过科学的复习计划和直观的进度管理，帮助用户提高刷题效率，为技术面试做好充分准备。

## ✨ 核心功能

- **📅 计划模块**
  - 日历视图管理学习计划
  - 可视化展示刷题进度
  - 灵活的复习时间安排
  - 任务完成度追踪

- **📝 练题模块**
  - 清晰的题目展示界面
  - 支持多种编程语言的代码编辑环境
  - 实时代码高亮
  - 智能代码补全

- **🔄 复习系统**
  - 基于艾宾浩斯记忆曲线的复习机制
  - 智能复习提醒
  - 题目难度动态调整
  - 复习效果追踪

- **👤 个人中心**
  - 个人题解库管理
  - 学习数据统计分析
  - 进度追踪与可视化
  - 个性化学习报告

## 🛠️ 技术栈

- **核心框架**
  - Vue 3 - 渐进式 JavaScript 框架
  - Vite - 下一代前端构建工具

- **状态管理**
  - Pinia - 直观的 Vue.js 状态管理库

- **路由管理**
  - Vue Router - Vue.js 官方路由管理器

- **UI 组件**
  - Element Plus - 基于 Vue 3 的组件库
  - ECharts - 功能丰富的图表库

- **开发工具**
  - CodeMirror - 功能强大的代码编辑器
  - Sass - CSS 预处理器
  - Day.js - 轻量级日期处理库

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- npm >= 7

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
muscle/
├── src/                    # 源代码目录
│   ├── api/               # API 接口定义
│   ├── assets/           # 静态资源
│   ├── components/       # 通用组件
│   ├── layout/          # 布局组件
│   ├── router/          # 路由配置
│   ├── utils/           # 工具函数
│   ├── views/           # 页面视图
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── public/               # 公共资源目录
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
└── package.json         # 项目配置和依赖
```

## 🤝 贡献指南

欢迎提交问题和改进建议！在提交 PR 之前，请确保：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 开源协议

本项目基于 MIT 协议开源 - 查看 [LICENSE](LICENSE) 了解更多细节
