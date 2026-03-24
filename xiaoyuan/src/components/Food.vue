<template>
  <div class="content">
    <div class="content-header">
      <h1 class="content-title">校园食堂</h1>
      <button class="primary-button" @click="showAddForm = true" v-if="userInfo && userInfo.role === 'admin'">添加食堂</button>
    </div>
    
    <!-- 食堂列表和详情区域 -->
    <div class="canteen-container">
      <!-- 食堂列表 -->
      <div class="canteen-list" v-if="merchants.length > 0">
        <div class="card-grid">
          <div 
            class="food-card card" 
            v-for="merchant in merchants" 
            :key="merchant.merchant_id"
            @click="selectMerchant(merchant.merchant_id)"
          >
            <div class="food-image">
              <img 
                :src="merchant.merchant_image ? merchant.merchant_image.replace('./', '/') : 'https://neeko-copilot.bytedance.net/api/text2image?prompt=campus%20canteen%20restaurant&image_size=square'" 
                :alt="merchant.merchant_name + '图片'"
              />
            </div>
            <div class="food-info">
              <h3 class="food-name">{{ merchant.merchant_name }}</h3>
              <p class="food-description">{{ merchant.intro }}</p>
              <div class="food-meta">
                <span class="food-location">{{ merchant.address }}</span>
                <span class="food-rating">评分: {{ merchant.score }}</span>
                <span class="food-comments">{{ merchant.comment_count }}条评论</span>
              </div>
              <div class="feature-dishes">
                <h4>特色菜品</h4>
                <p>{{ merchant.feature_dishes }}</p>
              </div>
              <div class="food-actions" v-if="userInfo && userInfo.role === 'admin'">
                <button class="edit-button" @click.stop="editMerchant(merchant)">编辑</button>
                <button class="delete-button" @click.stop="deleteMerchant(merchant.merchant_id)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无食堂提示 -->
      <div class="empty-state" v-else>
        <p>暂无食堂</p>
      </div>
    </div>
    
    <!-- 添加/编辑食堂表单 -->
    <div class="modal-overlay" v-if="showAddForm || showEditForm" @click="closeForm"></div>
    <div class="modal-form card" v-if="showAddForm || showEditForm">
      <div class="modal-header">
        <h2>{{ showEditForm ? '编辑食堂' : '添加食堂' }}</h2>
        <button class="close-button" @click="closeForm">×</button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">食堂名称</label>
          <input type="text" class="form-input" v-model="formData.merchant_name" required />
        </div>
        <div class="form-group">
          <label class="form-label">食堂介绍</label>
          <textarea class="form-input" v-model="formData.intro" rows="3" required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">地址</label>
          <input type="text" class="form-input" v-model="formData.address" required />
        </div>
        <div class="form-group">
          <label class="form-label">评分</label>
          <input type="number" class="form-input" v-model="formData.score" step="0.1" min="0" max="5" required />
        </div>
        <div class="form-group">
          <label class="form-label">评论数</label>
          <input type="number" class="form-input" v-model="formData.comment_count" min="0" required />
        </div>
        <div class="form-group">
          <label class="form-label">特色菜品</label>
          <textarea class="form-input" v-model="formData.feature_dishes" rows="2" required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">图片路径</label>
          <input type="text" class="form-input" v-model="formData.merchant_image" placeholder="例如：D:\图片\毕设图片\食堂\第一食堂.png" />
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
import FoodDetail from './FoodDetail.vue';

const router = useRouter();
const userInfo = ref(null);
const merchants = ref([]);
const showAddForm = ref(false);
const showEditForm = ref(false);
const selectedMerchantId = ref(null);
const formData = ref({
  merchant_id: '',
  merchant_name: '',
  intro: '',
  address: '',
  score: 0,
  comment_count: 0,
  feature_dishes: '',
  merchant_image: ''
});

// 选择食堂
const selectMerchant = (merchantId) => {
  // 跳转到食堂详情页面
  router.push(`/food-detail/${merchantId}`);
};

// 获取所有食堂
const fetchAllMerchants = () => {
  axios.get('/api/merchants/all')
    .then(response => {
      console.log('完整的后端响应数据:', response.data);
      merchants.value = response.data;
      // 打印第一个食堂的完整信息到控制台
      if (merchants.value.length > 0) {
        console.log('第一个食堂的完整信息:', merchants.value[0]);
      }
    })
    .catch(error => {
      console.error('从后端获取数据失败:', error);
      // 显示错误信息
      alert('获取食堂信息失败，请稍后重试');
    });
};

// 编辑食堂
const editMerchant = (merchant) => {
  formData.value = { ...merchant };
  showEditForm.value = true;
  showAddForm.value = false;
};

// 删除食堂
const deleteMerchant = (merchantId) => {
  if (confirm('确定要删除这个食堂吗？')) {
    console.log('删除食堂ID:', merchantId, '类型:', typeof merchantId);
    const id = parseInt(merchantId);
    console.log('转换后的ID:', id, '类型:', typeof id);
    console.log('请求URL:', `/api/merchants/delete/${id}`);
    
    axios.delete(`/api/merchants/delete/${id}`)
      .then(response => {
        console.log('删除响应:', response);
        if (response.data > 0) {
          // 删除成功
          merchants.value = merchants.value.filter(item => item.merchant_id !== merchantId);
          alert('删除食堂成功');
        } else {
          alert('删除食堂失败');
        }
      })
      .catch(error => {
        console.error('删除食堂失败:', error);
        alert('删除食堂失败，请稍后重试');
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
    merchant_id: '',
    merchant_name: '',
    intro: '',
    address: '',
    score: 0,
    comment_count: 0,
    feature_dishes: '',
    merchant_image: ''
  };
};

// 处理表单提交
const handleSubmit = () => {
  const submitData = {
    ...formData.value,
    score: parseFloat(formData.value.score),
    comment_count: parseInt(formData.value.comment_count)
  };
  
  if (showEditForm.value) {
    // 编辑食堂
    axios.put('/api/merchants/update', submitData)
      .then(response => {
        if (response.data > 0) {
          // 更新成功
          merchants.value = merchants.value.map(item => 
            item.merchant_id === formData.value.merchant_id ? formData.value : item
          );
          alert('更新食堂成功');
          closeForm();
        } else {
          alert('更新食堂失败');
        }
      })
      .catch(error => {
        console.error('更新食堂失败:', error);
        alert('更新食堂失败，请稍后重试');
      });
  } else {
    // 添加食堂
    axios.post('/api/merchants/add', submitData)
      .then(response => {
        if (response.data > 0) {
          // 添加成功
          fetchAllMerchants();
          alert('添加食堂成功');
          closeForm();
        } else {
          alert('添加食堂失败');
        }
      })
      .catch(error => {
        console.error('添加食堂失败:', error);
        alert('添加食堂失败，请稍后重试');
      });
  }
};





onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
  // 获取食堂数据
  fetchAllMerchants();
});
</script>

<style scoped>
/* 食堂列表布局 */
.canteen-container {
  margin-bottom: var(--spacing-2xl);
}

/* 食堂列表区域 */
.canteen-list {
  width: 100%;
}

/* 食堂卡片悬停效果 */
.food-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

/* 食堂卡片样式 */
.food-card {
  overflow: hidden;
}

.food-image {
  height: 200px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-info {
  padding: var(--spacing-lg);
}

.food-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.food-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.4;
}

.food-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.feature-dishes {
  margin-bottom: var(--spacing-md);
}

.feature-dishes h4 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.feature-dishes p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 操作按钮样式 */
.food-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.food-actions button {
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

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

/* 管理员徽章样式 */
.admin-badge {
  background-color: var(--primary-color);
  color: var(--white);
  font-size: var(--font-size-sm);
  padding: 2px 8px;
  border-radius: 10px;
}

/* 模态框样式 */
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .canteen-container {
    flex-direction: column;
  }
  
  .canteen-detail {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .category-section {
    flex-wrap: wrap;
  }
  
  .food-actions {
    flex-direction: column;
  }
  
  .modal-form {
    width: 95%;
    margin: var(--spacing-md);
  }
  
  .food-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
