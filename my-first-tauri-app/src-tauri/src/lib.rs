// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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
        .invoke_handler(tauri::generate_handler![greet, calculate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
