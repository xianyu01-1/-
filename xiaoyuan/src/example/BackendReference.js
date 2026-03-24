// 前端代码参考 - 用于后端和数据库开发

// =====================================
// 数据模型定义
// =====================================

// 用户模型
const UserModel = {
  userId: Number,         // 用户ID
  username: String,       // 用户名
  password: String,       // 密码（后端存储加密后的密码）
  userRole: Number,       // 用户角色：0-普通用户，1-管理员
  phone: String,          // 手机号
  createTime: String      // 创建时间
};

// 二手商品模型
const GoodsModel = {
  goodsId: Number,        // 商品ID
  goodsName: String,      // 商品名称
  description: String,    // 商品描述
  price: Number,          // 商品价格
  seller: String,         // 卖家用户名
  contact: String,        // 联系方式
  location: String,       // 交易地点
  imageUrl: String,       // 商品图片URL
  publishTime: String,    // 发布时间
  category: Number        // 商品分类
};

// 食堂模型
const MerchantModel = {
  merchantId: Number,     // 食堂ID
  merchantName: String,   // 食堂名称
  intro: String,          // 食堂介绍
  address: String,        // 食堂地址
  score: Number,          // 食堂评分
  commentCount: Number,   // 评论数
  featureDishes: String,  // 特色菜品
  merchantImage: String   // 食堂图片URL
};

// 食堂食物模型
const FoodModel = {
  foodId: Number,         // 食物ID
  foodName: String,       // 食物名称
  price: Number,          // 食物价格
  description: String,    // 食物描述
  imageUrl: String,       // 食物图片URL
  merchantId: Number      // 所属食堂ID
};

// 失物招领模型
const LostItemModel = {
  lostItemId: Number,     // 失物招领ID
  itemName: String,       // 物品名称
  itemType: Number,       // 物品类型：0-失物，1-招领
  description: String,    // 物品描述
  location: String,       // 地点
  contactPerson: String,  // 联系人
  contactPhone: String,   // 联系电话
  publishTime: String,    // 发布时间
  publisher: String       // 发布人
};

// 公告模型
const NoticeModel = {
  noticeId: Number,       // 公告ID
  title: String,          // 公告标题
  content: String,        // 公告内容
  publisher: String,      // 发布人
  publishTime: String,    // 发布时间
  isTop: Number           // 是否置顶：0-否，1-是
};

// =====================================
// API调用示例
// =====================================

// 用户认证API
const AuthAPI = {
  login: (username, password) => {
    // POST /api/auth/login
    // 请求体：{ username, password }
    // 响应：{ success: Boolean, userInfo: Object, token: String }
  },
  register: (userData) => {
    // POST /api/auth/register
    // 请求体：userData
    // 响应：{ success: Boolean, message: String }
  }
};

// 二手商品API
const GoodsAPI = {
  getAll: () => {
    // GET /api/goods/all
    // 响应：[{ goodsId, goodsName, description, price, seller, contact, location, imageUrl, publishTime, category }]
  },
  getDetail: (id) => {
    // GET /api/goods/detail/:id
    // 响应：{ goodsId, goodsName, description, price, seller, contact, location, imageUrl, publishTime, category }
  },
  add: (goodsData) => {
    // POST /api/goods/add
    // 请求体：goodsData
    // 响应：{ success: Boolean, message: String }
  },
  update: (goodsData) => {
    // PUT /api/goods/update
    // 请求体：goodsData
    // 响应：{ success: Boolean, message: String }
  },
  delete: (id) => {
    // DELETE /api/goods/delete/:id
    // 响应：{ success: Boolean, message: String }
  }
};

// 食堂API
const MerchantAPI = {
  getAll: () => {
    // GET /api/merchants/all
    // 响应：[{ merchantId, merchantName, intro, address, score, commentCount, featureDishes, merchantImage }]
  },
  getDetail: (id) => {
    // GET /api/merchants/detail/:id
    // 响应：{ merchantId, merchantName, intro, address, score, commentCount, featureDishes, merchantImage }
  },
  getFoods: (id) => {
    // GET /api/merchants/foods/:id
    // 响应：[{ foodId, foodName, price, description, imageUrl, merchantId }]
  },
  add: (merchantData) => {
    // POST /api/merchants/add
    // 请求体：merchantData
    // 响应：{ success: Boolean, message: String }
  },
  update: (merchantData) => {
    // PUT /api/merchants/update
    // 请求体：merchantData
    // 响应：{ success: Boolean, message: String }
  },
  delete: (id) => {
    // DELETE /api/merchants/delete/:id
    // 响应：{ success: Boolean, message: String }
  }
};

// 失物招领API
const LostItemAPI = {
  getAll: () => {
    // GET /api/lost-items/all
    // 响应：[{ lostItemId, itemName, itemType, description, location, contactPerson, contactPhone, publishTime, publisher }]
  },
  add: (itemData) => {
    // POST /api/lost-items/add
    // 请求体：itemData
    // 响应：{ success: Boolean, message: String }
  },
  update: (itemData) => {
    // PUT /api/lost-items/update
    // 请求体：itemData
    // 响应：{ success: Boolean, message: String }
  },
  delete: (id) => {
    // DELETE /api/lost-items/delete/:id
    // 响应：{ success: Boolean, message: String }
  }
};

// 公告API
const NoticeAPI = {
  getAll: () => {
    // GET /api/notices/all
    // 响应：[{ noticeId, title, content, publisher, publishTime, isTop }]
  },
  add: (noticeData) => {
    // POST /api/notices/add
    // 请求体：noticeData
    // 响应：{ success: Boolean, message: String }
  },
  update: (noticeData) => {
    // PUT /api/notices/update
    // 请求体：noticeData
    // 响应：{ success: Boolean, message: String }
  },
  delete: (id) => {
    // DELETE /api/notices/delete/:id
    // 响应：{ success: Boolean, message: String }
  }
};

// =====================================
// 组件结构示例
// =====================================

// 组件示例 - 二手商品列表
/*
<template>
  <div class="goods-list">
    <h2>二手商品列表</h2>
    <div class="goods-grid">
      <div class="goods-card" v-for="goods in goods" :key="goods.goodsId">
        <img :src="goods.imageUrl" :alt="goods.goodsName" />
        <h3>{{ goods.goodsName }}</h3>
        <p>{{ goods.description }}</p>
        <div class="price">¥{{ goods.price }}</div>
        <div class="seller">卖家：{{ goods.seller }}</div>
        <div class="actions">
          <button @click="contactSeller(goods)">联系卖家</button>
          <button @click="editGoods(goods)" v-if="canEdit(goods)">编辑</button>
          <button @click="deleteGoods(goods.goodsId)" v-if="canDelete(goods)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const goods = ref([]);

// 获取商品列表
const fetchGoods = async () => {
  try {
    const response = await axios.get('/api/goods/all');
    goods.value = response.data;
  } catch (error) {
    console.error('获取商品列表失败:', error);
  }
};

// 联系卖家
const contactSeller = (goods) => {
  alert(`联系卖家 ${goods.seller}：${goods.contact}`);
};

// 编辑商品
const editGoods = (goods) => {
  // 跳转到编辑页面或显示编辑表单
};

// 删除商品
const deleteGoods = async (id) => {
  if (confirm('确定要删除这个商品吗？')) {
    try {
      await axios.delete(`/api/goods/delete/${id}`);
      goods.value = goods.value.filter(item => item.goodsId !== id);
    } catch (error) {
      console.error('删除商品失败:', error);
    }
  }
};

// 权限控制
const canEdit = (goods) => {
  // 实现权限检查逻辑
  return false;
};

const canDelete = (goods) => {
  // 实现权限检查逻辑
  return false;
};

onMounted(() => {
  fetchGoods();
});
</script>
*/

// =====================================
// 状态管理示例
// =====================================

// 简单状态管理示例
const useStore = () => {
  // 用户状态
  const userInfo = ref(null);

  // 登录状态
  const isLoggedIn = computed(() => !!userInfo.value);

  // 登录
  const login = (userData) => {
    userInfo.value = userData;
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  // 退出登录
  const logout = () => {
    userInfo.value = null;
    localStorage.removeItem('userInfo');
  };

  // 获取用户信息
  const getUserInfo = () => {
    return userInfo.value;
  };

  // 初始化用户信息
  const initUserInfo = () => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo);
    }
  };

  return {
    userInfo,
    isLoggedIn,
    login,
    logout,
    getUserInfo,
    initUserInfo
  };
};

// =====================================
// API响应格式示例
// =====================================

// 成功响应示例
const successResponse = {
  success: true,
  data: {}, // 响应数据
  message: '操作成功'
};

// 失败响应示例
const errorResponse = {
  success: false,
  data: null,
  message: '操作失败，原因：...'
};

// 列表数据响应示例
const listResponse = {
  success: true,
  data: [
    // 数据列表
  ],
  total: 100, // 总条数（用于分页）
  page: 1,    // 当前页码
  pageSize: 10 // 每页条数
};

// =====================================
// 路由配置示例
// =====================================

/*
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue')
  },
  {
    path: '/secondhand-market',
    name: 'SecondhandMarket',
    component: () => import('../components/SecondhandMarket.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/food',
    name: 'Food',
    component: () => import('../components/Food.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/food/:id',
    name: 'FoodDetail',
    component: () => import('../components/FoodDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lost-and-found',
    name: 'LostAndFound',
    component: () => import('../components/LostAndFound.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../components/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];
*/

// =====================================
// 权限控制示例
// =====================================

/*
// 路由守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const userInfo = localStorage.getItem('userInfo');
  const isLoggedIn = !!userInfo;
  const userRole = isLoggedIn ? JSON.parse(userInfo).userRole : null;

  if (requiresAuth) {
    if (!isLoggedIn) {
      // 未登录，跳转到登录页
      next('/login');
    } else if (requiresAdmin && userRole !== 1) {
      // 需要管理员权限，但不是管理员
      alert('权限不足，需要管理员权限');
      next('/');
    } else {
      // 已登录且权限满足
      next();
    }
  } else {
    // 不需要登录的页面
    next();
  }
});
*/

// =====================================
// 数据库表结构建议
// =====================================

/*
-- 用户表
CREATE TABLE `user` (
  `user_id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `user_role` TINYINT NOT NULL DEFAULT 0,
  `phone` VARCHAR(20),
  `create_time` DATETIME NOT NULL
);

-- 二手商品表
CREATE TABLE `goods` (
  `goods_id` INT PRIMARY KEY AUTO_INCREMENT,
  `goods_name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `seller` VARCHAR(50) NOT NULL,
  `contact` VARCHAR(50),
  `location` VARCHAR(100),
  `image_url` VARCHAR(255),
  `publish_time` DATETIME NOT NULL,
  `category` TINYINT NOT NULL DEFAULT 0
);

-- 食堂表
CREATE TABLE `merchant` (
  `merchant_id` INT PRIMARY KEY AUTO_INCREMENT,
  `merchant_name` VARCHAR(100) NOT NULL,
  `intro` TEXT,
  `address` VARCHAR(100),
  `score` DECIMAL(3,1) NOT NULL DEFAULT 0,
  `comment_count` INT NOT NULL DEFAULT 0,
  `feature_dishes` VARCHAR(255),
  `merchant_image` VARCHAR(255)
);

-- 食堂食物表
CREATE TABLE `food` (
  `food_id` INT PRIMARY KEY AUTO_INCREMENT,
  `food_name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `description` TEXT,
  `image_url` VARCHAR(255),
  `merchant_id` INT NOT NULL,
  FOREIGN KEY (`merchant_id`) REFERENCES `merchant`(`merchant_id`)
);

-- 失物招领表
CREATE TABLE `lost_item` (
  `lost_item_id` INT PRIMARY KEY AUTO_INCREMENT,
  `item_name` VARCHAR(100) NOT NULL,
  `item_type` TINYINT NOT NULL,
  `description` TEXT,
  `location` VARCHAR(100),
  `contact_person` VARCHAR(50),
  `contact_phone` VARCHAR(20),
  `publish_time` DATETIME NOT NULL,
  `publisher` VARCHAR(50) NOT NULL
);

-- 公告表
CREATE TABLE `notice` (
  `notice_id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `content` TEXT NOT NULL,
  `publisher` VARCHAR(50) NOT NULL,
  `publish_time` DATETIME NOT NULL,
  `is_top` TINYINT NOT NULL DEFAULT 0
);
*/

// 导出示例（如果需要）
// export { UserModel, GoodsModel, MerchantModel, FoodModel, LostItemModel, NoticeModel };