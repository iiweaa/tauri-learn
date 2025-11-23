# 第4课作业完成说明：窗口管理与自定义

## 作业完成情况

### ✅ 任务1：创建多个窗口

#### 窗口配置
在 `src-tauri/tauri.conf.json` 中配置了两个窗口：

1. **主窗口（main）**
   - Label: `"main"`
   - 标题: `"主窗口"`
   - 大小: 1200x800
   - 最小大小: 500x400
   - 居中显示: `true`
   - 可关闭: `true`

2. **辅助窗口（secondary）**
   - Label: `"secondary"`
   - 标题: `"辅助窗口"`
   - 大小: 800x600
   - 最小大小: 400x300
   - 居中显示: `true`
   - 初始状态: 隐藏（`visible: false`）
   - 可关闭: `true`

#### 窗口标识符的作用
- **唯一标识**：每个窗口通过 label 唯一标识
- **窗口获取**：通过 `Window.getByLabel(label)` 获取特定窗口
- **权限控制**：在 `capabilities/default.json` 中通过 label 指定窗口权限

### ✅ 任务2：动态控制窗口

#### 权限配置
在 `src-tauri/capabilities/default.json` 中添加了完整的窗口权限：
- `core:window:allow-create` - 创建窗口
- `core:window:allow-show` - 显示窗口
- `core:window:allow-hide` - 隐藏窗口
- `core:window:allow-close` - 关闭窗口
- `core:window:allow-destroy` - 销毁窗口
- `core:window:allow-set-title` - 设置标题
- `core:window:allow-set-size` - 设置大小
- `core:window:allow-set-position` - 设置位置
- `core:window:allow-center` - 居中窗口

#### 窗口控制界面
在 `src/App.jsx` 中实现了完整的窗口控制界面：

1. **显示/隐藏辅助窗口**
   - 按钮：`显示/隐藏辅助窗口`
   - 功能：切换辅助窗口的显示状态
   - 实现：`toggleSecondaryWindow()` 函数

2. **设置主窗口标题**
   - 输入框：输入新标题
   - 按钮：`设置窗口标题`
   - 功能：动态修改主窗口标题
   - 实现：`setMainWindowTitle()` 函数

3. **设置主窗口大小**
   - 三个按钮：
     - `设置大小：1000x700`
     - `设置大小：1200x800`
     - `设置大小：800x600`
   - 功能：动态修改主窗口大小
   - 实现：`setMainWindowSize()` 函数，使用 `LogicalSize` 类型

4. **居中窗口**
   - 按钮：`居中窗口`
   - 功能：将主窗口居中显示
   - 实现：`centerMainWindow()` 函数

#### 窗口信息显示
- 显示当前窗口大小：`当前窗口大小：{windowSize}`

### ✅ 任务3：窗口事件处理

#### 事件监听实现
在 `src/App.jsx` 的 `useEffect` 中实现了三个窗口事件监听：

1. **关闭事件监听**
   ```javascript
   await mainWindow.onCloseRequested((event) => {
     console.log("窗口即将关闭");
   });
   ```
   - 功能：监听窗口关闭请求
   - 输出：控制台显示"窗口即将关闭"
   - 注意：不阻止关闭，允许窗口正常关闭

2. **大小改变事件监听**
   ```javascript
   await mainWindow.onResized((size) => {
     console.log("窗口大小改变:", size);
     setWindowSize(`${size.width}x${size.height}`);
   });
   ```
   - 功能：监听窗口大小改变
   - 输出：控制台显示新的窗口大小
   - UI更新：界面显示当前窗口大小

3. **焦点事件监听**
   ```javascript
   await mainWindow.onFocusChanged((focused) => {
     console.log("窗口焦点状态:", focused);
   });
   ```
   - 功能：监听窗口焦点变化
   - 输出：控制台显示窗口焦点状态（true/false）

### ✅ 任务4：理解窗口管理

#### 窗口标识符的作用
- **唯一标识**：每个窗口通过 label 唯一标识，用于区分不同的窗口实例
- **窗口获取**：通过 `Window.getByLabel(label)` 可以获取特定窗口对象
- **权限控制**：在权限配置中通过 label 指定哪些窗口可以使用哪些权限

#### 如何通过API获取特定窗口
```javascript
import { Window } from "@tauri-apps/api/window";

// 方法1：通过 label 获取（推荐）
const secondaryWindow = await Window.getByLabel("secondary");

// 方法2：获取所有窗口后查找
const allWindows = await Window.getAll();
const secondaryWindow = allWindows.find(w => w.label === "secondary");
```

**注意事项**：
- `Window.getByLabel()` 返回 Promise，必须使用 `await`
- 如果窗口不存在，会返回 `null` 或抛出错误
- 建议添加错误处理

#### 窗口创建和销毁的流程

**创建流程**：
1. 在 `tauri.conf.json` 中定义窗口配置（label、title、size等）
2. 应用启动时，TAURI 根据配置自动创建窗口
3. 前端通过 `getCurrentWindow()` 或 `Window.getByLabel()` 获取窗口对象
4. 通过窗口API控制窗口属性（显示/隐藏、标题、大小等）

**销毁流程**：
1. 用户点击关闭按钮或调用 `window.close()`
2. 触发 `onCloseRequested` 事件
3. 检查是否有 `core:window:allow-destroy` 权限
4. 如果权限允许，窗口被销毁
5. 窗口对象不再可用

**关键点**：
- 窗口关闭需要 `core:window:allow-destroy` 权限
- 可以在 `onCloseRequested` 中调用 `event.preventDefault()` 阻止关闭
- 窗口销毁后，所有窗口对象引用失效

## 实现的功能

### 窗口管理功能
1. ✅ 创建多个窗口（主窗口 + 辅助窗口）
2. ✅ 动态显示/隐藏辅助窗口
3. ✅ 动态设置窗口标题
4. ✅ 动态设置窗口大小（三个预设尺寸）
5. ✅ 窗口居中功能
6. ✅ 窗口关闭功能（修复了权限问题）

### 事件监听功能
1. ✅ 窗口关闭事件监听
2. ✅ 窗口大小改变事件监听
3. ✅ 窗口焦点事件监听

### UI功能
1. ✅ 窗口控制界面
2. ✅ 当前窗口大小显示
3. ✅ 用户友好的按钮和输入框

## 遇到的问题和解决方法

### 问题1：窗口无法关闭
- **问题**：点击X按钮无法关闭窗口
- **原因**：缺少 `core:window:allow-destroy` 权限
- **解决**：在 `capabilities/default.json` 中添加该权限

### 问题2：辅助窗口无法显示/隐藏
- **问题**：`isVisible is not a function` 错误
- **原因**：`Window.getByLabel()` 返回 Promise，没有使用 `await`
- **解决**：在所有窗口获取操作前添加 `await`

### 问题3：窗口大小设置不生效
- **问题**：调用 `setSize()` 后窗口大小没有改变
- **原因**：TAURI 2.0 需要使用 `LogicalSize` 类型
- **解决**：使用 `new LogicalSize(width, height)` 而不是直接传递对象

## 代码结构

### 主要文件
- `src-tauri/tauri.conf.json` - 窗口配置
- `src-tauri/capabilities/default.json` - 权限配置
- `src/App.jsx` - 前端窗口控制逻辑

### 主要函数
- `toggleSecondaryWindow()` - 切换辅助窗口显示/隐藏
- `setMainWindowTitle()` - 设置主窗口标题
- `setMainWindowSize()` - 设置主窗口大小
- `centerMainWindow()` - 居中主窗口
- `useEffect` - 窗口事件监听设置

## 总结

本次作业成功实现了TAURI窗口管理的核心功能：
- ✅ 多窗口创建和配置
- ✅ 动态窗口控制
- ✅ 窗口事件监听
- ✅ 权限配置

通过本次作业，深入理解了TAURI的窗口管理系统，掌握了窗口创建、控制、事件处理等核心概念。同时也学会了如何调试和解决权限相关的问题。

