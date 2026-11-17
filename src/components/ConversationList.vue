<script setup>
import { computed, ref } from 'vue'
import Avatar from './Avatar.vue'
import Icon from './Icon.vue'
import { listTime, previewOf } from '../utils'

const props = defineProps({ convs: Array, activeId: Number })
const emit = defineEmits(['select'])

const q = ref('')
const last = (c) => c.messages[c.messages.length - 1]

const sorted = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return props.convs
    .filter((c) => !kw || c.name.toLowerCase().includes(kw))
    .slice()
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return last(b)?.time - last(a)?.time
    })
})

// 群聊预览前面带上发言人
const sender = (c) => {
  const m = last(c)
  if (!c.group || !m || m.from === 'system') return ''
  return m.from === 'me' ? '我' : c.members[m.from]?.name || ''
}
</script>

<template>
  <aside class="list">
    <div class="top">
      <slot name="tools" />
      <label class="search">
        <Icon name="search" :size="18" />
        <input v-model="q" placeholder="搜索" />
      </label>
    </div>

    <div class="items">
      <button
        v-for="c in sorted"
        :key="c.id"
        class="item"
        :class="{ active: c.id === activeId }"
        @click="emit('select', c.id)"
      >
        <Avatar :name="c.name" :hue="c.hue" :size="50" />
        <div class="main">
          <div class="r1">
            <span class="name">{{ c.name }}</span>
            <span class="time">
              <Icon v-if="last(c).from === 'me'" name="checks" :size="15" class="ck" />
              {{ listTime(last(c).time) }}
            </span>
          </div>
          <div class="r2">
            <span class="preview"
              ><b v-if="sender(c)">{{ sender(c) }}：</b>{{ previewOf(last(c)) }}</span
            >
            <span class="meta">
              <span v-if="c.unread" class="badge" :class="{ muted: c.muted }">{{ c.unread > 99 ? '99+' : c.unread }}</span>
              <Icon v-else-if="c.pinned" name="pin" :size="15" class="pin" />
            </span>
          </div>
        </div>
      </button>
      <div v-if="!sorted.length" class="empty">没有找到相关会话</div>
    </div>
  </aside>
</template>

<style scoped>
.list {
  width: 360px;
  max-width: 45%; /* 窗口变窄时自动收窄，不挤压聊天区 */
  min-width: 240px;
  flex: none;
  background: var(--list-bg);
  border-radius: var(--radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.top {
  height: 56px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px 0 23px; /* 按钮中心对齐下方头像中心：8 + 10 + 25 - 20 */
}
.search {
  flex: 1;
  min-width: 0;
  height: 40px;
  border-radius: var(--radius);
  background: var(--search-bg);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  color: var(--text-3);
  border: 1px solid transparent;
}
.search:focus-within {
  background: var(--list-bg);
  border-color: var(--primary);
  color: var(--primary);
}
.search input {
  flex: 1;
  min-width: 0;
  background: none;
  border: 0;
  outline: 0;
  font-size: 15px;
  color: var(--text);
}
.search input::placeholder {
  color: var(--text-3);
}

.items {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
}
.item {
  width: 100%;
  height: 68px;
  display: flex;
  gap: 12px;
  align-items: center;
  text-align: left;
  padding: 0 10px;
  border-radius: var(--radius);
}
.item:hover {
  background: var(--hover);
}
.item.active {
  background: var(--active);
}
.main {
  flex: 1;
  min-width: 0;
}
.r1,
.r2 {
  display: flex;
  align-items: center;
  gap: 8px;
}
.r1 {
  margin-bottom: 3px;
}
.name {
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.time {
  flex: none;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12.5px;
  color: var(--text-2);
}
.ck {
  color: var(--time-out);
}
.preview {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.preview b {
  font-weight: 400;
  color: var(--text);
}
.meta {
  flex: none;
  display: flex;
  align-items: center;
  height: 22px;
}
.badge {
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 11px;
  background: var(--badge);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  display: grid;
  place-items: center;
}
.badge.muted {
  background: var(--badge-muted);
}
.pin {
  color: var(--text-3);
}

/* 选中行：整行蓝底，文字全白 */
.item.active .name,
.item.active .preview,
.item.active .preview b,
.item.active .time,
.item.active .ck,
.item.active .pin {
  color: #fff;
}
.item.active .preview,
.item.active .time {
  opacity: 0.85;
}
.item.active .badge {
  background: #fff;
  color: var(--active);
}
.empty {
  padding: 40px 0;
  text-align: center;
  color: var(--text-3);
}
</style>
