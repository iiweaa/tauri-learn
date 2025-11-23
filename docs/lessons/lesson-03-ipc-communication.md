# 第3课：前端与后端的通信机制（IPC）

## 课程信息

- **课程编号**：第3课
- **课程标题**：前端与后端的通信机制（IPC）
- **学习目标**：
  - 深入理解TAURI的IPC通信原理
  - 掌握如何定义Rust命令（后端）
  - 学会在前端调用后端命令
  - 理解错误处理和类型转换
  - 掌握前后端数据传递的方法
  - 学会实现双向通信（前端↔后端）
- **预计学习时间**：3-4小时
- **前置知识要求**：
  - 完成第1课和第2课的学习
  - 理解TAURI项目结构
  - 熟悉基本的Rust和JavaScript语法

## 理论讲解

### 什么是IPC？

**IPC（Inter-Process Communication）**：进程间通信

在TAURI中，IPC是前端（WebView进程）和后端（Rust进程）之间通信的桥梁。

```
┌─────────────────┐
│   前端（WebView） │
│  JavaScript     │
└────────┬────────┘
         │
         │ invoke("command", { args })
         │ ←──────────────────┐
         │                     │
         │                     │ 返回结果
         │                     │
┌────────▼────────┐           │
│   IPC通信层      │           │
│  (安全通道)      │           │
└────────┬────────┘           │
         │                     │
         │ 调用命令             │
         │ ────────────────────┘
┌────────▼────────┐
│   后端（Rust）   │
│  Rust函数        │
└─────────────────┘
```

### IPC通信的特点

1. **安全性**：所有通信都经过TAURI的安全层验证
2. **类型安全**：Rust的类型系统确保数据正确性
3. **异步通信**：前端使用async/await，后端返回Future
4. **权限控制**：只有授权的命令才能被调用

### 关键概念

- **命令（Command）**：后端定义的Rust函数，可以被前端调用
- **invoke**：前端调用后端命令的函数
- **序列化**：数据在前后端之间传递时需要序列化（JSON格式）

## 实践操作

### 步骤1：理解现有的IPC通信

让我们先看看项目中已有的IPC通信示例。

#### 1.1 后端命令定义（Rust）

查看 `src-tauri/src/lib.rs`：

```rust
// 定义一个简单的命令
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 定义一个带错误处理的命令
#[tauri::command]
fn calculate(operation: &str, a: f64, b: f64) -> Result<f64, String> {
    // 错误处理逻辑
    match operation {
        "add" => Ok(a + b),
        "divide" => {
            if b == 0.0 {
                Err("除数不能为零！".to_string())
            } else {
                Ok(a / b)
            }
        },
        _ => Err(format!("不支持的运算类型: {}", operation))
    }
}
```

**关键点**：
- `#[tauri::command]`：标记函数为TAURI命令
- 参数类型：可以是基本类型、结构体等（需要实现Serialize）
- 返回类型：可以是基本类型、Result类型等（需要实现Serialize）

#### 1.2 前端调用命令（JavaScript）

查看 `src/App.jsx`：

```javascript
import { invoke } from "@tauri-apps/api/core";

// 调用简单命令
async function greet() {
    const result = await invoke("greet", { name: "小丁" });
    console.log(result); // "Hello, 小丁! You've been greeted from Rust!"
}

// 调用带错误处理的命令
async function calculate() {
    try {
        const result = await invoke("calculate", { 
            operation: "add", 
            a: 10, 
            b: 20 
        });
        console.log(result); // 30
    } catch (error) {
        console.error("计算错误:", error);
    }
}
```

**关键点**：
- `invoke`：调用后端命令的函数
- 第一个参数：命令名称（字符串）
- 第二个参数：命令参数（对象）
- 返回Promise，需要使用`await`等待结果

### 步骤2：创建新的Rust命令

让我们创建一个新的命令来加深理解。

#### 2.1 定义简单的命令

在 `src-tauri/src/lib.rs` 中添加：

```rust
// 获取当前时间戳
#[tauri::command]
fn get_timestamp() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

// 字符串处理命令
#[tauri::command]
fn reverse_string(text: &str) -> String {
    text.chars().rev().collect()
}
```

#### 2.2 注册命令

在 `run()` 函数中注册新命令：

```rust
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            calculate,
            get_timestamp,      // 新命令
            reverse_string     // 新命令
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**重要**：必须在 `generate_handler!` 宏中列出所有要注册的命令。

### 步骤3：在前端调用新命令

在 `src/App.jsx` 中添加调用代码：

```javascript
// 获取时间戳
async function getCurrentTime() {
    const timestamp = await invoke("get_timestamp");
    const date = new Date(timestamp * 1000);
    console.log("当前时间:", date.toLocaleString());
    return timestamp;
}

// 反转字符串
async function reverseText(text) {
    const reversed = await invoke("reverse_string", { text });
    console.log("反转结果:", reversed);
    return reversed;
}
```

### 步骤4：传递复杂数据结构

#### 4.1 定义结构体（Rust）

在 `src-tauri/src/lib.rs` 中添加：

```rust
use serde::{Deserialize, Serialize};

// 定义用户信息结构体
#[derive(Serialize, Deserialize)]
struct User {
    name: String,
    age: u32,
    email: String,
}

// 处理用户信息的命令
#[tauri::command]
fn create_user(user: User) -> String {
    format!("用户 {} ({}岁) 已创建，邮箱: {}", user.name, user.age, user.email)
}

// 返回结构体的命令
#[tauri::command]
fn get_user_info(name: &str) -> User {
    User {
        name: name.to_string(),
        age: 25,
        email: format!("{}@example.com", name),
    }
}
```

**关键点**：
- `#[derive(Serialize, Deserialize)]`：让结构体可以序列化/反序列化
- `serde`：Rust的序列化库，TAURI使用它进行数据转换

#### 4.2 在前端传递对象

```javascript
// 创建用户
async function createUser() {
    const result = await invoke("create_user", {
        user: {
            name: "小丁",
            age: 25,
            email: "xiaoding@example.com"
        }
    });
    console.log(result);
}

// 获取用户信息
async function getUserInfo() {
    const user = await invoke("get_user_info", { name: "小丁" });
    console.log("用户信息:", user);
    // { name: "小丁", age: 25, email: "小丁@example.com" }
}
```

### 步骤5：错误处理

#### 5.1 Rust中的错误处理

```rust
// 使用Result类型返回错误
#[tauri::command]
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("除数不能为零".to_string())
    } else {
        Ok(a / b)
    }
}

// 使用Option类型处理可选值
#[tauri::command]
fn find_item(items: Vec<String>, target: String) -> Option<String> {
    items.iter().find(|&item| item == &target).cloned()
}
```

#### 5.2 前端错误处理

```javascript
// 处理Result类型的错误
async function safeDivide(a, b) {
    try {
        const result = await invoke("divide", { a, b });
        console.log("结果:", result);
        return result;
    } catch (error) {
        console.error("错误:", error);
        // error 是 Rust 返回的 Err 中的字符串
        alert(`计算错误: ${error}`);
        return null;
    }
}

// 处理Option类型
async function findItem(items, target) {
    const result = await invoke("find_item", { items, target });
    if (result === null || result === undefined) {
        console.log("未找到");
    } else {
        console.log("找到:", result);
    }
}
```

### 步骤6：双向通信（事件系统）

TAURI还支持事件系统，实现后端主动向前端发送消息。

#### 6.1 后端发送事件

```rust
use tauri::Manager;

#[tauri::command]
fn start_timer(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        loop {
            std::thread::sleep(std::time::Duration::from_secs(1));
            app.emit_all("tick", "tick").unwrap();
        }
    });
}
```

#### 6.2 前端监听事件

```javascript
import { listen } from "@tauri-apps/api/event";

// 监听事件
async function setupTimer() {
    await listen("tick", (event) => {
        console.log("收到事件:", event.payload);
    });
}
```

## 数据类型映射

### Rust → JavaScript 类型映射

| Rust类型 | JavaScript类型 | 说明 |
|---------|---------------|------|
| `i32`, `i64` | `number` | 整数 |
| `f32`, `f64` | `number` | 浮点数 |
| `bool` | `boolean` | 布尔值 |
| `String`, `&str` | `string` | 字符串 |
| `Vec<T>` | `Array` | 数组 |
| `Option<T>` | `T \| null` | 可选值 |
| `Result<T, E>` | `T` (成功) 或抛出错误 | 结果类型 |
| 结构体 | `object` | 对象（需要Serialize） |

### 注意事项

1. **类型必须匹配**：前后端的类型必须兼容
2. **序列化要求**：复杂类型需要实现`Serialize`和`Deserialize`
3. **错误处理**：Rust的`Result`类型在前端会变成异常

## 最佳实践

### 1. 命令命名规范

- 使用小写字母和下划线：`get_user_info`
- 动词开头：`create_user`, `delete_file`
- 清晰表达功能：避免缩写

### 2. 错误处理

- 使用`Result`类型返回错误
- 提供有意义的错误信息
- 前端使用`try-catch`处理错误

### 3. 性能优化

- 避免传递大量数据
- 使用异步操作处理耗时任务
- 考虑使用事件系统而不是轮询

### 4. 安全性

- 验证所有输入数据
- 不要信任前端传来的数据
- 使用权限系统控制访问

## 练习任务

### 基础练习（必做）

1. **创建新命令**
   - 创建一个`get_system_info`命令，返回系统信息（操作系统类型、版本等）
   - 在前端调用并显示结果

2. **传递复杂数据**
   - 创建一个`process_data`命令，接收一个数组，返回处理后的数组
   - 在前端传递数组并显示结果

3. **错误处理实践**
   - 创建一个可能失败的命令（如文件读取）
   - 在前端正确处理错误并显示友好提示

### 进阶挑战（选做）

1. **双向通信**
   - 实现一个计时器，后端每秒向前端发送一次时间更新
   - 前端实时显示时间

2. **批量操作**
   - 创建一个命令，接收多个任务，批量处理并返回结果
   - 使用进度事件通知前端处理进度

3. **类型转换**
   - 创建一个命令，接收和返回自定义结构体
   - 在前端正确处理复杂数据结构

## 总结与回顾

### 本节重点回顾

1. **IPC通信原理**：
   - 前端通过`invoke`调用后端命令
   - 后端通过`#[tauri::command]`定义命令
   - 数据通过JSON序列化传递

2. **命令定义**：
   - 使用`#[tauri::command]`标记函数
   - 在`generate_handler!`中注册命令
   - 支持基本类型和复杂类型

3. **错误处理**：
   - Rust使用`Result`类型
   - 前端使用`try-catch`处理
   - 提供有意义的错误信息

4. **数据类型**：
   - 基本类型自动映射
   - 复杂类型需要序列化
   - 注意类型兼容性

### 常见问题解答

**Q1: 为什么命令调用是异步的？**
A: IPC通信是跨进程的，需要时间。使用异步可以避免阻塞UI线程。

**Q2: 可以传递函数吗？**
A: 不可以。只能传递可序列化的数据（基本类型、结构体、数组等）。

**Q3: 如何传递文件？**
A: 可以传递文件路径（字符串），或者使用文件系统API读取文件内容后传递。

**Q4: 命令可以调用其他命令吗？**
A: 可以，但通常不推荐。应该将逻辑组织在同一个命令中。

**Q5: 如何调试IPC通信？**
A: 使用`console.log`在前端打印，使用`println!`在Rust后端打印。

### 下节预告

下一节课我们将学习：
- **窗口管理与自定义**
  - 创建和管理多个窗口
  - 自定义窗口样式和行为
  - 窗口间通信
  - 窗口事件处理

---

**祝你学习愉快！如有问题，随时提问。** 🚀

