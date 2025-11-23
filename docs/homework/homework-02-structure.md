# 第2课作业：项目结构说明

## 任务1：理解项目结构

### 项目目录结构图

```
my-first-tauri-app/
├── src/                          # 前端源代码目录
│   ├── App.jsx                   # 主应用组件（React）
│   ├── App.css                   # 样式文件
│   ├── main.jsx                  # 前端入口文件（初始化React应用）
│   └── assets/                   # 静态资源
│       └── react.svg             # React logo
│
├── src-tauri/                    # Rust后端目录
│   ├── src/                      # Rust源代码
│   │   ├── main.rs               # Rust程序入口
│   │   └── lib.rs                # 库文件（定义TAURI命令）
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
│   └── tauri.conf.json           # TAURI主配置文件
│
├── public/                       # 公共静态资源
│   ├── tauri.svg                 # TAURI logo
│   └── vite.svg                  # Vite logo
│
├── index.html                    # HTML入口文件
├── package.json                  # Node.js依赖配置
├── package-lock.json             # npm依赖锁定文件
├── vite.config.js                # Vite构建配置
└── README.md                     # 项目说明
```

### 主要目录和文件的作用

#### 前端部分（src/）

1. **src/App.jsx**
   - **作用**：主应用组件，包含应用的主要逻辑和UI
   - **类比**：类似C语言的main函数，是应用的入口组件

2. **src/main.jsx**
   - **作用**：前端入口文件，初始化React应用并挂载到DOM
   - **类比**：类似C语言的程序入口点

3. **src/App.css**
   - **作用**：应用的样式文件，定义UI的外观
   - **类比**：类似CSS样式表

4. **src/assets/**
   - **作用**：存放静态资源文件（图片、字体等）
   - **类比**：类似C项目的资源目录

#### 后端部分（src-tauri/）

1. **src-tauri/src/lib.rs**
   - **作用**：定义TAURI命令（可以被前端调用的Rust函数）
   - **类比**：类似C语言的库文件，定义可调用的函数

2. **src-tauri/src/main.rs**
   - **作用**：Rust程序入口，初始化TAURI应用
   - **类比**：类似C语言的main函数

3. **src-tauri/tauri.conf.json**
   - **作用**：TAURI主配置文件，控制应用的所有行为
   - **类比**：类似Makefile或CMakeLists.txt，定义项目配置

4. **src-tauri/Cargo.toml**
   - **作用**：Rust依赖管理文件，定义项目信息和依赖
   - **类比**：类似package.json，但用于Rust项目

5. **src-tauri/capabilities/default.json**
   - **作用**：权限配置文件，定义前端可以访问哪些后端功能
   - **类比**：类似操作系统的权限设置

6. **src-tauri/build.rs**
   - **作用**：构建脚本，在编译前执行
   - **类比**：类似Makefile中的构建规则

7. **src-tauri/icons/**
   - **作用**：存放应用图标，不同平台需要不同格式
   - **类比**：类似应用资源目录

#### 配置文件

1. **package.json**
   - **作用**：Node.js项目配置，定义依赖和脚本
   - **类比**：类似C项目的配置文件

2. **vite.config.js**
   - **作用**：Vite构建工具配置，控制前端构建过程
   - **类比**：类似构建系统的配置文件

3. **index.html**
   - **作用**：HTML入口文件，React应用挂载的容器
   - **类比**：类似C程序的入口点

### 前端目录和后端目录的区别

| 特性 | 前端目录（src/） | 后端目录（src-tauri/） |
|------|-----------------|---------------------|
| **技术栈** | JavaScript/React | Rust |
| **作用** | 用户界面和交互 | 系统API访问和业务逻辑 |
| **运行环境** | 浏览器/WebView | 操作系统 |
| **通信方式** | 通过IPC调用后端 | 接收IPC请求并处理 |
| **构建工具** | Vite | Cargo |
| **依赖管理** | package.json | Cargo.toml |
| **类比** | 客户端代码 | 服务端代码 |

**关键区别**：
- **前端**：负责用户界面，使用Web技术（HTML/CSS/JavaScript）
- **后端**：负责系统操作，使用Rust语言，可以访问系统API
- **通信**：通过IPC（进程间通信）进行前后端交互

---

## 任务3：理解配置文件

### tauri.conf.json 配置项说明

#### 基础配置
- **$schema**：JSON Schema文件路径，提供配置验证和自动补全
- **productName**：应用的产品名称（显示在窗口标题等地方）
- **version**：应用版本号（遵循语义化版本规范）
- **identifier**：应用的唯一标识符（反向域名格式，发布后不应更改）

#### build 配置块
- **beforeDevCommand**：开发模式启动前执行的命令（启动前端开发服务器）
- **devUrl**：开发模式下的前端URL（TAURI从这个地址加载前端）
- **beforeBuildCommand**：构建应用前执行的命令（构建前端代码）
- **frontendDist**：前端构建输出的目录（构建时从这个目录读取文件）

**作用**：控制开发和构建流程

#### app 配置块
- **windows**：窗口配置数组，定义应用的窗口属性
  - `label`：窗口标识符
  - `title`：窗口标题
  - `width/height`：窗口大小
  - `minWidth/minHeight`：最小窗口尺寸
  - `center`：是否居中显示
- **security**：安全配置（CSP等）

**作用**：控制应用窗口和安全策略

#### bundle 配置块
- **active**：是否启用打包
- **targets**：打包目标平台（"all"表示所有平台）
- **icon**：应用图标文件列表

**作用**：控制应用打包和分发

### Cargo.toml 依赖说明

#### [package] 包信息
- **name**：包名（必须是小写字母、数字、连字符）
- **version**：版本号
- **description**：包描述
- **authors**：作者列表
- **edition**：Rust版本（"2021"）

#### [lib] 库配置
- **name**：库名称（Rust命名规范：下划线分隔）
- **crate-type**：库类型（静态库、动态库、Rust库）

#### [build-dependencies] 构建依赖
- **tauri-build**：TAURI构建工具（仅在构建时需要）

#### [dependencies] 运行时依赖

1. **tauri = { version = "2", features = [] }**
   - **作用**：TAURI核心库
   - **功能**：提供TAURI框架的核心功能（窗口管理、IPC通信等）
   - **类比**：类似C语言的系统库

2. **tauri-plugin-opener = "2"**
   - **作用**：打开文件/URL的插件
   - **功能**：允许应用打开外部文件和URL
   - **类比**：类似C语言的第三方库

3. **serde = { version = "1", features = ["derive"] }**
   - **作用**：序列化/反序列化库
   - **功能**：将Rust数据结构转换为JSON等格式（用于前后端通信）
   - **类比**：类似C语言的序列化库

4. **serde_json = "1"**
   - **作用**：JSON处理库
   - **功能**：处理JSON格式的数据（与serde配合使用）
   - **类比**：类似C语言的JSON解析库

### package.json 前端依赖说明

#### scripts 脚本
- **dev**：启动Vite开发服务器
- **build**：构建前端代码
- **preview**：预览构建后的应用
- **tauri**：TAURI CLI命令

#### dependencies 运行时依赖

1. **react = "^19.1.0"**
   - **作用**：React框架核心库
   - **功能**：提供组件化UI开发能力

2. **react-dom = "^19.1.0"**
   - **作用**：React DOM渲染库
   - **功能**：将React组件渲染到DOM

3. **@tauri-apps/api = "^2"**
   - **作用**：TAURI API库
   - **功能**：提供调用后端命令的API（如invoke函数）

4. **@tauri-apps/plugin-opener = "^2"**
   - **作用**：打开文件/URL的插件（前端部分）
   - **功能**：前端调用打开文件/URL的功能

#### devDependencies 开发依赖

1. **@vitejs/plugin-react = "^4.6.0"**
   - **作用**：Vite的React插件
   - **功能**：让Vite支持React开发

2. **vite = "^7.0.4"**
   - **作用**：前端构建工具
   - **功能**：提供快速的前端开发和构建能力

3. **@tauri-apps/cli = "^2"**
   - **作用**：TAURI命令行工具
   - **功能**：提供TAURI开发、构建等命令

### 配置文件关系图

```
tauri.conf.json (TAURI主配置)
    ↓
    ├─→ 控制应用行为（窗口、安全、打包）
    ├─→ 引用 Cargo.toml 的依赖
    └─→ 引用 capabilities/ 的权限配置

Cargo.toml (Rust依赖)
    ↓
    └─→ 定义后端依赖（tauri、插件等）

package.json (前端依赖)
    ↓
    └─→ 定义前端依赖（React、TAURI API等）

capabilities/default.json (权限配置)
    ↓
    └─→ 定义前端可以访问的后端功能
```

---

**完成时间**：2025年11月15日  
**学员**：小丁

