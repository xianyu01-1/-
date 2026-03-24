<template>
  <div class="content">
      <div class="content-header">
        <h1 class="content-title">失物招领</h1>
        <button class="primary-button" @click="showAddForm = true" v-if="userInfo">发布信息</button>
      </div>
      
      <!-- 失物招领分类 -->
      <div class="category-section">
        <button class="category-button" 
                :class="{ active: activeType === 'all' }" 
                @click="activeType = 'all'; filterItems">
          全部
        </button>
        <button class="category-button" 
                :class="{ active: activeType === 'lost' }" 
                @click="activeType = 'lost'; filterItems">
          失物
        </button>
        <button class="category-button" 
                :class="{ active: activeType === 'found' }" 
                @click="activeType = 'found'; filterItems">
          招领
        </button>
      </div>
      
      <!-- 失物招领列表 -->
      <div class="card-grid" v-if="filteredItems.length > 0">
        <div class="item-card card" v-for="item in filteredItems" :key="item.id" @click="viewItemDetail(item.id)">
          <div class="item-image">
            <img :src="item.imageUrl || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=lost%20and%20found%20placeholder&image_size=square'" alt="物品图片" />
          </div>
          <div class="item-info">
            <div class="item-type-tag" :class="item.type">
              {{ item.type === 'lost' ? '失物' : '招领' }}
            </div>
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-description">{{ item.description }}</p>
            <div class="item-location">{{ item.location }}</div>
            <div class="item-meta">
              <span class="item-time">{{ formatDate(item.createTime) }}</span>
            </div>
            <div class="item-status" v-if="item.status !== 1">
              <span :class="['status-badge', getStatusClass(item.status)]">{{ getStatusText(item.status) }}</span>
            </div>
            <div class="item-contact">
              <span class="contact-label">联系人：</span>
              <span class="contact-info">{{ item.contactPerson }}</span>
              <span class="contact-phone">{{ item.contactPhone }}</span>
            </div>
            <div class="item-actions" v-if="userInfo">
              <button class="primary-button" @click.stop="handleContact(item)">联系失主/拾主</button>
              <button class="edit-button" @click.stop="editItem(item)" v-if="canEdit(item)">编辑</button>
              <button class="delete-button" @click.stop="deleteItem(item.id)" v-if="canDelete(item)">删除</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无信息提示 -->
      <div class="empty-state" v-else>
        <p>暂无失物招领信息</p>
      </div>
      
      <!-- 添加/编辑失物招领表单 -->
      <div class="modal-overlay" v-if="showAddForm || showEditForm" @click="closeForm"></div>
      <div class="modal-form card" v-if="showAddForm || showEditForm">
        <div class="modal-header">
          <h2>{{ showEditForm ? '编辑信息' : '发布失物招领' }}</h2>
          <button class="close-button" @click="closeForm">×</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">类型</label>
            <select class="form-input" v-model="formData.type" required>
              <option value="lost">失物</option>
              <option value="found">招领</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">标题</label>
            <input type="text" class="form-input" v-model="formData.title" required />
          </div>
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea class="form-input" v-model="formData.description" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">地点</label>
            <input type="text" class="form-input" v-model="formData.location" required />
          </div>
          <div class="form-group">
            <label class="form-label">联系人</label>
            <input type="text" class="form-input" v-model="formData.contactPerson" required />
          </div>
          <div class="form-group">
            <label class="form-label">联系电话</label>
            <input type="text" class="form-input" v-model="formData.contactPhone" required />
          </div>
          <div class="form-group">
            <label class="form-label">图片链接</label>
            <input type="text" class="form-input" v-model="formData.imageUrl" />
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const userInfo = ref(null);
const items = ref([]);
const activeType = ref('all');
const showAddForm = ref(false);
const showEditForm = ref(false);
const formData = ref({
  id: '',
  type: 'lost',
  title: '',
  description: '',
  location: '',
  contactPerson: '',
  contactPhone: '',
  imageUrl: ''
});



// 计算过滤后的物品列表
const filteredItems = computed(() => {
  let result = [...items.value];
  
  // 按类型过滤
  if (activeType.value !== 'all') {
    result = result.filter(item => item.type === activeType.value);
  }
  
  // 只显示审核通过的物品，或者是用户自己发布的物品
  result = result.filter(item => {
    if (userInfo.value) {
      // 管理员可以看到所有物品
      if (userInfo.value.role === 'admin') return true;
      // 用户可以看到自己的所有物品和审核通过的其他物品
      return item.status === 1 || item.publisher === userInfo.value.username;
    } else {
      // 未登录用户只能看到审核通过的物品
      return item.status === 1;
    }
  });
  
  return result;
});

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

// 过滤物品
const filterItems = () => {
  // 计算属性会自动更新
};

// 获取所有失物招领信息
const fetchAllItems = () => {
  axios.get('/api/lost-items/all')
    .then(response => {
      console.log('失物招领完整响应数据:', response.data);
      // 处理后端数据，转换snake_case为camelCase
      items.value = response.data.map(item => {
        const processedItem = {
          id: item.lost_item_id,
          type: item.item_type === 1 ? 'lost' : 'found',
          title: item.item_name,
          description: item.description,
          location: item.location,
          contactPerson: item.contact_person,
          contactPhone: item.contact_phone,
          createTime: item.publish_time,
          publisher: item.publisher,
          status: item.status || 0,
          // 将后端的item_image字段映射到前端的imageUrl
          imageUrl: item.item_image
        };
        return processedItem;
      });
      // 打印第一个失物招领的完整信息
      if (items.value.length > 0) {
        console.log('第一个失物招领完整信息:', items.value[0]);
        // 特别打印图片路径
        console.log('第一个失物招领图片路径:', items.value[0].imageUrl);
      }
    })
    .catch(error => {
      console.error('从后端获取数据失败:', error);
      items.value = [];
    });
};

// 权限控制函数
const canEdit = (item) => {
  if (!userInfo.value) return false;
  if (userInfo.value.role === 'admin') return true;
  return item.publisher === userInfo.value.username;
};

const canDelete = (item) => {
  return canEdit(item);
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0:
      return '待审核';
    case 1:
      return '审核通过';
    case 2:
      return '审核拒绝';
    default:
      return '未知状态';
  }
};

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 0:
      return 'status-pending';
    case 1:
      return 'status-approved';
    case 2:
      return 'status-rejected';
    default:
      return '';
  }
};

// 查看物品详情
const viewItemDetail = (itemId) => {
  router.push(`/lost-and-found-detail/${itemId}`);
};

// 处理联系
const handleContact = (item) => {
  alert(`联系${item.type === 'lost' ? '失主' : '拾主'} ${item.contactPerson}：${item.contactPhone}`);
};

// 编辑物品
const editItem = (item) => {
  formData.value = { ...item };
  showEditForm.value = true;
  showAddForm.value = false;
};

// 删除物品
const deleteItem = (id) => {
  if (confirm('确定要删除这个信息吗？')) {
    axios.delete(`/api/lost-items/delete/${id}`)
      .then(() => {
        items.value = items.value.filter(item => item.id !== id);
      })
      .catch(error => {
        console.error('删除失败:', error);
        alert('删除失败，请稍后重试');
      });
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
    type: 'lost',
    title: '',
    description: '',
    location: '',
    contactPerson: '',
    contactPhone: '',
    imageUrl: ''
  };
};

// 处理表单提交
const handleSubmit = () => {
  // 转换数据格式，camelCase to snake_case
  const submitData = {
    item_type: formData.value.type,
    item_name: formData.value.title,
    description: formData.value.description,
    location: formData.value.location,
    contact_person: formData.value.contactPerson,
    contact_phone: formData.value.contactPhone,
    publisher: userInfo.value.username
  };

  if (showEditForm.value) {
    // 编辑信息
    const updateData = {
      ...submitData,
      lost_item_id: formData.value.id
    };
    
    axios.put('/api/lost-items/update', updateData)
      .then(() => {
        // 更新本地数据
        items.value = items.value.map(item => 
          item.id === formData.value.id ? formData.value : item
        );
        closeForm();
      })
      .catch(error => {
        console.error('更新失败:', error);
        alert('更新失败，请稍后重试');
      });
  } else {
    // 添加信息
    const newItem = {
      ...submitData,
      status: 0 // 设置为待审核状态
    };
    
    axios.post('/api/lost-items/add', newItem)
      .then(response => {
        // 添加成功后刷新列表
        fetchAllItems();
        alert('信息发布成功，等待审核');
        closeForm();
      })
      .catch(error => {
        console.error('添加失败:', error);
        alert('添加失败，请稍后重试');
      });
  }
};



onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
  // 获取失物招领数据
  fetchAllItems();
});
</script>

<style scoped>
.category-section {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.category-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--white);
  cursor: pointer;
  transition: all 0.3s;
}

.category-button.active {
  background-color: var(--primary-color);
  color: var(--white);
  border-color: var(--primary-color);
}

.item-card {
  overflow: hidden;
  position: relative;
}

.item-image {
  height: 200px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  padding: var(--spacing-lg);
}

.item-type-tag {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--white);
}

.item-type-tag.lost {
  background-color: #f56c6c;
}

.item-type-tag.found {
  background-color: #67c23a;
}

.item-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.item-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.item-location {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.item-meta {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.item-contact {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.contact-label {
  font-weight: 500;
  color: var(--text-primary);
}

.contact-info {
  color: var(--text-primary);
  margin-right: var(--spacing-md);
}

.contact-phone {
  color: var(--primary-color);
}

.item-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.item-actions button {
  flex: 1;
  padding: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.edit-button {
  background-color: #67c23a;
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
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
  max-width: 500px;
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

.item-status {
  margin-bottom: var(--spacing-sm);
}

.status-badge {
  font-size: var(--font-size-sm);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.status-pending {
  background-color: #e6a23c;
  color: var(--white);
}

.status-approved {
  background-color: #67c23a;
  color: var(--white);
}

.status-rejected {
  background-color: #f56c6c;
  color: var(--white);
}

:root {
  --spacing-xs: 4px;
  --font-size-xs: 10px;
}

@media (max-width: 768px) {
  .category-section {
    flex-wrap: wrap;
  }
  
  .item-actions {
    flex-direction: column;
  }
  
  .modal-form {
    width: 95%;
    margin: var(--spacing-md);
  }
}
</style>
