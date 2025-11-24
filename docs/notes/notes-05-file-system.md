# 第5课学习笔记：文件系统操作

## 课程信息

- **课程编号**：第5课
- **课程标题**：文件系统操作
- **学习日期**：2025年11月24日
- **学习时长**：约2小时

## 遇到的问题

### 问题1：前端npm包未安装

**问题描述**：
应用启动后，主界面一片空白，控制台报错：`Failed to resolve import "@tauri-apps/plugin-fs"`

**错误信息**：
```
[vite] Internal server error: Failed to resolve import "@tauri-apps/plugin-fs" from "src/App.jsx". Does the file exist?
```

**问题原因**：
在Tauri 2.0中，前端JavaScript代码需要使用npm包来调用插件API。我只在Rust的`Cargo.toml`中添加了依赖，但忘记在前端的`package.json`中安装对应的npm包。

**解决方法**：
1. 安装前端npm包：
   ```bash
   npm install @tauri-apps/plugin-fs @tauri-apps/plugin-dialog
   ```
2. 清除Vite缓存（如果需要）：
   ```bash
   rm -rf node_modules/.vite
   ```
3. 重新启动应用

**相关资源**：
- Tauri 2.0插件系统需要同时安装Rust依赖和npm包
- 前端API通过npm包提供，后端功能通过Rust crate提供

### 问题2：权限名称不匹配

**问题描述**：
编译时出现错误：`Permission fs:allow-create-dir not found`

**错误信息**：
```
Permission fs:allow-create-dir not found, expected one of core:default, ...
```

**问题原因**：
Tauri 2.0的文件系统权限名称与讲义中的名称不完全一致。讲义中使用的权限名称：
- `fs:allow-create-dir` ❌
- `fs:allow-remove-dir` ❌
- `fs:allow-remove-file` ❌
- `fs:allow-rename-file` ❌

但实际Tauri 2.0中正确的权限名称是：
- `fs:allow-mkdir` ✅
- `fs:allow-remove` ✅（统一用于删除文件和目录）
- `fs:allow-rename` ✅（统一用于重命名文件和目录）

**解决方法**：
根据编译错误信息中列出的可用权限，修正了 `capabilities/default.json` 中的权限名称：
- `fs:allow-create-dir` → `fs:allow-mkdir`
- `fs:allow-remove-dir` 和 `fs:allow-remove-file` → `fs:allow-remove`
- `fs:allow-rename-file` → `fs:allow-rename`

**相关资源**：
- 编译错误信息中列出了所有可用的权限名称
- Tauri 2.0官方文档中的权限列表

### 问题3：API名称错误

**问题描述**：
应用运行时出现错误：`SyntaxError: Importing binding name 'createDir' is not found.`

**错误信息**：
```
[Error] SyntaxError: Importing binding name 'createDir' is not found.
```

**问题原因**：
在Tauri 2.0的`@tauri-apps/plugin-fs`中，API名称与讲义中的不同：
- `createDir` ❌ → `mkdir` ✅
- `removeDir` ❌ → `remove` ✅（统一用于删除文件和目录）
- `removeFile` ❌ → `remove` ✅（统一用于删除文件和目录）

我在导入语句中使用了不存在的API名称。

**解决方法**：
1. 检查实际可用的API：查看 `node_modules/@tauri-apps/plugin-fs/dist-js/index.d.ts` 文件
2. 修正导入语句，只导入实际使用的API：
   ```javascript
   // 错误
   import { readTextFile, writeTextFile, readDir, createDir, removeDir, removeFile, exists } from '@tauri-apps/plugin-fs';
   
   // 正确（只导入实际使用的API）
   import { readTextFile, writeTextFile, readDir, exists } from '@tauri-apps/plugin-fs';
   ```

**相关资源**：
- Tauri 2.0文件系统插件实际导出的API：`mkdir`, `remove`, `readTextFile`, `writeTextFile`, `readDir`, `exists` 等
- 类型定义文件：`node_modules/@tauri-apps/plugin-fs/dist-js/index.d.ts`

**注意**：
- 如果以后需要使用创建目录或删除功能，应该使用 `mkdir` 和 `remove`
- `remove` 函数可以删除文件和目录，通过 `recursive` 选项控制是否递归删除目录

### 问题4：文件写入权限不足

**问题描述**：
尝试保存文件时出现错误：`fs.write_text_file not allowed`

**错误信息**：
```
文件保存失败: fs.write_text_file not allowed. Permissions associated with this command: fs:allow-app-write, fs:allow-app-write-recursive, fs:allow-write-text-file, fs:write-all, fs:write-files, ...
```

**问题原因**：
在Tauri 2.0中，`writeTextFile()` 函数需要特定的权限：
- `fs:allow-write-text-file` - 写入文本文件的权限（必需）
- `fs:write-all` - 写入所有文件的权限（可选，更广泛）
- `fs:write-files` - 写入文件的权限（可选）
- 或者特定目录的写入权限，如 `fs:allow-document-write`, `fs:allow-download-write` 等

仅仅有 `fs:allow-write-file` 权限是不够的，需要添加 `fs:allow-write-text-file` 权限。

**解决方法**：
在 `capabilities/default.json` 中添加以下权限：
```json
{
  "permissions": [
    "fs:allow-write-text-file",  // 必需：写入文本文件
    "fs:write-all",              // 可选：写入所有文件
    "fs:write-files",            // 可选：写入文件
    "fs:allow-document-write",   // 可选：写入文档目录
    "fs:allow-document-write-recursive",
    "fs:allow-download-write",   // 可选：写入下载目录
    "fs:allow-download-write-recursive",
    "fs:allow-desktop-write",    // 可选：写入桌面
    "fs:allow-desktop-write-recursive",
    "fs:allow-home-write",       // 可选：写入主目录
    "fs:allow-home-write-recursive"
  ]
}
```

**重要提示**：
- `fs:allow-write-text-file` 是写入文本文件的必需权限
- 如果需要在特定目录写入，需要添加对应的目录写入权限
- 添加权限后需要重新编译应用才能生效

**相关资源**：
- Tauri 2.0文件系统权限文档
- 错误信息中会列出所有可用的权限选项

### 问题5：作用域权限格式问题

**问题描述**：
最初添加了 `fs:scope:allow-read` 和 `fs:scope:allow-write` 权限，导致JSON解析错误。

**错误信息**：
```
failed to parse JSON: identifiers can only include a single separator '58' at line 36 column 1
```

**问题原因**：
权限标识符中不能有多个冒号分隔符。`fs:scope:allow-read` 包含两个冒号，不符合权限命名规范。

**解决方法**：
移除了这两个权限。如果需要作用域权限，应该使用更具体的权限名称，如：
- `fs:allow-app-read`
- `fs:allow-app-write`
- `fs:allow-document-read`
- 等等

## 知识点总结

### 1. 文件系统插件安装

**重要提示**：Tauri 2.0的插件需要同时安装Rust依赖和npm包！

**步骤**：
1. 在 `Cargo.toml` 中添加Rust依赖：
   ```toml
   tauri-plugin-fs = "2"
   tauri-plugin-dialog = "2"
   ```

2. 在 `lib.rs` 中注册插件：
   ```rust
   .plugin(tauri_plugin_fs::init())
   .plugin(tauri_plugin_dialog::init())
   ```

3. 在 `package.json` 中安装前端npm包：
   ```bash
   npm install @tauri-apps/plugin-fs @tauri-apps/plugin-dialog
   ```

4. 在 `capabilities/default.json` 中配置权限

### 2. 正确的权限名称

**文件系统权限**：
- `fs:default` - 默认权限
- `fs:allow-read-file` - 读取文件
- `fs:allow-write-file` - 写入文件
- `fs:allow-read-dir` - 读取目录
- `fs:allow-mkdir` - 创建目录（注意：不是 `fs:allow-create-dir`）
- `fs:allow-remove` - 删除文件或目录（注意：不是 `fs:allow-remove-dir` 或 `fs:allow-remove-file`）
- `fs:allow-exists` - 检查文件/目录是否存在
- `fs:allow-rename` - 重命名文件或目录（注意：不是 `fs:allow-rename-file`）
- `fs:allow-copy-file` - 复制文件

**对话框权限**：
- `dialog:default` - 默认权限
- `dialog:allow-open` - 打开文件对话框
- `dialog:allow-save` - 保存文件对话框

### 3. 前端API使用

**导入API**：
```javascript
import { readTextFile, writeTextFile, readDir, exists } from '@tauri-apps/plugin-fs';
import { open, save } from '@tauri-apps/plugin-dialog';
```

**常用API**：
- `readTextFile(path, options?)` - 读取文本文件
- `writeTextFile(path, content, options?)` - 写入文本文件
- `readDir(path, options?)` - 读取目录内容
- `exists(path, options?)` - 检查文件/目录是否存在
- `mkdir(path, options?)` - 创建目录（注意：不是 `createDir`）
- `remove(path, options?)` - 删除文件或目录（注意：不是 `removeDir` 或 `removeFile`）
- `open(options)` - 打开文件选择对话框
- `save(options)` - 打开文件保存对话框

**注意**：
- Tauri 2.0的API名称与Tauri 1.0不同，需要注意API名称的变化
- 所有API都支持可选的 `options` 参数，可以指定 `baseDir` 等选项

### 4. 文件对话框配置

**打开文件对话框**：
```javascript
const selected = await open({
  multiple: false,        // 是否允许多选
  directory: false,       // 是否选择目录
  filters: [              // 文件类型过滤器
    { name: '文本文件', extensions: ['txt', 'md'] },
    { name: '所有文件', extensions: ['*'] }
  ]
});
```

**保存文件对话框**：
```javascript
const path = await save({
  defaultPath: 'untitled.txt',  // 默认文件名
  filters: [
    { name: '文本文件', extensions: ['txt'] }
  ]
});
```

### 5. 错误处理

所有文件系统操作都应该包含错误处理：
```javascript
try {
  const content = await readTextFile(path);
  // 处理成功情况
} catch (error) {
  console.error('读取文件失败:', error);
  alert('读取文件失败: ' + error.message);
}
```

## 心得体会

### 学习收获

1. **权限系统的重要性**：
   - Tauri 2.0的权限系统非常严格，必须明确声明每个权限
   - 权限名称必须准确，否则编译会失败
   - 权限配置是安全机制的重要组成部分

2. **API版本差异**：
   - 不同版本的Tauri可能有不同的API和权限名称
   - 需要参考官方文档和编译错误信息来确定正确的权限名称
   - 讲义中的示例可能需要根据实际版本进行调整

3. **错误处理的重要性**：
   - 文件系统操作可能遇到各种错误（文件不存在、权限不足等）
   - 完善的错误处理可以提升用户体验
   - 错误信息应该清晰易懂

4. **文件对话框的使用**：
   - 文件对话框提供了用户友好的文件选择方式
   - 支持文件类型过滤，可以限制用户只能选择特定类型的文件
   - 支持多选和目录选择

### 难点分析

1. **权限名称的记忆**：
   - Tauri 2.0的权限名称很多，需要记住常用的权限名称
   - 权限名称的命名规则需要理解（如 `fs:allow-*` 格式）

2. **错误调试**：
   - 编译错误信息很长，需要仔细阅读找到关键信息
   - 权限错误通常会在编译时发现，而不是运行时

3. **API的异步特性**：
   - 所有文件系统操作都是异步的，需要使用 `async/await`
   - 需要理解Promise和异步编程

### 改进建议

1. **查阅官方文档**：
   - 遇到权限问题时，应该查阅Tauri 2.0的官方文档
   - 编译错误信息中会列出所有可用的权限，这是很好的参考

2. **逐步测试**：
   - 先实现基本功能，确保编译通过
   - 再逐步添加更多功能
   - 每个功能都要单独测试

3. **记录常见问题**：
   - 将遇到的问题和解决方法记录下来
   - 建立自己的知识库，方便以后查阅

## 参考资料

- [TAURI文件系统插件文档](https://v2.tauri.app/plugin/fs/)
- [TAURI对话框插件文档](https://v2.tauri.app/plugin/dialog/)
- 课程讲义：`docs/lessons/lesson-05-file-system.md`
- 编译错误信息中的权限列表

## 下一步计划

1. 测试所有文件系统功能
2. 完成作业要求
3. 尝试实现选做作业（文本编辑器、文件管理器等）
4. 提交代码和笔记

