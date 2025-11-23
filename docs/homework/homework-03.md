# 第3课作业：前端与后端的通信机制（IPC）

## 作业说明

完成本作业以巩固第三课的学习内容。作业分为**必做部分**和**选做部分**，请至少完成必做部分。

## 作业要求

### 必做作业（必须全部完成）

#### 任务1：创建新命令
- [ ] 在`src-tauri/src/lib.rs`中创建一个`get_system_info`命令
  - 命令返回系统信息（至少包含操作系统类型）
  - 可以使用`std::env::consts::OS`获取操作系统类型
  - 返回类型可以是`String`或结构体
- [ ] 在`run()`函数中注册这个命令
- [ ] 在前端（`src/App.jsx`）中调用这个命令
- [ ] 在界面上显示系统信息

#### 任务2：传递复杂数据
- [ ] 创建一个`process_numbers`命令
  - 接收一个数字数组（`Vec<f64>`）
  - 计算数组的和、平均值、最大值、最小值
  - 返回包含这些统计信息的结构体
- [ ] 定义返回结构体（需要实现`Serialize`）
- [ ] 在前端传递一个数字数组
- [ ] 在界面上显示统计结果

#### 任务3：错误处理实践
- [ ] 创建一个`safe_divide`命令
  - 接收两个数字参数
  - 如果除数为零，返回错误
  - 如果除数不为零，返回除法结果
- [ ] 在前端调用这个命令
- [ ] 正确处理成功和失败的情况
- [ ] 显示友好的错误提示

#### 任务4：理解IPC通信流程
- [ ] 绘制IPC通信流程图（可以用文本或工具）
- [ ] 说明数据在前后端之间是如何传递的
- [ ] 解释序列化和反序列化的过程
- [ ] 说明错误是如何从后端传递到前端的

### 选做作业（加分项）

#### 任务5：双向通信（选做）
- [ ] 实现一个简单的计时器功能
- [ ] 后端每秒向前端发送一次时间更新事件
- [ ] 前端监听事件并实时显示时间
- [ ] 可以开始和停止计时器

#### 任务6：批量操作（选做）
- [ ] 创建一个`batch_process`命令
- [ ] 接收一个任务列表，批量处理
- [ ] 使用事件系统通知前端处理进度
- [ ] 前端显示进度条

#### 任务7：自定义结构体（选做）
- [ ] 创建一个复杂的结构体（包含多个字段和嵌套结构）
- [ ] 实现序列化和反序列化
- [ ] 在前端和后端之间传递这个结构体
- [ ] 在前端正确显示结构体的所有字段

## 提交要求

### 提交内容

1. **项目代码**
   - 完整的TAURI项目目录
   - 确保所有新创建的命令都已注册
   - 确保前端调用代码正确

2. **代码说明文档**（可选但推荐）
   - 创建一个`docs/homework/homework-03-ipc.md`文件
   - 记录创建的命令及其功能
   - 说明IPC通信的实现方式
   - 记录遇到的问题和解决方法

3. **流程图**（任务4）
   - 绘制IPC通信流程图
   - 可以用文本、Markdown表格或工具生成

### 提交方式

1. 将项目代码提交到Git仓库
2. 在提交信息中说明完成了哪些任务
3. 如果创建了说明文档，一并提交

### 检查标准

我会检查以下内容：

✅ **命令定义**：命令正确定义并注册  
✅ **前端调用**：前端正确调用命令并处理结果  
✅ **错误处理**：正确使用Result类型和try-catch  
✅ **数据类型**：正确使用基本类型和复杂类型  
✅ **代码质量**：代码结构清晰，有适当注释  
✅ **功能实现**：所有必做任务的功能都已实现  
✅ **Git提交**：代码已提交到Git仓库，提交信息清晰

## 作业提示

### 创建命令的步骤

1. **在lib.rs中定义命令**：
```rust
#[tauri::command]
fn your_command(param: Type) -> ReturnType {
    // 命令逻辑
}
```

2. **注册命令**：
```rust
.invoke_handler(tauri::generate_handler![
    greet,
    calculate,
    your_command  // 添加新命令
])
```

3. **在前端调用**：
```javascript
const result = await invoke("your_command", { param: value });
```

### 错误处理示例

**Rust端**：
```rust
#[tauri::command]
fn safe_operation(input: f64) -> Result<f64, String> {
    if input < 0.0 {
        Err("输入不能为负数".to_string())
    } else {
        Ok(input * 2.0)
    }
}
```

**前端**：
```javascript
try {
    const result = await invoke("safe_operation", { input: 10 });
    console.log("成功:", result);
} catch (error) {
    console.error("错误:", error);
}
```

### 结构体定义示例

```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Statistics {
    sum: f64,
    average: f64,
    max: f64,
    min: f64,
}

#[tauri::command]
fn calculate_stats(numbers: Vec<f64>) -> Statistics {
    // 计算统计信息
    Statistics {
        sum: numbers.iter().sum(),
        average: numbers.iter().sum::<f64>() / numbers.len() as f64,
        max: numbers.iter().cloned().fold(f64::NEG_INFINITY, f64::max),
        min: numbers.iter().cloned().fold(f64::INFINITY, f64::min),
    }
}
```

## 完成作业后

完成作业后，请告诉我：
1. 已完成的任务列表
2. 创建的命令及其功能
3. 遇到的任何问题
4. 需要我检查的Git提交哈希（如果有）

我会检查你的作业，通过后我们再进行第4课的学习。

---

**加油！相信你能完成得很好！** 💪

