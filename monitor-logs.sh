#!/bin/bash
# 监控 Tauri 应用的日志

echo "=== 开始监控 Tauri 应用日志 ==="
echo "按 Ctrl+C 停止监控"
echo ""

# 监控 Rust 后端日志（从进程的标准错误输出）
echo "--- Rust 后端日志（stderr）---"
# 查找 my-first-tauri-app 进程并监控其输出
# 注意：这需要应用在运行时输出到 stderr

# 监控前端日志文件（如果存在）
if [ -f /tmp/tauri-debug.log ]; then
    echo "--- 前端日志（从 /tmp/tauri-debug.log）---"
    tail -f /tmp/tauri-debug.log 2>/dev/null &
    TAIL_PID=$!
fi

# 等待用户中断
trap "kill $TAIL_PID 2>/dev/null; exit" INT TERM

# 提示用户如何查看日志
echo ""
echo "提示："
echo "1. 打开应用窗口"
echo "2. 打开浏览器开发者工具（F12），查看 Console 标签页"
echo "3. 点击窗口的关闭按钮（X）"
echo "4. 观察终端和浏览器控制台的输出"
echo ""
echo "监控中...（按 Ctrl+C 停止）"

# 保持脚本运行
wait

