// 纯演示数据：全部是编的，不读取任何真实聊天记录。
let uid = 0

// T(几天前, 时, 分)
const T = (d, h, m) => {
  const x = new Date()
  x.setHours(h, m, 0, 0)
  x.setDate(x.getDate() - d)
  return x.getTime()
}

const text = (from, t, time, extra = {}) => ({ id: ++uid, from, type: 'text', text: t, time, ...extra })
const sys = (t, time) => ({ id: ++uid, from: 'system', type: 'system', text: t, time })
const mk = (from, type, time, extra) => ({ id: ++uid, from, type, time, ...extra })

const ME = { id: 'me', name: '我', hue: 160 }

export const conversations = [
  {
    id: 1,
    name: '周末爬山小分队',
    group: true,
    hue: 150,
    pinned: true,
    muted: false,
    unread: 3,
    members: {
      me: ME,
      jie: { id: 'jie', name: '阿杰', hue: 20 },
      lu: { id: 'lu', name: '小鹿', hue: 330 },
      wang: { id: 'wang', name: '老王', hue: 215 },
      qing: { id: 'qing', name: '晓晴', hue: 275 },
    },
    replies: ['哈哈哈同意', '那就这么定了！', '收到', '我可以', '+1', '到时候群里再喊一下'],
    messages: [
      sys('阿杰 邀请 晓晴 加入了群聊', T(3, 20, 1)),
      text('qing', '大家好，第一次参加，请多关照', T(3, 20, 3)),
      text('jie', '欢迎欢迎！装备不用太复杂，鞋底防滑就行', T(3, 20, 5)),
      text('lu', '我把上次的路线图发一下', T(3, 20, 6)),
      mk('lu', 'file', T(3, 20, 6), { name: '香山路线-v3.pdf', size: '2.4 MB', ext: 'pdf' }),
      text('jie', '顺便说下这周的安排：', T(3, 20, 8)),
      text('jie', '1. 早上 8:00 东门集合，别迟到', T(3, 20, 8)),
      text('jie', '2. 路线走南坡上、北坡下，全程大概 9 公里', T(3, 20, 9)),
      text('jie', '3. 中午在山腰的凉亭吃自带的午饭，记得带垃圾袋', T(3, 20, 9)),
      text('jie', '4. 下午四点前下撤，天黑得早，安全第一', T(3, 20, 10)),
      text('jie', '有问题随时在群里问', T(3, 20, 10)),
      text('wang', '这个版本我看了，北坡那段是不是封了？', T(2, 9, 12)),
      text('jie', '上周封的，这周应该开了，我再确认下', T(2, 9, 20), {
        quote: { name: '老王', text: '这个版本我看了，北坡那段是不是封了？' },
      }),
      mk('wang', 'voice', T(2, 9, 31), { seconds: 12 }),
      text('lu', '老王又发语音，地铁上没法听', T(2, 9, 33), { reactions: [{ e: '😂', n: 2 }] }),
      sys('老王 撤回了一条消息', T(2, 9, 40)),
      text('wang', '文字版：我周六早上八点能到东门，别迟到', T(2, 9, 41)),
      mk('me', 'image', T(1, 18, 22), { w: 320, h: 220, hue: 150, caption: '' }),
      text('me', '上次拍的，这周天气应该也不错', T(1, 18, 23)),
      text('qing', '好美，我也想拍这种', T(1, 18, 30), { reactions: [{ e: '❤️', n: 2 }, { e: '👍', n: 1 }] }),
      mk('jie', 'link', T(1, 19, 2), {
        title: '周六天气预报：晴，12–21°C',
        desc: '早晚温差大，建议带一件薄外套。',
        source: '天气',
        hue: 205,
      }),
      text('lu', '周六见！', T(1, 19, 5)),
      text('jie', '那就这么定了：周六 8:00 东门集合', T(0, 8, 41)),
      text('wang', '收到，我带保温杯和零食', T(0, 8, 44)),
      text('qing', '我需要带什么吗？', T(0, 9, 2)),
      text('lu', '带水就行', T(0, 9, 5)),
    ],
  },
  {
    id: 2,
    name: '林小夏',
    group: false,
    hue: 345,
    pinned: true,
    muted: false,
    unread: 0,
    members: { me: ME, xia: { id: 'xia', name: '林小夏', hue: 345 } },
    replies: ['嗯嗯', '好呀', '哈哈哈哈', '等我一下', '我也这么想'],
    messages: [
      text('xia', '在吗？', T(1, 21, 10)),
      text('me', '在，刚到家', T(1, 21, 12)),
      text('xia', '今天看的那部电影，你觉得结局怎么样？', T(1, 21, 13)),
      text('me', '前面铺垫挺足的，结尾有点仓促', T(1, 21, 15)),
      text('xia', '我也觉得！但配乐真的太绝了', T(1, 21, 16), {
        quote: { name: '我', text: '前面铺垫挺足的，结尾有点仓促' },
      }),
      mk('xia', 'voice', T(1, 21, 18), { seconds: 27 }),
      mk('me', 'voice', T(1, 21, 21), { seconds: 8 }),
      mk('xia', 'image', T(0, 12, 30), { w: 320, h: 240, hue: 25 }),
      text('xia', '今天的午饭', T(0, 12, 30)),
      text('me', '看起来好吃，哪家？', T(0, 12, 41)),
      text('xia', '公司楼下新开的，周五一起去？', T(0, 12, 43)),
      text('me', '可以，约 12:15', T(0, 12, 45), { reactions: [{ e: '👌', n: 1 }] }),
    ],
  },
  {
    id: 3,
    name: '产品设计评审群',
    group: true,
    hue: 235,
    pinned: false,
    muted: true,
    unread: 12,
    members: {
      me: ME,
      mo: { id: 'mo', name: 'Momo', hue: 300 },
      ken: { id: 'ken', name: 'Ken', hue: 45 },
      sam: { id: 'sam', name: 'Sam', hue: 190 },
    },
    replies: ['已更新', '我看下', '稍后给到', '没问题'],
    messages: [
      text('mo', '新版聊天页的设计稿我传到共享盘了', T(5, 15, 2)),
      mk('mo', 'file', T(5, 15, 2), { name: '聊天页-设计稿.fig', size: '18.7 MB', ext: 'fig' }),
      text('ken', '气泡的圆角能再大一点吗？现在偏硬', T(5, 15, 20)),
      text('sam', '同意，另外深色模式下自己发的消息对比度偏低', T(5, 15, 26)),
      text('mo', '好，今天改完', T(5, 15, 30), { reactions: [{ e: '👍', n: 2 }] }),
      mk('ken', 'link', T(4, 10, 11), {
        title: 'IM 消息气泡的 8 个细节',
        desc: '分组、时间戳、已读状态：一篇讲清楚。',
        source: 'design.example.com',
        hue: 255,
      }),
      text('sam', '第 5 条很有用，连续消息只显示一次头像', T(4, 10, 40)),
      text('me', '阅读器场景可以先只做只读，输入框收起来', T(3, 14, 5)),
      text('mo', '同时加个“阅读模式”开关', T(3, 14, 8)),
      mk('mo', 'file', T(2, 11, 0), { name: '消息类型清单.xlsx', size: '86 KB', ext: 'xls' }),
      text('ken', '周四评审，大家提前看下', T(0, 9, 30)),
    ],
  },
  {
    id: 4,
    name: '妈妈',
    group: false,
    hue: 30,
    pinned: false,
    muted: false,
    unread: 1,
    members: { me: ME, mom: { id: 'mom', name: '妈妈', hue: 30 } },
    replies: ['好的', '注意身体', '早点睡'],
    messages: [
      text('mom', '周末回来吃饭吗？', T(2, 18, 40)),
      text('me', '回，周六中午到', T(2, 19, 2)),
      text('mom', '好，给你做红烧肉', T(2, 19, 3)),
      
      text('mom', '天冷了，多穿点', T(0, 7, 50)),
    ],
  },
  {
    id: 5,
    name: '读书会',
    group: true,
    hue: 30,
    pinned: false,
    muted: false,
    unread: 0,
    members: {
      me: ME,
      an: { id: 'an', name: '安然', hue: 90 },
      bo: { id: 'bo', name: '阿博', hue: 250 },
    },
    replies: ['这段我也很喜欢', '下次聊聊这个'],
    messages: [
      text('an', '本周共读到第 4 章，有什么想聊的？', T(6, 20, 0)),
      text('bo', '“好的设计是尽可能少的设计”——放在今天依旧成立', T(6, 20, 12)),
      text('me', '我更喜欢作者说的：克制不是偷懒，是取舍', T(6, 20, 20)),
      text('an', '这句要记下来', T(6, 20, 22), { reactions: [{ e: '👍', n: 2 }] }),
    ],
  },
  {
    id: 6,
    name: '文件传输助手',
    group: false,
    hue: 200,
    pinned: false,
    muted: false,
    unread: 0,
    members: { me: ME, fh: { id: 'fh', name: '文件传输助手', hue: 200 } },
    replies: [],
    messages: [
      text('me', '备忘：周四 15:00 评审', T(8, 11, 0)),
      mk('me', 'file', T(8, 11, 1), { name: 'notes.txt', size: '3 KB', ext: 'txt' }),
    ],
  },
]
