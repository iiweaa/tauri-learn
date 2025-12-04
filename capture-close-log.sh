#!/bin/bash
# 捕获窗口关闭事件的日志

LOG_FILE="/tmp/tauri-full.log"
OUTPUT_FILE="/tmp/close-event-log.txt"

echo "=========================================="
echo "窗口关闭事件日志捕获工具"
echo "=========================================="
echo ""
echo "请按照以下步骤操作："
echo "1. 确保应用窗口已打开"
echo "2. 打开浏览器开发者工具（F12），切换到 Console 标签页"
echo "3. 点击窗口的关闭按钮（X）"
echo "4. 等待 3 秒后，日志将自动显示"
echo ""
echo "=========================================="
echo ""

# 获取当前日志文件的行数
INITIAL_LINES=$(wc -l < "$LOG_FILE" 2>/dev/null || echo "0")

echo "当前日志行数: $INITIAL_LINES"
echo "等待您点击关闭按钮..."
echo ""
echo "（点击关闭按钮后，等待 3 秒，然后按 Enter 键查看日志）"
read -p "按 Enter 继续..." 

sleep 3

# 获取新的日志行数
CURRENT_LINES=$(wc -l < "$LOG_FILE" 2>/dev/null || echo "0")

echo ""
echo "=========================================="
echo "捕获到的日志（最后 50 行，包含关键词）："
echo "=========================================="
echo ""

# 显示相关的日志
tail -100 "$LOG_FILE" 2>/dev/null | grep -E "\[RUST\]|\[JS\]|窗口|关闭|tray|托盘|error|Error|失败|成功|创建" | tail -30

echo ""
echo "=========================================="
echo "完整日志文件位置: $LOG_FILE"
echo "=========================================="

