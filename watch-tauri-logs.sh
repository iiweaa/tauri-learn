#!/bin/bash
# 实时监控 Tauri 应用的日志

LOG_FILE="/tmp/tauri-restart.log"

echo "=== 实时监控 Tauri 应用日志 ==="
echo "日志文件: $LOG_FILE"
echo "按 Ctrl+C 停止监控"
echo "---------------------------------"

# 确保日志文件存在
touch $LOG_FILE

# 实时查看日志，并高亮显示关键信息
tail -f $LOG_FILE | grep --color=always -E '\[RUST\]|\[JS\]|显示|窗口|error|Error|失败|成功|✅|❌|WARNING|WARN' || tail -f $LOG_FILE

