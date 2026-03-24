import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    },
    // 禁用自动打开浏览器
    open: false,
    // 完全禁用热更新，防止浏览器聚焦
    hmr: false,
    // 禁用文件更改时的浏览器聚焦
    // watch: {
    //   awaitWriteFinish: {
    //     stabilityThreshold: 3000,
    //     pollInterval: 200
    //   },
    //   // 禁用文件系统事件，使用轮询方式
    //   usePolling: true,
    //   // 禁用文件更改时的浏览器聚焦
    //   ignoreInitial: true
    // }
  }
})
