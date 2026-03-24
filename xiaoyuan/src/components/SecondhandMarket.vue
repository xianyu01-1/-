<template>
  <div class="content">
    <div class="content-header">
      <h1 class="content-title">二手市场</h1>
      <div class="header-actions">
        <button class="primary-button" @click="showAddForm = true" v-if="userInfo">发布商品</button>
        <button class="cart-button" @click="showCart = true">
          购物车 ({{ cart.length }})
        </button>
      </div>
    </div>
    
    <!-- 搜索和筛选 -->
    <div class="search-section card">
      <div class="search-form">
        <input 
          type="text" 
          class="form-input" 
          v-model="searchKeyword" 
          placeholder="搜索商品名称或描述"
          @input="filterGoods"
        />
        <select class="form-input" v-model="sortBy" @change="filterGoods">
          <option value="price_asc">价格从低到高</option>
          <option value="price_desc">价格从高到低</option>
          <option value="time_desc">发布时间从新到旧</option>
        </select>
      </div>
    </div>
    
    <!-- 商品列表 -->
    <div class="card-grid" v-if="filteredGoods.length > 0">
      <div class="goods-card card" v-for="goods in filteredGoods" :key="goods.goods_id" @click="viewGoodsDetail(goods.goods_id)">
        <div class="goods-image">
          <img :src="goods.imageUrl || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=secondhand%20goods%20placeholder&image_size=square'" alt="商品图片" />
        </div>
        <div class="goods-info">
          <h3 class="goods-title">{{ goods.goods_name }}</h3>
          <p class="goods-description">{{ goods.description }}</p>
          <div class="goods-price">¥{{ goods.price }}</div>
          <div class="goods-meta">
          <span class="goods-seller">{{ goods.seller || '未知卖家' }}</span>
          <span class="goods-time">{{ formatDate(goods.publish_time) }}</span>
        </div>
        <div class="goods-status" v-if="goods.status !== 1">
          <span :class="['status-badge', getStatusClass(goods.status)]">{{ getStatusText(goods.status) }}</span>
        </div>
          <div class="goods-location" v-if="goods.location">
            <span>交易地点: {{ goods.location }}</span>
          </div>
          <div class="goods-actions">
            <button class="primary-button" @click.stop="addToCart(goods)">加入购物车</button>
            <button class="edit-button" @click.stop="editGoods(goods)" v-if="canEdit(goods)">编辑</button>
            <button class="delete-button" @click.stop="deleteGoods(goods.goods_id)" v-if="canDelete(goods)">删除</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 无商品提示 -->
    <div class="empty-state" v-else>
      <p>暂无商品</p>
    </div>
    
    <!-- 添加/编辑商品表单 -->
    <div class="modal-overlay" v-if="showAddForm || showEditForm" @click="closeForm"></div>
    <div class="modal-form card" v-if="showAddForm || showEditForm">
      <div class="modal-header">
        <h2>{{ showEditForm ? '编辑商品' : '发布商品' }}</h2>
        <button class="close-button" @click="closeForm">×</button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">商品名称</label>
          <input type="text" class="form-input" v-model="formData.goods_name" required />
        </div>
        <div class="form-group">
          <label class="form-label">商品描述</label>
          <textarea class="form-input" v-model="formData.description" rows="3" required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">价格</label>
          <input type="number" class="form-input" v-model.number="formData.price" min="0" step="0.01" required />
        </div>
        <div class="form-group">
          <label class="form-label">卖家</label>
          <input type="text" class="form-input" v-model="formData.seller" required />
        </div>
        <div class="form-group">
          <label class="form-label">联系方式</label>
          <input type="text" class="form-input" v-model="formData.contact" required />
        </div>
        <div class="form-group">
          <label class="form-label">交易地点</label>
          <input type="text" class="form-input" v-model="formData.location" required />
        </div>
        <div class="form-group">
          <label class="form-label">商品图片</label>
          <input type="file" class="form-input" accept="image/jpeg,image/png" @change="handleImageUpload" />
          <div v-if="formData.imageUrl" class="image-preview">
            <img :src="formData.imageUrl" alt="预览图片" style="max-width: 200px; max-height: 200px;" />
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-button" @click="closeForm">取消</button>
          <button type="submit" class="primary-button">保存</button>
        </div>
      </form>
    </div>
    
    <!-- 购物车模态框 -->
    <div class="modal-overlay" v-if="showCart" @click="showCart = false"></div>
    <div class="modal-form card" v-if="showCart">
      <div class="modal-header">
        <h2>购物车</h2>
        <button class="close-button" @click="showCart = false">×</button>
      </div>
      <div class="cart-content">
        <div v-if="cart.length === 0" class="empty-cart">
          <p>购物车为空</p>
        </div>
        <div v-else class="cart-items">
          <div class="cart-item" v-for="item in cart" :key="item.goods_id">
            <div class="cart-item-image">
              <img :src="item.imageUrl || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=secondhand%20goods%20placeholder&image_size=square'" alt="商品图片" />
            </div>
            <div class="cart-item-info">
              <h3 class="cart-item-title">{{ item.goods_name }}</h3>
              <p class="cart-item-price">¥{{ item.price }}</p>
              <div class="cart-item-seller">卖家: {{ item.seller }}</div>
            </div>
            <div class="cart-item-actions">
              <button class="delete-button" @click.stop="removeFromCart(item.goods_id)">删除</button>
            </div>
          </div>
          <div class="cart-total">
            <span>总计: ¥{{ cartTotal }}</span>
            <div class="cart-actions-buttons">
              <button class="view-orders-button" @click="goToOrders">我的订单</button>
              <button class="cancel-button" @click="clearCart">清空购物车</button>
              <button class="primary-button" @click="showCheckoutModal">结算</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 确认结算模态框 -->
    <div class="modal-overlay" v-if="showCheckout" @click="showCheckout = false"></div>
    <div class="checkout-modal card" v-if="showCheckout">
      <div class="modal-header">
        <h2>确认结算</h2>
        <button class="close-button" @click="showCheckout = false">×</button>
      </div>
      <div class="checkout-content">
        <div class="checkout-order-info">
          <h3>订单信息</h3>
          <div class="order-items">
            <div class="order-item" v-for="item in cart" :key="item.goods_id">
              <div class="order-item-info">
                <div class="order-item-name">{{ item.goods_name }}</div>
                <div class="order-item-detail">¥{{ item.price }} × {{ item.quantity }}</div>
              </div>
              <div class="order-item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
        </div>
        <div class="checkout-summary">
          <div class="summary-item">
            <span class="summary-label">商品总数：</span>
            <span class="summary-value">{{ cart.length }} 件</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">订单金额：</span>
            <span class="summary-value">¥{{ cartTotal }}</span>
          </div>
          <div class="summary-total">
            <span class="total-label">应付总额：</span>
            <span class="total-value">¥{{ cartTotal }}</span>
          </div>
        </div>
      </div>
      <div class="checkout-actions">
        <button class="cancel-button" @click="showCheckout = false">取消</button>
        <button class="confirm-pay-button" @click="confirmPayment">确认支付</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
const router = useRouter();
const userInfo = ref(null);
const goods = ref([]);
const searchKeyword = ref('');
const sortBy = ref('time_desc');
const showAddForm = ref(false);
const showEditForm = ref(false);
const cart = ref([]);
const showCart = ref(false);
const showCheckout = ref(false);
const formData = ref({
  goods_id: '',
  goods_name: '',
  description: '',
  price: 0,
  seller: '',
  contact: '',
  location: '',
  imageUrl: '',
  publish_time: ''
});



// 计算过滤后的商品列表
const filteredGoods = computed(() => {
  let result = [...goods.value];
  
  // 只显示审核通过的商品，或者是用户自己发布的商品
  result = result.filter(goods => {
    if (userInfo.value) {
      // 管理员可以看到所有商品
      if (userInfo.value.role === 'admin') return true;
      // 用户可以看到自己的所有商品和审核通过的其他商品
      return goods.status === 1 || goods.seller === userInfo.value.username;
    } else {
      // 未登录用户只能看到审核通过的商品
      return goods.status === 1;
    }
  });
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(goods => 
      goods.goods_name.toLowerCase().includes(keyword) || 
      goods.description.toLowerCase().includes(keyword)
    );
  }
  
  // 排序
  switch (sortBy.value) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'time_desc':
      result.sort((a, b) => new Date(b.publish_time) - new Date(a.publish_time));
      break;
  }
  
  return result;
});

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

// 过滤商品
const filterGoods = () => {
  // 计算属性会自动更新
};

// 检查是否可以编辑商品
const canEdit = (goods) => {
  if (!userInfo.value) return false;
  if (userInfo.value.role === 'admin') return true;
  return goods.seller === userInfo.value.username;
};

// 检查是否可以删除商品
const canDelete = (goods) => {
  if (!userInfo.value) return false;
  if (userInfo.value.role === 'admin') return true;
  return goods.seller === userInfo.value.username;
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

// 查看商品详情
const viewGoodsDetail = (goodsId) => {
  router.push(`/secondhand-goods-detail/${goodsId}`);
};

// 获取所有商品
const fetchAllGoods = () => {
  axios.get('/api/goods/all')
    .then(response => {
      console.log('二手市场完整响应数据:', response.data);
      // 转换后端数据，处理字段名映射
      goods.value = response.data.map(item => ({
        ...item,
        // 将后端的image_url映射到前端的imageUrl
        imageUrl: item.image_url || item.imageUrl
      }));
      // 打印第一个商品的完整信息
      if (goods.value.length > 0) {
        console.log('第一个商品完整信息:', goods.value[0]);
        // 特别打印图片路径
        console.log('第一个商品图片路径:', goods.value[0].imageUrl);
      }
    })
    .catch(error => {
        console.error('从后端获取数据失败:', error);
        goods.value = [];
      });
};

// 加入购物车
const addToCart = (goods) => {
  if (!userInfo.value) {
    alert('请先登录后再添加商品到购物车');
    return;
  }
  
  // 检查商品是否已在购物车中
  const existingItem = cart.value.find(item => item.goods_id === goods.goods_id);
  if (existingItem) {
    alert('该商品已在购物车中');
    return;
  }
  
  // 添加到购物车
  cart.value.push({
    ...goods,
    quantity: 1
  });
  
  // 保存到本地存储
  localStorage.setItem('cart', JSON.stringify(cart.value));
  
  alert('商品已成功加入购物车');
};

// 从购物车移除商品
const removeFromCart = (goodsId) => {
  cart.value = cart.value.filter(item => item.goods_id !== goodsId);
  localStorage.setItem('cart', JSON.stringify(cart.value));
};

// 清空购物车
const clearCart = () => {
  cart.value = [];
  localStorage.removeItem('cart');
};

// 跳转到订单页面
const goToOrders = () => {
  showCart.value = false;
  router.push('/orders');
};

// 显示确认结算模态框
const showCheckoutModal = () => {
  if (cart.value.length === 0) {
    alert('购物车为空，无法结算');
    return;
  }
  showCart.value = false;
  showCheckout.value = true;
};

// 生成订单ID
const generateOrderId = () => {
  return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// 保存订单
const saveOrder = (order) => {
  let orders = [];
  const storedOrders = localStorage.getItem('orders');
  if (storedOrders) {
    orders = JSON.parse(storedOrders);
  }
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));
};

// 确认支付
const confirmPayment = () => {
  // 创建新订单
  const newOrder = {
    id: generateOrderId(),
    type: 'secondhand',
    items: [...cart.value],
    totalAmount: cartTotal.value,
    status: 'paid',
    createTime: new Date().toISOString()
  };
  
  // 保存订单到本地存储
  saveOrder(newOrder);
  
  // 清空购物车
  cart.value = [];
  localStorage.removeItem('cart');
  showCheckout.value = false;
  
  // 跳转到订单页面
  router.push('/orders');
};

// 计算购物车总价
const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => total + item.price * item.quantity, 0);
});

// 编辑商品
const editGoods = (goods) => {
  formData.value = { ...goods };
  showEditForm.value = true;
  showAddForm.value = false;
};

// 删除商品
const deleteGoods = (goodsId) => {
  if (confirm('确定要删除这个商品吗？')) {
    axios.delete(`/api/goods/delete/${goodsId}`)
      .then(response => {
        if (response.data > 0) {
          // 删除成功
          goods.value = goods.value.filter(item => item.goods_id !== goodsId);
          alert('删除商品成功');
        } else {
          alert('删除商品失败');
        }
      })
      .catch(error => {
        console.error('删除商品失败:', error);
        alert('删除商品失败，请稍后重试');
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
    goods_id: '',
    goods_name: '',
    description: '',
    price: 0,
    seller: userInfo.value?.username || '',
    contact: '',
    location: '',
    imageUrl: '',
    publish_time: ''
  };
};

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // 验证图片格式
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    alert('只支持JPG和PNG格式的图片');
    return;
  }
  
  // 验证图片大小（限制为5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('图片大小不能超过5MB');
    return;
  }
  
  // 创建FormData对象
  const formData = new FormData();
  formData.append('file', file);
  
  // 这里应该调用后端的图片上传接口
  // 由于我们使用模拟数据，这里直接使用base64
  const reader = new FileReader();
  reader.onload = (e) => {
    formData.value.imageUrl = e.target.result;
  };
  reader.readAsDataURL(file);
};

// 处理表单提交
const handleSubmit = () => {
  if (showEditForm.value) {
    // 编辑商品
    axios.put('/api/goods/update', formData.value)
      .then(response => {
        if (response.data > 0) {
          // 更新成功
          goods.value = goods.value.map(item => 
            item.goods_id === formData.value.goods_id ? formData.value : item
          );
          alert('更新商品成功');
          closeForm();
        } else {
          alert('更新商品失败');
        }
      })
      .catch(error => {
        console.error('更新商品失败:', error);
        alert('更新商品失败，请稍后重试');
      });
  } else {
    // 添加商品
    const newGoods = {
      ...formData.value,
      status: 0, // 设置为待审核状态
      publish_time: new Date().toISOString(),
      user_id: userInfo.value?.id || 0
    };
    
    axios.post('/api/goods/add', newGoods)
      .then(response => {
        if (response.data > 0) {
          // 添加成功
          fetchAllGoods();
          alert('商品发布成功，等待审核');
          closeForm();
        } else {
          alert('添加商品失败');
        }
      })
      .catch(error => {
        console.error('添加商品失败:', error);
        alert('添加商品失败，请稍后重试');
      });
  }
};

onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
  // 从本地存储加载购物车数据
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    cart.value = JSON.parse(storedCart);
  }
  // 获取商品数据
  fetchAllGoods();
});
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.cart-button {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: var(--font-size-sm);
}

.cart-button:hover {
  background-color: var(--primary-hover);
}

.search-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.search-form {
  display: flex;
  gap: var(--spacing-md);
}

.search-form .form-input {
  flex: 1;
}

.goods-card {
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.goods-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.goods-image {
  height: 200px;
  overflow: hidden;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-info {
  padding: var(--spacing-lg);
}

.goods-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.goods-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.4;
}

.goods-price {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: var(--spacing-md);
}

.goods-meta {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.goods-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.goods-actions button {
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

.goods-status {
  margin-bottom: var(--spacing-md);
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

.image-preview {
  margin-top: var(--spacing-md);
  border: 1px solid var(--border-color);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
}

/* 购物车样式 */
.cart-content {
  padding: var(--spacing-lg);
  max-height: 400px;
  overflow-y: auto;
}

.empty-cart {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.cart-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--white);
}

.cart-item-image {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: var(--border-radius);
  margin-right: var(--spacing-md);
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
}

.cart-item-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.cart-item-price {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: var(--spacing-sm);
}

.cart-item-seller {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.cart-item-actions {
  margin-left: var(--spacing-md);
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  margin-top: var(--spacing-md);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.cart-actions-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.cart-actions-buttons button {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.view-orders-button {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-orders-button:hover {
  background-color: var(--primary-hover);
}

/* 确认结算模态框样式 */
.checkout-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  z-index: 1001;
}

.checkout-modal .modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  background-color: var(--white);
  z-index: 1;
}

.checkout-modal .modal-header h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.checkout-modal .close-button {
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

.checkout-content {
  padding: var(--spacing-lg);
}

.checkout-order-info {
  margin-bottom: var(--spacing-xl);
}

.checkout-order-info h3 {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.order-items {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.order-item:last-child {
  border-bottom: none;
}

.order-item-info {
  flex: 1;
}

.order-item-name {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.order-item-detail {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.order-item-total {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: #f56c6c;
  margin-left: var(--spacing-md);
}

.checkout-summary {
  background-color: #f5f7fa;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.summary-item:last-of-type {
  margin-bottom: var(--spacing-lg);
}

.summary-label {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.summary-value {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--border-color);
}

.summary-total .total-label {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.summary-total .total-value {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: #f56c6c;
}

.checkout-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.checkout-actions .cancel-button {
  flex: 1;
  background-color: var(--white);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 12px;
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all 0.3s;
}

.checkout-actions .cancel-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.checkout-actions .confirm-pay-button {
  flex: 2;
  background-color: #67c23a;
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: 12px;
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.checkout-actions .confirm-pay-button:hover {
  background-color: #85ce61;
}

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .goods-actions {
    flex-direction: column;
  }
  
  .modal-form {
    width: 95%;
    margin: var(--spacing-md);
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cart-item-image {
    margin-right: 0;
    margin-bottom: var(--spacing-md);
  }
  
  .cart-item-actions {
    margin-left: 0;
    margin-top: var(--spacing-md);
    align-self: flex-end;
  }
  
  .cart-total {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .cart-actions-buttons {
    width: 100%;
  }
  
  .cart-actions-buttons {
    flex-direction: column;
  }
  
  .cart-actions-buttons button {
    width: 100%;
  }
  
  .checkout-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .checkout-actions {
    flex-direction: column;
  }
  
  .checkout-actions .cancel-button,
  .checkout-actions .confirm-pay-button {
    width: 100%;
  }
}
</style>
