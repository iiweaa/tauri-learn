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

在Tauri 2.0中，系统托盘和菜单API有重大变化：

- **系统托盘**：使用 `TrayIcon` 和 `TrayIconBuilder` API
- **应用菜单**：使用 `Menu` 和 `MenuItem` API
- **事件处理**：通过 `on_menu_event` 和 `on_tray_icon_event` 处理事件
- **双端支持**：可以在JavaScript端或Rust端创建和管理

**参考文档**：
- [Tauri 2.0 系统托盘文档](https://v2.tauri.org.cn/learn/system-tray/)
- [Tauri 2.0 窗口菜单文档](https://v2.tauri.org.cn/learn/window-menu/)

## 实践操作

### 步骤1：配置系统托盘

#### 1.1 启用托盘功能

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

### 步骤2：创建系统托盘（Rust端实现）

根据 [Tauri 2.0 官方文档](https://v2.tauri.org.cn/learn/system-tray/)，我们可以在Rust端创建系统托盘。

#### 2.1 创建托盘菜单（Rust端）

编辑 `src-tauri/src/lib.rs`，在 `setup` 函数中添加系统托盘相关代码：

```rust
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 创建菜单项
            let show_item = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let hide_item = MenuItem::with_id(app, "hide", "隐藏窗口", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            
            // 创建菜单
            let menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item)?;
            
            // 创建系统托盘图标
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("我的TAURI学习应用")
                .menu_on_left_click(true)  // 左键点击也显示菜单
                .on_menu_event(move |app, event| {
                    // 处理菜单项点击事件
                    match event.id.as_ref() {
                        "show" => {
                            // 显示主窗口
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.unminimize();
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "hide" => {
                            // 隐藏主窗口
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.hide();
                            }
                        }
                        "quit" => {
                            // 退出应用
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    // 处理托盘图标事件（点击、双击等）
                    use tauri::tray::{MouseButton, MouseButtonState, TrayIconEvent};
                    
                    match event {
                        TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            // 左键点击：显示/隐藏窗口
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.unminimize();
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                        _ => {}
                    }
                })
                .build(app)?;
            
            Ok(())
        })
        // ... 其他配置 ...
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**关键点说明**：
- `MenuItem::with_id`：创建菜单项，参数为 `(app, id, text, enabled, accelerator)`
- `Menu::with_items`：创建菜单，传入菜单项数组
- `TrayIconBuilder::new()`：创建托盘图标构建器
- `.menu(&menu)`：设置托盘菜单
- `.on_menu_event`：处理菜单项点击事件
- `.on_tray_icon_event`：处理托盘图标本身的事件（点击、双击等）
- `.menu_on_left_click(true)`：设置左键点击也显示菜单

#### 2.2 配置窗口关闭行为

默认情况下，关闭窗口会退出应用。如果我们希望关闭窗口后应用继续在托盘中运行，需要修改窗口的关闭行为。

编辑 `src-tauri/src/lib.rs`，添加窗口关闭事件处理：

```rust
.on_window_event(|window, event| {
    // 处理窗口关闭事件：隐藏窗口而不是退出应用
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        let window_label = window.label().to_string();
        
        // 只对主窗口（main）进行特殊处理：隐藏而不是关闭
        if window_label == "main" {
            // 阻止窗口关闭
            api.prevent_close();
            
            // 隐藏窗口
            let _ = window.hide();
        }
        // 其他窗口允许正常关闭
    }
})
```

### 步骤3：创建系统托盘（JavaScript端实现）

根据 [Tauri 2.0 官方文档](https://v2.tauri.org.cn/learn/system-tray/)，我们也可以在JavaScript端创建系统托盘。

#### 3.1 创建托盘菜单（JavaScript端）

在 `src/main.jsx` 或 `src/App.jsx` 中：

```javascript
import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu } from '@tauri-apps/api/menu';

// 创建托盘菜单
const menu = await Menu.new({
  items: [
    {
      id: 'show',
      text: '显示窗口',
      action: () => {
        // 显示窗口的逻辑
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const window = getCurrentWindow();
        window.show();
        window.setFocus();
      },
    },
    {
      id: 'hide',
      text: '隐藏窗口',
      action: () => {
        // 隐藏窗口的逻辑
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const window = getCurrentWindow();
        window.hide();
      },
    },
    {
      type: 'Separator',  // 分隔线
    },
    {
      id: 'quit',
      text: '退出',
      action: () => {
        // 退出应用
        const { exit } = await import('@tauri-apps/api/app');
        exit(0);
      },
    },
  ],
});

// 创建系统托盘图标
const tray = await TrayIcon.new({
  menu: menu,
  menuOnLeftClick: true,  // 左键点击也显示菜单
  tooltip: '我的TAURI学习应用',
  action: (event) => {
    // 处理托盘图标事件
    switch (event.type) {
      case 'Click':
        // 左键点击：显示/隐藏窗口
        if (event.button === 'Left' && event.buttonState === 'Up') {
          const { getCurrentWindow } = await import('@tauri-apps/api/window');
          const window = getCurrentWindow();
          if (window.isVisible()) {
            window.hide();
          } else {
            window.show();
            window.setFocus();
          }
        }
        break;
      case 'DoubleClick':
        // 双击事件
        console.log('托盘图标被双击');
        break;
      default:
        break;
    }
  },
});
```

**关键点说明**：
- `Menu.new()`：创建菜单，传入菜单项数组
- 菜单项的 `action` 属性：直接定义回调函数
- `TrayIcon.new()`：创建托盘图标
- `action` 选项：处理托盘图标本身的事件

**注意**：JavaScript端和Rust端不要同时创建托盘，选择一种方式即可。

### 步骤4：创建应用窗口菜单栏

#### 4.1 创建窗口菜单（Rust端）

编辑 `src-tauri/src/lib.rs`：

```rust
use tauri::menu::{Menu, MenuItem, Submenu};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 创建文件菜单
            let new_item = MenuItem::with_id(app, "new", "新建", true, Some("CmdOrCtrl+N"))?;
            let open_item = MenuItem::with_id(app, "open", "打开", true, Some("CmdOrCtrl+O"))?;
            let save_item = MenuItem::with_id(app, "save", "保存", true, Some("CmdOrCtrl+S"))?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, Some("CmdOrCtrl+Q"))?;
            
            let file_menu = Submenu::with_items(
                app,
                "文件",
                true,
                &[&new_item, &open_item, &save_item, &quit_item],
            )?;
            
            // 创建编辑菜单
            let undo_item = MenuItem::with_id(app, "undo", "撤销", true, Some("CmdOrCtrl+Z"))?;
            let redo_item = MenuItem::with_id(app, "redo", "重做", true, Some("CmdOrCtrl+Shift+Z"))?;
            let cut_item = MenuItem::with_id(app, "cut", "剪切", true, Some("CmdOrCtrl+X"))?;
            let copy_item = MenuItem::with_id(app, "copy", "复制", true, Some("CmdOrCtrl+C"))?;
            let paste_item = MenuItem::with_id(app, "paste", "粘贴", true, Some("CmdOrCtrl+V"))?;
            
            let edit_menu = Submenu::with_items(
                app,
                "编辑",
                true,
                &[&undo_item, &redo_item, &cut_item, &copy_item, &paste_item],
            )?;
            
            // 创建主菜单
            let menu = Menu::with_items(app, &[&file_menu, &edit_menu])?;
            
            // 设置应用菜单
            app.set_menu(menu)?;
            
            // 监听菜单事件
            app.on_menu_event(|_app, event| {
                match event.id().0.as_str() {
                    "new" => println!("新建文件"),
                    "open" => println!("打开文件"),
                    "save" => println!("保存文件"),
                    "quit" => std::process::exit(0),
                    "undo" => println!("撤销"),
                    "redo" => println!("重做"),
                    "cut" => println!("剪切"),
                    "copy" => println!("复制"),
                    "paste" => println!("粘贴"),
                    _ => {}
                }
            });
            
            Ok(())
        })
        // ... 其他配置 ...
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 4.2 创建窗口菜单（JavaScript端）

在 `src/main.jsx` 或 `src/App.jsx` 中：

```javascript
import { Menu, MenuItem, Submenu } from '@tauri-apps/api/menu';

// 创建文件菜单
const fileMenu = await Submenu.new({
  text: '文件',
  items: [
    {
      id: 'new',
      text: '新建',
      accelerator: 'CmdOrCtrl+N',
    },
    {
      id: 'open',
      text: '打开',
      accelerator: 'CmdOrCtrl+O',
    },
    {
      id: 'save',
      text: '保存',
      accelerator: 'CmdOrCtrl+S',
    },
    {
      type: 'Separator',
    },
    {
      id: 'quit',
      text: '退出',
      accelerator: 'CmdOrCtrl+Q',
    },
  ],
});

// 创建编辑菜单
const editMenu = await Submenu.new({
  text: '编辑',
  items: [
    {
      id: 'undo',
      text: '撤销',
      accelerator: 'CmdOrCtrl+Z',
    },
    {
      id: 'redo',
      text: '重做',
      accelerator: 'CmdOrCtrl+Shift+Z',
    },
    {
      type: 'Separator',
    },
    {
      id: 'cut',
      text: '剪切',
      accelerator: 'CmdOrCtrl+X',
    },
    {
      id: 'copy',
      text: '复制',
      accelerator: 'CmdOrCtrl+C',
    },
    {
      id: 'paste',
      text: '粘贴',
      accelerator: 'CmdOrCtrl+V',
    },
  ],
});

// 创建主菜单
const menu = await Menu.new({
  items: [fileMenu, editMenu],
});

// 设置为应用菜单
await menu.setAsAppMenu();
```

**参考文档**：详细菜单创建方法请参考 [Tauri 2.0 窗口菜单文档](https://v2.tauri.org.cn/learn/window-menu/)。

### 步骤5：托盘图标配置

#### 5.1 使用默认图标

托盘图标会自动使用应用的主图标。如果应用有图标配置，托盘会自动使用。

#### 5.2 自定义托盘图标

**Rust端**：

```rust
use tauri::image::Image;

let icon = Image::from_bytes(include_bytes!("../icons/tray-icon.png"))?;

let _tray = TrayIconBuilder::new()
    .icon(icon)
    .build(app)?;
```

**JavaScript端**：

```javascript
import { Image } from '@tauri-apps/api/image';

const icon = await Image.fromPath('../icons/tray-icon.png');

const tray = await TrayIcon.new({
  icon: icon,
  // ... 其他选项
});
```

## 最佳实践

### 1. 选择实现方式

- **Rust端实现**：适合需要复杂逻辑或性能要求高的场景
- **JavaScript端实现**：适合需要与前端代码紧密集成的场景
- **建议**：优先使用Rust端实现，更稳定可靠

### 2. 窗口关闭行为

- 如果应用需要在后台运行，应该隐藏窗口而不是关闭
- 使用 `api.prevent_close()` 阻止窗口关闭
- 在托盘菜单中提供"退出"选项，让用户真正退出应用

### 3. 菜单项设计

- 提供常用的快捷操作
- 使用分隔线组织菜单项
- 为常用操作添加快捷键
- 根据窗口状态动态更新菜单项文本（如"显示窗口"/"隐藏窗口"）

### 4. 事件处理

- 菜单项点击事件：使用 `on_menu_event` 处理
- 托盘图标事件：使用 `on_tray_icon_event` 处理
- 窗口事件：使用 `on_window_event` 处理窗口关闭等事件

## 总结与回顾

### 本节重点

1. **系统托盘创建**：使用 `TrayIconBuilder`（Rust）或 `TrayIcon.new()`（JavaScript）
2. **菜单创建**：使用 `Menu` 和 `MenuItem` API
3. **事件处理**：通过 `on_menu_event` 和 `on_tray_icon_event` 处理事件
4. **窗口关闭行为**：使用 `api.prevent_close()` 实现隐藏而不是关闭

### 常见问题

1. **Q: 托盘图标不显示？**
   - A: 检查是否启用了 `tray-icon` 特性
   - A: 检查系统是否支持系统托盘（某些Linux发行版需要额外配置）

2. **Q: 菜单项点击没有反应？**
   - A: 检查是否正确注册了事件处理器
   - A: 检查菜单项的 `id` 是否与事件处理中的匹配

3. **Q: 窗口关闭后应用退出？**
   - A: 检查是否正确实现了 `on_window_event` 和 `api.prevent_close()`

### 下节预告

下一课我们将学习插件系统与扩展，了解如何使用Tauri插件扩展应用功能。

## 参考资料

- [Tauri 2.0 系统托盘文档](https://v2.tauri.org.cn/learn/system-tray/)
- [Tauri 2.0 窗口菜单文档](https://v2.tauri.org.cn/learn/window-menu/)
- [Tauri API 参考](https://v2.tauri.app/api/)
