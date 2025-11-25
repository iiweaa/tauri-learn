# 第6课：系统通知与对话框

## 课程信息

- **课程编号**：第6课
- **课程标题**：系统通知与对话框
- **学习目标**：
  - 掌握系统通知的使用方法
  - 学会发送不同类型的通知
  - 掌握消息对话框的使用（确认、警告、错误）
  - 理解通知权限管理
  - 学会在应用中使用对话框提升用户体验
- **预计学习时间**：3-4小时
- **前置知识要求**：
  - 完成第1-5课的学习
  - 理解TAURI插件系统
  - 掌握权限配置方法
  - 了解异步编程（async/await）

## 理论讲解

### 系统通知概述

系统通知是桌面应用与用户交互的重要方式之一，它允许应用在后台运行时向用户发送提示信息。Tauri提供了通知插件，可以方便地集成系统通知功能。

**通知的特点**：
- 非阻塞：不会打断用户当前操作
- 系统级：使用操作系统原生通知机制
- 可配置：支持标题、内容、图标等自定义
- 权限控制：需要用户授权才能发送通知

### 对话框概述

对话框用于与用户进行交互，可以显示信息、警告、错误，或者获取用户确认。Tauri的对话框插件提供了多种类型的对话框。

**对话框类型**：
- **消息对话框**：显示信息、警告或错误消息
- **确认对话框**：获取用户确认（是/否）
- **文件对话框**：选择文件或目录（已在第5课学习）

### 插件系统

在TAURI 2.0中，通知和对话框功能都通过插件实现：
- `tauri-plugin-notification`：系统通知插件
- `tauri-plugin-dialog`：对话框插件（部分功能已在第5课使用）

## 实践操作

### 步骤1：安装通知插件

#### 1.1 添加Rust依赖

编辑 `src-tauri/Cargo.toml`：

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
tauri-plugin-fs = "2"
tauri-plugin-dialog = "2"
tauri-plugin-notification = "2"  # 添加通知插件
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

#### 1.2 注册插件

编辑 `src-tauri/src/lib.rs`：

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())  // 注册通知插件
        .invoke_handler(tauri::generate_handler![
            greet, 
            calculate, 
            get_timestamp, 
            get_system_info, 
            process_numbers, 
            safe_divide
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 1.3 配置权限

编辑 `src-tauri/capabilities/default.json`：

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main", "secondary"],
  "permissions": [
    "core:default",
    "opener:default",
    "core:window:allow-create",
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-close",
    "core:window:allow-destroy",
    "core:window:allow-set-title",
    "core:window:allow-set-size",
    "core:window:allow-set-position",
    "core:window:allow-center",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "fs:default",
    "fs:allow-read-file",
    "fs:allow-write-file",
    "fs:allow-write-text-file",
    "fs:allow-read-dir",
    "fs:allow-mkdir",
    "fs:allow-remove",
    "fs:allow-exists",
    "fs:allow-rename",
    "fs:allow-copy-file",
    "fs:write-all",
    "fs:write-files",
    "fs:allow-document-write",
    "fs:allow-document-write-recursive",
    "fs:allow-download-write",
    "fs:allow-download-write-recursive",
    "fs:allow-desktop-write",
    "fs:allow-desktop-write-recursive",
    "fs:allow-home-write",
    "fs:allow-home-write-recursive",
    "dialog:default",
    "dialog:allow-open",
    "dialog:allow-save",
    "dialog:allow-message",      // 消息对话框权限
    "dialog:allow-ask",           // 确认对话框权限
    "notification:default",      // 通知默认权限
    "notification:allow-is-permission-granted",  // 检查权限
    "notification:allow-request-permission",     // 请求权限
    "notification:allow-send"                    // 发送通知
  ]
}
```

#### 1.4 安装前端npm包

在 `my-first-tauri-app` 目录下运行：

```bash
npm install @tauri-apps/plugin-notification
```

### 步骤2：实现系统通知功能

#### 2.1 导入通知API

在 `src/App.jsx` 中添加导入：

```javascript
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
```

#### 2.2 检查并请求通知权限

```javascript
// 检查通知权限
async function checkNotificationPermission() {
  try {
    const granted = await isPermissionGranted();
    if (!granted) {
      const permission = await requestPermission();
      return permission === 'granted';
    }
    return granted;
  } catch (error) {
    console.error('检查通知权限失败:', error);
    return false;
  }
}
```

#### 2.3 发送通知

```javascript
// 发送通知
async function handleSendNotification() {
  try {
    const granted = await checkNotificationPermission();
    if (granted) {
      await sendNotification({
        title: '系统通知',
        body: '这是一条测试通知消息！',
        icon: undefined,  // 可选：自定义图标路径
      });
      alert('通知已发送！');
    } else {
      alert('用户未授予通知权限');
    }
  } catch (error) {
    console.error('发送通知失败:', error);
    alert('发送通知失败: ' + (error.message || String(error)));
  }
}
```

#### 2.4 发送不同类型的通知

```javascript
// 发送成功通知
async function sendSuccessNotification(message) {
  const granted = await checkNotificationPermission();
  if (granted) {
    await sendNotification({
      title: '操作成功',
      body: message,
    });
  }
}

// 发送错误通知
async function sendErrorNotification(message) {
  const granted = await checkNotificationPermission();
  if (granted) {
    await sendNotification({
      title: '操作失败',
      body: message,
    });
  }
}

// 发送警告通知
async function sendWarningNotification(message) {
  const granted = await checkNotificationPermission();
  if (granted) {
    await sendNotification({
      title: '警告',
      body: message,
    });
  }
}
```

### 步骤3：实现消息对话框功能

#### 3.1 导入对话框API

在 `src/App.jsx` 中添加导入（如果还没有）：

```javascript
import { message, ask } from '@tauri-apps/plugin-dialog';
```

#### 3.2 显示信息对话框

```javascript
// 显示信息对话框
async function handleShowInfoDialog() {
  try {
    await message('这是一个信息对话框，用于显示一般信息。', {
      title: '信息',
      kind: 'info',
    });
  } catch (error) {
    console.error('显示信息对话框失败:', error);
  }
}
```

#### 3.3 显示警告对话框

```javascript
// 显示警告对话框
async function handleShowWarningDialog() {
  try {
    await message('这是一个警告对话框，用于显示警告信息。', {
      title: '警告',
      kind: 'warning',
    });
  } catch (error) {
    console.error('显示警告对话框失败:', error);
  }
}
```

#### 3.4 显示错误对话框

```javascript
// 显示错误对话框
async function handleShowErrorDialog() {
  try {
    await message('这是一个错误对话框，用于显示错误信息。', {
      title: '错误',
      kind: 'error',
    });
  } catch (error) {
    console.error('显示错误对话框失败:', error);
  }
}
```

#### 3.5 显示确认对话框

```javascript
// 显示确认对话框
async function handleShowConfirmDialog() {
  try {
    const confirmed = await ask('确定要执行此操作吗？', {
      title: '确认',
      kind: 'warning',
    });
    
    if (confirmed) {
      alert('用户点击了"是"');
      // 执行确认后的操作
    } else {
      alert('用户点击了"否"');
      // 执行取消后的操作
    }
  } catch (error) {
    console.error('显示确认对话框失败:', error);
  }
}
```

### 步骤4：完整示例代码

在 `src/App.jsx` 中添加通知和对话框相关的状态和函数：

```javascript
import { useState } from "react";
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { message, ask } from '@tauri-apps/plugin-dialog';

function App() {
  // ... 其他状态 ...
  
  // 通知相关状态
  const [notificationTitle, setNotificationTitle] = useState('系统通知');
  const [notificationBody, setNotificationBody] = useState('这是一条测试通知消息！');
  
  // 检查通知权限
  async function checkNotificationPermission() {
    try {
      const granted = await isPermissionGranted();
      if (!granted) {
        const permission = await requestPermission();
        return permission === 'granted';
      }
      return granted;
    } catch (error) {
      console.error('检查通知权限失败:', error);
      return false;
    }
  }
  
  // 发送通知
  async function handleSendNotification() {
    try {
      const granted = await checkNotificationPermission();
      if (granted) {
        await sendNotification({
          title: notificationTitle || '系统通知',
          body: notificationBody || '这是一条测试通知消息！',
        });
        alert('通知已发送！');
      } else {
        alert('用户未授予通知权限');
      }
    } catch (error) {
      console.error('发送通知失败:', error);
      alert('发送通知失败: ' + (error.message || String(error)));
    }
  }
  
  // 显示信息对话框
  async function handleShowInfoDialog() {
    try {
      await message('这是一个信息对话框，用于显示一般信息。', {
        title: '信息',
        kind: 'info',
      });
    } catch (error) {
      console.error('显示信息对话框失败:', error);
    }
  }
  
  // 显示警告对话框
  async function handleShowWarningDialog() {
    try {
      await message('这是一个警告对话框，用于显示警告信息。', {
        title: '警告',
        kind: 'warning',
      });
    } catch (error) {
      console.error('显示警告对话框失败:', error);
    }
  }
  
  // 显示错误对话框
  async function handleShowErrorDialog() {
    try {
      await message('这是一个错误对话框，用于显示错误信息。', {
        title: '错误',
        kind: 'error',
      });
    } catch (error) {
      console.error('显示错误对话框失败:', error);
    }
  }
  
  // 显示确认对话框
  async function handleShowConfirmDialog() {
    try {
      const confirmed = await ask('确定要执行此操作吗？', {
        title: '确认',
        kind: 'warning',
      });
      
      if (confirmed) {
        await message('用户确认了操作', {
          title: '提示',
          kind: 'info',
        });
      } else {
        await message('用户取消了操作', {
          title: '提示',
          kind: 'info',
        });
      }
    } catch (error) {
      console.error('显示确认对话框失败:', error);
    }
  }
  
  return (
    <div className="container">
      {/* ... 其他UI ... */}
      
      {/* 通知功能区域 */}
      <div className="section">
        <h2>系统通知</h2>
        <div className="input-group">
          <label>通知标题：</label>
          <input
            type="text"
            value={notificationTitle}
            onChange={(e) => setNotificationTitle(e.target.value)}
            placeholder="输入通知标题"
          />
        </div>
        <div className="input-group">
          <label>通知内容：</label>
          <textarea
            value={notificationBody}
            onChange={(e) => setNotificationBody(e.target.value)}
            placeholder="输入通知内容"
            rows={3}
          />
        </div>
        <button onClick={handleSendNotification}>
          发送通知
        </button>
      </div>
      
      {/* 对话框功能区域 */}
      <div className="section">
        <h2>消息对话框</h2>
        <div className="button-group">
          <button onClick={handleShowInfoDialog}>
            显示信息对话框
          </button>
          <button onClick={handleShowWarningDialog}>
            显示警告对话框
          </button>
          <button onClick={handleShowErrorDialog}>
            显示错误对话框
          </button>
          <button onClick={handleShowConfirmDialog}>
            显示确认对话框
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 步骤5：测试功能

1. **测试通知功能**：
   - 点击"发送通知"按钮
   - 首次使用时会请求通知权限
   - 确认后应该看到系统通知

2. **测试对话框功能**：
   - 点击各个对话框按钮
   - 验证不同类型的对话框显示正确
   - 测试确认对话框的返回值

## 核心知识点

### 1. 通知权限管理

**权限检查**：
```javascript
const granted = await isPermissionGranted();
```

**请求权限**：
```javascript
const permission = await requestPermission();
// permission 可能是 'granted' 或 'denied'
```

**最佳实践**：
- 在发送通知前先检查权限
- 如果权限未授予，先请求权限
- 尊重用户的选择，不要重复请求

### 2. 发送通知

**基本用法**：
```javascript
await sendNotification({
  title: '通知标题',
  body: '通知内容',
  icon: undefined,  // 可选：图标路径
});
```

**注意事项**：
- 标题和内容都是必需的
- 图标路径必须是应用资源路径
- 在开发模式下，通知可能显示为PowerShell（Windows）或终端（Linux）

### 3. 消息对话框

**信息对话框**：
```javascript
await message('消息内容', {
  title: '标题',
  kind: 'info',  // 'info' | 'warning' | 'error'
});
```

**确认对话框**：
```javascript
const confirmed = await ask('确认消息', {
  title: '标题',
  kind: 'warning',  // 可选
});
// confirmed 是 boolean 值
```

**对话框类型**：
- `info`：信息对话框（蓝色）
- `warning`：警告对话框（黄色）
- `error`：错误对话框（红色）

### 4. 错误处理

所有通知和对话框操作都应该包含错误处理：

```javascript
try {
  await sendNotification({ title: '标题', body: '内容' });
} catch (error) {
  console.error('发送通知失败:', error);
  // 显示用户友好的错误提示
}
```

## 常见问题

### Q1: 通知不显示怎么办？

**可能原因**：
1. 用户未授予通知权限
2. 系统通知设置被禁用
3. 应用在开发模式下，通知可能显示为终端窗口

**解决方法**：
- 检查权限状态
- 检查系统通知设置
- 在打包后的应用中测试

### Q2: 对话框API找不到？

**可能原因**：
1. 未安装 `@tauri-apps/plugin-dialog` npm包
2. 未在 `capabilities/default.json` 中配置权限
3. 未在 `lib.rs` 中注册插件

**解决方法**：
- 确保所有步骤都正确完成
- 检查控制台错误信息
- 参考第5课的对话框配置

### Q3: 确认对话框返回值不正确？

**解决方法**：
- 确认使用了 `ask` 而不是 `message`
- 检查返回值类型（boolean）
- 添加适当的错误处理

## 总结与回顾

### 本节重点

1. **系统通知**：
   - 需要安装 `tauri-plugin-notification` 插件
   - 需要配置通知相关权限
   - 需要检查并请求用户权限
   - 使用 `sendNotification` API发送通知

2. **消息对话框**：
   - 使用 `message` API显示信息、警告、错误对话框
   - 使用 `ask` API显示确认对话框
   - 对话框类型通过 `kind` 参数指定

3. **权限管理**：
   - 通知需要用户授权
   - 对话框不需要额外权限（已包含在dialog权限中）

4. **最佳实践**：
   - 始终检查权限状态
   - 提供友好的错误提示
   - 合理使用通知，避免打扰用户

### 下节预告

下一课我们将学习**系统托盘与菜单**，包括：
- 创建系统托盘图标
- 添加托盘菜单
- 处理托盘事件
- 创建应用菜单栏

---

**学习建议**：
- 完成本课的所有实践操作
- 尝试不同的通知和对话框类型
- 理解权限管理的重要性
- 完成课后作业巩固知识

