<template>
  <div class="content">
    <div class="content-header">
      <h1 class="content-title">管理员页面</h1>
    </div>
    
    <div class="admin-dashboard">
      <div class="admin-card card">
        <h2>用户管理</h2>
        <p>管理平台用户账号</p>
        <button class="primary-button" @click="handleShowUserList">查看用户列表</button>
      </div>
      
      <div class="admin-card card">
        <h2>内容审核</h2>
        <p>审核用户发布的内容</p>
        <button class="primary-button" @click="handleShowAuditList">查看待审核内容</button>
      </div>
      
      <div class="admin-card card">
        <h2>内容管理</h2>
        <p>管理平台所有内容</p>
        <div class="admin-links">
          <router-link to="/secondhand-market" class="admin-link">二手市场</router-link>
          <router-link to="/notice" class="admin-link">公告管理</router-link>
          <router-link to="/food" class="admin-link">校园美食</router-link>
          <router-link to="/lost-and-found" class="admin-link">失物招领</router-link>
        </div>
      </div>
      
      <div class="admin-card card">
        <h2>系统设置</h2>
        <p>平台系统配置</p>
        <button class="primary-button">系统配置</button>
      </div>
      
      <div class="admin-card card">
        <h2>数据统计</h2>
        <p>平台使用数据</p>
        <button class="primary-button">查看统计</button>
      </div>
    </div>
    
    <!-- 用户列表模态框 -->
    <div class="modal-overlay" v-if="showUserListModal" @click="showUserListModal = false"></div>
    <div class="modal-form card" v-if="showUserListModal">
      <div class="modal-header">
        <h2>用户列表</h2>
        <button class="close-button" @click="showUserListModal = false">×</button>
      </div>
      <div class="user-list">
        <table class="user-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>权限等级</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.userId">
              <td>{{ user.username }}</td>
              <td>
                <span :class="['role-badge', user.role]">
                  {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                </span>
              </td>
              <td>
                <select 
                  class="role-select" 
                  :value="user.role" 
                  @change="handleRoleChange(user.userId, $event.target.value)"
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" v-if="users.length === 0">
          <p>暂无用户数据</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="cancel-button" @click="showUserListModal = false">关闭</button>
      </div>
    </div>
    
    <!-- 内容审核模态框 -->
    <div class="modal-overlay" v-if="showAuditModal" @click="showAuditModal = false"></div>
    <div class="modal-form card" v-if="showAuditModal">
      <div class="modal-header">
        <h2>内容审核</h2>
        <button class="close-button" @click="showAuditModal = false">×</button>
      </div>
      <div class="audit-list">
        <div class="audit-tabs">
          <button 
            class="audit-tab" 
            :class="{ active: activeAuditTab === 'secondhand' }"
            @click="activeAuditTab = 'secondhand'; fetchAuditItems('secondhand')"
          >
            二手物品
          </button>
          <button 
            class="audit-tab" 
            :class="{ active: activeAuditTab === 'lost-found' }"
            @click="activeAuditTab = 'lost-found'; fetchAuditItems('lost-found')"
          >
            失物招领
          </button>
        </div>
        <div class="audit-items">
          <div class="audit-item card" v-for="item in auditItems" :key="item.id">
            <div class="audit-item-header">
              <h3>{{ item.title || item.goods_name }}</h3>
              <span class="item-type">{{ item.type === 'lost' ? '失物' : item.type === 'found' ? '招领' : '二手物品' }}</span>
            </div>
            <div class="audit-item-content">
              <p class="item-description">{{ item.description }}</p>
              <div class="item-meta">
                <span class="item-publisher">发布者：{{ item.publisher || item.seller }}</span>
                <span class="item-time">{{ formatDate(item.createTime || item.publish_time) }}</span>
              </div>
            </div>
            <div class="audit-item-actions">
              <button class="approve-button" @click="approveItem(item)">通过</button>
              <button class="reject-button" @click="rejectItem(item)">拒绝</button>
            </div>
          </div>
          <div class="empty-state" v-if="auditItems.length === 0">
            <p>暂无待审核内容</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="cancel-button" @click="showAuditModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const showUserListModal = ref(false);
const users = ref([]);

// 审核相关状态
const showAuditModal = ref(false);
const activeAuditTab = ref('secondhand');
const auditItems = ref([]);

// 获取用户列表
const fetchUsers = () => {
  axios.get('/api/users/all')
    .then(response => {
      const result = response.data;
      if (result.success && result.data) {
        users.value = result.data.map(user => ({
          userId: user.user_id,
          username: user.username,
          role: user.user_role === 1 ? 'admin' : 'user'
        }));
      } else {
        users.value = [];
      }
    })
    .catch(error => {
      console.error('获取用户列表失败:', error);
      users.value = [];
    });
};

// 点击查看用户列表时获取数据
const handleShowUserList = () => {
  fetchUsers();
  showUserListModal.value = true;
};

// 处理用户权限修改
const handleRoleChange = (userId, newRole) => {
  // 调用后端API更新用户权限
  axios.put(`/api/users/update-role/${userId}`, {
    role: newRole === 'admin' ? 1 : 0
  })
  .then(response => {
    if (response.data > 0) {
      // 更新成功，更新本地数据
      const user = users.value.find(u => u.userId === userId);
      if (user) {
        user.role = newRole;
      }
      alert('权限修改成功');
    } else {
      alert('权限修改失败');
    }
  })
  .catch(error => {
    console.error('修改用户权限失败:', error);
    alert('权限修改失败');
  });
};

// 点击查看审核列表
const handleShowAuditList = () => {
  activeAuditTab.value = 'secondhand';
  fetchAuditItems('secondhand');
  showAuditModal.value = true;
};

// 获取待审核内容
const fetchAuditItems = (type) => {
  if (type === 'secondhand') {
    // 获取待审核的二手物品
    axios.get('/api/goods/all')
      .then(response => {
        auditItems.value = response.data.filter(item => item.status === 0);
      })
      .catch(error => {
        console.error('获取待审核二手物品失败:', error);
        auditItems.value = [];
      });
  } else if (type === 'lost-found') {
    // 获取待审核的失物招领
    axios.get('/api/lost-items/all')
      .then(response => {
        auditItems.value = response.data.filter(item => item.status === 0).map(item => ({
          id: item.lost_item_id,
          title: item.item_name,
          description: item.description,
          publisher: item.publisher,
          createTime: item.publish_time,
          type: item.item_type === 1 ? 'lost' : 'found',
          status: item.status
        }));
      })
      .catch(error => {
        console.error('获取待审核失物招领失败:', error);
        auditItems.value = [];
      });
  }
};

// 审核通过
const approveItem = (item) => {
  if (activeAuditTab.value === 'secondhand') {
    // 审核通过二手物品
    axios.put(`/api/goods/update-status/${item.id}`, { status: 1 })
      .then(response => {
        if (response.data > 0) {
          // 移除已审核的物品
          auditItems.value = auditItems.value.filter(i => i.id !== item.id);
          alert('审核通过成功');
        } else {
          alert('审核通过失败');
        }
      })
      .catch(error => {
        console.error('审核通过失败:', error);
        alert('审核通过失败');
      });
  } else if (activeAuditTab.value === 'lost-found') {
    // 审核通过失物招领
    axios.put(`/api/lost-items/update-status/${item.id}`, { status: 1 })
      .then(response => {
        if (response.data > 0) {
          // 移除已审核的物品
          auditItems.value = auditItems.value.filter(i => i.id !== item.id);
          alert('审核通过成功');
        } else {
          alert('审核通过失败');
        }
      })
      .catch(error => {
        console.error('审核通过失败:', error);
        alert('审核通过失败');
      });
  }
};

// 审核拒绝
const rejectItem = (item) => {
  if (activeAuditTab.value === 'secondhand') {
    // 审核拒绝二手物品
    axios.put(`/api/goods/update-status/${item.id}`, { status: 2 })
      .then(response => {
        if (response.data > 0) {
          // 移除已审核的物品
          auditItems.value = auditItems.value.filter(i => i.id !== item.id);
          alert('审核拒绝成功');
        } else {
          alert('审核拒绝失败');
        }
      })
      .catch(error => {
        console.error('审核拒绝失败:', error);
        alert('审核拒绝失败');
      });
  } else if (activeAuditTab.value === 'lost-found') {
    // 审核拒绝失物招领
    axios.put(`/api/lost-items/update-status/${item.id}`, { status: 2 })
      .then(response => {
        if (response.data > 0) {
          // 移除已审核的物品
          auditItems.value = auditItems.value.filter(i => i.id !== item.id);
          alert('审核拒绝成功');
        } else {
          alert('审核拒绝失败');
        }
      })
      .catch(error => {
        console.error('审核拒绝失败:', error);
        alert('审核拒绝失败');
      });
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 监听按钮点击
const originalClickHandler = () => {
  handleShowUserList();
};

onMounted(() => {
  // 初始化时可以预加载用户数据
  // fetchUsers();
});
</script>

<style scoped>
.admin-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.admin-card {
  padding: var(--spacing-xl);
}

.admin-card h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.admin-card p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.admin-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.admin-link {
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--white);
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.3s;
}

.admin-link:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.admin-badge {
  background-color: var(--primary-color);
  color: var(--white);
  font-size: var(--font-size-sm);
  padding: 2px 8px;
  border-radius: 10px;
}

/* 用户列表模态框样式 */
.modal-form {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--white);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-button:hover {
  background-color: var(--background-color);
  color: var(--text-primary);
}

.user-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 var(--spacing-lg);
}

/* 滚动条样式 */
.user-list::-webkit-scrollbar {
  width: 6px;
}

.user-list::-webkit-scrollbar-track {
  background: var(--background-color);
  border-radius: 3px;
}

.user-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.user-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-md) 0;
}

.user-table th,
.user-table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s;
}

.user-table th {
  background-color: var(--background-color);
  font-weight: 600;
  color: var(--text-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.user-table tr {
  transition: all 0.3s;
}

.user-table tr:hover {
  background-color: rgba(64, 158, 255, 0.05);
  transform: translateY(-1px);
}

/* 权限等级样式 */
.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  text-align: center;
}

.role-badge.admin {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.role-badge.user {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

/* 权限选择下拉框样式 */
.role-select {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  background-color: var(--white);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
}

.role-select:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.role-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background-color: var(--white);
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-md);
}

/* 审核模态框样式 */
.audit-list {
  max-height: 500px;
  overflow-y: auto;
}

.audit-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-lg);
}

.audit-tab {
  flex: 1;
  padding: var(--spacing-md);
  background-color: var(--white);
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  font-size: var(--font-size-md);
}

.audit-tab:hover {
  color: var(--primary-color);
}

.audit-tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 500;
}

.audit-items {
  padding: 0 var(--spacing-lg);
}

.audit-item {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--white);
}

.audit-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.audit-item-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  margin-right: var(--spacing-md);
}

.item-type {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  background-color: var(--primary-color);
  color: var(--white);
}

.audit-item-content {
  margin-bottom: var(--spacing-lg);
}

.item-description {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--spacing-md);
}

.item-meta {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.audit-item-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

.approve-button {
  background-color: #67c23a;
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: var(--font-size-md);
}

.approve-button:hover {
  background-color: #85ce61;
}

.reject-button {
  background-color: #f56c6c;
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: var(--font-size-md);
}

.reject-button:hover {
  background-color: #f78989;
}

@media (max-width: 768px) {
  .admin-dashboard {
    grid-template-columns: 1fr;
  }
  
  .admin-card {
    padding: var(--spacing-lg);
  }
  
  .modal-form {
    width: 90%;
    max-width: 400px;
  }
  
  .audit-item-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-type {
    margin-top: var(--spacing-sm);
  }
  
  .audit-item-actions {
    flex-direction: column;
  }
  
  .approve-button,
  .reject-button {
    width: 100%;
  }
}

</style>
