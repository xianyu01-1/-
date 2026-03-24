<template>
  <div class="content">
    <!-- 二手商品详情内容 -->
    <div class="content-header">
      <button class="back-button" @click="goBack">← 返回</button>
      <h1 class="content-title">{{ goods.goods_name }}</h1>
    </div>
    
    <div class="goods-detail">
      <div class="goods-detail-image">
        <img 
          :src="goods.imageUrl || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=secondhand%20goods%20placeholder&image_size=square'" 
          :alt="goods.goods_name + '图片'" 
        />
        <div class="goods-status" v-if="goods.status !== 1">
          <span :class="['status-badge', getStatusClass(goods.status)]">{{ getStatusText(goods.status) }}</span>
        </div>
      </div>
      
      <div class="goods-detail-info">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="detail-item">
            <span class="detail-label">价格：</span>
            <span class="detail-value price">{{ goods.price ? '¥' + goods.price : '面议' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">卖家：</span>
            <span class="detail-value">{{ goods.seller || '未知卖家' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">交易地点：</span>
            <span class="detail-value">{{ goods.location || '未指定' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">发布时间：</span>
            <span class="detail-value">{{ formatDate(goods.publish_time) }}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>商品描述</h3>
          <p class="detail-description">{{ goods.description || '暂无描述' }}</p>
        </div>
        
        <div class="detail-section">
          <h3>联系方式</h3>
          <div class="detail-item">
            <span class="detail-label">联系人：</span>
            <span class="detail-value">{{ goods.seller || '未知' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话：</span>
            <span class="detail-value contact-phone">{{ goods.contact || '未提供' }}</span>
          </div>
        </div>
        
        <div class="detail-actions" v-if="userInfo">
          <button class="primary-button" @click="handleContact(goods)">联系卖家</button>
          <button class="edit-button" @click="editGoods" v-if="canEdit(goods)">编辑商品</button>
        </div>
      </div>
    </div>
    
    <!-- 联系卖家对话框 -->
    <div class="modal-overlay" v-if="showContactDialog" @click="showContactDialog = false"></div>
    <div class="chat-dialog card" v-if="showContactDialog">
      <div class="chat-header">
        <div class="chat-header-info">
          <h2>与 {{ goods.seller }} 聊天</h2>
          <p class="chat-subtitle">商品：{{ goods.goods_name }}</p>
        </div>
        <button class="close-button" @click="showContactDialog = false">×</button>
      </div>
      <div class="chat-messages">
        <div 
          v-for="message in messages" 
          :key="message.id" 
          :class="['message', message.sender]"
        >
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ formatDate(message.timestamp) }}</div>
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <input 
          type="text" 
          v-model="messageInput" 
          class="message-input" 
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
        />
        <button class="send-button" @click="sendMessage">发送</button>
      </div>
      <div class="chat-footer">
        <div class="contact-info">
          <span class="contact-item">电话：{{ goods.contact }}</span>
          <span class="contact-item">地点：{{ goods.location }}</span>
          <button class="copy-button" @click="copyContact">复制联系方式</button>
        </div>
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
const goods = ref({
  goods_id: '',
  goods_name: '',
  description: '',
  price: 0,
  seller: '',
  contact: '',
  location: '',
  imageUrl: '',
  publish_time: '',
  status: 1
});
const showContactDialog = ref(false);
const messages = ref([]);
const messageInput = ref('');

// 初始化聊天消息
const initChatMessages = () => {
  messages.value = [
    {
      id: 1,
      sender: 'system',
      content: `您正在联系 ${goods.value.seller}，关于商品：${goods.value.goods_name}`,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      sender: 'seller',
      content: '您好，有什么可以帮助您的吗？',
      timestamp: new Date().toISOString()
    }
  ];
};

// 返回上一页
const goBack = () => {
  router.push('/secondhand-market');
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

// 处理联系卖家
const handleContact = (goods) => {
  initChatMessages();
  showContactDialog.value = true;
};

// 发送消息
const sendMessage = () => {
  if (!messageInput.value.trim()) return;
  
  const newMessage = {
    id: Date.now(),
    sender: 'user',
    content: messageInput.value.trim(),
    timestamp: new Date().toISOString()
  };
  
  messages.value.push(newMessage);
  messageInput.value = '';
  
  // 模拟卖家回复
  // setTimeout(() => {
  //   const replyMessage = {
  //     id: Date.now() + 1,
  //     sender: 'seller',
  //     content: '感谢您的咨询，我会尽快回复您！',
  //     timestamp: new Date().toISOString()
  //   };
  //   messages.value.push(replyMessage);
  // }, 1000);
};

// 复制联系方式
const copyContact = () => {
  const contactInfo = `${goods.value.seller}：${goods.value.contact}`;
  navigator.clipboard.writeText(contactInfo)
    .then(() => {
      alert('联系方式已复制到剪贴板');
    })
    .catch(err => {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    });
};

// 编辑商品
const editGoods = () => {
  router.push({
    path: '/secondhand-market',
    query: { edit: true, id: goods.value.goods_id }
  });
};

// 检查是否可以编辑商品
const canEdit = (goods) => {
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

// 获取商品详情
const fetchGoodsDetail = () => {
  const goodsId = route.params.id;
  axios.get(`/api/goods/${goodsId}`)
    .then(response => {
      const data = response.data;
      goods.value = {
        ...data,
        // 将后端的image_url映射到前端的imageUrl
        imageUrl: data.image_url || data.imageUrl
      };
    })
    .catch(error => {
      console.error('从后端获取数据失败:', error);
      // 使用模拟数据
      goods.value = {
        goods_id: goodsId,
        goods_name: '模拟二手商品',
        description: '这是一个模拟的二手商品详情',
        price: 999,
        seller: '模拟卖家',
        contact: '13800138000',
        location: '学生活动中心',
        imageUrl: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=secondhand%20goods%20placeholder&image_size=square',
        publish_time: new Date().toISOString(),
        status: 1
      };
    });
};

onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
  // 获取商品详情
  fetchGoodsDetail();
});
</script>

<style scoped>
/* 二手商品详情样式 */
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

.goods-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-xl);
}

.goods-detail-image {
  height: 400px;
  overflow: hidden;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  position: relative;
}

.goods-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-status {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
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

.goods-detail-info {
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

.detail-value.price {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: #f56c6c;
}

.contact-phone {
  color: var(--primary-color);
  font-weight: 500;
}

.detail-description {
  color: var(--text-secondary);
  line-height: 1.5;
}

.detail-actions {
  display: flex;
  gap: var(--spacing-md);
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

/* 响应式设计 */
/* 联系卖家对话框样式 */
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

.chat-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  height: 80vh;
  max-height: 600px;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: dialogFadeIn 0.3s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--primary-color);
  color: var(--white);
}

.chat-header-info h2 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.chat-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--white);
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
  background-color: rgba(255, 255, 255, 0.2);
}

.chat-messages {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.message {
  display: flex;
  margin-bottom: var(--spacing-sm);
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.seller {
  align-self: flex-start;
}

.message.system {
  align-self: center;
  max-width: 90%;
}

.message-content {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  position: relative;
}

.message.user .message-content {
  background-color: var(--primary-color);
  color: var(--white);
  border-bottom-right-radius: 4px;
}

.message.seller .message-content {
  background-color: var(--white);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
}

.message.system .message-content {
  background-color: #e9ecef;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  text-align: center;
}

.message-text {
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.message-time {
  font-size: var(--font-size-xs);
  opacity: 0.7;
  text-align: right;
}

.chat-input-area {
  display: flex;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background-color: var(--white);
  gap: var(--spacing-sm);
}

.message-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-md);
  resize: none;
  outline: none;
  transition: border-color 0.3s;
}

.message-input:focus {
  border-color: var(--primary-color);
}

.send-button {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  padding: 0 var(--spacing-lg);
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: var(--font-size-md);
  white-space: nowrap;
}

.send-button:hover {
  background-color: var(--primary-hover);
}

.chat-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background-color: #f8f9fa;
}

.chat-footer .contact-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.chat-footer .contact-item {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.copy-button {
  background-color: var(--white);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s;
  font-size: var(--font-size-sm);
  margin-left: auto;
}

.copy-button:hover {
  background-color: var(--primary-color);
  color: var(--white);
}

@media (max-width: 768px) {
  .goods-detail {
    grid-template-columns: 1fr;
  }
  
  .goods-detail-image {
    height: 300px;
  }
  
  .detail-actions {
    flex-direction: column;
  }
  
  .detail-actions button {
    width: 100%;
  }
  
  .chat-dialog {
    width: 95%;
    height: 90vh;
    margin: var(--spacing-md);
  }
  
  .chat-footer .contact-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .copy-button {
    margin-left: 0;
    align-self: flex-start;
  }
}
</style>