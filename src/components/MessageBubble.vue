<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import { hm } from '../utils'

// pos：该气泡在同一发送者连续消息组里的位置 single | first | mid | last
const props = defineProps({
  msg: Object,
  pos: { type: String, default: 'single' },
  keyword: String,
  sname: String, // 群聊里显示在气泡内的发言人名字
  nidx: { type: Number, default: 0 }, // 名字颜色序号 0-6
})

const mine = computed(() => props.msg.from === 'me')
const showName = computed(() => !!props.sname && !mine.value && (props.pos === 'first' || props.pos === 'single'))
// 文字 / 语音 / 文件且没有反应：时间嵌在最后一行右下角，不单独占一行
const inline = computed(() => ['text', 'voice', 'file'].includes(props.msg.type) && !props.msg.reactions?.length)

// 关键词高亮：切成 [{t, hit}]
const parts = computed(() => {
  const s = props.msg.text || ''
  const k = (props.keyword || '').trim()
  if (!k) return [{ t: s, hit: false }]
  const out = []
  const low = s.toLowerCase()
  const kl = k.toLowerCase()
  let i = 0
  for (;;) {
    const j = low.indexOf(kl, i)
    if (j < 0) {
      if (i < s.length) out.push({ t: s.slice(i), hit: false })
      break
    }
    if (j > i) out.push({ t: s.slice(i, j), hit: false })
    out.push({ t: s.slice(j, j + k.length), hit: true })
    i = j + k.length
  }
  return out
})

// 语音：假播放，只是为了好看
const playing = ref(false)
const bars = computed(() => {
  const n = Math.min(30, Math.max(14, Math.round((props.msg.seconds || 5) * 1.6)))
  return Array.from({ length: n }, (_, i) => 4 + Math.abs(Math.sin(i * 1.7 + props.msg.id)) * 13)
})
const togglePlay = () => {
  playing.value = !playing.value
  if (playing.value) setTimeout(() => (playing.value = false), (props.msg.seconds || 3) * 1000)
}
</script>

<template>
  <div class="row" :class="{ me: mine, fresh: msg.fresh }">
    <div class="bubble" :class="['t-' + msg.type, pos, { me: mine }]">
      <div v-if="showName" class="sname" :style="{ color: `var(--n${nidx})` }">{{ sname }}</div>

      <div v-if="msg.quote" class="quote">
        <b>{{ msg.quote.name }}</b>
        <span>{{ msg.quote.text }}</span>
      </div>

      <!-- 文字 -->
      <template v-if="msg.type === 'text'">
        <span class="txt"
          ><template v-for="(p, i) in parts" :key="i"
            ><mark v-if="p.hit">{{ p.t }}</mark
            ><template v-else>{{ p.t }}</template></template
          ></span
        ><span v-if="inline" class="spacer" :class="{ me: mine }"></span>
      </template>

      <!-- 图片 -->
      <svg
        v-else-if="msg.type === 'image'"
        class="photo"
        :viewBox="`0 0 ${msg.w} ${msg.h}`"
        :style="{ aspectRatio: msg.w + '/' + msg.h }"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect :width="msg.w" :height="msg.h" :fill="`hsl(${msg.hue} 40% 86%)`" />
        <circle :cx="msg.w * 0.75" :cy="msg.h * 0.26" :r="msg.h * 0.1" fill="rgba(255,255,255,.85)" />
        <path
          :d="`M0 ${msg.h} L0 ${msg.h * 0.66} L${msg.w * 0.22} ${msg.h * 0.4} L${msg.w * 0.4} ${msg.h * 0.62} L${msg.w * 0.58} ${msg.h * 0.34} L${msg.w * 0.82} ${msg.h * 0.64} L${msg.w} ${msg.h * 0.5} L${msg.w} ${msg.h} Z`"
          :fill="`hsl(${msg.hue} 36% 48%)`"
          opacity=".85"
        />
        <path
          :d="`M0 ${msg.h} L0 ${msg.h * 0.8} L${msg.w * 0.3} ${msg.h * 0.58} L${msg.w * 0.55} ${msg.h * 0.78} L${msg.w * 0.8} ${msg.h * 0.6} L${msg.w} ${msg.h * 0.76} L${msg.w} ${msg.h} Z`"
          :fill="`hsl(${msg.hue} 40% 33%)`"
        />
      </svg>

      <!-- 语音 -->
      <button v-else-if="msg.type === 'voice'" class="voice" @click="togglePlay">
        <span class="play"><Icon :name="playing ? 'pause' : 'play'" :size="14" /></span>
        <span class="vcol">
          <span class="wave" :class="{ playing }">
            <i v-for="(h, i) in bars" :key="i" :style="{ height: h + 'px', animationDelay: i * 40 + 'ms' }"></i>
          </span>
          <span class="dur">0:{{ String(msg.seconds).padStart(2, '0') }}</span>
        </span>
      </button>

      <!-- 文件 -->
      <div v-else-if="msg.type === 'file'" class="file">
        <span class="ficon"><Icon name="file" :size="20" /></span>
        <span class="finfo">
          <span class="fname">{{ msg.name }}</span>
          <span class="fsize">{{ msg.size }}</span>
        </span>
      </div>

      <!-- 链接 -->
      <div v-else-if="msg.type === 'link'" class="link">
        <div class="ltxt">
          <div class="lsrc">{{ msg.source }}</div>
          <div class="ltitle">{{ msg.title }}</div>
          <div class="ldesc">{{ msg.desc }}</div>
        </div>
        <div
          class="lthumb"
          :style="{ background: `hsl(${msg.hue} 45% 70%)` }"
        ></div>
      </div>

      <!-- 反应 + 时间 -->
      <div v-if="msg.reactions?.length || (!inline && msg.type !== 'image')" class="foot">
        <span class="rx">
          <span v-for="r in msg.reactions" :key="r.e" class="chip">{{ r.e }} {{ r.n }}</span>
        </span>
        <span class="meta"
          >{{ hm(msg.time) }}<Icon v-if="mine" name="checks" :size="15" class="tick"
        /></span>
      </div>
      <span v-else-if="inline" class="meta abs"
        >{{ hm(msg.time) }}<Icon v-if="mine" name="checks" :size="15" class="tick"
      /></span>
      <span v-else class="meta over"
        >{{ hm(msg.time) }}<Icon v-if="mine" name="checks" :size="15" class="tick"
      /></span>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  max-width: 100%;
}
.row.me {
  justify-content: flex-end;
}

.bubble {
  --r: 15px; /* 大圆角 */
  --s: 6px; /* 与同组相邻气泡接触的一侧 */
  --t: 4px; /* 组尾“小尾巴”，靠近头像 */
  position: relative;
  min-width: 0;
  background: var(--bubble-in);
  color: var(--text);
  padding: 6px 10px 7px;
  border-radius: var(--r);
  box-shadow: var(--bubble-shadow);
  font-size: 15px;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
}
.bubble.me {
  background: var(--bubble-out);
}
/* 对方：贴头像的左侧 */
.bubble.first:not(.me) { border-bottom-left-radius: var(--s); }
.bubble.mid:not(.me) { border-top-left-radius: var(--s); border-bottom-left-radius: var(--s); }
.bubble.last:not(.me) { border-top-left-radius: var(--s); border-bottom-left-radius: var(--t); }
.bubble.single:not(.me) { border-bottom-left-radius: var(--t); }
/* 自己：镜像到右侧 */
.bubble.first.me { border-bottom-right-radius: var(--s); }
.bubble.mid.me { border-top-right-radius: var(--s); border-bottom-right-radius: var(--s); }
.bubble.last.me { border-top-right-radius: var(--s); border-bottom-right-radius: var(--t); }
.bubble.single.me { border-bottom-right-radius: var(--t); }

.bubble.t-image {
  padding: 0;
  overflow: hidden;
  white-space: normal;
}
.bubble.t-file,
.bubble.t-link,
.bubble.t-voice {
  white-space: normal;
}

/* 只有新发/新收的消息才有入场动画，切会话时不会整屏一起动 */
.row.fresh .bubble { animation: pop 0.18s ease-out; }
@keyframes pop { from { opacity: 0; transform: translateY(3px); } }

.sname {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  margin-bottom: 2px;
}

mark {
  background: var(--mark);
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}

/* ---- 时间 / 已读 ---- */
.meta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  line-height: 1;
  color: var(--time-in);
  white-space: nowrap;
  user-select: none;
}
.bubble.me .meta { color: var(--time-out); }
.meta.abs {
  position: absolute;
  right: 9px;
  bottom: 6px;
}
.tick { margin-left: 1px; }
/* 给文字最后一行右下角的时间留位置 */
.spacer {
  display: inline-block;
  width: 40px;
  height: 1px;
}
.spacer.me { width: 62px; }

/* 图片上的时间：半透明深色小标签（Telegram 做法） */
.meta.over {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 3px 7px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.42);
  color: #fff !important;
}

.foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin-top: 3px;
}
.rx {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.chip {
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--quote-in);
  color: var(--primary);
}
.bubble.me .chip {
  background: var(--quote-out);
  color: var(--out-accent);
}

/* ---- 引用 ---- */
.quote {
  border-left: 2px solid var(--primary);
  background: var(--quote-in);
  border-radius: 4px;
  padding: 3px 8px;
  margin: 2px 0 4px;
  font-size: 14px;
  line-height: 1.35;
  display: flex;
  flex-direction: column;
  white-space: normal;
}
.bubble.me .quote {
  border-left-color: var(--out-accent);
  background: var(--quote-out);
}
.quote b {
  font-weight: 500;
  color: var(--primary);
}
.bubble.me .quote b { color: var(--out-accent); }
.quote span {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ---- 图片 ---- */
.photo {
  display: block;
  width: 300px;
  max-width: 100%;
}

/* ---- 语音 ---- */
.voice {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 230px;
  padding: 1px 0;
}
.play {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--primary-ink);
  display: grid;
  place-items: center;
  flex: none;
}
.bubble.me .play { background: var(--out-accent); color: #fff; }
.vcol {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}
.wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 18px;
}
.wave i {
  width: 2.5px;
  border-radius: 2px;
  background: var(--primary);
  opacity: 0.45;
}
.bubble.me .wave i { background: var(--out-accent); }
.wave.playing i {
  animation: beat 0.7s ease-in-out infinite alternate;
  opacity: 0.9;
}
@keyframes beat { to { transform: scaleY(0.45); } }
.dur {
  font-size: 12px;
  color: var(--time-in);
}
.bubble.me .dur { color: var(--time-out); }

/* ---- 文件 ---- */
.file {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 230px;
  padding: 1px 0;
}
.ficon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--primary-ink);
  display: grid;
  place-items: center;
  flex: none;
}
.bubble.me .ficon { background: var(--out-accent); color: #fff; }
.finfo { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.fname { font-weight: 500; font-size: 15px; }
.fsize { font-size: 13px; color: var(--text-2); }

/* ---- 链接预览 ---- */
.link {
  display: flex;
  gap: 12px;
  width: 300px;
  max-width: 100%;
  border-left: 2px solid var(--primary);
  padding-left: 9px;
  margin: 2px 0;
}
.bubble.me .link { border-left-color: var(--out-accent); }
.ltxt { flex: 1; min-width: 0; }
.lsrc { font-size: 14px; font-weight: 500; color: var(--primary); }
.bubble.me .lsrc { color: var(--out-accent); }
.ltitle { font-weight: 500; line-height: 1.35; }
.ldesc { font-size: 14px; color: var(--text-2); line-height: 1.35; margin-top: 1px; }
.lthumb { width: 54px; height: 54px; border-radius: 6px; flex: none; }
</style>
