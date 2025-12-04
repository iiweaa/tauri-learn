// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};

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

// 获取当前时间戳（Unix时间戳，秒）
#[tauri::command]
fn get_timestamp() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

// 获取系统信息
#[tauri::command]
fn get_system_info() -> String {
    format!("操作系统类型: {}", std::env::consts::OS)
}

// 安全除法：正确处理除零错误
#[tauri::command]
fn safe_divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("除数不能为零！".to_string())
    } else {
        Ok(a / b)
    }
}

// 处理数字数组，返回统计信息
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

// 计算器命令：接收运算类型和两个数字，返回计算结果
// 使用Result类型来处理错误（特别是除零错误）
#[tauri::command]
fn calculate(operation: &str, a: f64, b: f64) -> Result<f64, String> {
    // 验证输入是否为有效数字
    if a.is_nan() || b.is_nan() {
        return Err("输入的数字无效".to_string());
    }
    
    if a.is_infinite() || b.is_infinite() {
        return Err("输入的数字超出范围".to_string());
    }
    
    // 根据运算类型执行相应的计算
    match operation {
        "add" => Ok(a + b),
        "subtract" => Ok(a - b),
        "multiply" => Ok(a * b),
        "divide" => {
            // 处理除零错误
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
    use tauri::Manager;
    use tauri::Emitter;
    use tauri::menu::{Menu, MenuItem, Submenu};
    use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
    
    tauri::Builder::default()
        .setup(|app| {
            // ========== 创建应用窗口菜单栏 ==========
            // 文件菜单
            let new_item = MenuItem::with_id(app, "new", "新建", true, Some("CmdOrCtrl+N"))?;
            let open_item = MenuItem::with_id(app, "open", "打开", true, Some("CmdOrCtrl+O"))?;
            let save_item = MenuItem::with_id(app, "save", "保存", true, Some("CmdOrCtrl+S"))?;
            let save_as_item = MenuItem::with_id(app, "save_as", "另存为", true, None::<&str>)?;
            let quit_app_item = MenuItem::with_id(app, "quit_app", "退出", true, Some("CmdOrCtrl+Q"))?;
            
            let file_menu = Submenu::with_items(
                app,
                "文件",
                true,
                &[&new_item, &open_item, &save_item, &save_as_item, &quit_app_item],
            )?;
            
            // 编辑菜单
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
            
            // 视图菜单
            let zoom_in_item = MenuItem::with_id(app, "zoom_in", "放大", true, Some("CmdOrCtrl+Plus"))?;
            let zoom_out_item = MenuItem::with_id(app, "zoom_out", "缩小", true, Some("CmdOrCtrl+-"))?;
            let zoom_reset_item = MenuItem::with_id(app, "zoom_reset", "重置缩放", true, Some("CmdOrCtrl+0"))?;
            
            let view_menu = Submenu::with_items(
                app,
                "视图",
                true,
                &[&zoom_in_item, &zoom_out_item, &zoom_reset_item],
            )?;
            
            // 帮助菜单
            let about_item = MenuItem::with_id(app, "about", "关于", true, None::<&str>)?;
            
            let help_menu = Submenu::with_items(
                app,
                "帮助",
                true,
                &[&about_item],
            )?;
            
            // 创建主菜单
            let app_menu = Menu::with_items(app, &[&file_menu, &edit_menu, &view_menu, &help_menu])?;
            
            // 设置应用菜单
            app.set_menu(app_menu)?;
            
            // 监听应用菜单事件
            app.on_menu_event(|app, event| {
                match event.id.as_ref() {
                    "new" => {
                        eprintln!("[RUST] 菜单：新建文件");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "new");
                        }
                    }
                    "open" => {
                        eprintln!("[RUST] 菜单：打开文件");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "open");
                        }
                    }
                    "save" => {
                        eprintln!("[RUST] 菜单：保存文件");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "save");
                        }
                    }
                    "save_as" => {
                        eprintln!("[RUST] 菜单：另存为");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "save_as");
                        }
                    }
                    "quit_app" => {
                        eprintln!("[RUST] 菜单：退出应用");
                        std::process::exit(0);
                    }
                    "undo" => {
                        eprintln!("[RUST] 菜单：撤销");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "undo");
                        }
                    }
                    "redo" => {
                        eprintln!("[RUST] 菜单：重做");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "redo");
                        }
                    }
                    "cut" => {
                        eprintln!("[RUST] 菜单：剪切");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "cut");
                        }
                    }
                    "copy" => {
                        eprintln!("[RUST] 菜单：复制");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "copy");
                        }
                    }
                    "paste" => {
                        eprintln!("[RUST] 菜单：粘贴");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "paste");
                        }
                    }
                    "zoom_in" => {
                        eprintln!("[RUST] 菜单：放大");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "zoom_in");
                        }
                    }
                    "zoom_out" => {
                        eprintln!("[RUST] 菜单：缩小");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "zoom_out");
                        }
                    }
                    "zoom_reset" => {
                        eprintln!("[RUST] 菜单：重置缩放");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "zoom_reset");
                        }
                    }
                    "about" => {
                        eprintln!("[RUST] 菜单：关于");
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("menu-action", "about");
                        }
                    }
                    _ => {
                        eprintln!("[RUST] 未知菜单项: {:?}", event.id);
                    }
                }
            });
            
            // ========== 创建系统托盘菜单 ==========
            let show_item = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let hide_item = MenuItem::with_id(app, "hide", "隐藏窗口", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            
            // 创建托盘菜单
            let tray_menu = Menu::with_items(app, &[&show_item, &hide_item, &quit_item])?;
            
            // 创建系统托盘图标
            let _tray = TrayIconBuilder::new()
                .menu(&tray_menu)
                .tooltip("我的TAURI学习应用")
                .show_menu_on_left_click(true)  // 左键点击也显示菜单
                .on_menu_event(move |app, event| {
                    // 处理菜单项点击事件
                    eprintln!("[RUST] 托盘菜单事件: {:?}", event.id);
                    match event.id.as_ref() {
                        "show" => {
                            eprintln!("[RUST] 显示窗口菜单项被点击");
                            // 显示主窗口 - 尝试多种方法获取窗口
                            let window = app.get_webview_window("main")
                                .or_else(|| {
                                    eprintln!("[RUST] get_webview_window 失败，尝试 webview_windows");
                                    let all_windows = app.webview_windows();
                                    let window_labels: Vec<String> = all_windows.keys().cloned().collect();
                                    eprintln!("[RUST] 所有可用窗口标签: {:?}", window_labels);
                                    all_windows.get("main").cloned()
                                });
                            
                            if let Some(window) = window {
                                eprintln!("[RUST] ✅ 成功获取主窗口");
                                
                                // 检查窗口当前状态
                                if let Ok(is_visible) = window.is_visible() {
                                    eprintln!("[RUST] 窗口当前可见状态: {}", is_visible);
                                }
                                
                                // 检查窗口是否最小化
                                if let Ok(is_minimized) = window.is_minimized() {
                                    eprintln!("[RUST] 窗口是否最小化: {}", is_minimized);
                                    if is_minimized {
                                        // 先取消最小化
                                        match window.unminimize() {
                                            Ok(_) => eprintln!("[RUST] 取消最小化成功"),
                                            Err(e) => eprintln!("[RUST] 取消最小化失败: {:?}", e),
                                        }
                                    }
                                }
                                
                                // 显示窗口 - 使用异步方式，确保窗口真正显示
                                match window.show() {
                                    Ok(_) => {
                                        eprintln!("[RUST] 窗口显示命令执行成功");
                                        
                                        // 等待一小段时间确保窗口显示
                                        std::thread::sleep(std::time::Duration::from_millis(200));
                                        
                                        // 再次检查窗口状态
                                        if let Ok(is_visible) = window.is_visible() {
                                            eprintln!("[RUST] 显示后窗口可见状态: {}", is_visible);
                                            
                                            // 如果窗口仍然不可见，尝试其他方法
                                            if !is_visible {
                                                eprintln!("[RUST] ⚠️ 窗口显示后仍然不可见，尝试强制显示");
                                                
                                                // 尝试将窗口居中（确保窗口在可见区域）
                                                if let Err(e) = window.center() {
                                                    eprintln!("[RUST] 窗口居中失败: {:?}", e);
                                                } else {
                                                    eprintln!("[RUST] 窗口已居中");
                                                }
                                                
                                                // 再次尝试显示
                                                if let Err(e) = window.show() {
                                                    eprintln!("[RUST] 再次显示窗口失败: {:?}", e);
                                                } else {
                                                    eprintln!("[RUST] 再次显示窗口成功");
                                                    std::thread::sleep(std::time::Duration::from_millis(100));
                                                }
                                            }
                                        }
                                        
                                        // 设置焦点
                                        match window.set_focus() {
                                            Ok(_) => eprintln!("[RUST] 窗口焦点设置成功"),
                                            Err(e) => eprintln!("[RUST] 窗口焦点设置失败: {:?}", e),
                                        }
                                        
                                        // 最终检查窗口状态
                                        std::thread::sleep(std::time::Duration::from_millis(100));
                                        if let Ok(is_visible) = window.is_visible() {
                                            eprintln!("[RUST] 窗口最终可见状态: {}", is_visible);
                                        }
                                    }
                                    Err(e) => eprintln!("[RUST] ❌ 窗口显示失败: {:?}", e),
                                }
                            } else {
                                eprintln!("[RUST] ❌ 无法获取主窗口（标签：main）");
                                // 尝试列出所有窗口
                                let all_windows = app.webview_windows();
                                let window_labels: Vec<String> = all_windows.keys().cloned().collect();
                                eprintln!("[RUST] 所有可用窗口标签: {:?}", window_labels);
                                
                                // 如果主窗口不存在，尝试重新创建（作为最后手段）
                                eprintln!("[RUST] ⚠️ 主窗口不存在，可能需要重新创建");
                            }
                        }
                        "hide" => {
                            eprintln!("[RUST] 隐藏窗口菜单项被点击");
                            // 隐藏主窗口
                            if let Some(window) = app.get_webview_window("main") {
                                match window.hide() {
                                    Ok(_) => eprintln!("[RUST] 窗口隐藏成功"),
                                    Err(e) => eprintln!("[RUST] 窗口隐藏失败: {:?}", e),
                                }
                            } else {
                                eprintln!("[RUST] ❌ 无法获取主窗口（标签：main）");
                            }
                        }
                        "quit" => {
                            eprintln!("[RUST] 退出菜单项被点击");
                            // 退出应用
                            std::process::exit(0);
                        }
                        _ => {
                            eprintln!("[RUST] 未知菜单项: {:?}", event.id);
                        }
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    // 处理托盘图标事件（点击、双击等）
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
        .on_window_event(|window, event| {
            // 处理窗口关闭事件：隐藏窗口而不是退出应用
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let window_label = window.label().to_string();
                eprintln!("[RUST] ========== 窗口关闭请求 ==========");
                eprintln!("[RUST] 窗口标签: {:?}", window_label);
                
                // 只对主窗口（main）进行特殊处理：隐藏而不是关闭
                if window_label == "main" {
                    eprintln!("[RUST] 这是主窗口，阻止关闭并隐藏");
                    
                    // 重要：必须先调用 prevent_close()，然后再隐藏窗口
                    // 这样可以确保窗口不会被销毁
                    api.prevent_close();
                    eprintln!("[RUST] ✅ 已阻止窗口关闭");
                    
                    // 然后隐藏窗口
                    match window.hide() {
                        Ok(_) => {
                            eprintln!("[RUST] ✅ 主窗口隐藏成功");
                            
                            // 验证窗口是否仍然存在
                            eprintln!("[RUST] 窗口标签验证: {:?}", window.label());
                            
                            // 验证窗口是否仍然可以通过 app 获取
                            // 注意：这里不能直接使用 app，需要通过其他方式验证
                            eprintln!("[RUST] 窗口对象仍然有效");
                            
                            // 尝试通过窗口的 app_handle 验证窗口是否仍然在列表中
                            let app_handle = window.app_handle();
                            let all_windows = app_handle.webview_windows();
                            let window_labels: Vec<String> = all_windows.keys().cloned().collect();
                            eprintln!("[RUST] 隐藏后所有可用窗口标签: {:?}", window_labels);
                        }
                        Err(e) => {
                            eprintln!("[RUST] ❌ 主窗口隐藏失败: {:?}", e);
                        }
                    }
                    
                    eprintln!("[RUST] ========== 窗口关闭处理完成 ==========");
                } else {
                    eprintln!("[RUST] 非主窗口关闭，允许正常关闭");
                }
            }
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())      // 注册文件系统插件
        .plugin(tauri_plugin_dialog::init())  // 注册对话框插件
        .plugin(tauri_plugin_notification::init())  // 注册通知插件
        .invoke_handler(tauri::generate_handler![greet, calculate, get_timestamp, get_system_info, process_numbers, safe_divide])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
