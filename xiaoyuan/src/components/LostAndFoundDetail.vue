<template>
  <div class="content">
    <!-- 失物招领详情内容 -->
    <div class="content-header">
      <button class="back-button" @click="goBack">← 返回</button>
      <h1 class="content-title">{{ item.title }}</h1>
    </div>
    
    <div class="item-detail">
      <div class="item-detail-image">
        <img 
          :src="item.imageUrl || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=lost%20and%20found%20placeholder&image_size=square'" 
          :alt="item.title + '图片'" 
        />
        <div class="item-type-tag" :class="item.type">
          {{ item.type === 'lost' ? '失物' : '招领' }}
        </div>
      </div>
      
      <div class="item-detail-info">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="detail-item">
            <span class="detail-label">类型：</span>
            <span class="detail-value">{{ item.type === 'lost' ? '失物' : '招领' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">地点：</span>
            <span class="detail-value">{{ item.location }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">发布时间：</span>
            <span class="detail-value">{{ formatDate(item.createTime) }}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>物品描述</h3>
          <p class="detail-description">{{ item.description }}</p>
        </div>
        
        <div class="detail-section">
          <h3>联系方式</h3>
          <div class="detail-item">
            <span class="detail-label">联系人：</span>
            <span class="detail-value">{{ item.contactPerson }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">联系电话：</span>
            <span class="detail-value contact-phone">{{ item.contactPhone }}</span>
          </div>
        </div>
        
        <div class="detail-actions" v-if="userInfo">
          <button class="primary-button" @click="handleContact(item)">联系失主/拾主</button>
          <button class="edit-button" @click="editItem" v-if="canEdit(item)">编辑信息</button>
        </div>
      </div>
    </div>
    
    <!-- 联系对话框 -->
    <div class="modal-overlay" v-if="showContactDialog" @click="showContactDialog = false"></div>
    <div class="chat-dialog card" v-if="showContactDialog">
      <div class="chat-header">
        <div class="chat-header-info">
          <h2>与 {{ item.contactPerson }} 聊天</h2>
          <p class="chat-subtitle">物品：{{ item.title }}</p>
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
          <span class="contact-item">电话：{{ item.contactPhone }}</span>
          <span class="contact-item">地点：{{ item.location }}</span>
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
const item = ref({
  id: '',
  type: 'lost',
  title: '',
  description: '',
  location: '',
  contactPerson: '',
  contactPhone: '',
  imageUrl: '',
  createTime: '',
  publisher: ''
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
      content: `您正在联系${item.value.type === 'lost' ? '失主' : '拾主'} ${item.value.contactPerson}，关于物品：${item.value.title}`,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      sender: 'contact',
      content: '您好，有什么可以帮助您的吗？',
      timestamp: new Date().toISOString()
    }
  ];
};

// 返回上一页
const goBack = () => {
  router.push('/lost-and-found');
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

// 处理联系
const handleContact = (item) => {
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
  
  // 模拟对方回复
//   setTimeout(() => {
//     const replyMessage = {
//       id: Date.now() + 1,
//       sender: 'contact',
//       content: '感谢您的咨询，我会尽快回复您！',
//       timestamp: new Date().toISOString()
//     };
//     messages.value.push(replyMessage);
//   }, 1000);
};

// 复制联系方式
const copyContact = () => {
  const contactInfo = `${item.value.contactPerson}：${item.value.contactPhone}`;
  navigator.clipboard.writeText(contactInfo)
    .then(() => {
      alert('联系方式已复制到剪贴板');
    })
    .catch(err => {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    });
};

// 编辑物品
const editItem = () => {
  router.push({
    path: '/lost-and-found',
    query: { edit: true, id: item.value.id }
  });
};

// 权限控制函数
const canEdit = (item) => {
  if (!userInfo.value) return false;
  if (userInfo.value.role === 'admin') return true;
  return item.publisher === userInfo.value.username;
};

// 获取失物招领详情
const fetchItemDetail = () => {
  const itemId = route.params.id;
  axios.get(`/api/lost-items/${itemId}`)
    .then(response => {
      // 处理后端数据，转换snake_case为camelCase
      const data = response.data;
      item.value = {
        id: data.lost_item_id,
        type: data.item_type === 1 ? 'lost' : 'found',
        title: data.item_name,
        description: data.description,
        location: data.location,
        contactPerson: data.contact_person,
        contactPhone: data.contact_phone,
        createTime: data.publish_time,
        publisher: data.publisher,
        imageUrl: data.item_image
      };
    })
    .catch(error => {
      console.error('从后端获取数据失败:', error);
      // 使用模拟数据
      item.value = {
        id: itemId,
        type: 'lost',
        title: '模拟失物信息',
        description: '这是一个模拟的失物招领详情',
        location: '图书馆',
        contactPerson: '模拟联系人',
        contactPhone: '13800138000',
        createTime: new Date().toISOString(),
        publisher: 'admin',
        imageUrl: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=lost%20and%20found%20placeholder&image_size=square'
      };
    });
};

onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo);
  }
  // 获取失物招领详情
  fetchItemDetail();
});
</script>

<style scoped>
/* 失物招领详情样式 */
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

.item-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-xl);
}

.item-detail-image {
  height: 400px;
  overflow: hidden;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  position: relative;
}

.item-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.item-detail-info {
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

/* 联系对话框样式 */
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

.message.contact {
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

.message.contact .message-content {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .item-detail {
    grid-template-columns: 1fr;
  }
  
  .item-detail-image {
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