<template>
  <div class="content">
    <!-- 食堂详情内容 -->
    <div class="content-header">
      <button class="back-button" @click="goBack">← 返回</button>
      <h1 class="content-title">{{ merchant.merchant_name }}</h1>
    </div>
    
    <div class="food-detail">
      <div class="food-detail-image">
        <img 
          :src="merchant.merchant_image ? merchant.merchant_image.replace('./', '/') : 'https://neeko-copilot.bytedance.net/api/text2image?prompt=campus%20canteen%20restaurant&image_size=square'" 
          :alt="merchant.merchant_name + '图片'" 
        />
      </div>
      
      <div class="food-detail-info">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="detail-item">
            <span class="detail-label">评分：</span>
            <span class="detail-value">{{ merchant.score }}分</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">评论数：</span>
            <span class="detail-value">{{ merchant.comment_count }}条</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">地址：</span>
            <span class="detail-value">{{ merchant.address }}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>食堂介绍</h3>
          <p class="detail-description">{{ merchant.intro }}</p>
        </div>
        
        <div class="detail-section">
          <h3>特色菜品</h3>
          <p class="detail-dishes">{{ merchant.feature_dishes }}</p>
        </div>
        
        <div class="detail-actions" v-if="userInfo && userInfo.role === 'admin'">
          <button class="edit-button" @click="editMerchant">编辑食堂信息</button>
        </div>
      </div>
    </div>
    
    <!-- 食物列表 -->
    <div class="food-list">
      <h2>菜品列表</h2>
      <div class="food-items-grid">
        <div class="food-item-card card" v-for="food in foods" :key="food.food_id">
          <div class="food-item-image">
            <img 
              :src="food.image_url || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=delicious%20food&image_size=square'" 
              :alt="food.food_name + '图片'" 
            />
          </div>
          <div class="food-item-info">
            <h3 class="food-item-name">{{ food.food_name }}</h3>
            <p class="food-item-description">{{ food.description }}</p>
            <div class="food-item-price">¥{{ food.price }}</div>
            <button class="add-to-cart-button" @click="addToCart(food)">加入购物车</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 购物车悬浮按钮 -->
    <div class="cart-float-button" @click="showCart = !showCart">
      <div class="cart-icon">🛒</div>
      <div class="cart-count" v-if="cartItemCount > 0">{{ cartItemCount }}</div>
    </div>
    
    <!-- 购物车面板 -->
    <div class="cart-panel" v-if="showCart">
      <div class="cart-header">
        <h3>购物车</h3>
        <button class="close-cart" @click="showCart = false">×</button>
      </div>
      <div class="cart-items">
        <div class="cart-item" v-for="item in cart" :key="item.food_id">
          <div class="cart-item-info">
            <div class="cart-item-name">{{ item.food_name }}</div>
            <div class="cart-item-price">¥{{ item.price }}</div>
          </div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" @click="adjustQuantity(item.food_id, 'decrease')">-</button>
            <span class="quantity">{{ item.quantity }}</span>
            <button class="quantity-btn" @click="adjustQuantity(item.food_id, 'increase')">+</button>
          </div>
          <button class="remove-from-cart" @click="removeFromCart(item.food_id)">×</button>
        </div>
        <div class="empty-cart" v-if="cart.length === 0">
          购物车为空
        </div>
      </div>
      <div class="cart-footer">
        <div class="cart-total">
          <span class="total-label">总计：</span>
          <span class="total-amount">¥{{ totalAmount }}</span>
        </div>
        <div class="cart-actions">
          <button class="view-orders-button" @click="goToOrders">我的订单</button>
          <button class="clear-cart-button" @click="clearCart">清空购物车</button>
          <button class="checkout-button" @click="showCheckoutModal" :disabled="cart.length === 0">结算</button>
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
            <div class="order-item" v-for="item in cart" :key="item.food_id">
              <div class="order-item-info">
                <div class="order-item-name">{{ item.food_name }}</div>
                <div class="order-item-detail">¥{{ item.price }} × {{ item.quantity }}</div>
              </div>
              <div class="order-item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
        </div>
        <div class="checkout-summary">
          <div class="summary-item">
            <span class="summary-label">商品总数：</span>
            <span class="summary-value">{{ cartItemCount }} 件</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">订单金额：</span>
            <span class="summary-value">¥{{ totalAmount }}</span>
          </div>
          <div class="summary-total">
            <span class="total-label">应付总额：</span>
            <span class="total-value">¥{{ totalAmount }}</span>
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
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const userInfo = ref(null);
const merchant = ref({
  merchant_id: '',
  merchant_name: '',
  intro: '',
  address: '',
  score: 0,
  comment_count: 0,
  feature_dishes: '',
  merchant_image: ''
});

// 食物列表
const foods = ref([]);
// 购物车状态
const cart = ref([]);
const showCart = ref(false);
const showCheckout = ref(false);

// 计算属性
const totalAmount = computed(() => {
  return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
});

const cartItemCount = computed(() => {
  return cart.value.reduce((total, item) => total + item.quantity, 0);
});

// 返回上一页
const goBack = () => {
  router.push('/food');
};

// 获取食堂详情
const fetchMerchantDetail = () => {
  const merchantId = route.params.id;
  axios.get(`/api/merchants/${merchantId}`)
    .then(response => {
      merchant.value = response.data;
    })
    .catch(error => {
      console.error('从后端获取食堂详情失败:', error);
      // 隐藏错误提示，使用模拟数据
      console.log('使用模拟食堂数据');
      merchant.value = {
        merchant_id: merchantId,
        merchant_name: '模拟食堂',
        intro: '这是一个模拟的食堂详情',
        address: '校园内',
        score: 4.5,
        comment_count: 100,
        feature_dishes: '红烧肉、糖醋里脊、番茄炒蛋',
        merchant_image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=campus%20canteen%20restaurant&image_size=square'
      };
    });
};

// 获取食堂食物列表
const fetchFoods = () => {
  const merchantId = route.params.id;
  axios.get(`/api/merchant-food/merchant/${merchantId}`)
    .then(response => {
      console.log('从后端获取的菜品数据:', response.data);
      foods.value = response.data;
    })
    .catch(error => {
      console.error('从后端获取食物列表失败:', error);
      // 使用模拟数据
      foods.value = [
        {
          food_id: 1,
          food_name: '红烧肉',
          price: 18.8,
          description: '肥而不腻，入口即化',
          image_url: '/images/food/hongshaorou.png',
          merchant_id: merchantId
        },
        {
          food_id: 2,
          food_name: '糖醋里脊',
          price: 16.8,
          description: '酸甜可口，外酥里嫩',
          image_url: '/images/food/tangculiji.png',
          merchant_id: merchantId
        },
        {
          food_id: 3,
          food_name: '番茄炒蛋',
          price: 12.8,
          description: '经典家常菜，营养丰富',
          image_url: '/images/food/fanqiechaodan.png',
          merchant_id: merchantId
        },
        {
          food_id: 4,
          food_name: '麻婆豆腐',
          price: 14.8,
          description: '麻辣鲜香，下饭神器',
          image_url: '/images/food/mapotofu.png',
          merchant_id: merchantId
        }
      ];
    });
};

// 添加到购物车
const addToCart = (food) => {
  // 检查购物车中是否已存在该商品
  const existingItem = cart.value.find(item => item.food_id === food.food_id);
  if (existingItem) {
    // 已存在，数量+1
    existingItem.quantity += 1;
  } else {
    // 不存在，添加到购物车
    cart.value.push({
      ...food,
      quantity: 1
    });
  }
};

// 从购物车移除
const removeFromCart = (foodId) => {
  cart.value = cart.value.filter(item => item.food_id !== foodId);
};

// 调整购物车商品数量
const adjustQuantity = (foodId, action) => {
  const item = cart.value.find(item => item.food_id === foodId);
  if (item) {
    if (action === 'increase') {
      item.quantity += 1;
    } else if (action === 'decrease') {
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        removeFromCart(foodId);
      }
    }
  }
};

// 清空购物车
const clearCart = () => {
  if (confirm('确定要清空购物车吗？')) {
    cart.value = [];
  }
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
    type: 'food',
    items: [...cart.value],
    totalAmount: totalAmount.value,
    status: 'paid',
    createTime: new Date().toISOString()
  };
  
  // 保存订单到本地存储
  saveOrder(newOrder);
  
  // 清空购物车
  cart.value = [];
  showCart.value = false;
  showCheckout.value = false;
  
  // 跳转到订单页面
  router.push('/orders');
};

// 编辑食堂
const editMerchant = () => {
  router.push({
    path: '/food',
    query: { edit: true, id: merchant.value.merchant_id }
  });
};

onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
  // 获取食堂详情和菜品列表
  fetchMerchantDetail();
  fetchFoods();
});
</script>

<style scoped>
/* 食堂详情样式 */
.content-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.back-button {
  background-color: var(--white);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: all 0.3s;
  font-size: var(--font-size-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.back-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.food-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-xl);
}

.food-detail-image {
  height: 400px;
  overflow: hidden;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
}

.food-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-detail-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.detail-section {
  background-color: var(--white);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.detail-section h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.detail-item {
  display: flex;
  margin-bottom: var(--spacing-md);
  align-items: baseline;
}

.detail-label {
  font-weight: 500;
  color: var(--text-primary);
  margin-right: var(--spacing-sm);
  min-width: 80px;
}

.detail-value {
  color: var(--text-secondary);
}

.detail-description,
.detail-dishes {
  color: var(--text-secondary);
  line-height: 1.5;
}

.detail-actions {
  display: flex;
  justify-content: flex-start;
}

.edit-button {
  background-color: #67c23a;
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: var(--font-size-md);
}

.edit-button:hover {
  background-color: #85ce61;
}

/* 食物列表样式 */
.food-list {
  margin-top: var(--spacing-2xl);
}

.food-list h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.food-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.food-item-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.food-item-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.food-item-image {
  height: 200px;
  overflow: hidden;
}

.food-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.food-item-card:hover .food-item-image img {
  transform: scale(1.05);
}

.food-item-info {
  padding: var(--spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.food-item-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.food-item-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.4;
  flex: 1;
}

.food-item-price {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: var(--spacing-md);
}

.add-to-cart-button {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: var(--font-size-md);
  align-self: flex-start;
}

.add-to-cart-button:hover {
  background-color: var(--primary-hover);
}

/* 购物车悬浮按钮样式 */
.cart-float-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background-color: var(--primary-color);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 999;
}

.cart-float-button:hover {
  background-color: var(--primary-hover);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.cart-icon {
  font-size: 24px;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f56c6c;
  color: var(--white);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

/* 购物车面板样式 */
.cart-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--white);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
}

.cart-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-cart {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-cart:hover {
  background-color: var(--background-color);
  color: var(--text-primary);
}

/* 购物车商品列表 */
.cart-items {
  margin-bottom: 20px;
  max-height: 40vh;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid var(--border-color);
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.cart-item-price {
  font-size: var(--font-size-md);
  color: #f56c6c;
  font-weight: 600;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 20px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  background-color: var(--white);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.quantity-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-size: var(--font-size-md);
}

.remove-from-cart {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.remove-from-cart:hover {
  background-color: #f56c6c;
  color: var(--white);
}

.empty-cart {
  text-align: center;
  padding: 40px 0;
  color: var(--text-secondary);
  font-size: var(--font-size-md);
}

/* 购物车底部 */
.cart-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.total-label {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
}

.total-amount {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: #f56c6c;
}

.cart-actions {
  display: flex;
  gap: 15px;
}

.clear-cart-button {
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

.clear-cart-button:hover {
  border-color: #f56c6c;
  color: #f56c6c;
}

.checkout-button {
  flex: 2;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: 12px;
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.checkout-button:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.checkout-button:disabled {
  background-color: #c6e2ff;
  cursor: not-allowed;
}

.view-orders-button {
  flex: 1;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: 12px;
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-orders-button:hover {
  background-color: var(--primary-hover);
}

/* 确认结算模态框样式 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .food-detail {
    grid-template-columns: 1fr;
  }
  
  .food-detail-image {
    height: 300px;
  }
  
  .food-items-grid {
    grid-template-columns: 1fr;
  }
  
  .cart-float-button {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
  }
  
  .cart-icon {
    font-size: 20px;
  }
  
  .cart-panel {
    padding: 15px;
  }
  
  .cart-actions {
    flex-direction: column;
  }
  
  .view-orders-button,
  .clear-cart-button,
  .checkout-button {
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