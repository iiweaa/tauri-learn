# 第2课：项目结构解析与基础配置

## 课程信息

- **课程编号**：第2课
- **课程标题**：项目结构解析与基础配置
- **学习目标**：
  - 深入理解TAURI项目的完整目录结构
  - 掌握`tauri.conf.json`配置文件的各项设置
  - 理解TAURI 2.0的权限系统（Capabilities）
  - 学会配置Rust依赖（Cargo.toml）
  - 了解前端构建配置（Vite）
  - 能够根据需求自定义项目配置
- **预计学习时间**：2-3小时
- **前置知识要求**：
  - 完成第1课的学习
  - 了解JSON配置文件格式
  - 熟悉基本的命令行操作

## 理论讲解

### TAURI项目架构概览

TAURI项目采用前后端分离的架构，包含以下主要部分：

```
┌─────────────────────────────────────┐
│        前端层（Web技术）              │
│  - React/Vue/Svelte等               │
│  - HTML/CSS/JavaScript               │
│  - Vite构建工具                      │
└──────────────┬──────────────────────┘
               │
               │ IPC通信
               │
┌──────────────▼──────────────────────┐
│      TAURI核心层（Rust）             │
│  - 系统API访问                       │
│  - 安全权限控制                      │
│  - 窗口管理                          │
└──────────────┬──────────────────────┘
               │
               │
┌──────────────▼──────────────────────┐
│          操作系统                    │
│  Windows / macOS / Linux            │
└─────────────────────────────────────┘
```

### 关键知识点

1. **前端目录**：存放Web应用代码，使用Vite等工具构建
2. **src-tauri目录**：存放Rust后端代码和TAURI配置
3. **配置文件**：控制应用的行为、权限、构建等
4. **权限系统**：TAURI 2.0引入的Capabilities机制，确保安全性

## 实践操作

### 步骤1：项目结构详细解析

让我们深入分析TAURI项目的完整目录结构：

```
my-first-tauri-app/
├── src/                          # 前端源代码目录
│   ├── App.jsx                   # 主应用组件
│   ├── App.css                   # 样式文件
│   ├── main.jsx                  # 前端入口文件
│   └── assets/                   # 静态资源
│       └── react.svg
│
├── src-tauri/                    # Rust后端目录
│   ├── src/                      # Rust源代码
│   │   ├── main.rs               # Rust入口文件
│   │   └── lib.rs                # 库文件（包含命令定义）
│   │
│   ├── capabilities/             # 权限配置（TAURI 2.0）
│   │   └── default.json          # 默认权限配置
│   │
│   ├── icons/                    # 应用图标
│   │   ├── icon.png              # 通用图标
│   │   ├── icon.ico              # Windows图标
│   │   ├── icon.icns             # macOS图标
│   │   └── ...                   # 各种尺寸的图标
│   │
│   ├── gen/                      # 自动生成的代码
│   │   └── schemas/              # JSON Schema文件
│   │
│   ├── Cargo.toml                # Rust依赖配置
│   ├── Cargo.lock                # 依赖版本锁定文件
│   ├── build.rs                  # 构建脚本
│   ├── tauri.conf.json           # TAURI主配置文件
│   └── target/                   # 编译输出目录（可忽略）
│
├── public/                       # 公共静态资源
│   ├── tauri.svg
│   └── vite.svg
│
├── node_modules/                 # Node.js依赖（可忽略）
├── dist/                         # 前端构建输出（可忽略）
│
├── index.html                    # HTML入口文件
├── package.json                  # Node.js依赖配置
├── vite.config.js                # Vite构建配置
└── README.md                     # 项目说明
```

#### 1.1 前端目录（src/）

**作用**：存放前端应用的所有源代码

**关键文件**：
- `main.jsx`：前端入口文件，初始化React应用
- `App.jsx`：主应用组件，包含应用的主要逻辑
- `App.css`：样式文件

**类比理解**（C语言开发者）：
- 就像C项目的`src/`目录，存放所有源代码文件
- `main.jsx`类似C的`main.c`，是程序入口

#### 1.2 后端目录（src-tauri/）

**作用**：存放Rust后端代码和TAURI配置

**关键文件**：
- `src/main.rs`：Rust程序入口
- `src/lib.rs`：库文件，定义TAURI命令
- `Cargo.toml`：Rust依赖管理（类似`package.json`）
- `tauri.conf.json`：TAURI配置文件

**类比理解**（C语言开发者）：
- `Cargo.toml`类似`Makefile`或`CMakeLists.txt`，定义依赖和构建配置
- `src/lib.rs`类似C的库文件（`.h`和`.c`），定义可调用的函数

#### 1.3 权限配置（capabilities/）

**作用**：TAURI 2.0的权限系统，控制前端可以访问哪些后端功能

**关键文件**：
- `default.json`：默认权限配置

**类比理解**（C语言开发者）：
- 类似操作系统的权限系统，需要明确声明才能访问系统资源
- 就像Linux的文件权限（`chmod`），需要明确授权

### 步骤2：tauri.conf.json 配置详解

`tauri.conf.json`是TAURI应用的核心配置文件，控制应用的所有行为。

#### 2.1 配置文件结构

让我们逐项解析配置文件：

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "my-first-tauri-app",
  "version": "0.1.0",
  "identifier": "com.fei.my-first-tauri-app",
  "build": { ... },
  "app": { ... },
  "bundle": { ... }
}
```

#### 2.2 基础配置项

**`$schema`**：
- 作用：JSON Schema文件路径，提供配置项的自动补全和验证
- 说明：编辑器可以根据这个schema提供智能提示

**`productName`**：
- 作用：应用的产品名称
- 说明：会显示在窗口标题、任务栏等地方
- 示例：`"我的第一个TAURI应用"`

**`version`**：
- 作用：应用版本号
- 格式：遵循语义化版本（Semantic Versioning）
- 示例：`"0.1.0"`（主版本.次版本.修订版本）

**`identifier`**：
- 作用：应用的唯一标识符
- 格式：反向域名格式（类似Java包名）
- 示例：`"com.fei.my-first-tauri-app"`
- **重要**：用于系统识别应用，发布后不应更改

#### 2.3 构建配置（build）

```json
"build": {
  "beforeDevCommand": "npm run dev",
  "devUrl": "http://localhost:1420",
  "beforeBuildCommand": "npm run build",
  "frontendDist": "../dist"
}
```

**配置项说明**：

- **`beforeDevCommand`**：
  - 作用：开发模式启动前执行的命令
  - 说明：通常用于启动前端开发服务器
  - 示例：`"npm run dev"` 启动Vite开发服务器

- **`devUrl`**：
  - 作用：开发模式下的前端URL
  - 说明：TAURI会从这个URL加载前端内容
  - 默认：`"http://localhost:1420"`

- **`beforeBuildCommand`**：
  - 作用：构建应用前执行的命令
  - 说明：通常用于构建前端代码
  - 示例：`"npm run build"` 构建生产版本

- **`frontendDist`**：
  - 作用：前端构建输出的目录
  - 说明：构建时会从这个目录读取前端文件
  - 示例：`"../dist"` 相对于`src-tauri`目录

**工作流程**：
```
开发模式（tauri dev）：
  1. 执行 beforeDevCommand → 启动前端开发服务器
  2. 从 devUrl 加载前端内容
  3. 启动TAURI应用

构建模式（tauri build）：
  1. 执行 beforeBuildCommand → 构建前端
  2. 从 frontendDist 读取前端文件
  3. 打包成桌面应用
```

#### 2.4 应用配置（app）

```json
"app": {
  "windows": [
    {
      "title": "我的第一个TAURI应用",
      "width": 1000,
      "height": 700
    }
  ],
  "security": {
    "csp": null
  }
}
```

**窗口配置（windows）**：

每个窗口对象可以配置以下属性：

- **`title`**：窗口标题
- **`width`**：窗口宽度（像素）
- **`height`**：窗口高度（像素）
- **`resizable`**：是否可调整大小（默认：`true`）
- **`fullscreen`**：是否全屏（默认：`false`）
- **`minWidth`**：最小宽度
- **`minHeight`**：最小高度
- **`maxWidth`**：最大宽度
- **`maxHeight`**：最大高度
- **`x`**：窗口初始X坐标
- **`y`**：窗口初始Y坐标
- **`center`**：是否居中显示（默认：`true`）
- **`decorations`**：是否显示窗口装饰（标题栏等，默认：`true`）
- **`transparent`**：是否透明（默认：`false`）
- **`alwaysOnTop`**：是否始终置顶（默认：`false`）
- **`skipTaskbar`**：是否在任务栏显示（默认：`false`）

**完整窗口配置示例**：

```json
"windows": [
  {
    "label": "main",                    // 窗口标识符
    "title": "我的第一个TAURI应用",
    "width": 1000,
    "height": 700,
    "resizable": true,
    "fullscreen": false,
    "minWidth": 400,
    "minHeight": 300,
    "center": true,
    "decorations": true,
    "transparent": false,
    "alwaysOnTop": false
  }
]
```

**安全配置（security）**：

- **`csp`**：内容安全策略（Content Security Policy）
  - `null`：使用默认策略
  - 字符串：自定义CSP规则
  - 用于防止XSS攻击

#### 2.5 打包配置（bundle）

```json
"bundle": {
  "active": true,
  "targets": "all",
  "icon": [
    "icons/32x32.png",
    "icons/128x128.png",
    "icons/128x128@2x.png",
    "icons/icon.icns",
    "icons/icon.ico"
  ]
}
```

**配置项说明**：

- **`active`**：是否启用打包（默认：`true`）
- **`targets`**：打包目标平台
  - `"all"`：所有平台
  - `"app"`：仅应用包
  - `"dmg"`：macOS DMG安装包
  - `"msi"`：Windows MSI安装包
  - `"deb"`：Linux DEB包
  - `"appimage"`：Linux AppImage
- **`icon`**：应用图标文件列表
  - 需要提供多种格式和尺寸
  - Windows：`.ico`文件
  - macOS：`.icns`文件
  - Linux：`.png`文件

### 步骤3：Cargo.toml 配置详解

`Cargo.toml`是Rust项目的依赖管理文件，类似于Node.js的`package.json`。

#### 3.1 文件结构

```toml
[package]
name = "my-first-tauri-app"
version = "0.1.0"
description = "A Tauri App"
authors = ["you"]
edition = "2021"

[lib]
name = "my_first_tauri_app_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

#### 3.2 包配置（[package]）

- **`name`**：包名（必须是小写字母、数字、连字符）
- **`version`**：版本号
- **`description`**：包描述
- **`authors`**：作者列表
- **`edition`**：Rust版本（"2018"或"2021"）

#### 3.3 库配置（[lib]）

- **`name`**：库名称（Rust命名规范：下划线分隔）
- **`crate-type`**：库类型
  - `"staticlib"`：静态库
  - `"cdylib"`：动态库
  - `"rlib"`：Rust库

#### 3.4 依赖配置

**构建依赖（[build-dependencies]）**：
- 仅在构建时需要的依赖
- `tauri-build`：TAURI构建工具

**运行时依赖（[dependencies]）**：
- 应用运行时需要的依赖
- `tauri`：TAURI核心库
- `tauri-plugin-opener`：打开文件/URL的插件
- `serde`：序列化/反序列化库
- `serde_json`：JSON处理库

**添加依赖示例**：

```toml
[dependencies]
tauri = { version = "2", features = [] }
# 添加新依赖
tokio = { version = "1", features = ["full"] }
reqwest = "0.11"
```

### 步骤4：权限系统（Capabilities）详解

TAURI 2.0引入了基于权限的安全模型，确保应用只能访问明确授权的功能。

#### 4.1 权限系统原理

**安全原则**：
- **默认拒绝**：所有功能默认不可访问
- **显式授权**：必须在`capabilities`中明确声明权限
- **最小权限**：只授予必要的权限

**类比理解**（C语言开发者）：
- 类似Linux的文件权限系统
- 就像`sudo`需要明确授权才能执行特权操作
- 防止恶意代码访问系统资源

#### 4.2 权限配置文件

`src-tauri/capabilities/default.json`：

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default"
  ]
}
```

**配置项说明**：

- **`identifier`**：权限配置的唯一标识符
- **`description`**：权限配置的描述
- **`windows`**：应用此权限的窗口列表
  - `["main"]`：应用到主窗口
  - 可以为不同窗口配置不同权限
- **`permissions`**：权限列表
  - `"core:default"`：核心默认权限（窗口管理等）
  - `"opener:default"`：打开文件/URL的默认权限

#### 4.3 常用权限

**核心权限（core）**：
- `core:default`：默认核心权限
- `core:window:allow-*`：窗口操作权限
- `core:event:allow-*`：事件处理权限

**文件系统权限（fs）**：
- `fs:default`：默认文件系统权限
- `fs:allow-read-file`：读取文件
- `fs:allow-write-file`：写入文件
- `fs:allow-read-dir`：读取目录

**对话框权限（dialog）**：
- `dialog:default`：默认对话框权限
- `dialog:allow-open`：打开文件对话框
- `dialog:allow-save`：保存文件对话框

**通知权限（notification）**：
- `notification:default`：默认通知权限
- `notification:allow-show`：显示通知

**添加权限示例**：

```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "fs:allow-read-file",
    "fs:allow-write-file",
    "dialog:allow-open",
    "notification:default"
  ]
}
```

### 步骤5：前端构建配置（Vite）

`vite.config.js`配置前端构建工具。

#### 5.1 配置文件解析

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [react()],

  // Vite选项，针对TAURI开发优化
  clearScreen: false,              // 不清屏，显示Rust错误
  server: {
    port: 1420,                    // 开发服务器端口
    strictPort: true,              // 端口被占用时失败
    host: host || false,          // 监听的主机
    hmr: host ? {                 // 热模块替换配置
      protocol: "ws",
      host,
      port: 1421,
    } : undefined,
    watch: {
      ignored: ["**/src-tauri/**"], // 忽略src-tauri目录的变更
    },
  },
}));
```

#### 5.2 关键配置说明

- **`plugins`**：Vite插件列表
  - `react()`：React支持插件

- **`clearScreen`**：是否清屏
  - `false`：保留Rust编译错误信息

- **`server.port`**：开发服务器端口
  - 必须与`tauri.conf.json`中的`devUrl`端口一致

- **`server.strictPort`**：严格端口模式
  - `true`：端口被占用时直接失败，不尝试其他端口

- **`server.watch.ignored`**：忽略的文件/目录
  - 忽略`src-tauri`，避免不必要的重新加载

### 步骤6：实践操作 - 自定义配置

让我们通过实际修改配置来加深理解。

#### 6.1 修改窗口配置

编辑`src-tauri/tauri.conf.json`：

```json
{
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "我的自定义TAURI应用",
        "width": 1200,
        "height": 800,
        "minWidth": 600,
        "minHeight": 400,
        "resizable": true,
        "center": true,
        "alwaysOnTop": false,
        "decorations": true
      }
    ]
  }
}
```

**操作步骤**：
1. 修改`title`为自定义标题
2. 调整`width`和`height`
3. 设置`minWidth`和`minHeight`
4. 保存文件
5. 重启应用查看效果

#### 6.2 添加新权限

编辑`src-tauri/capabilities/default.json`：

```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "fs:allow-read-file",
    "fs:allow-write-file"
  ]
}
```

**说明**：
- 添加文件系统权限后，前端可以调用文件读写API
- 权限必须与使用的API匹配

#### 6.3 修改应用信息

编辑`src-tauri/tauri.conf.json`：

```json
{
  "productName": "我的TAURI应用",
  "version": "1.0.0",
  "identifier": "com.yourname.my-app"
}
```

**重要提示**：
- `identifier`发布后不应更改
- `version`遵循语义化版本规范

## 练习任务

### 基础练习（必做）

1. **修改窗口配置**
   - 将窗口标题改为"我的学习应用"
   - 设置窗口大小为1200x800
   - 设置最小尺寸为500x400
   - 验证修改生效

2. **理解配置文件**
   - 阅读`tauri.conf.json`的每个配置项
   - 理解`build`、`app`、`bundle`的作用
   - 查看`Cargo.toml`的依赖列表

3. **权限配置实践**
   - 查看`capabilities/default.json`
   - 理解每个权限的作用
   - 尝试添加一个权限（如`fs:allow-read-file`）

### 进阶挑战（选做）

1. **多窗口配置**
   - 在`tauri.conf.json`中配置多个窗口
   - 为不同窗口设置不同的标题和大小
   - 理解`label`的作用

2. **自定义图标**
   - 准备自己的应用图标
   - 替换`icons/`目录中的图标文件
   - 确保提供所有必需的格式和尺寸

3. **环境变量配置**
   - 了解如何在配置中使用环境变量
   - 为不同环境（开发/生产）配置不同的设置

### 思考题

1. 为什么TAURI需要权限系统？它如何保证安全性？
2. `tauri.conf.json`中的`build`配置和`app`配置有什么区别？
3. 为什么需要`Cargo.toml`和`package.json`两个依赖管理文件？
4. 权限配置中的`windows`字段有什么作用？
5. 如何为不同平台配置不同的打包选项？

## 总结与回顾

### 本节重点回顾

1. **项目结构**：
   - 前端目录（`src/`）：Web应用代码
   - 后端目录（`src-tauri/`）：Rust代码和配置
   - 配置文件：控制应用行为

2. **核心配置文件**：
   - `tauri.conf.json`：TAURI主配置
   - `Cargo.toml`：Rust依赖管理
   - `package.json`：Node.js依赖管理
   - `vite.config.js`：前端构建配置

3. **权限系统**：
   - TAURI 2.0的安全模型
   - 默认拒绝，显式授权
   - 通过`capabilities`配置权限

4. **窗口配置**：
   - 可以配置多个窗口
   - 丰富的窗口属性选项
   - 支持自定义窗口行为

### 常见问题解答

**Q1: 修改配置后需要重启应用吗？**
A: 是的，大部分配置修改需要重启应用才能生效。开发模式下，修改`tauri.conf.json`后需要重新运行`npm run tauri dev`。

**Q2: 如何添加新的Rust依赖？**
A: 在`Cargo.toml`的`[dependencies]`部分添加依赖，然后运行`cargo build`会自动下载。

**Q3: 权限配置错误会怎样？**
A: 如果前端调用了未授权的API，会抛出权限错误。需要在`capabilities`中添加相应权限。

**Q4: 可以动态修改窗口配置吗？**
A: 部分配置可以通过TAURI API动态修改（如窗口大小、标题），但基础配置需要在`tauri.conf.json`中设置。

**Q5: 如何为不同平台配置不同的设置？**
A: TAURI支持平台特定的配置，可以在配置文件中使用条件配置，或使用环境变量。

### 下节预告

下一节课我们将学习：
- **前端与后端的通信机制（IPC）**
  - 深入理解TAURI的IPC通信原理
  - 学习如何定义和调用Rust命令
  - 掌握前端调用后端的方法
  - 学习错误处理和类型转换
  - 实践双向通信（前端↔后端）

---

**祝你学习愉快！如有问题，随时提问。** 🚀

