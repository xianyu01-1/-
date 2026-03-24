<template>
  <div class="content">
      <div class="content-header">
        <h1 class="content-title">校园公告</h1>
        <button class="primary-button" @click="showAddForm = true" v-if="userInfo && userInfo.role === 'admin'">发布公告</button>
      </div>
      
      <!-- 公告列表 -->
      <div class="notice-list">
        <div class="notice-card card" v-for="notice in notices" :key="notice.id">
          <div class="notice-header">
            <h3 class="notice-title">{{ notice.title }}</h3>
            <div class="notice-meta">
              <span class="notice-author">{{ notice.publish_dept || notice.author }}</span>
              <span class="notice-time">{{ formatDate(notice.publish_time || notice.createTime) }}</span>
              <span class="notice-views">浏览量: {{ notice.view_count || 0 }}</span>
            </div>
          </div>
          <div class="notice-content">
            {{ notice.content }}
          </div>
          <div class="notice-actions" v-if="userInfo && userInfo.role === 'admin'">
            <button class="edit-button" @click="editNotice(notice)">编辑</button>
            <button class="delete-button" @click="deleteNotice(notice.id)">删除</button>
          </div>
        </div>
      </div>
      
      <!-- 无公告提示 -->
      <div class="empty-state" v-if="notices.length === 0">
        <p>暂无公告</p>
      </div>
      
      <!-- 添加/编辑公告表单 -->
      <div class="modal-overlay" v-if="showAddForm || showEditForm" @click="closeForm"></div>
      <div class="modal-form card" v-if="showAddForm || showEditForm">
        <div class="modal-header">
          <h2>{{ showEditForm ? '编辑公告' : '发布公告' }}</h2>
          <button class="close-button" @click="closeForm">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">公告标题</label>
            <input type="text" class="form-input" v-model="formData.title" required />
          </div>
          <div class="form-group">
            <label class="form-label">公告内容</label>
            <textarea class="form-input" v-model="formData.content" rows="5" required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">发布人</label>
            <input type="text" class="form-input" v-model="formData.author" required />
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="closeForm">取消</button>
            <button type="submit" class="primary-button">保存</button>
          </div>
        </form>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const userInfo = ref(null);
const notices = ref([]);
const showAddForm = ref(false);
const showEditForm = ref(false);
const formData = ref({
  id: '',
  title: '',
  content: '',
  author: ''
});

// 本地模拟数据
const mockNotices = [
  {
    id: 1,
    title: '关于新学期开学的通知',
    content: '亲爱的同学们，新学期即将开始，请注意以下事项：1. 开学时间为9月1日；2. 请提前准备好相关证件；3. 注意校园安全。',
    author: '学校办公室',
    createTime: new Date().toISOString()
  },
  {
    id: 2,
    title: '校园活动预告',
    content: '本周六将举办校园文化节，欢迎广大师生参加。活动包括文艺表演、社团展示、美食节等。',
    author: '学生会',
    createTime: new Date().toISOString()
  },
  {
    id: 3,
    title: '图书馆开放时间调整',
    content: '从下周一开始，图书馆开放时间调整为8:00-22:00，周末正常开放。',
    author: '图书馆',
    createTime: new Date().toISOString()
  }
];

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取所有公告
const fetchAllNotices = () => {
  axios.get('/api/notices/all')
    .then(response => {
      notices.value = response.data;
    })
    .catch(error => {
      console.error('从后端获取数据失败:', error);
      // 使用模拟数据
      notices.value = [...mockNotices];
    });
};

// 编辑公告
const editNotice = (notice) => {
  formData.value = { ...notice };
  showEditForm.value = true;
  showAddForm.value = false;
};

// 删除公告
const deleteNotice = (id) => {
  if (confirm('确定要删除这个公告吗？')) {
    // 这里可以添加删除公告的API调用
    notices.value = notices.value.filter(item => item.id !== id);
  }
};

// 关闭表单
const closeForm = () => {
  showAddForm.value = false;
  showEditForm.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  formData.value = {
    id: '',
    title: '',
    content: '',
    author: ''
  };
};

// 处理表单提交
const handleSubmit = () => {
  if (showEditForm.value) {
    // 编辑公告
    notices.value = notices.value.map(item => 
      item.id === formData.value.id ? formData.value : item
    );
  } else {
    // 添加公告
    const newNotice = {
      ...formData.value,
      id: Date.now(),
      createTime: new Date().toISOString()
    };
    notices.value.unshift(newNotice);
  }
  closeForm();
};



onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
  // 获取公告数据
  fetchAllNotices();
});
</script>

<style scoped>
.notice-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.notice-card {
  padding: var(--spacing-xl);
}

.notice-header {
  margin-bottom: var(--spacing-md);
}

.notice-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.notice-meta {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.notice-views {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notice-views::before {
  content: '👁️';
  font-size: 12px;
}

.notice-content {
  font-size: var(--font-size-md);
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.notice-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

.edit-button {
  background-color: #67c23a;
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-button:hover {
  background-color: #85ce61;
}

.delete-button {
  background-color: #f56c6c;
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-button:hover {
  background-color: #f78989;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-form {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  z-index: 1001;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-form form {
  padding: var(--spacing-lg);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
}

.cancel-button {
  background-color: var(--white);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-button:hover {
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

@media (max-width: 768px) {
  .notice-card {
    padding: var(--spacing-lg);
  }
  
  .modal-form {
    width: 95%;
    margin: var(--spacing-md);
  }
}
</style>
