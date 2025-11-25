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
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())      // 注册文件系统插件
        .plugin(tauri_plugin_dialog::init())  // 注册对话框插件
        .plugin(tauri_plugin_notification::init())  // 注册通知插件
        .invoke_handler(tauri::generate_handler![greet, calculate, get_timestamp, get_system_info, process_numbers, safe_divide])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
