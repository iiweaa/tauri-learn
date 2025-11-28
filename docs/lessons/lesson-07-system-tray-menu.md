# 第7课：系统托盘与菜单

## 课程信息

- **课程编号**：第7课
- **课程标题**：系统托盘与菜单
- **学习目标**：
  - 掌握系统托盘图标的创建和配置
  - 学会为托盘图标添加菜单项
  - 掌握托盘事件的处理方法
  - 学会创建应用窗口菜单栏
  - 理解托盘和菜单的最佳实践
- **预计学习时间**：3-4小时
- **前置知识要求**：
  - 完成第1-6课的学习
  - 理解TAURI项目结构和配置
  - 掌握窗口管理（第4课）
  - 了解Rust基础语法

## 理论讲解

### 系统托盘概述

系统托盘（System Tray）是操作系统任务栏或菜单栏中的一个小图标区域，允许应用程序在后台运行时仍然保持可见。当用户关闭主窗口时，应用可以通过托盘图标继续运行，用户可以通过托盘图标快速访问应用功能。

**系统托盘的特点**：
- **后台运行**：应用可以在主窗口关闭后继续运行
- **快速访问**：用户可以通过托盘图标快速打开应用
- **菜单操作**：托盘图标通常带有右键菜单，提供快捷操作
- **跨平台**：支持Windows、macOS和Linux

### 应用菜单栏概述

应用菜单栏是桌面应用窗口顶部的菜单栏，提供文件、编辑、视图等常见功能菜单。在macOS上，菜单栏显示在屏幕顶部；在Windows和Linux上，菜单栏显示在窗口顶部。

**菜单栏的特点**：
- **标准界面**：符合桌面应用的常见设计模式
- **快捷键支持**：菜单项可以绑定键盘快捷键
- **子菜单**：支持多级菜单嵌套
- **平台差异**：不同平台的菜单栏位置和样式可能不同

### Tauri 2.0中的托盘和菜单

在Tauri 2.0中：
- **系统托盘**：使用 `SystemTray` 和 `SystemTrayMenu` API
- **应用菜单**：使用 `Menu` 和 `MenuItem` API
- **事件处理**：通过事件处理器响应托盘和菜单操作

## 实践操作

### 步骤1：配置系统托盘

#### 1.1 准备托盘图标

首先，我们需要准备一个托盘图标。图标文件应该放在 `src-tauri/icons/` 目录下。

**图标要求**：
- **格式**：PNG格式
- **尺寸**：建议16x16、32x32、64x64像素
- **背景**：建议使用透明背景
- **颜色**：根据系统主题自动适配（浅色/深色）

如果项目中没有合适的图标，可以使用现有的应用图标，或者创建一个简单的图标。

#### 1.2 启用托盘功能

编辑 `src-tauri/Cargo.toml`，确保启用了托盘功能：

```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon"] }  # 启用托盘功能
tauri-plugin-opener = "2"
tauri-plugin-fs = "2"
tauri-plugin-dialog = "2"
tauri-plugin-notification = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

**注意**：`tray-icon` 是Tauri的内置功能，不需要额外安装插件。

### 步骤2：创建系统托盘

#### 2.1 创建托盘菜单

编辑 `src-tauri/src/lib.rs`，添加系统托盘相关代码：

```rust
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

// ... 其他代码 ...

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 创建托盘菜单项
    let show = CustomMenuItem::new("show".to_string(), "显示窗口");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏窗口");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    
    // 创建托盘菜单
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)  // 分隔线
        .add_item(quit);
    
    // 创建系统托盘
    let system_tray = SystemTray::new().with_menu(tray_menu);
    
    tauri::Builder::default()
        .system_tray(system_tray)  // 设置系统托盘
        .on_system_tray_event(|app, event| {
            // 处理托盘事件
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    // 左键点击：显示/隐藏窗口
                    let window = app.get_window("main").unwrap();
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    // 菜单项点击
                    let item_handle = app.tray_handle().get_item(&id);
                    match id.as_str() {
                        "show" => {
                            let window = app.get_window("main").unwrap();
                            window.show().unwrap();
                            window.set_focus().unwrap();
                            item_handle.set_title("隐藏窗口").unwrap();
                        }
                        "hide" => {
                            let window = app.get_window("main").unwrap();
                            window.hide().unwrap();
                            item_handle.set_title("显示窗口").unwrap();
                        }
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
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

#### 2.2 配置托盘图标

托盘图标会自动使用应用的主图标。如果需要使用特定的托盘图标，可以在 `tauri.conf.json` 中配置：

```json
{
  "tauri": {
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true
    }
  }
}
```

**配置说明**：
- **`iconPath`**：托盘图标路径（相对于 `src-tauri` 目录）
- **`iconAsTemplate`**：在macOS上，设置为 `true` 可以让图标根据系统主题自动调整颜色

### 步骤3：配置窗口关闭行为

默认情况下，关闭窗口会退出应用。如果我们希望关闭窗口后应用继续在托盘中运行，需要修改窗口的关闭行为。

编辑 `src-tauri/tauri.conf.json`：

```json
{
  "tauri": {
    "windows": [
      {
        "label": "main",
        "title": "我的第一个TAURI应用",
        "width": 1000,
        "height": 700,
        "resizable": true,
        "fullscreen": false,
        "closable": true,
        "minimizable": true,
        "maximizable": true,
        "close": {
          "action": "hide"  // 关闭窗口时隐藏而不是退出
        }
      }
    ]
  }
}
```

**关闭行为选项**：
- **`"exit"`**：关闭窗口时退出应用（默认）
- **`"hide"`**：关闭窗口时隐藏窗口，应用继续运行

### 步骤4：创建应用菜单栏

#### 4.1 创建菜单结构

编辑 `src-tauri/src/lib.rs`，添加菜单栏代码：

```rust
use tauri::{
    CustomMenuItem, Manager, Menu, MenuItem, Submenu, SystemTray,
    SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

// ... 其他代码 ...

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 创建托盘菜单（之前的代码）
    let show = CustomMenuItem::new("show".to_string(), "显示窗口");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏窗口");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    
    let system_tray = SystemTray::new().with_menu(tray_menu);
    
    // 创建应用菜单栏
    let file_menu = Submenu::new(
        "文件",
        Menu::new()
            .add_item(CustomMenuItem::new("new".to_string(), "新建"))
            .add_item(CustomMenuItem::new("open".to_string(), "打开"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("save".to_string(), "保存"))
            .add_item(CustomMenuItem::new("save_as".to_string(), "另存为"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("exit".to_string(), "退出")),
    );
    
    let edit_menu = Submenu::new(
        "编辑",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste),
    );
    
    let view_menu = Submenu::new(
        "视图",
        Menu::new()
            .add_item(CustomMenuItem::new("zoom_in".to_string(), "放大"))
            .add_item(CustomMenuItem::new("zoom_out".to_string(), "缩小"))
            .add_item(CustomMenuItem::new("zoom_reset".to_string(), "重置缩放")),
    );
    
    let help_menu = Submenu::new(
        "帮助",
        Menu::new()
            .add_item(CustomMenuItem::new("about".to_string(), "关于")),
    );
    
    let menu = Menu::new()
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu)
        .add_submenu(help_menu);
    
    tauri::Builder::default()
        .menu(menu)  // 设置应用菜单
        .on_menu_event(|event| {
            // 处理菜单事件
            match event.menu_item_id() {
                "new" => {
                    println!("新建文件");
                }
                "open" => {
                    println!("打开文件");
                }
                "save" => {
                    println!("保存文件");
                }
                "save_as" => {
                    println!("另存为");
                }
                "exit" => {
                    std::process::exit(0);
                }
                "zoom_in" => {
                    println!("放大");
                }
                "zoom_out" => {
                    println!("缩小");
                }
                "zoom_reset" => {
                    println!("重置缩放");
                }
                "about" => {
                    println!("关于应用");
                }
                _ => {}
            }
        })
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| {
            // 托盘事件处理（之前的代码）
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    let window = app.get_window("main").unwrap();
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    let item_handle = app.tray_handle().get_item(&id);
                    match id.as_str() {
                        "show" => {
                            let window = app.get_window("main").unwrap();
                            window.show().unwrap();
                            window.set_focus().unwrap();
                            item_handle.set_title("隐藏窗口").unwrap();
                        }
                        "hide" => {
                            let window = app.get_window("main").unwrap();
                            window.hide().unwrap();
                            item_handle.set_title("显示窗口").unwrap();
                        }
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
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

#### 4.2 原生菜单项

Tauri提供了一些原生菜单项，这些菜单项会自动适配平台的标准行为：

- **`MenuItem::Undo`**：撤销
- **`MenuItem::Redo`**：重做
- **`MenuItem::Cut`**：剪切
- **`MenuItem::Copy`**：复制
- **`MenuItem::Paste`**：粘贴
- **`MenuItem::SelectAll`**：全选
- **`MenuItem::Separator`**：分隔线

这些原生菜单项会自动绑定系统快捷键（如 Ctrl+Z、Ctrl+C 等）。

### 步骤5：添加菜单快捷键

可以为自定义菜单项添加快捷键：

```rust
let save_item = CustomMenuItem::new("save".to_string(), "保存")
    .accelerator("CmdOrCtrl+S");  // macOS: Cmd+S, Windows/Linux: Ctrl+S

let open_item = CustomMenuItem::new("open".to_string(), "打开")
    .accelerator("CmdOrCtrl+O");
```

**快捷键格式**：
- **`CmdOrCtrl`**：在macOS上使用Cmd，在Windows/Linux上使用Ctrl
- **`Alt`**：Alt键
- **`Shift`**：Shift键
- **组合键**：如 `CmdOrCtrl+Shift+S`

### 步骤6：前端集成（可选）

如果需要从前端控制托盘和菜单，可以创建相应的命令：

```rust
#[tauri::command]
fn toggle_tray_menu_item(app: tauri::AppHandle, id: String, enabled: bool) {
    let item = app.tray_handle().get_item(&id);
    item.set_enabled(enabled).unwrap();
}

#[tauri::command]
fn update_tray_menu_item_title(app: tauri::AppHandle, id: String, title: String) {
    let item = app.tray_handle().get_item(&id);
    item.set_title(&title).unwrap();
}
```

在前端调用：

```javascript
import { invoke } from '@tauri-apps/api/core';

// 启用/禁用托盘菜单项
await invoke('toggle_tray_menu_item', { id: 'show', enabled: true });

// 更新托盘菜单项标题
await invoke('update_tray_menu_item_title', { id: 'show', title: '显示主窗口' });
```

## 完整代码示例

### Rust后端代码（lib.rs）

```rust
use serde::{Deserialize, Serialize};
use tauri::{
    CustomMenuItem, Manager, Menu, MenuItem, Submenu, SystemTray,
    SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

// 统计信息结构体
#[derive(Serialize, Deserialize)]
struct Statistics {
    sum: f64,
    average: f64,
    max: f64,
    min: f64,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_timestamp() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

#[tauri::command]
fn get_system_info() -> String {
    format!("操作系统类型: {}", std::env::consts::OS)
}

#[tauri::command]
fn safe_divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("除数不能为零！".to_string())
    } else {
        Ok(a / b)
    }
}

#[tauri::command]
fn process_numbers(numbers: Vec<f64>) -> Statistics {
    if numbers.is_empty() {
        return Statistics {
            sum: 0.0,
            average: 0.0,
            max: 0.0,
            min: 0.0,
        };
    }
    
    let sum: f64 = numbers.iter().sum();
    let average = sum / numbers.len() as f64;
    let max = numbers.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
    let min = numbers.iter().cloned().fold(f64::INFINITY, f64::min);
    
    Statistics {
        sum,
        average,
        max,
        min,
    }
}

#[tauri::command]
fn calculate(operation: &str, a: f64, b: f64) -> Result<f64, String> {
    if a.is_nan() || b.is_nan() {
        return Err("输入的数字无效".to_string());
    }
    
    if a.is_infinite() || b.is_infinite() {
        return Err("输入的数字超出范围".to_string());
    }
    
    match operation {
        "add" => Ok(a + b),
        "subtract" => Ok(a - b),
        "multiply" => Ok(a * b),
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 创建托盘菜单
    let show = CustomMenuItem::new("show".to_string(), "显示窗口");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏窗口");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    
    let system_tray = SystemTray::new().with_menu(tray_menu);
    
    // 创建应用菜单栏
    let file_menu = Submenu::new(
        "文件",
        Menu::new()
            .add_item(CustomMenuItem::new("new".to_string(), "新建").accelerator("CmdOrCtrl+N"))
            .add_item(CustomMenuItem::new("open".to_string(), "打开").accelerator("CmdOrCtrl+O"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("save".to_string(), "保存").accelerator("CmdOrCtrl+S"))
            .add_item(CustomMenuItem::new("save_as".to_string(), "另存为").accelerator("CmdOrCtrl+Shift+S"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("exit".to_string(), "退出").accelerator("CmdOrCtrl+Q")),
    );
    
    let edit_menu = Submenu::new(
        "编辑",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste),
    );
    
    let view_menu = Submenu::new(
        "视图",
        Menu::new()
            .add_item(CustomMenuItem::new("zoom_in".to_string(), "放大"))
            .add_item(CustomMenuItem::new("zoom_out".to_string(), "缩小"))
            .add_item(CustomMenuItem::new("zoom_reset".to_string(), "重置缩放")),
    );
    
    let help_menu = Submenu::new(
        "帮助",
        Menu::new()
            .add_item(CustomMenuItem::new("about".to_string(), "关于")),
    );
    
    let menu = Menu::new()
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu)
        .add_submenu(help_menu);
    
    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            println!("菜单项点击: {}", event.menu_item_id());
            // 这里可以添加具体的菜单项处理逻辑
        })
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| {
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    let window = app.get_window("main").unwrap();
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    let item_handle = app.tray_handle().get_item(&id);
                    match id.as_str() {
                        "show" => {
                            let window = app.get_window("main").unwrap();
                            window.show().unwrap();
                            window.set_focus().unwrap();
                            item_handle.set_title("隐藏窗口").unwrap();
                        }
                        "hide" => {
                            let window = app.get_window("main").unwrap();
                            window.hide().unwrap();
                            item_handle.set_title("显示窗口").unwrap();
                        }
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
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

## 常见问题解答

### Q1: 托盘图标不显示？

**可能原因**：
1. 未启用 `tray-icon` 特性
2. 图标文件不存在或路径错误
3. 系统不支持托盘（某些Linux发行版需要额外依赖）

**解决方法**：
- 检查 `Cargo.toml` 中是否启用了 `tray-icon` 特性
- 确认图标文件存在于 `src-tauri/icons/` 目录
- Linux系统可能需要安装 `libayatana-appindicator3-dev` 或 `libappindicator3-dev`

### Q2: 菜单项点击无反应？

**解决方法**：
- 确认注册了 `on_menu_event` 处理器
- 检查菜单项ID是否匹配
- 添加日志输出调试信息

### Q3: 窗口关闭后应用退出？

**解决方法**：
- 在 `tauri.conf.json` 中设置窗口关闭行为为 `"hide"`
- 或者移除窗口的关闭按钮，改用隐藏

### Q4: 快捷键不工作？

**解决方法**：
- 确认快捷键格式正确（如 `CmdOrCtrl+S`）
- 检查是否有其他应用占用了相同的快捷键
- 某些平台可能需要额外的权限

## 总结与回顾

### 本节重点

1. **系统托盘**：
   - 需要启用 `tray-icon` 特性
   - 使用 `SystemTray` 和 `SystemTrayMenu` 创建托盘
   - 通过 `on_system_tray_event` 处理托盘事件
   - 可以配置窗口关闭行为为隐藏而不是退出

2. **应用菜单栏**：
   - 使用 `Menu` 和 `Submenu` 创建菜单结构
   - 使用 `CustomMenuItem` 创建自定义菜单项
   - 使用原生 `MenuItem` 获得平台标准行为
   - 通过 `on_menu_event` 处理菜单事件

3. **最佳实践**：
   - 托盘图标应该简洁明了
   - 菜单项应该提供清晰的标签
   - 合理使用快捷键提升用户体验
   - 考虑不同平台的差异

### 下节预告

下一课我们将学习**插件系统与扩展**，包括：
- 了解TAURI插件生态系统
- 安装和使用第三方插件
- 创建自定义插件
- 插件的最佳实践

---

**学习建议**：
- 完成本课的所有实践操作
- 尝试不同的托盘菜单配置
- 测试菜单快捷键功能
- 完成课后作业巩固知识

