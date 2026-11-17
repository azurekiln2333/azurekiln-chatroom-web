<script setup>
import { computed } from 'vue'
import { AVATAR_COLORS, peerIdx } from '../utils'

const props = defineProps({
  name: { type: String, default: '' },
  hue: { type: Number, default: 200 },
  size: { type: Number, default: 40 },
})

const bg = computed(() => AVATAR_COLORS[peerIdx(props.hue)])
const label = computed(() => (props.name || '?').trim().slice(0, 1))
</script>

<template>
  <div
    class="avatar"
    :style="{ width: size + 'px', height: size + 'px', background: bg, fontSize: size * 0.4 + 'px' }"
  >
    {{ label }}
  </div>
</template>

<style scoped>
.avatar {
  flex: none;
  border-radius: 50%;
  color: #fff;
  font-weight: 500;
  display: grid;
  place-items: center;
  user-select: none;
}
</style>
