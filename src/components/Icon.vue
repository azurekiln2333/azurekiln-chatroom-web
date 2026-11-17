<script setup>
import { computed } from 'vue'

const props = defineProps({ name: String, size: { type: Number, default: 18 } })

const ICONS = {
  chat: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 20l1.1-4.8A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  more: 'M12 12h.01M19 12h.01M5 12h.01',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  smile: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
  plus: 'M12 5v14M5 12h14',
  image: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
  close: 'M18 6L6 18M6 6l12 12',
  left: 'M15 18l-6-6 6-6',
  down: 'M6 9l6 6 6-6',
  up: 'M18 15l-6-6-6 6',
  bellOff: 'M13.7 21a2 2 0 0 1-3.4 0M18.6 13A17.9 17.9 0 0 1 18 8 6 6 0 0 0 6.3 6.3M6 8c0 7-3 9-3 9h14M1 1l22 22',
  pin: 'M12 17v5M5 17h14M9 17V7l-2-3h10l-2 3v10',
  mic: 'M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM19 11a7 7 0 0 1-14 0M12 18v4',
  clip: 'M21.4 11.1l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5',
  check: 'M20 6L9 17l-5-5',
  link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  play: 'M6 4l14 8-14 8z',
  pause: 'M7 4v16M17 4v16',
  menu: 'M4 6h16M4 12h16M4 18h16',
  checks: 'M1.5 12.5l4.5 4.5L15.5 7.5M9 15.5l1.5 1.5L21 7',
}

// 每个 M 开头是一段独立路径
const paths = computed(() => (ICONS[props.name] || '').split(/(?=M)/))
const isDot = computed(() => props.name === 'more')
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="isDot ? 3 : 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    :style="{ flex: 'none' }"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>
