import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')

// 滚动时给滚动容器加 .is-scrolling，停下 800ms 后去掉 → 滚动条只在滚动时出现
const timers = new WeakMap()
document.addEventListener(
  'scroll',
  (e) => {
    const el = e.target === document ? document.documentElement : e.target
    if (!(el instanceof Element)) return
    el.classList.add('is-scrolling')
    clearTimeout(timers.get(el))
    timers.set(el, setTimeout(() => el.classList.remove('is-scrolling'), 800))
  },
  { capture: true, passive: true },
)
