# 第5课：文件系统操作

## 课程信息

- **课程编号**：第5课
- **课程标题**：文件系统操作
- **学习目标**：
  - 掌握TAURI文件系统API的使用
  - 学会读取和写入文件
  - 掌握目录的创建、遍历和删除
  - 学会使用文件对话框选择文件
  - 理解文件权限和安全机制
  - 掌握错误处理和路径处理
- **预计学习时间**：4-5小时
- **前置知识要求**：
  - 完成第1-4课的学习
  - 理解TAURI项目结构和配置
  - 掌握IPC通信机制
  - 了解权限系统

## 理论讲解

### 文件系统操作概述

TAURI提供了强大的文件系统操作能力，允许你：
- 读取和写入文件
- 创建、删除和遍历目录
- 检查文件/目录是否存在
- 获取文件信息（大小、修改时间等）
- 使用文件对话框选择文件

### 文件系统插件

在TAURI 2.0中，文件系统操作需要使用 `tauri-plugin-fs` 插件。这个插件提供了：
- 文件读写API
- 目录操作API
- 路径处理工具
- 安全沙箱机制

### 安全机制

TAURI的文件系统操作遵循严格的安全原则：
- **作用域限制**：只能访问明确授权的目录
- **权限控制**：需要在`capabilities`中声明权限
- **路径验证**：自动验证路径安全性
- **沙箱隔离**：应用无法访问系统敏感目录

### 文件对话框插件

`tauri-plugin-dialog` 提供了文件对话框功能：
- 打开文件对话框
- 保存文件对话框
- 选择目录对话框

## 实践操作

### 步骤1：安装文件系统插件

#### 1.1 添加Rust依赖

编辑 `src-tauri/Cargo.toml`：

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
tauri-plugin-fs = "2"        # 添加文件系统插件
tauri-plugin-dialog = "2"   # 添加对话框插件
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

#### 1.2 注册插件

编辑 `src-tauri/src/main.rs`：

```rust
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())      // 注册文件系统插件
        .plugin(tauri_plugin_dialog::init())  // 注册对话框插件
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
    "fs:allow-read-dir",
    "fs:allow-create-dir",
    "fs:allow-remove-dir",
    "fs:allow-remove-file",
    "fs:allow-exists",
    "fs:allow-rename-file",
    "fs:allow-copy-file",
    "fs:scope:allow-read",
    "fs:scope:allow-write",
    "dialog:default",
    "dialog:allow-open",
    "dialog:allow-save"
  ]
}
```

**权限说明**：
- `fs:default`：文件系统默认权限
- `fs:allow-read-file`：读取文件
- `fs:allow-write-file`：写入文件
- `fs:allow-read-dir`：读取目录
- `fs:allow-create-dir`：创建目录
- `fs:allow-remove-dir`：删除目录
- `fs:allow-remove-file`：删除文件
- `fs:allow-exists`：检查文件/目录是否存在
- `fs:allow-rename-file`：重命名文件
- `fs:allow-copy-file`：复制文件
- `fs:scope:allow-read`：允许读取作用域
- `fs:scope:allow-write`：允许写入作用域
- `dialog:default`：对话框默认权限
- `dialog:allow-open`：打开文件对话框
- `dialog:allow-save`：保存文件对话框

### 步骤2：前端文件操作API

#### 2.1 导入API

在 `src/App.jsx` 中导入文件系统API：

```javascript
import { readTextFile, writeTextFile, readDir, createDir, removeDir, removeFile, exists } from '@tauri-apps/plugin-fs';
import { open, save } from '@tauri-apps/plugin-dialog';
```

#### 2.2 读取文件

```javascript
// 读取文本文件
async function readFileExample() {
  try {
    const content = await readTextFile('path/to/file.txt');
    console.log('文件内容:', content);
    return content;
  } catch (error) {
    console.error('读取文件失败:', error);
    throw error;
  }
}
```

**说明**：
- `readTextFile(path)`：读取文本文件，返回字符串
- 路径可以是相对路径或绝对路径
- 需要文件系统读取权限

#### 2.3 写入文件

```javascript
// 写入文本文件
async function writeFileExample() {
  try {
    await writeTextFile('path/to/file.txt', '文件内容');
    console.log('文件写入成功');
  } catch (error) {
    console.error('写入文件失败:', error);
    throw error;
  }
}
```

**说明**：
- `writeTextFile(path, content)`：写入文本文件
- 如果文件不存在，会自动创建
- 如果文件存在，会覆盖原有内容
- 需要文件系统写入权限

#### 2.4 检查文件是否存在

```javascript
// 检查文件是否存在
async function checkFileExists() {
  try {
    const fileExists = await exists('path/to/file.txt');
    if (fileExists) {
      console.log('文件存在');
    } else {
      console.log('文件不存在');
    }
    return fileExists;
  } catch (error) {
    console.error('检查文件失败:', error);
    throw error;
  }
}
```

#### 2.5 读取目录

```javascript
// 读取目录内容
async function readDirectory() {
  try {
    const entries = await readDir('path/to/directory');
    console.log('目录内容:', entries);
    
    entries.forEach(entry => {
      if (entry.isFile) {
        console.log('文件:', entry.name);
      } else if (entry.isDirectory) {
        console.log('目录:', entry.name);
      }
    });
    
    return entries;
  } catch (error) {
    console.error('读取目录失败:', error);
    throw error;
  }
}
```

**说明**：
- `readDir(path)`：读取目录内容，返回条目数组
- 每个条目包含：`name`（名称）、`isFile`（是否为文件）、`isDirectory`（是否为目录）

#### 2.6 创建目录

```javascript
// 创建目录
async function createDirectory() {
  try {
    await createDir('path/to/new-directory', { recursive: true });
    console.log('目录创建成功');
  } catch (error) {
    console.error('创建目录失败:', error);
    throw error;
  }
}
```

**说明**：
- `createDir(path, options)`：创建目录
- `recursive: true`：递归创建父目录（类似`mkdir -p`）

#### 2.7 删除文件或目录

```javascript
// 删除文件
async function deleteFile() {
  try {
    await removeFile('path/to/file.txt');
    console.log('文件删除成功');
  } catch (error) {
    console.error('删除文件失败:', error);
    throw error;
  }
}

// 删除目录
async function deleteDirectory() {
  try {
    await removeDir('path/to/directory', { recursive: true });
    console.log('目录删除成功');
  } catch (error) {
    console.error('删除目录失败:', error);
    throw error;
  }
}
```

**说明**：
- `removeFile(path)`：删除文件
- `removeDir(path, options)`：删除目录
- `recursive: true`：递归删除目录及其内容

### 步骤3：使用文件对话框

#### 3.1 打开文件对话框

```javascript
import { open } from '@tauri-apps/plugin-dialog';

// 打开文件对话框
async function openFileDialog() {
  try {
    const selected = await open({
      multiple: false,           // 是否允许选择多个文件
      directory: false,          // 是否选择目录
      filters: [                 // 文件类型过滤器
        {
          name: '文本文件',
          extensions: ['txt', 'md']
        },
        {
          name: '所有文件',
          extensions: ['*']
        }
      ]
    });
    
    if (selected) {
      console.log('选择的文件:', selected);
      // 读取选择的文件
      const content = await readTextFile(selected);
      return content;
    } else {
      console.log('用户取消了选择');
      return null;
    }
  } catch (error) {
    console.error('打开文件对话框失败:', error);
    throw error;
  }
}
```

**说明**：
- `open(options)`：打开文件选择对话框
- `multiple: true`：允许选择多个文件，返回数组
- `directory: true`：选择目录而不是文件
- `filters`：文件类型过滤器

#### 3.2 保存文件对话框

```javascript
import { save } from '@tauri-apps/plugin-dialog';

// 保存文件对话框
async function saveFileDialog() {
  try {
    const filePath = await save({
      defaultPath: 'untitled.txt',  // 默认文件名
      filters: [                    // 文件类型过滤器
        {
          name: '文本文件',
          extensions: ['txt']
        }
      ]
    });
    
    if (filePath) {
      console.log('保存路径:', filePath);
      // 写入文件
      await writeTextFile(filePath, '文件内容');
      console.log('文件保存成功');
    } else {
      console.log('用户取消了保存');
    }
  } catch (error) {
    console.error('保存文件对话框失败:', error);
    throw error;
  }
}
```

**说明**：
- `save(options)`：打开文件保存对话框
- `defaultPath`：默认保存路径和文件名
- 返回用户选择的保存路径

### 步骤4：完整示例 - 文本编辑器

让我们创建一个简单的文本编辑器示例：

```javascript
import { useState } from 'react';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { open, save } from '@tauri-apps/plugin-dialog';

function TextEditor() {
  const [content, setContent] = useState('');
  const [filePath, setFilePath] = useState(null);

  // 打开文件
  const handleOpen = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          { name: '文本文件', extensions: ['txt', 'md'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      });

      if (selected) {
        const text = await readTextFile(selected);
        setContent(text);
        setFilePath(selected);
        console.log('文件打开成功:', selected);
      }
    } catch (error) {
      console.error('打开文件失败:', error);
      alert('打开文件失败: ' + error.message);
    }
  };

  // 保存文件
  const handleSave = async () => {
    try {
      if (filePath) {
        // 保存到当前文件
        await writeTextFile(filePath, content);
        console.log('文件保存成功:', filePath);
        alert('文件保存成功！');
      } else {
        // 另存为
        await handleSaveAs();
      }
    } catch (error) {
      console.error('保存文件失败:', error);
      alert('保存文件失败: ' + error.message);
    }
  };

  // 另存为
  const handleSaveAs = async () => {
    try {
      const path = await save({
        defaultPath: 'untitled.txt',
        filters: [
          { name: '文本文件', extensions: ['txt'] }
        ]
      });

      if (path) {
        await writeTextFile(path, content);
        setFilePath(path);
        console.log('文件另存为成功:', path);
        alert('文件保存成功！');
      }
    } catch (error) {
      console.error('另存为失败:', error);
      alert('另存为失败: ' + error.message);
    }
  };

  return (
    <div>
      <div>
        <button onClick={handleOpen}>打开文件</button>
        <button onClick={handleSave}>保存</button>
        <button onClick={handleSaveAs}>另存为</button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: '100%', height: '400px' }}
      />
      {filePath && <p>当前文件: {filePath}</p>}
    </div>
  );
}
```

### 步骤5：路径处理

#### 5.1 路径分隔符

不同操作系统的路径分隔符不同：
- Windows: `\`
- Linux/macOS: `/`

TAURI会自动处理路径分隔符，但建议使用 `/` 作为分隔符。

#### 5.2 相对路径和绝对路径

```javascript
// 相对路径（相对于应用目录）
const relativePath = 'data/file.txt';

// 绝对路径
const absolutePath = '/home/user/documents/file.txt';

// 使用路径
await readTextFile(relativePath);
await readTextFile(absolutePath);
```

#### 5.3 路径拼接

```javascript
// 手动拼接（不推荐）
const path1 = 'directory';
const path2 = 'file.txt';
const fullPath = path1 + '/' + path2;

// 使用数组（推荐）
const parts = ['directory', 'subdirectory', 'file.txt'];
const fullPath = parts.join('/');
```

### 步骤6：错误处理

文件系统操作可能遇到各种错误，需要妥善处理：

```javascript
async function safeFileOperation() {
  try {
    // 检查文件是否存在
    if (await exists('path/to/file.txt')) {
      // 读取文件
      const content = await readTextFile('path/to/file.txt');
      return content;
    } else {
      console.log('文件不存在');
      return null;
    }
  } catch (error) {
    // 处理不同类型的错误
    if (error.code === 'ENOENT') {
      console.error('文件或目录不存在');
    } else if (error.code === 'EACCES') {
      console.error('权限不足');
    } else if (error.code === 'EISDIR') {
      console.error('这是一个目录，不是文件');
    } else {
      console.error('未知错误:', error);
    }
    throw error;
  }
}
```

**常见错误代码**：
- `ENOENT`：文件或目录不存在
- `EACCES`：权限不足
- `EISDIR`：期望文件但得到目录
- `ENOTDIR`：期望目录但得到文件
- `EEXIST`：文件或目录已存在

## 练习任务

### 基础练习（必做）

1. **文件读取和写入**
   - 创建一个按钮，点击后打开文件对话框选择文本文件
   - 读取文件内容并显示在界面上
   - 提供编辑功能，可以修改内容
   - 提供保存按钮，将修改后的内容写回文件

2. **目录操作**
   - 创建一个功能，列出指定目录下的所有文件和子目录
   - 显示每个条目的类型（文件/目录）和名称
   - 提供创建新目录的功能
   - 提供删除文件或目录的功能（带确认提示）

3. **文件对话框**
   - 实现打开文件对话框，支持选择文本文件
   - 实现保存文件对话框，支持保存为文本文件
   - 添加文件类型过滤器（.txt, .md等）

### 进阶挑战（选做）

1. **简单文件管理器**
   - 创建一个文件管理器界面
   - 显示当前目录的文件列表
   - 支持进入子目录和返回上级目录
   - 支持文件预览（文本文件）
   - 支持文件重命名和删除

2. **文件搜索功能**
   - 实现递归搜索指定目录下的文件
   - 支持按文件名或扩展名过滤
   - 显示搜索结果列表

3. **文件内容统计**
   - 读取文件并统计：字符数、单词数、行数
   - 显示文件大小和修改时间
   - 支持多个文件的批量统计

## 总结与回顾

### 本节重点回顾

1. **文件系统插件**：
   - 需要安装 `tauri-plugin-fs` 插件
   - 需要在 `main.rs` 中注册插件
   - 需要在 `capabilities` 中配置权限

2. **文件操作API**：
   - `readTextFile()`：读取文本文件
   - `writeTextFile()`：写入文本文件
   - `exists()`：检查文件/目录是否存在
   - `readDir()`：读取目录内容
   - `createDir()`：创建目录
   - `removeFile()`：删除文件
   - `removeDir()`：删除目录

3. **文件对话框**：
   - `open()`：打开文件选择对话框
   - `save()`：打开文件保存对话框
   - 支持文件类型过滤和多选

4. **错误处理**：
   - 使用 `try-catch` 捕获错误
   - 根据错误代码进行不同处理
   - 提供友好的错误提示

### 常见问题解答

**Q1: 为什么无法读取文件？**
A: 检查以下几点：
- 是否安装了 `tauri-plugin-fs` 插件
- 是否在 `capabilities` 中配置了 `fs:allow-read-file` 权限
- 文件路径是否正确
- 文件是否存在且有读取权限

**Q2: 如何访问用户的主目录？**
A: 可以使用绝对路径，如 `/home/username`（Linux）或 `C:\Users\username`（Windows）。但需要注意权限配置。

**Q3: 如何递归遍历目录？**
A: 使用递归函数：
```javascript
async function traverseDirectory(dir) {
  const entries = await readDir(dir);
  for (const entry of entries) {
    if (entry.isDirectory) {
      await traverseDirectory(dir + '/' + entry.name);
    } else {
      console.log('文件:', dir + '/' + entry.name);
    }
  }
}
```

**Q4: 文件对话框返回的路径格式是什么？**
A: 返回的是字符串路径，格式取决于操作系统。TAURI会自动处理路径分隔符。

### 下节预告

下一课将学习：**系统通知与对话框**
- 系统通知的使用
- 消息对话框（确认、警告、错误）
- 输入对话框
- 自定义对话框样式

---

**学习提示**：
- 文件系统操作涉及系统安全，务必理解权限机制
- 始终进行错误处理，提供友好的错误提示
- 使用文件对话框可以提升用户体验
- 注意路径处理，避免跨平台兼容性问题

