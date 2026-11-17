<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import MessageBubble from './MessageBubble.vue'
import Avatar from './Avatar.vue'
import Icon from './Icon.vue'
import { dayKey, dayLabel, peerIdx } from '../utils'

const props = defineProps({
  messages: Array,
  members: Object,
  keyword: String,
  isGroup: Boolean,
  typing: String, // 正在输入的人名，空则不显示
  convId: Number,
  typingHue: Number,
})

const el = ref(null)
const atBottom = ref(true)
const GAP = 10 * 60 * 1000

// 按“天”分节（日期标签吸顶）；节内再把同一人的连续消息并成一组
const days = computed(() => {
  const out = []
  let day = null
  let cur = null
  let prev = null
  for (const m of props.messages) {
    const dk = dayKey(m.time)
    if (!day || day.dk !== dk) {
      day = { dk, key: 'd' + dk, label: dayLabel(m.time), items: [] }
      out.push(day)
      cur = null
      prev = null
    }
    if (m.type === 'system') {
      day.items.push({ kind: 'system', key: 's' + m.id, text: m.text })
      cur = null
      prev = m
      continue
    }
    if (!cur || cur.from !== m.from || m.time - prev.time > GAP) {
      const sender = props.members[m.from]
      cur = {
        kind: 'group',
        key: 'g' + m.id, // 用组内第一条的 id，追加消息时 key 不变
        from: m.from,
        mine: m.from === 'me',
        sender,
        nidx: peerIdx(sender?.hue),
        list: [],
      }
      day.items.push(cur)
    }
    cur.list.push(m)
    prev = m
  }
  // 组内位置：single / first / mid / last
  for (const d of out)
    for (const it of d.items) {
      if (it.kind !== 'group') continue
      const n = it.list.length
      it.rows = it.list.map((msg, i) => ({
        msg,
        pos: n === 1 ? 'single' : i === 0 ? 'first' : i === n - 1 ? 'last' : 'mid',
      }))
    }
  return out
})

const toBottom = (smooth = false) => {
  nextTick(() => {
    const e = el.value
    if (e) e.scrollTo({ top: e.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  })
}
const onScroll = () => {
  const e = el.value
  atBottom.value = e.scrollHeight - e.scrollTop - e.clientHeight < 80
}

onMounted(() => toBottom())
watch(() => props.convId, () => toBottom())
watch(
  () => props.messages.length,
  () => toBottom(true),
)
watch(
  () => props.typing,
  () => atBottom.value && toBottom(true),
)
watch(
  () => props.keyword,
  () =>
    nextTick(() => {
      el.value?.querySelector('mark')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }),
)

defineExpose({ toBottom })
</script>

<template>
  <div class="wrap">
    <div ref="el" class="scroll" @scroll.passive="onScroll">
      <div class="inner">
        <section v-for="d in days" :key="d.key" class="day">
          <div class="datechip">
            <span>{{ d.label }}</span>
          </div>

          <template v-for="it in d.items" :key="it.key">
            <div v-if="it.kind === 'system'" class="system">
              <span>{{ it.text }}</span>
            </div>

            <!-- 连续消息组：头像在组底部，滚动时吸附在可视区底部（TG 风格） -->
            <div v-else class="group" :class="{ me: it.mine }">
              <div v-if="!it.mine" class="av-col">
                <Avatar class="av" :name="it.sender?.name" :hue="it.sender?.hue ?? 200" :size="40" />
              </div>
              <div class="stack">
                <MessageBubble
                  v-for="r in it.rows"
                  :key="r.msg.id"
                  :msg="r.msg"
                  :pos="r.pos"
                  :keyword="keyword"
                  :sname="isGroup ? it.sender?.name : ''"
                  :nidx="it.nidx"
                />
              </div>
            </div>
          </template>
        </section>

        <div v-if="typing" class="group">
          <div class="av-col"><Avatar class="av" :name="typing" :hue="typingHue" :size="40" /></div>
          <div class="stack">
            <div class="typing"><i></i><i></i><i></i></div>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <button v-if="!atBottom" class="to-bottom" @click="toBottom(true)" title="回到最新">
        <Icon name="down" :size="22" />
      </button>
    </transition>
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
  flex: 1;
  min-height: 0;
}
.scroll {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable both-edges; /* 左右对称留出滚动条位置，消息列和顶栏/输入框严格居中对齐 */
  padding: 56px 8px 8px; /* 顶部让出浮动顶栏的 56px */
}
.inner {
  max-width: 728px;
  margin: 0 auto;
}

/* 日期标签：吸顶；系统提示用同样的样式 */
.datechip {
  position: sticky;
  top: 6px; /* 吸在顶栏下方 6px（Chrome 的吸顶偏移从滚动区内边距之内算起，56px 已经让出） */
  z-index: 3;
  display: flex;
  justify-content: center;
  margin: 14px 0 8px;
  pointer-events: none;
}
/* 第一个日期标签和吸顶后的位置一致（顶栏下 6px），滚动时不跳 */
.day:first-child .datechip {
  margin-top: 6px;
}
.datechip span,
.system span {
  background: var(--chip-bg);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  padding: 3px 12px;
  border-radius: 14px;
}
.system {
  display: flex;
  justify-content: center;
  margin: 10px 0 4px;
}
.system span {
  font-weight: 400;
  font-size: 12.5px;
}

/* ---- 消息组 ---- */
.group {
  display: flex;
  align-items: stretch; /* 头像列撑满整组高度，sticky 才有活动范围 */
  gap: 8px;
  margin-top: 8px;
}
.group.me {
  justify-content: flex-end;
}
.av-col {
  width: 40px;
  flex: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* 默认停在组底部 */
}
.av {
  position: sticky;
  bottom: 8px; /* 组很长时，头像吸附在视口底部上方一点 */
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  max-width: min(480px, 78%);
}
.group.me .stack {
  align-items: flex-end;
}

.typing {
  align-self: flex-start;
  background: var(--bubble-in);
  box-shadow: var(--bubble-shadow);
  border-radius: 15px 15px 15px 4px;
  padding: 14px 15px;
  display: flex;
  gap: 4px;
}
.typing i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-3);
  animation: blink 1.1s infinite ease-in-out;
}
.typing i:nth-child(2) { animation-delay: 0.15s; }
.typing i:nth-child(3) { animation-delay: 0.3s; }
@keyframes blink {
  0%, 80%, 100% { opacity: 0.35; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}

.to-bottom {
  position: absolute;
  right: 24px;
  bottom: 12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--composer);
  color: var(--text-2);
  display: grid;
  place-items: center;
}
.to-bottom:hover { color: var(--primary); }
.fade-enter-active,
.fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
