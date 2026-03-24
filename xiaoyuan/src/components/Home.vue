<template>
  <div class="content">
    <div class="content-header">
      <h1 class="content-title">欢迎使用校园生活服务平台</h1>
    </div>
    
    <div class="welcome-section">
      <div class="welcome-card card">
        <h2>平台功能</h2>
        <ul>
          <li><router-link to="/secondhand-market">二手市场 - 买卖闲置物品</router-link></li>
          <li><router-link to="/notice">公告 - 查看校园通知</router-link></li>
          <li><router-link to="/food">校园美食 - 探索校园美食</router-link></li>
          <li><router-link to="/lost-and-found">失物招领 - 寻找丢失物品</router-link></li>
          <li v-if="userInfo && userInfo.role === 'admin'">
            <router-link to="/admin">管理员页面 - 管理平台内容</router-link>
          </li>
        </ul>
      </div>
      
      <div class="welcome-card card">
        <h2>使用须知</h2>
        <p>1. 请遵守平台规则，文明交流</p>
        <p>2. 二手市场交易请选择安全地点</p>
        <p>3. 失物招领信息请确保真实有效</p>
        <p>4. 如有问题请联系管理员</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const userInfo = ref(null);

onMounted(() => {
  // 从本地存储获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
});
</script>

<style scoped>
.welcome-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.welcome-card {
  padding: var(--spacing-xl);
}

.welcome-card h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.welcome-card ul {
  list-style: none;
}

.welcome-card li {
  margin-bottom: var(--spacing-md);
}

.welcome-card a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s;
}

.welcome-card a:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.welcome-card p {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .welcome-section {
    grid-template-columns: 1fr;
  }
  
  .welcome-card {
    padding: var(--spacing-lg);
  }
}
</style>
