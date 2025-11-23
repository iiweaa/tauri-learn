# 第4课：窗口管理与自定义

## 课程信息

- **课程编号**：第4课
- **课程标题**：窗口管理与自定义
- **学习目标**：
  - 掌握如何创建和管理多个窗口
  - 学会使用TAURI窗口API动态控制窗口
  - 理解窗口标识符（label）的作用
  - 学会自定义窗口样式和行为
  - 掌握窗口事件处理
  - 了解窗口间通信的方法
- **预计学习时间**：3-4小时
- **前置知识要求**：
  - 完成第1-3课的学习
  - 理解TAURI项目结构和配置
  - 掌握IPC通信机制

## 理论讲解

### 窗口管理概述

TAURI提供了强大的窗口管理功能，允许你：
- 创建多个窗口
- 动态控制窗口属性（大小、位置、标题等）
- 监听窗口事件
- 实现窗口间通信

### 窗口标识符（Label）

每个窗口都有一个唯一的标识符（label），用于：
- 区分不同的窗口
- 通过API操作特定窗口
- 配置窗口权限

### 窗口生命周期

```
创建窗口 → 显示窗口 → 用户交互 → 关闭窗口
    ↓         ↓          ↓          ↓
配置窗口   设置属性   事件处理   清理资源
```

## 实践操作

### 步骤1：在配置文件中创建多个窗口

#### 1.1 修改tauri.conf.json

编辑 `src-tauri/tauri.conf.json`，添加多个窗口：

```json
{
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "主窗口",
        "width": 1200,
        "height": 800,
        "minWidth": 500,
        "minHeight": 400,
        "center": true
      },
      {
        "label": "secondary",
        "title": "辅助窗口",
        "width": 800,
        "height": 600,
        "minWidth": 400,
        "minHeight": 300,
        "center": true,
        "visible": false
      }
    ]
  }
}
```

**关键点**：
- `label`：窗口的唯一标识符
- `visible: false`：窗口创建但不立即显示

### 步骤2：使用窗口API动态创建窗口

#### 2.1 添加窗口权限

编辑 `src-tauri/capabilities/default.json`：

```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "core:window:allow-create",
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-close",
    "core:window:allow-set-title",
    "core:window:allow-set-size",
    "core:window:allow-set-position"
  ]
}
```

#### 2.2 前端创建窗口

在 `src/App.jsx` 中：

```javascript
import { getCurrentWindow, Window } from "@tauri-apps/api/window";

// 创建新窗口
async function createNewWindow() {
  const appWindow = new Window("new-window", {
    url: "index.html",  // 或指定URL
    title: "新窗口",
    width: 600,
    height: 400,
    center: true,
  });
  
  await appWindow.show();
}
```

### 步骤3：动态控制窗口属性

#### 3.1 获取当前窗口

```javascript
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

// 设置窗口标题
await appWindow.setTitle("新标题");

// 设置窗口大小
await appWindow.setSize({ width: 1000, height: 700 });

// 设置窗口位置
await appWindow.setPosition({ x: 100, y: 100 });

// 居中窗口
await appWindow.center();

// 最大化/最小化
await appWindow.maximize();
await appWindow.minimize();
await appWindow.unmaximize();
await appWindow.unminimize();
```

#### 3.2 窗口显示/隐藏

```javascript
// 隐藏窗口
await appWindow.hide();

// 显示窗口
await appWindow.show();

// 关闭窗口
await appWindow.close();
```

### 步骤4：监听窗口事件

#### 4.1 监听窗口事件

```javascript
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";

const appWindow = getCurrentWindow();

// 监听窗口关闭事件
await appWindow.onCloseRequested((event) => {
  console.log("窗口即将关闭");
  // 可以阻止关闭
  // event.preventDefault();
});

// 监听窗口获得焦点
const unlistenFocus = await appWindow.onFocusChanged((focused) => {
  console.log("窗口焦点状态:", focused);
});

// 监听窗口大小改变
const unlistenResize = await appWindow.onResized((size) => {
  console.log("窗口大小:", size);
});

// 取消监听
// unlistenFocus();
// unlistenResize();
```

### 步骤5：窗口间通信

#### 5.1 通过事件系统通信

**发送窗口（窗口A）**：
```javascript
import { Window } from "@tauri-apps/api/window";

const otherWindow = Window.getByLabel("secondary");

// 向其他窗口发送事件
await otherWindow.emit("message-from-main", {
  text: "来自主窗口的消息"
});
```

**接收窗口（窗口B）**：
```javascript
import { listen } from "@tauri-apps/api/event";

// 监听来自其他窗口的事件
await listen("message-from-main", (event) => {
  console.log("收到消息:", event.payload);
});
```

### 步骤6：自定义窗口样式

#### 6.1 无边框窗口

在 `tauri.conf.json` 中：

```json
{
  "app": {
    "windows": [
      {
        "label": "main",
        "decorations": false,  // 无边框
        "transparent": true,   // 透明背景
        "width": 1200,
        "height": 800
      }
    ]
  }
}
```

#### 6.2 自定义窗口背景

在CSS中：

```css
body {
  background: transparent;
  border-radius: 10px;
  overflow: hidden;
}
```

## 常用窗口API

### 窗口属性获取

```javascript
// 获取窗口标题
const title = await appWindow.title();

// 获取窗口大小
const size = await appWindow.innerSize();

// 获取窗口位置
const position = await appWindow.innerPosition();

// 检查窗口是否最大化
const isMaximized = await appWindow.isMaximized();

// 检查窗口是否最小化
const isMinimized = await appWindow.isMinimized();

// 检查窗口是否可见
const isVisible = await appWindow.isVisible();
```

### 窗口操作

```javascript
// 设置始终置顶
await appWindow.setAlwaysOnTop(true);

// 设置可调整大小
await appWindow.setResizable(true);

// 设置最小尺寸
await appWindow.setMinSize({ width: 400, height: 300 });

// 设置最大尺寸
await appWindow.setMaxSize({ width: 1920, height: 1080 });
```

## 最佳实践

### 1. 窗口标识符命名

- 使用有意义的名称：`main`, `settings`, `about`
- 保持一致性：所有窗口使用相同的命名风格
- 避免特殊字符：只使用字母、数字、下划线

### 2. 窗口管理

- 合理使用窗口数量：避免创建过多窗口
- 及时关闭不需要的窗口：释放资源
- 保存窗口状态：记住用户偏好（大小、位置等）

### 3. 性能优化

- 延迟加载窗口：只在需要时创建
- 重用窗口：避免频繁创建和销毁
- 监听事件后记得取消：避免内存泄漏

## 练习任务

### 基础练习（必做）

1. **创建多个窗口**
   - 在配置文件中定义两个窗口
   - 理解label的作用
   - 测试窗口的显示和隐藏

2. **动态控制窗口**
   - 创建按钮控制窗口大小
   - 创建按钮控制窗口位置
   - 实现窗口居中功能

3. **窗口事件处理**
   - 监听窗口关闭事件
   - 监听窗口大小改变事件
   - 在控制台输出事件信息

### 进阶挑战（选做）

1. **窗口管理器**
   - 创建一个窗口管理器界面
   - 显示所有打开的窗口列表
   - 可以切换、关闭窗口

2. **自定义窗口样式**
   - 创建无边框窗口
   - 实现自定义标题栏
   - 添加窗口阴影效果

3. **窗口间通信**
   - 实现主窗口和辅助窗口的通信
   - 传递数据并在另一个窗口显示
   - 实现窗口同步（如主题切换）

## 总结与回顾

### 本节重点回顾

1. **窗口创建**：
   - 配置文件定义窗口
   - 使用API动态创建窗口

2. **窗口控制**：
   - 获取和设置窗口属性
   - 显示、隐藏、关闭窗口

3. **窗口事件**：
   - 监听窗口事件
   - 处理用户交互

4. **窗口通信**：
   - 通过事件系统通信
   - 传递数据

### 常见问题解答

**Q1: 如何获取特定窗口？**
A: 使用 `Window.getByLabel("label")` 获取指定label的窗口。

**Q2: 窗口关闭后如何重新打开？**
A: 可以保存窗口状态，需要时重新创建窗口。

**Q3: 可以创建多少个窗口？**
A: 理论上没有限制，但建议合理控制数量。

**Q4: 如何实现窗口拖拽？**
A: 无边框窗口需要自己实现拖拽功能，可以使用CSS和JavaScript。

**Q5: 窗口间如何共享数据？**
A: 可以通过事件系统、全局状态管理或后端存储实现。

### 下节预告

下一节课我们将学习：
- **文件系统操作**
  - 读取和写入文件
  - 目录操作
  - 文件对话框
  - 文件权限管理

---

**祝你学习愉快！如有问题，随时提问。** 🚀

