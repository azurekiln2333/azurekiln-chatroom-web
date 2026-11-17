import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 单文件输出：dist/index.html 双击即可打开（file:// 下 type=module 外链会被拦，所以全部内联）
export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  base: './',
})
