# 第4课作业：窗口管理与自定义

## 作业说明

完成本作业以巩固第四课的学习内容。作业分为**必做部分**和**选做部分**，请至少完成必做部分。

## 作业要求

### 必做作业（必须全部完成）

#### 任务1：创建多个窗口
- [ ] 在`tauri.conf.json`中配置两个窗口
  - 第一个窗口：主窗口（label: "main"），标题"主窗口"，大小1200x800
  - 第二个窗口：辅助窗口（label: "secondary"），标题"辅助窗口"，大小800x600
  - 第二个窗口初始状态为隐藏（visible: false）
- [ ] 理解`label`的作用和窗口标识符的概念
- [ ] 验证两个窗口都能正常创建

#### 任务2：动态控制窗口
- [ ] 添加窗口操作权限到`capabilities/default.json`
  - 至少包含：`core:window:allow-create`, `core:window:allow-show`, `core:window:allow-hide`
- [ ] 在前端创建窗口控制界面
  - 添加按钮：显示/隐藏辅助窗口
  - 添加按钮：设置主窗口标题
  - 添加按钮：设置主窗口大小（至少两个不同尺寸）
- [ ] 实现窗口控制功能
  - 点击按钮能够控制窗口的显示/隐藏
  - 能够动态修改窗口标题和大小

#### 任务3：窗口事件处理
- [ ] 监听主窗口的关闭事件
  - 在控制台输出"窗口即将关闭"
  - 可以尝试阻止关闭（可选）
- [ ] 监听窗口大小改变事件
  - 在控制台输出新的窗口大小
  - 或者在界面上显示当前窗口大小
- [ ] 监听窗口焦点事件
  - 在控制台输出窗口焦点状态

#### 任务4：理解窗口管理
- [ ] 说明窗口标识符（label）的作用
- [ ] 说明如何通过API获取特定窗口
- [ ] 说明窗口创建和销毁的流程
- [ ] 记录在笔记文档中

### 选做作业（加分项）

#### 任务5：窗口管理器（选做）
- [ ] 创建一个窗口管理器界面
- [ ] 显示所有打开的窗口列表
- [ ] 可以切换、关闭窗口
- [ ] 显示每个窗口的状态（是否可见、大小等）

#### 任务6：自定义窗口样式（选做）
- [ ] 创建无边框窗口（decorations: false）
- [ ] 实现自定义标题栏
- [ ] 添加窗口拖拽功能
- [ ] 添加最小化、最大化、关闭按钮

#### 任务7：窗口间通信（选做）
- [ ] 实现主窗口和辅助窗口的通信
- [ ] 主窗口可以发送消息到辅助窗口
- [ ] 辅助窗口可以接收并显示消息
- [ ] 实现双向通信

## 提交要求

### 提交内容

1. **项目代码**
   - 完整的TAURI项目目录
   - 确保所有窗口配置正确
   - 确保窗口控制功能正常

2. **代码说明文档**（可选但推荐）
   - 创建一个`docs/homework/homework-04-windows.md`文件
   - 记录创建的窗口及其功能
   - 说明窗口管理的实现方式
   - 记录遇到的问题和解决方法

3. **窗口管理说明**（任务4）
   - 说明窗口标识符的作用
   - 说明窗口API的使用方法
   - 记录在笔记文档中

### 提交方式

1. 将项目代码提交到Git仓库
2. 在提交信息中说明完成了哪些任务
3. 如果创建了说明文档，一并提交

### 检查标准

我会检查以下内容：

✅ **窗口配置**：多个窗口正确定义并配置  
✅ **窗口控制**：能够动态控制窗口属性  
✅ **事件处理**：正确监听和处理窗口事件  
✅ **权限配置**：窗口相关权限正确配置  
✅ **代码质量**：代码结构清晰，有适当注释  
✅ **功能实现**：所有必做任务的功能都已实现  
✅ **Git提交**：代码已提交到Git仓库，提交信息清晰

## 作业提示

### 添加窗口权限

在`src-tauri/capabilities/default.json`中添加：

```json
{
  "permissions": [
    "core:default",
    "opener:default",
    "core:window:allow-create",
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-close",
    "core:window:allow-set-title",
    "core:window:allow-set-size"
  ]
}
```

### 获取窗口示例

```javascript
import { getCurrentWindow, Window } from "@tauri-apps/api/window";

// 获取当前窗口
const mainWindow = getCurrentWindow();

// 获取指定窗口
const secondaryWindow = Window.getByLabel("secondary");
```

### 窗口控制示例

```javascript
// 显示窗口
await secondaryWindow.show();

// 隐藏窗口
await secondaryWindow.hide();

// 设置标题
await mainWindow.setTitle("新标题");

// 设置大小
await mainWindow.setSize({ width: 1000, height: 700 });
```

### 事件监听示例

```javascript
import { listen } from "@tauri-apps/api/event";

// 监听窗口关闭
await mainWindow.onCloseRequested((event) => {
  console.log("窗口即将关闭");
});

// 监听窗口大小改变
await mainWindow.onResized((size) => {
  console.log("窗口大小:", size);
});
```

## 完成作业后

完成作业后，请告诉我：
1. 已完成的任务列表
2. 创建的窗口及其功能
3. 遇到的任何问题
4. 需要我检查的Git提交哈希（如果有）

我会检查你的作业，通过后我们再进行第5课的学习。

---

**加油！相信你能完成得很好！** 💪

