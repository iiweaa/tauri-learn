#!/bin/bash
# 实时监控窗口关闭事件的日志

echo "=========================================="
echo "监控 Tauri 应用窗口关闭事件日志"
echo "=========================================="
echo ""
echo "请按照以下步骤操作："
echo "1. 确保应用窗口已打开"
echo "2. 打开浏览器开发者工具（F12），切换到 Console 标签页"
echo "3. 点击窗口的关闭按钮（X）"
echo "4. 观察下面的日志输出"
echo ""
echo "=========================================="
echo "开始监控日志..."
echo "（按 Ctrl+C 停止监控）"
echo "=========================================="
echo ""

# 监控日志文件
tail -f /tmp/tauri-full.log 2>/dev/null | grep --line-buffered -E "\[RUST\]|\[JS\]|窗口|关闭|tray|托盘|error|Error|失败" || {
    echo "等待日志输出..."
    sleep 2
    tail -f /tmp/tauri-full.log 2>/dev/null
}

