export const pad = (n) => String(n).padStart(2, '0')
const WEEK = ['日', '一', '二', '三', '四', '五', '六']

export const hm = (t) => {
  const d = new Date(t)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const startOfDay = (t) => {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
export const dayKey = (t) => startOfDay(t)
const dayDiff = (t) => Math.round((startOfDay(Date.now()) - startOfDay(t)) / 86400000)

// 会话列表右侧时间
export const listTime = (t) => {
  const diff = dayDiff(t)
  const d = new Date(t)
  if (diff <= 0) return hm(t)
  if (diff === 1) return '昨天'
  if (diff < 7) return `周${WEEK[d.getDay()]}`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 吸顶日期标签
export const dayLabel = (t) => {
  const diff = dayDiff(t)
  const d = new Date(t)
  if (diff <= 0) return '今天'
  if (diff === 1) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日 周${WEEK[d.getDay()]}`
}

export const previewOf = (m) => {
  if (!m) return ''
  switch (m.type) {
    case 'image':
      return '[图片]'
    case 'voice':
      return '[语音]'
    case 'file':
      return '[文件] ' + m.name
    case 'link':
      return '[链接] ' + m.title
    case 'sticker':
      return '[表情]'
    default:
      return m.text || ''
  }
}

// 7 种「身份色」：头像底色 + 发言人名字颜色共用同一序号（纯色，不用渐变）
export const AVATAR_COLORS = ['#e17076', '#eda86c', '#a695e7', '#7bc862', '#6ec9cb', '#65aadd', '#ee7aae']
export const peerIdx = (hue) => Math.floor((((hue ?? 0) % 360) / 360) * 7)
