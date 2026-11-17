<script setup>
import { nextTick, ref } from 'vue'
import Icon from './Icon.vue'

const emit = defineEmits(['send'])

const text = ref('')
const ta = ref(null)
const showEmoji = ref(false)

const EMOJIS = ['😀', '😂', '🥹', '😍', '😎', '🤔', '😭', '😴', '🙌', '👍', '👏', '🙏', '❤️', '🔥', '🎉', '☀️', '🌙', '🍜', '☕', '🎬', '📝', '✅', '👌', '🥳']

const grow = () => {
  const e = ta.value
  if (!e) return
  e.style.height = 'auto'
  e.style.height = Math.min(e.scrollHeight, 140) + 'px'
}

const submit = () => {
  const v = text.value.trim()
  if (!v) return
  emit('send', v)
  text.value = ''
  showEmoji.value = false
  nextTick(grow)
}

const onKey = (e) => {
  // Enter 发送，Shift+Enter 换行；输入法组词中不触发
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    submit()
  }
}

const addEmoji = (e) => {
  text.value += e
  ta.value?.focus()
  nextTick(grow)
}
</script>

<template>
  <div class="composer">
    <transition name="rise">
      <div v-if="showEmoji" class="emoji-panel">
        <button v-for="e in EMOJIS" :key="e" @click="addEmoji(e)">{{ e }}</button>
      </div>
    </transition>

    <div class="row">
      <!-- 输入条：白色圆角条，不带边框 -->
      <div class="bar">
        <button class="tool" :class="{ on: showEmoji }" title="表情" @click="showEmoji = !showEmoji">
          <Icon name="smile" :size="24" />
        </button>
        <textarea
          ref="ta"
          v-model="text"
          rows="1"
          placeholder="发消息"
          @input="grow"
          @keydown="onKey"
        ></textarea>
        <button class="tool" title="附件"><Icon name="clip" :size="24" /></button>
      </div>

      <!-- 独立的圆形按钮：空时是麦克风，有字时变成发送 -->
      <button class="fab" :title="text.trim() ? '发送' : '语音'" @click="submit">
        <Icon :name="text.trim() ? 'send' : 'mic'" :size="24" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.composer {
  position: relative;
  padding: 6px 8px 0;
}
.row {
  max-width: 728px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.bar {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-end;
  background: var(--composer);
  border-radius: var(--radius);
  padding: 0 6px;
  min-height: 52px;
  box-shadow: var(--bubble-shadow);
}
.tool {
  width: 44px;
  height: 52px;
  display: grid;
  place-items: center;
  color: var(--text-3);
  flex: none;
}
.tool:hover,
.tool.on {
  color: var(--primary);
}
textarea {
  flex: 1;
  min-width: 0;
  resize: none;
  border: 0;
  outline: 0;
  background: none;
  line-height: 1.4;
  font-size: 15.5px;
  padding: 15px 2px;
  max-height: 140px;
}
textarea::placeholder {
  color: var(--text-3);
}
.fab {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--primary-ink);
  display: grid;
  place-items: center;
  flex: none;
  box-shadow: var(--bubble-shadow);
  transition: transform 0.12s;
}
.fab:active {
  transform: scale(0.94);
}

.emoji-panel {
  position: absolute;
  left: 16px;
  bottom: calc(100% - 2px);
  width: min(380px, calc(100% - 32px));
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  padding: 8px;
  background: var(--composer);
  border-radius: var(--radius);
  border: 1px solid var(--line);
}
.emoji-panel button {
  font-size: 22px;
  height: 38px;
  border-radius: 8px;
}
.emoji-panel button:hover {
  background: var(--hover);
}
.rise-enter-active,
.rise-leave-active {
  transition: opacity 0.12s, transform 0.12s;
}
.rise-enter-from,
.rise-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
