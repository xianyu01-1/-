<template>
  <div class="app-container">
    <!-- 统一导航栏 -->
    <nav class="navbar">
      <div class="navbar-container">
        <router-link to="/home" class="navbar-brand">校园生活服务平台</router-link>
        
        <ul class="navbar-menu">
          <li class="navbar-item">
            <router-link to="/home" class="navbar-link" active-class="active">首页</router-link>
          </li>
          <li class="navbar-item">
            <router-link to="/secondhand-market" class="navbar-link" active-class="active">二手市场</router-link>
          </li>
          <li class="navbar-item">
            <router-link to="/notice" class="navbar-link" active-class="active">公告</router-link>
          </li>
          <li class="navbar-item">
            <router-link to="/food" class="navbar-link" active-class="active">校园美食</router-link>
          </li>
          <li class="navbar-item">
            <router-link to="/lost-and-found" class="navbar-link" active-class="active">失物招领</router-link>
          </li>
          <li class="navbar-item" v-if="userInfo">
            <router-link to="/orders" class="navbar-link" active-class="active">我的订单</router-link>
          </li>
          <li class="navbar-item" v-if="userInfo && userInfo.role === 'admin'">
            <router-link to="/admin" class="navbar-link" active-class="active">管理员页面</router-link>
          </li>
        </ul>
        
        <div class="navbar-right">
          <div class="user-info" v-if="userInfo">
            <span>{{ userInfo.username }}</span>
            <span v-if="userInfo.role === 'admin'" class="admin-badge">管理员</span>
            <button class="logout-button" @click="handleLogout">退出登录</button>
          </div>
          <router-link to="/login" class="navbar-link" v-else>登录</router-link>
        </div>
      </div>
    </nav>
    
    <!-- 页面内容 -->
    <div class="content-wrapper">
      <router-view @login-success="handleLoginSuccess" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const userInfo = ref(null);

// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('token');
  userInfo.value = null;
  router.push('/login');
};

// 处理登录成功
const handleLoginSuccess = (userData) => {
  userInfo.value = userData;
};

// 路由切换时重置模态框状态
watch(() => route.path, () => {
  // 强制刷新页面，确保所有模态框状态重置
  window.scrollTo(0, 0);
});

onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
});
</script>

<style>
:root {
  --background-color: #f5f7fa;
  --white: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --primary-color: #409EFF;
  --primary-hover: #66B1FF;
  --border-color: #e4e7ed;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --border-radius: 4px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: var(--font-size-md);
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--background-color);
}

.app-container {
  min-height: 100vh;
}

.card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-md);
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.primary-button {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.primary-button:hover {
  background-color: var(--primary-hover);
}

.primary-button:disabled {
  background-color: #c6e2ff;
  cursor: not-allowed;
}

.app-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

/* 导航栏样式 */
.navbar {
  background-color: var(--white);
  box-shadow: var(--shadow-sm);
  padding: 0 var(--spacing-xl);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.navbar-brand {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--primary-color);
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: var(--spacing-lg);
  list-style: none;
}

.navbar-item {
  position: relative;
}

.navbar-link {
  display: block;
  padding: var(--spacing-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.3s;
}

.navbar-link:hover {
  color: var(--primary-color);
}

.navbar-link.active {
  color: var(--primary-color);
  font-weight: 500;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logout-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  font-size: var(--font-size-md);
  transition: color 0.3s;
}

.logout-button:hover {
  color: var(--text-primary);
}

/* 内容区域样式 */
.content {
  padding: var(--spacing-2xl);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
}

.content-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

/* 卡片网格样式 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

/* 内容包装器样式 */
.content-wrapper {
  min-height: calc(100vh - 60px);
  background-color: var(--background-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    padding: 0 var(--spacing-lg);
  }
  
  .navbar-menu {
    gap: var(--spacing-md);
  }
  
  .content {
    padding: var(--spacing-lg);
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
