<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { conversations } from './mock'
import ConversationList from './components/ConversationList.vue'
import MessageList from './components/MessageList.vue'
import Composer from './components/Composer.vue'
import Avatar from './components/Avatar.vue'
import Icon from './components/Icon.vue'

// ---- 会话列表宽度：拖拽调整，记在本地 ----
const LW_KEY = 'chat-ui-demo:listW'
const clampW = (w) => Math.min(520, Math.max(260, w))
const readW = () => {
  try {
    return clampW(Number(localStorage.getItem(LW_KEY)) || 360)
  } catch {
    return 360
  }
}
const listW = ref(readW())
const resizing = ref(false)
const startResize = (e) => {
  const startX = e.clientX
  const startW = listW.value
  resizing.value = true
  const move = (ev) => (listW.value = clampW(startW + ev.clientX - startX))
  const up = () => {
    resizing.value = false
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    try {
      localStorage.setItem(LW_KEY, String(listW.value))
    } catch {}
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

const convs = ref(conversations)
const activeId = ref(1)
const active = computed(() => convs.value.find((c) => c.id === activeId.value))

const mobileChat = ref(false) // 窄屏：true 时显示聊天页
const reader = ref(false) // 阅读模式：只读，隐藏输入框
const searchOpen = ref(false)
const keyword = ref('')
const searchInput = ref(null)

// ---- 主题 ----
const dark = ref(window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false)
watch(
  dark,
  (v) => {
    document.documentElement.dataset.theme = v ? 'dark' : 'light'
  },
  { immediate: true },
)

// ---- 会话切换 ----
const select = (id) => {
  activeId.value = id
  const c = active.value
  if (c) c.unread = 0
  mobileChat.value = true
  searchOpen.value = false
  keyword.value = ''
}

// ---- 搜索 ----
const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) nextTick(() => searchInput.value?.focus())
  else keyword.value = ''
}
const matchCount = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k || !active.value) return 0
  return active.value.messages.filter((m) => m.type === 'text' && m.text.toLowerCase().includes(k)).length
})

const subtitle = computed(() => {
  const c = active.value
  if (!c) return ''
  if (reader.value) return `阅读模式 · 共 ${c.messages.length} 条消息`
  return c.group ? `${Object.keys(c.members).length} 位成员` : '在线'
})

// ---- 发送 & 模拟对方回复（纯演示） ----
let nid = 100000
const timers = new Set()
const typing = ref(null) // { convId, name, hue }

const later = (fn, ms) => {
  const t = setTimeout(() => {
    timers.delete(t)
    fn()
  }, ms)
  timers.add(t)
}
onBeforeUnmount(() => timers.forEach(clearTimeout))

const send = (text) => {
  const c = active.value
  c.messages.push({ id: ++nid, from: 'me', type: 'text', text, time: Date.now(), fresh: true })

  if (!c.replies.length) return
  const others = Object.values(c.members).filter((m) => m.id !== 'me')
  const who = others[Math.floor(Math.random() * others.length)]
  later(() => (typing.value = { convId: c.id, name: who.name, hue: who.hue }), 700)
  later(() => {
    typing.value = null
    const t = c.replies[Math.floor(Math.random() * c.replies.length)]
    c.messages.push({ id: ++nid, from: who.id, type: 'text', text: t, time: Date.now(), fresh: true })
    if (c.id !== activeId.value) c.unread++
  }, 2000)
}

const typingName = computed(() => (typing.value && typing.value.convId === activeId.value ? typing.value.name : ''))
const typingHue = computed(() => typing.value?.hue ?? 200)
</script>

<template>
  <div class="app" :class="{ 'chat-open': mobileChat, resizing }">
    <ConversationList :convs="convs" :active-id="activeId" :style="{ width: listW + 'px' }" @select="select">
      <template #tools>
        <button class="hbtn" :title="dark ? '切换到浅色' : '切换到深色'" @click="dark = !dark">
          <Icon :name="dark ? 'sun' : 'moon'" :size="22" />
        </button>
      </template>
    </ConversationList>

    <div class="resizer" title="拖动调整宽度" @pointerdown.prevent="startResize"></div>

    <section v-if="active" class="chat">
      <header class="head">
        <button class="back" @click="mobileChat = false"><Icon name="left" :size="22" /></button>
        <Avatar :name="active.name" :hue="active.hue" :size="42" />
        <div class="title">
          <h2>{{ active.name }}</h2>
          <p :class="{ online: !active.group && !reader }">{{ subtitle }}</p>
        </div>

        <div class="actions">
          <transition name="slide">
            <div v-if="searchOpen" class="find">
              <input ref="searchInput" v-model="keyword" placeholder="搜索聊天记录" @keydown.esc="toggleSearch" />
              <span v-if="keyword.trim()" class="count">{{ matchCount }} 条</span>
            </div>
          </transition>
          <button class="hbtn" :class="{ on: searchOpen }" title="搜索" @click="toggleSearch">
            <Icon :name="searchOpen ? 'close' : 'search'" :size="19" />
          </button>
          <button class="hbtn" :class="{ on: reader }" title="阅读模式" @click="reader = !reader">
            <Icon name="book" :size="19" />
          </button>
          <button class="hbtn" title="更多"><Icon name="more" :size="19" /></button>
        </div>
      </header>

      <MessageList
        :key="active.id"
        :conv-id="active.id"
        :messages="active.messages"
        :members="active.members"
        :is-group="active.group"
        :keyword="keyword"
        :typing="typingName"
        :typing-hue="typingHue"
      />

      <Composer v-if="!reader" @send="send" />
      <div v-else class="reader-bar">
        <span>阅读模式 · 只读</span>
        <button @click="reader = false">退出</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 整个窗口就是聊天背景；左侧列表、右侧顶栏是浮在上面的卡片 */
.app {
  height: 100%;
  display: flex;
  padding: 8px;
  background: var(--wall);
  overflow: hidden;
}

/* ---- 列表和聊天区之间的 8px 缝隙就是拖拽把手；悬停时中间出现一根细条 ---- */
.resizer {
  position: relative;
  width: 8px;
  flex: none;
  cursor: col-resize;
}
.resizer::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 2px;
  width: 4px;
  height: 40px;
  margin-top: -20px;
  border-radius: 2px;
  background: var(--scroll-hover);
  opacity: 0;
  transition: opacity 0.15s;
}
.resizer:hover::after,
.app.resizing .resizer::after {
  opacity: 1;
}
.app.resizing {
  cursor: col-resize;
  user-select: none;
}

/* ---- 聊天区 ---- */
.chat {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.head {
  height: 56px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px 0 14px;
  background: var(--head-bg);
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(728px, calc(100% - 16px)); /* 和消息列、输入框同宽，居中浮动 */
  z-index: 4;
  border-radius: var(--radius);
}
.back {
  display: none;
  width: 36px;
  height: 36px;
  margin-left: -8px;
  border-radius: 50%;
  place-items: center;
  color: var(--text-2);
}
.title {
  min-width: 0;
  flex: 1;
}
h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title p {
  margin: 1px 0 0;
  font-size: 13.5px;
  color: var(--text-2);
}
.title p.online {
  color: var(--primary);
}
.actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.hbtn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--text-2);
}
.hbtn:hover {
  background: var(--hover);
}
.hbtn.on {
  color: var(--primary);
}
.find {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  width: 220px;
  padding: 0 14px;
  margin-right: 4px;
  border-radius: var(--radius);
  background: var(--search-bg);
  overflow: hidden;
}
.find input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: none;
  font-size: 13px;
  color: var(--text);
}
.find input::placeholder {
  color: var(--text-3);
}
.count {
  font-size: 12px;
  color: var(--text-3);
  white-space: nowrap;
}
.slide-enter-active,
.slide-leave-active {
  transition: width 0.18s ease, opacity 0.18s ease;
}
.slide-enter-from,
.slide-leave-to {
  width: 0;
  opacity: 0;
  padding: 0;
}

/* 只读时的底栏：和 Telegram 频道底部一样，居中的一行蓝色文字 */
.reader-bar {
  flex: none;
  height: 52px;
  margin-top: 6px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: var(--composer);
  color: var(--text-2);
  font-size: 15px;
}
.reader-bar button {
  color: var(--primary);
  font-weight: 500;
}
.reader-bar button:hover {
  text-decoration: underline;
}

/* ---- 窄屏：列表 / 聊天 二选一 ---- */
@media (max-width: 820px) {
  .app {
    padding: 0;
  }
  .app :deep(.list) {
    width: 100% !important;
    max-width: none;
    min-width: 0;
    border-radius: 0;
  }
  .resizer {
    display: none;
  }
  .head {
    width: 100%;
    border-radius: 0;
  }
  .chat {
    position: fixed;
    inset: 0;
    background: var(--wall);
    transform: translateX(100%);
    transition: transform 0.25s ease;
    z-index: 5;
  }
  .app.chat-open .chat {
    transform: none;
  }
  .back {
    display: grid;
  }
  .find {
    width: 130px;
  }
}
</style>
