<template>
  <div class="content">
    <div class="content-header">
      <h1 class="content-title">我的订单</h1>
    </div>
    
    <div class="order-list" v-if="orders.length > 0">
      <div class="order-card card" v-for="order in orders" :key="order.id">
        <div class="order-header">
          <div class="order-info">
            <div class="order-id">订单号：{{ order.id }}</div>
            <div class="order-time">{{ formatDate(order.createTime) }}</div>
          </div>
          <div class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </div>
        </div>
        
        <div class="order-items">
          <div class="order-item" v-for="item in order.items" :key="item.id || item.food_id || item.goods_id">
            <div class="order-item-image" v-if="item.imageUrl || item.image_url">
              <img :src="item.imageUrl || item.image_url || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=product%20placeholder&image_size=square'" alt="商品图片" />
            </div>
            <div class="order-item-info">
              <div class="order-item-name">{{ item.food_name || item.goods_name }}</div>
              <div class="order-item-detail">¥{{ item.price }} × {{ item.quantity }}</div>
            </div>
            <div class="order-item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <span class="total-label">订单金额：</span>
            <span class="total-value">¥{{ order.totalAmount }}</span>
          </div>
          <div class="order-type">
            订单类型：{{ order.type === 'food' ? '食堂订单' : '二手订单' }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <p>暂无订单</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const orders = ref([]);

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

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待处理';
    case 'paid':
      return '已支付';
    case 'shipped':
      return '已发货';
    case 'completed':
      return '已完成';
    default:
      return '未知状态';
  }
};

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'status-pending';
    case 'paid':
      return 'status-paid';
    case 'shipped':
      return 'status-shipped';
    case 'completed':
      return 'status-completed';
    default:
      return '';
  }
};

// 从本地存储获取订单
const fetchOrders = () => {
  const storedOrders = localStorage.getItem('orders');
  if (storedOrders) {
    orders.value = JSON.parse(storedOrders);
  }
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.content-header {
  margin-bottom: var(--spacing-xl);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.order-card {
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background-color: #fafafa;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-id {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.order-time {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.order-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.status-pending {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-paid {
  background-color: #ecf5ff;
  color: #409eff;
}

.status-shipped {
  background-color: #f0f9ff;
  color: #67c23a;
}

.status-completed {
  background-color: #f0f9ff;
  color: #67c23a;
}

.order-items {
  padding: var(--spacing-lg);
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-color);
}

.order-item:last-child {
  border-bottom: none;
}

.order-item-image {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: var(--border-radius);
  margin-right: var(--spacing-md);
}

.order-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background-color: #fafafa;
}

.order-total {
  display: flex;
  align-items: center;
  gap: 4px;
}

.order-total .total-label {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.order-total .total-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: #f56c6c;
}

.order-type {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .order-item-image {
    margin-right: 0;
    margin-bottom: var(--spacing-sm);
  }
  
  .order-item-total {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>
