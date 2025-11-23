# 第4课学习笔记：窗口管理与自定义

## 课程信息
- **课程编号**：第4课
- **课程标题**：窗口管理与自定义
- **学习日期**：2024年
- **学习时长**：约2小时

## 遇到的问题

### 问题1：窗口无法通过X按钮关闭
- **问题描述**：点击窗口右上角的X按钮无法关闭窗口
- **错误信息**：`window.destroy not allowed. Permissions associated with this command: core:window:allow-destroy`
- **问题原因**：缺少 `core:window:allow-destroy` 权限
- **解决方法**：在 `capabilities/default.json` 中添加 `"core:window:allow-destroy"` 权限
- **相关资源**：TAURI 2.0 权限系统文档

### 问题2：辅助窗口无法显示/隐藏
- **问题描述**：点击"显示/隐藏辅助窗口"按钮时报错 `isVisible is not a function`
- **错误信息**：`TypeError: secondaryWindow.isVisible is not a function`
- **问题原因**：`Window.getByLabel()` 返回的是 Promise，需要使用 `await` 等待解析
- **解决方法**：
  1. 在 `Window.getByLabel("secondary")` 前添加 `await`
  2. 在 `Window.getAll()` 前也添加 `await`
  3. 确保所有异步操作都正确等待
- **相关资源**：TAURI 2.0 Window API 文档

### 问题3：窗口大小设置不生效
- **问题描述**：调用 `setSize()` 方法后窗口大小没有改变
- **错误信息**：无明确错误，但功能不工作
- **问题原因**：TAURI 2.0 需要使用 `LogicalSize` 类型
- **解决方法**：使用 `new LogicalSize(width, height)` 而不是直接传递对象
- **相关资源**：TAURI 2.0 Window API 文档

## 知识点总结

### 1. 窗口标识符（Label）

**作用**：
- 窗口标识符（label）是窗口的唯一标识
- 用于区分不同的窗口实例
- 通过 label 可以获取和控制特定的窗口

**使用场景**：
```javascript
// 在配置文件中定义
{
  "label": "main",      // 主窗口
  "label": "secondary"  // 辅助窗口
}

// 在代码中获取窗口
const secondaryWindow = await Window.getByLabel("secondary");
```

**注意事项**：
- label 必须是唯一的
- label 在窗口创建后不能修改
- 通过 label 可以跨窗口通信

### 2. 窗口API的使用方法

#### 获取窗口
```javascript
import { getCurrentWindow, Window } from "@tauri-apps/api/window";

// 获取当前窗口
const mainWindow = getCurrentWindow();

// 获取指定窗口（需要await，返回Promise）
const secondaryWindow = await Window.getByLabel("secondary");

// 获取所有窗口
const allWindows = await Window.getAll();
```

#### 窗口控制
```javascript
// 显示/隐藏
await window.show();
await window.hide();

// 设置属性
await window.setTitle("新标题");
await window.setSize(new LogicalSize(1000, 700));
await window.center();

// 检查状态
const isVisible = await window.isVisible();
```

**关键点**：
- 所有窗口操作都是异步的，需要使用 `await`
- `Window.getByLabel()` 返回 Promise，必须使用 `await`
- TAURI 2.0 使用 `LogicalSize` 类型设置窗口大小

### 3. 窗口创建和销毁的流程

#### 创建流程
1. **配置文件定义**：在 `tauri.conf.json` 中定义窗口配置
2. **应用启动**：TAURI 根据配置创建窗口
3. **前端获取**：通过 `getCurrentWindow()` 或 `Window.getByLabel()` 获取窗口对象
4. **动态控制**：通过窗口API控制窗口属性

#### 销毁流程
1. **用户操作**：用户点击关闭按钮或调用 `window.close()`
2. **事件触发**：触发 `onCloseRequested` 事件
3. **权限检查**：检查是否有 `core:window:allow-destroy` 权限
4. **窗口销毁**：如果权限允许，窗口被销毁

**注意事项**：
- 窗口关闭需要 `core:window:allow-destroy` 权限
- 可以在 `onCloseRequested` 事件中调用 `event.preventDefault()` 阻止关闭
- 窗口销毁后，窗口对象不再可用

### 4. 窗口事件监听

#### 关闭事件
```javascript
await mainWindow.onCloseRequested((event) => {
  console.log("窗口即将关闭");
  // 可以阻止关闭
  // event.preventDefault();
});
```

#### 大小改变事件
```javascript
await mainWindow.onResized((size) => {
  console.log("窗口大小改变:", size);
  // size 是 PhysicalSize 对象
  setWindowSize(`${size.width}x${size.height}`);
});
```

#### 焦点事件
```javascript
await mainWindow.onFocusChanged((focused) => {
  console.log("窗口焦点状态:", focused);
  // focused 是 boolean 值
});
```

**关键点**：
- 所有事件监听都是异步的，需要使用 `await`
- 事件处理函数接收事件对象或数据作为参数
- 可以在事件处理函数中执行自定义逻辑

### 5. 权限配置

**必需的窗口权限**：
```json
{
  "permissions": [
    "core:window:allow-create",    // 创建窗口
    "core:window:allow-show",      // 显示窗口
    "core:window:allow-hide",      // 隐藏窗口
    "core:window:allow-close",     // 关闭窗口
    "core:window:allow-destroy",   // 销毁窗口（关闭必需）
    "core:window:allow-set-title", // 设置标题
    "core:window:allow-set-size",   // 设置大小
    "core:window:allow-set-position", // 设置位置
    "core:window:allow-center"     // 居中窗口
  ]
}
```

**注意事项**：
- 每个窗口操作都需要对应的权限
- 权限配置在 `capabilities/default.json` 中
- 权限列表需要包含所有窗口的 label

## 心得体会

### 学习收获
1. **理解了窗口管理系统**：学会了如何创建、控制和销毁窗口
2. **掌握了异步编程**：理解了 Promise 和 async/await 的使用
3. **熟悉了权限系统**：了解了 TAURI 2.0 的权限机制
4. **学会了事件处理**：掌握了窗口事件的监听和处理

### 难点分析
1. **异步操作**：窗口API都是异步的，需要正确使用 `await`
2. **权限配置**：需要明确知道每个操作需要什么权限
3. **类型系统**：TAURI 2.0 使用特定的类型（如 `LogicalSize`）

### 改进建议
1. **代码组织**：将窗口控制逻辑封装成独立的函数
2. **错误处理**：添加更完善的错误处理和用户提示
3. **状态管理**：使用状态管理库管理窗口状态

## 参考资料
- [TAURI 2.0 Window API 文档](https://v2.tauri.app/api/js/window/)
- [TAURI 2.0 权限系统](https://v2.tauri.app/develop/security/permissions/)
- [TAURI 2.0 配置文档](https://v2.tauri.app/develop/config/)

