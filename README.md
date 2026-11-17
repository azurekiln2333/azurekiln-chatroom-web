# azurekiln-chatroom-web

仿 Telegram 风格的聊天界面，Vue 3 + Vite。目前用的是内置的演示数据，后续会接到聊天记录阅读器上。

## 功能

- 浮动的会话列表卡片，可拖拽调整宽度，宽度会记在本地
- 同一人连续发的消息合成一组，头像停在组底部并随滚动吸附
- 消息类型：文字、图片、语音、文件、链接预览、引用回复、表情反应、系统提示
- 日期标签吸顶、聊天记录搜索高亮、只读的阅读模式
- 浅色 / 深色主题、滚动时才出现的细滚动条
- 手机端：列表和聊天页分屏切换

## 开发

```bash
npm install
npm run dev      # 本地开发
npm run build    # 打包到 dist/
```

打包产物是单个 `dist/index.html`（JS、CSS 全部内联），双击就能直接打开，不需要起服务。

## 发布

推送到 `main` 或提 PR 时，GitHub Actions 会自动构建。推送 `v*` 标签会额外发布 Release，附带单文件 `.html` 和 `.zip`：

```bash
git tag v0.2.0
git push origin v0.2.0
```

## 目录

```
src/
  App.vue                     整体布局、主题、阅读模式
  mock.js                     演示数据
  components/
    ConversationList.vue      会话列表
    MessageList.vue           消息流（分组、日期吸顶）
    MessageBubble.vue         单条消息气泡
    Composer.vue              输入框
```
