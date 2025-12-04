import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, Window, LogicalSize } from "@tauri-apps/api/window";
import { readTextFile, writeTextFile, readDir, exists, remove } from '@tauri-apps/plugin-fs';
import { open, save, message, ask } from '@tauri-apps/plugin-dialog';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import "./App.css";

// 检查是否在Tauri环境中运行
function isTauri() {
  // 检查多种方式来确定是否在Tauri环境中
  if (typeof window === 'undefined') return false;
  
  // 方式1：检查 window.__TAURI__
  if (window.__TAURI__ !== undefined) return true;
  
  // 方式2：检查是否有Tauri API可用（通过尝试访问Tauri API）
  try {
    // 如果能够访问 @tauri-apps/api，说明在Tauri环境中
    // 这里我们通过检查是否有invoke函数来判断
    if (typeof invoke !== 'undefined') return true;
  } catch (e) {
    // 忽略错误
  }
  
  // 方式3：检查用户代理（Tauri应用通常有特定的user agent）
  if (navigator.userAgent.includes('Tauri')) return true;
  
  return false;
}

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  
  // 计算器相关状态
  const [numA, setNumA] = useState("");
  const [numB, setNumB] = useState("");
  const [operation, setOperation] = useState("add"); // 运算类型：add, subtract, multiply, divide
  const [result, setResult] = useState("");
  const [error, setError] = useState(""); // 错误信息
  
  // 时间戳相关状态
  const [timestamp, setTimestamp] = useState("");
  const [formattedTime, setFormattedTime] = useState("");
  
  // 系统信息相关状态
  const [systemInfo, setSystemInfo] = useState("");
  
  // 数字统计相关状态
  const [numberInput, setNumberInput] = useState("");
  const [statistics, setStatistics] = useState(null);
  
  // 安全除法相关状态
  const [divideA, setDivideA] = useState("");
  const [divideB, setDivideB] = useState("");
  const [divideResult, setDivideResult] = useState("");
  const [divideError, setDivideError] = useState("");
  
  // 窗口控制相关状态
  const [windowTitle, setWindowTitle] = useState("主窗口");
  const [windowSize, setWindowSize] = useState("1200x800");
  const [isSecondaryVisible, setIsSecondaryVisible] = useState(false);

  // 文件系统相关状态
  const [fileContent, setFileContent] = useState("");
  const [currentFile, setCurrentFile] = useState(null);
  const [directoryEntries, setDirectoryEntries] = useState([]);
  const [currentDirectory, setCurrentDirectory] = useState(null);
  const [fileExists, setFileExists] = useState(null);
  const [filePathToCheck, setFilePathToCheck] = useState("");

  // 通知相关状态
  const [notificationTitle, setNotificationTitle] = useState('系统通知');
  const [notificationBody, setNotificationBody] = useState('这是一条测试通知消息！');

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  // 计算器函数：调用Rust后端的calculate命令，包含错误处理
  async function calculate() {
    // 清除之前的错误和结果
    setError("");
    setResult("");
    
    // 前端验证：检查输入是否为空
    if (numA === "" || numB === "") {
      setError("请输入两个数字！");
      return;
    }
    
    const a = parseFloat(numA);
    const b = parseFloat(numB);
    
    // 前端验证：检查是否为有效数字
    if (isNaN(a) || isNaN(b)) {
      setError("请输入有效的数字！");
      return;
    }
    
    try {
      // 调用Rust后端，传递运算类型和两个数字
      const calculatedResult = await invoke("calculate", { 
        operation, 
        a, 
        b 
      });
      
      // 获取运算符号用于显示
      const operationSymbols = {
        add: "+",
        subtract: "-",
        multiply: "×",
        divide: "÷"
      };
      
      setResult(`计算结果：${a} ${operationSymbols[operation]} ${b} = ${calculatedResult}`);
    } catch (err) {
      // 捕获Rust后端返回的错误（如除零错误）
      setError(err || "计算过程中发生错误！");
      setResult("");
    }
  }

  // 获取时间戳函数：调用Rust后端的get_timestamp命令
  async function getCurrentTimestamp() {
    try {
      // 调用Rust后端，不需要传递参数
      const ts = await invoke("get_timestamp");
      
      // 将时间戳转换为可读的日期时间
      const date = new Date(ts * 1000); // 时间戳是秒，需要乘以1000转换为毫秒
      const formatted = date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      
      setTimestamp(ts.toString());
      setFormattedTime(formatted);
    } catch (err) {
      console.error("获取时间戳失败:", err);
      setTimestamp("获取失败");
      setFormattedTime("");
    }
  }

  // 获取系统信息函数：调用Rust后端的get_system_info命令
  async function getSystemInfo() {
    try {
      const info = await invoke("get_system_info");
      setSystemInfo(info);
    } catch (err) {
      console.error("获取系统信息失败:", err);
      setSystemInfo("获取失败");
    }
  }

  // 处理数字数组函数：调用Rust后端的process_numbers命令
  async function processNumbers() {
    try {
      // 解析输入的数字（用逗号分隔）
      const numbers = numberInput
        .split(",")
        .map(s => parseFloat(s.trim()))
        .filter(n => !isNaN(n));
      
      if (numbers.length === 0) {
        setStatistics(null);
        return;
      }
      
      // 调用Rust后端，传递数字数组
      const stats = await invoke("process_numbers", { numbers });
      setStatistics(stats);
    } catch (err) {
      console.error("处理数字失败:", err);
      setStatistics(null);
    }
  }

  // 安全除法函数：调用Rust后端的safe_divide命令，包含错误处理
  async function performSafeDivide() {
    // 清除之前的结果和错误
    setDivideResult("");
    setDivideError("");
    
    // 前端验证
    if (divideA === "" || divideB === "") {
      setDivideError("请输入两个数字！");
      return;
    }
    
    const a = parseFloat(divideA);
    const b = parseFloat(divideB);
    
    if (isNaN(a) || isNaN(b)) {
      setDivideError("请输入有效的数字！");
      return;
    }
    
    try {
      // 调用Rust后端，使用try-catch捕获错误
      const result = await invoke("safe_divide", { a, b });
      setDivideResult(`结果：${a} ÷ ${b} = ${result}`);
      setDivideError("");
    } catch (err) {
      // 捕获Rust后端返回的错误（Result的Err部分）
      setDivideError(`错误：${err}`);
      setDivideResult("");
    }
  }

  // 窗口控制函数
  // 显示/隐藏辅助窗口
  async function toggleSecondaryWindow() {
    try {
      console.log("尝试获取辅助窗口...");
      
      // TAURI 2.0: 使用Window.getByLabel或Window.getAll
      let secondaryWindow = null;
      
      try {
        // 尝试使用getByLabel（需要await，因为它返回Promise）
        if (typeof Window.getByLabel === "function") {
          secondaryWindow = await Window.getByLabel("secondary");
          console.log("使用getByLabel获取窗口:", secondaryWindow);
        }
      } catch (e) {
        console.log("getByLabel失败:", e.message);
      }
      
      // 如果getByLabel失败，尝试使用getAll
      if (!secondaryWindow) {
        try {
          if (typeof Window.getAll === "function") {
            const allWindows = await Window.getAll();
            console.log("所有窗口:", allWindows);
            secondaryWindow = allWindows.find(w => w.label === "secondary");
            console.log("从getAll中找到的窗口:", secondaryWindow);
          }
        } catch (e) {
          console.log("getAll失败:", e.message);
        }
      }
      
      if (!secondaryWindow) {
        console.error("无法获取辅助窗口");
        alert("无法获取辅助窗口。请检查：\n1. 窗口是否在配置文件中定义\n2. 权限是否正确配置\n3. 查看浏览器控制台的详细错误");
        return;
      }
      
      console.log("辅助窗口对象:", secondaryWindow);
      const isVisible = await secondaryWindow.isVisible();
      console.log("辅助窗口是否可见:", isVisible);
      
      if (isVisible) {
        console.log("隐藏辅助窗口...");
        await secondaryWindow.hide();
        console.log("辅助窗口已隐藏");
        setIsSecondaryVisible(false);
      } else {
        console.log("显示辅助窗口...");
        await secondaryWindow.show();
        console.log("辅助窗口已显示");
        setIsSecondaryVisible(true);
      }
    } catch (err) {
      console.error("控制辅助窗口失败:", err);
      console.error("错误详情:", err.message, err.stack);
      alert(`控制辅助窗口失败: ${err.message || err}`);
    }
  }

  // 设置主窗口标题
  async function setMainWindowTitle() {
    try {
      const mainWindow = getCurrentWindow();
      await mainWindow.setTitle(windowTitle);
    } catch (err) {
      console.error("设置窗口标题失败:", err);
    }
  }

  // 设置主窗口大小
  async function setMainWindowSize(size) {
    try {
      console.log("设置窗口大小:", size);
      const mainWindow = getCurrentWindow();
      const [width, height] = size.split("x").map(Number);
      console.log("宽度:", width, "高度:", height);
      
      // TAURI 2.0使用LogicalSize类型
      await mainWindow.setSize(new LogicalSize(width, height));
      setWindowSize(size);
      console.log("窗口大小设置成功");
    } catch (err) {
      console.error("设置窗口大小失败:", err);
      alert(`设置窗口大小失败: ${err}`);
    }
  }

  // 居中主窗口
  async function centerMainWindow() {
    try {
      console.log("居中窗口...");
      const mainWindow = getCurrentWindow();
      await mainWindow.center();
      console.log("窗口已居中");
    } catch (err) {
      console.error("居中窗口失败:", err);
      alert(`居中窗口失败: ${err}`);
    }
  }

  // ========== 文件系统操作函数 ==========

  // 打开文件对话框并读取文件
  async function handleOpenFile() {
    try {
      console.log("打开文件对话框...");
      const selected = await open({
        multiple: false,
        filters: [
          { name: '文本文件', extensions: ['txt', 'md'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      });

      if (selected) {
        console.log("选择的文件:", selected);
        const content = await readTextFile(selected);
        setFileContent(content);
        setCurrentFile(selected);
        console.log("文件读取成功");
      } else {
        console.log("用户取消了文件选择");
      }
    } catch (error) {
      console.error("打开文件失败:", error);
      const errorMsg = error?.message || error?.toString() || String(error) || '未知错误';
      alert('打开文件失败: ' + errorMsg);
    }
  }

  // 保存文件（任务6：结合通知）
  async function handleSaveFile() {
    try {
      if (currentFile) {
        // 保存到当前文件
        console.log("保存到当前文件:", currentFile);
        await writeTextFile(currentFile, fileContent);
        console.log("文件保存成功");
        // 任务6：成功后发送通知
        await sendSuccessNotification(`文件已保存：${currentFile}`);
        alert('文件保存成功！');
      } else {
        // 另存为
        await handleSaveAs();
      }
    } catch (error) {
      console.error("保存文件失败:", error);
      const errorMsg = error?.message || error?.toString() || String(error) || '未知错误';
      // 任务6：失败后发送错误通知
      await sendErrorNotification(`文件保存失败：${errorMsg}`);
      alert('保存文件失败: ' + errorMsg);
    }
  }

  // 另存为
  async function handleSaveAs() {
    try {
      console.log("打开保存文件对话框...");
      const path = await save({
        defaultPath: 'untitled.txt',
        filters: [
          { name: '文本文件', extensions: ['txt'] }
        ]
      });

      if (path) {
        console.log("保存路径:", path);
        try {
          await writeTextFile(path, fileContent);
          setCurrentFile(path);
          console.log("文件另存为成功");
          // 任务6：成功后发送通知
          await sendSuccessNotification(`文件已另存为：${path}`);
          alert('文件保存成功！');
        } catch (writeError) {
          console.error("写入文件失败:", writeError);
          const writeErrorMsg = writeError?.message || writeError?.toString() || String(writeError) || '未知错误';
          // 任务6：失败后发送错误通知
          await sendErrorNotification(`文件另存为失败：${writeErrorMsg}`);
          alert('文件保存失败: ' + writeErrorMsg + '\n\n可能的原因：\n- 没有写入权限\n- 路径无效\n- 磁盘空间不足');
          throw writeError;
        }
      } else {
        console.log("用户取消了保存");
      }
    } catch (error) {
      console.error("另存为失败:", error);
      console.error("错误详情:", {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        error: error
      });
      
      // 更详细的错误信息处理
      let errorMsg = '未知错误';
      try {
        if (error) {
          if (error.message) {
            errorMsg = error.message;
          } else if (typeof error === 'string') {
            errorMsg = error;
          } else if (error.toString && typeof error.toString === 'function') {
            const str = error.toString();
            if (str !== '[object Object]') {
              errorMsg = str;
            } else {
              errorMsg = JSON.stringify(error);
            }
          } else {
            errorMsg = String(error);
          }
        }
      } catch (e) {
        errorMsg = '无法解析错误信息';
      }
      
      alert('另存为失败: ' + errorMsg + '\n\n可能的原因：\n- 对话框被取消\n- 没有保存权限\n- 路径无效');
    }
  }

  // 选择目录并读取目录内容
  async function handleSelectDirectory() {
    try {
      console.log("打开目录选择对话框...");
      const selected = await open({
        multiple: false,
        directory: true
      });

      if (selected) {
        console.log("选择的目录:", selected);
        setCurrentDirectory(selected);
        
        // 读取目录内容
        const entries = await readDir(selected);
        console.log("目录内容:", entries);
        setDirectoryEntries(entries);
      } else {
        console.log("用户取消了目录选择");
      }
    } catch (error) {
      console.error("选择目录失败:", error);
      const errorMsg = error?.message || error?.toString() || String(error) || '未知错误';
      alert('选择目录失败: ' + errorMsg);
    }
  }

  // 检查文件是否存在
  async function handleCheckFileExists() {
    try {
      if (!filePathToCheck.trim()) {
        alert('请输入文件路径');
        return;
      }

      console.log("检查文件是否存在:", filePathToCheck);
      
      // 尝试检查文件是否存在
      const existsResult = await exists(filePathToCheck.trim());
      setFileExists(existsResult);
      
      if (existsResult) {
        console.log("文件存在");
      } else {
        console.log("文件不存在");
      }
    } catch (error) {
      console.error("检查文件失败:", error);
      console.error("错误详情:", {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        error: error
      });
      
      // 更详细的错误信息处理
      let errorMsg = '未知错误';
      try {
        if (error) {
          if (error.message) {
            errorMsg = error.message;
          } else if (typeof error === 'string') {
            errorMsg = error;
          } else if (error.toString && typeof error.toString === 'function') {
            const str = error.toString();
            if (str !== '[object Object]') {
              errorMsg = str;
            } else {
              errorMsg = JSON.stringify(error);
            }
          } else {
            errorMsg = String(error);
          }
        }
      } catch (e) {
        errorMsg = '无法解析错误信息';
      }
      
      alert('检查文件失败: ' + errorMsg + '\n\n提示：请确保路径格式正确，可以使用文件对话框选择文件。');
      setFileExists(null);
    }
  }

  // 通知相关函数
  // 检查通知权限
  async function checkNotificationPermission() {
    try {
      const granted = await isPermissionGranted();
      if (!granted) {
        const permission = await requestPermission();
        return permission === 'granted';
      }
      return granted;
    } catch (error) {
      console.error('检查通知权限失败:', error);
      return false;
    }
  }

  // 任务7：自定义通知样式 - 辅助函数
  // 发送成功通知
  async function sendSuccessNotification(message) {
    try {
      const granted = await checkNotificationPermission();
      if (granted) {
        await sendNotification({
          title: '✅ 操作成功',
          body: message,
        });
        console.log('成功通知已发送:', message);
      } else {
        console.warn('通知权限未授予，无法发送成功通知');
        alert('通知权限未授予，请先授予通知权限');
      }
    } catch (error) {
      console.error('发送成功通知失败:', error);
      alert('发送成功通知失败: ' + (error.message || String(error)));
    }
  }

  // 发送错误通知
  async function sendErrorNotification(message) {
    try {
      const granted = await checkNotificationPermission();
      if (granted) {
        await sendNotification({
          title: '❌ 操作失败',
          body: message,
        });
        console.log('错误通知已发送:', message);
      } else {
        console.warn('通知权限未授予，无法发送错误通知');
        alert('通知权限未授予，请先授予通知权限');
      }
    } catch (error) {
      console.error('发送错误通知失败:', error);
      alert('发送错误通知失败: ' + (error.message || String(error)));
    }
  }

  // 发送警告通知
  async function sendWarningNotification(message) {
    try {
      const granted = await checkNotificationPermission();
      if (granted) {
        await sendNotification({
          title: '⚠️ 警告',
          body: message,
        });
        console.log('警告通知已发送:', message);
      } else {
        console.warn('通知权限未授予，无法发送警告通知');
        alert('通知权限未授予，请先授予通知权限');
      }
    } catch (error) {
      console.error('发送警告通知失败:', error);
      alert('发送警告通知失败: ' + (error.message || String(error)));
    }
  }

  // 发送通知
  async function handleSendNotification() {
    try {
      const granted = await checkNotificationPermission();
      if (granted) {
        await sendNotification({
          title: notificationTitle || '系统通知',
          body: notificationBody || '这是一条测试通知消息！',
        });
        alert('通知已发送！');
      } else {
        alert('用户未授予通知权限');
      }
    } catch (error) {
      console.error('发送通知失败:', error);
      alert('发送通知失败: ' + (error.message || String(error)));
    }
  }

  // 对话框相关函数
  // 显示信息对话框
  async function handleShowInfoDialog() {
    try {
      await message('ℹ️ 信息对话框\n\n这是一个信息对话框，用于显示一般信息。\n\n类型：info（信息）', {
        title: '信息对话框',
        kind: 'info',
      });
    } catch (error) {
      console.error('显示信息对话框失败:', error);
      alert('显示信息对话框失败: ' + (error.message || String(error)));
    }
  }

  // 显示警告对话框
  async function handleShowWarningDialog() {
    try {
      await message('⚠️ 警告对话框\n\n这是一个警告对话框，用于显示警告信息。\n\n类型：warning（警告）', {
        title: '警告对话框',
        kind: 'warning',
      });
    } catch (error) {
      console.error('显示警告对话框失败:', error);
      alert('显示警告对话框失败: ' + (error.message || String(error)));
    }
  }

  // 显示错误对话框
  async function handleShowErrorDialog() {
    try {
      await message('❌ 错误对话框\n\n这是一个错误对话框，用于显示错误信息。\n\n类型：error（错误）', {
        title: '错误对话框',
        kind: 'error',
      });
    } catch (error) {
      console.error('显示错误对话框失败:', error);
      alert('显示错误对话框失败: ' + (error.message || String(error)));
    }
  }

  // 显示确认对话框
  async function handleShowConfirmDialog() {
    try {
      const confirmed = await ask('确定要执行此操作吗？', {
        title: '确认对话框',
        kind: 'warning',
      });
      
      if (confirmed) {
        await message('用户确认了操作', {
          title: '提示',
          kind: 'info',
        });
      } else {
        await message('用户取消了操作', {
          title: '提示',
          kind: 'info',
        });
      }
    } catch (error) {
      console.error('显示确认对话框失败:', error);
      alert('显示确认对话框失败: ' + (error.message || String(error)));
    }
  }

  // 任务6：删除文件（带确认对话框）
  async function handleDeleteFile() {
    if (!currentFile) {
      await message('请先选择一个文件', {
        title: '提示',
        kind: 'warning',
      });
      return;
    }

    try {
      // 显示确认对话框
      const confirmed = await ask(`确定要删除文件吗？\n\n文件路径：${currentFile}`, {
        title: '删除文件确认',
        kind: 'warning',
      });

      if (confirmed) {
        // 执行删除操作
        await remove(currentFile);
        console.log("文件删除成功:", currentFile);
        
        // 清空文件内容
        setFileContent("");
        setCurrentFile(null);
        
        // 发送成功通知
        await sendSuccessNotification(`文件已删除：${currentFile}`);
        
        await message('文件删除成功', {
          title: '提示',
          kind: 'info',
        });
      } else {
        // 用户取消删除
        await message('已取消删除操作', {
          title: '提示',
          kind: 'info',
        });
      }
    } catch (error) {
      console.error("删除文件失败:", error);
      const errorMsg = error?.message || error?.toString() || String(error) || '未知错误';
      // 发送错误通知
      await sendErrorNotification(`文件删除失败：${errorMsg}`);
      alert('删除文件失败: ' + errorMsg);
    }
  }

  // 任务8：对话框链式操作
  async function handleChainDialogs() {
    try {
      // 第一步：确认
      const confirmed = await ask('确定要继续执行链式操作吗？', {
        title: '第一步：确认',
        kind: 'warning',
      });

      if (confirmed) {
        // 第二步：信息对话框
        await message('操作进行中，请稍候...', {
          title: '第二步：信息',
          kind: 'info',
        });

        // 模拟一些操作（延迟）
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 第三步：发送通知
        await sendSuccessNotification('所有链式操作已完成！');
        
        // 第四步：最终确认
        await message('✅ 链式操作完成\n\n所有步骤已成功执行：\n1. 确认操作\n2. 显示信息\n3. 发送通知\n4. 完成提示', {
          title: '第三步：完成',
          kind: 'info',
        });
      } else {
        await message('已取消链式操作', {
          title: '提示',
          kind: 'info',
        });
      }
    } catch (error) {
      console.error('链式对话框操作失败:', error);
      await sendErrorNotification(`链式操作失败：${error.message || String(error)}`);
      alert('链式操作失败: ' + (error.message || String(error)));
    }
  }

  // 监听窗口事件和菜单事件
  useEffect(() => {
    const setupWindowListeners = async () => {
      // 尝试设置窗口监听器，如果失败说明不在Tauri环境中
      try {
        const mainWindow = getCurrentWindow();
        
        // 注意：窗口关闭事件现在由 Rust 后端处理（在 lib.rs 中）
        // 这里不再监听窗口关闭事件，避免干扰 Rust 端的 prevent_close() 处理
        // await mainWindow.onCloseRequested((event) => {
        //   console.log("窗口即将关闭");
        //   // 不调用 event.preventDefault()，允许窗口正常关闭
        // });
        
        // 监听窗口大小改变
        await mainWindow.onResized((size) => {
          console.log("窗口大小改变:", size);
          setWindowSize(`${size.width}x${size.height}`);
        });
        
        // 监听窗口焦点
        await mainWindow.onFocusChanged((focused) => {
          console.log("窗口焦点状态:", focused);
        });
      } catch (err) {
        console.error("设置窗口监听器失败:", err);
      }
    };
    
    // 监听菜单事件
    const setupMenuListeners = async () => {
      try {
        // 监听菜单操作事件
        const unlisten = await listen("menu-action", (event) => {
          const action = event.payload;
          console.log("菜单操作:", action);
          
          // 根据不同的菜单操作显示相应的对话框
          switch (action) {
            case "new":
              message("新建文件", { title: "文件菜单", kind: "info" });
              break;
            case "open":
              message("打开文件", { title: "文件菜单", kind: "info" });
              break;
            case "save":
              message("保存文件", { title: "文件菜单", kind: "info" });
              break;
            case "save_as":
              message("另存为", { title: "文件菜单", kind: "info" });
              break;
            case "undo":
              message("撤销操作", { title: "编辑菜单", kind: "info" });
              break;
            case "redo":
              message("重做操作", { title: "编辑菜单", kind: "info" });
              break;
            case "cut":
              message("剪切", { title: "编辑菜单", kind: "info" });
              break;
            case "copy":
              message("复制", { title: "编辑菜单", kind: "info" });
              break;
            case "paste":
              message("粘贴", { title: "编辑菜单", kind: "info" });
              break;
            case "zoom_in":
              message("放大视图", { title: "视图菜单", kind: "info" });
              break;
            case "zoom_out":
              message("缩小视图", { title: "视图菜单", kind: "info" });
              break;
            case "zoom_reset":
              message("重置缩放", { title: "视图菜单", kind: "info" });
              break;
            case "about":
              message("我的TAURI学习应用\n版本：1.0.0\n\n这是一个用于学习TAURI框架的示例应用。", {
                title: "关于",
                kind: "info",
              });
              break;
            default:
              console.log("未知菜单操作:", action);
          }
        });
        
        // 返回清理函数
        return () => {
          unlisten();
        };
      } catch (err) {
        console.error("设置菜单监听器失败:", err);
      }
    };
    
    setupWindowListeners();
    const cleanup = setupMenuListeners();
    
    // 清理函数
    return () => {
      if (cleanup) {
        cleanup.then((unlisten) => {
          if (unlisten) unlisten();
        });
      }
    };
  }, []);

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>

      {/* 计算器部分 */}
      <div className="calculator-section">
        <h2>计算器</h2>
        <div className="row">
          <input
            type="number"
            value={numA}
            onChange={(e) => setNumA(e.target.value)}
            placeholder="输入第一个数字"
          />
          {/* 运算类型选择下拉菜单 */}
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="operation-select"
          >
            <option value="add">加法 (+)</option>
            <option value="subtract">减法 (-)</option>
            <option value="multiply">乘法 (×)</option>
            <option value="divide">除法 (÷)</option>
          </select>
          <input
            type="number"
            value={numB}
            onChange={(e) => setNumB(e.target.value)}
            placeholder="输入第二个数字"
          />
          <button type="button" onClick={calculate}>
            计算
          </button>
        </div>
        {/* 错误提示 */}
        {error && <p className="calculator-error">{error}</p>}
        {/* 结果显示 */}
        {result && <p className="calculator-result">{result}</p>}
      </div>

      {/* 时间戳部分 */}
      <div className="calculator-section">
        <h2>时间戳工具</h2>
        <div className="row">
          <button type="button" onClick={getCurrentTimestamp}>
            获取当前时间戳
          </button>
        </div>
        {timestamp && (
          <div style={{ marginTop: "1rem" }}>
            <p className="calculator-result">
              <strong>Unix时间戳（秒）：</strong> {timestamp}
            </p>
            {formattedTime && (
              <p className="calculator-result">
                <strong>格式化时间：</strong> {formattedTime}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 系统信息部分 */}
      <div className="calculator-section">
        <h2>系统信息</h2>
        <div className="row">
          <button type="button" onClick={getSystemInfo}>
            获取系统信息
          </button>
        </div>
        {systemInfo && (
          <p className="calculator-result" style={{ marginTop: "1rem" }}>
            {systemInfo}
          </p>
        )}
      </div>

      {/* 数字统计部分 */}
      <div className="calculator-section">
        <h2>数字统计</h2>
        <div className="row">
          <input
            type="text"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            placeholder="输入数字，用逗号分隔（如：1,2,3,4,5）"
            style={{ minWidth: "300px" }}
          />
          <button type="button" onClick={processNumbers}>
            计算统计
          </button>
        </div>
        {statistics && (
          <div style={{ marginTop: "1rem" }}>
            <p className="calculator-result">
              <strong>和：</strong> {statistics.sum.toFixed(2)}
            </p>
            <p className="calculator-result">
              <strong>平均值：</strong> {statistics.average.toFixed(2)}
            </p>
            <p className="calculator-result">
              <strong>最大值：</strong> {statistics.max.toFixed(2)}
            </p>
            <p className="calculator-result">
              <strong>最小值：</strong> {statistics.min.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* 安全除法部分 */}
      <div className="calculator-section">
        <h2>安全除法（错误处理示例）</h2>
        <div className="row">
          <input
            type="number"
            value={divideA}
            onChange={(e) => setDivideA(e.target.value)}
            placeholder="被除数"
          />
          <span style={{ fontSize: "1.5em", margin: "0 0.5rem" }}>÷</span>
          <input
            type="number"
            value={divideB}
            onChange={(e) => setDivideB(e.target.value)}
            placeholder="除数"
          />
          <button type="button" onClick={performSafeDivide}>
            计算
          </button>
        </div>
        {/* 错误提示 */}
        {divideError && (
          <p className="calculator-error" style={{ marginTop: "1rem" }}>
            {divideError}
          </p>
        )}
        {/* 结果显示 */}
        {divideResult && (
          <p className="calculator-result" style={{ marginTop: "1rem" }}>
            {divideResult}
          </p>
        )}
      </div>

      {/* 窗口管理部分 */}
      <div className="calculator-section">
        <h2>窗口管理</h2>
        
        {/* 辅助窗口控制 */}
        <div className="row" style={{ marginBottom: "1rem" }}>
          <button type="button" onClick={toggleSecondaryWindow}>
            显示/隐藏辅助窗口
          </button>
        </div>
        
        {/* 主窗口标题控制 */}
        <div className="row" style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            value={windowTitle}
            onChange={(e) => setWindowTitle(e.target.value)}
            placeholder="输入窗口标题"
            style={{ minWidth: "200px" }}
          />
          <button type="button" onClick={setMainWindowTitle}>
            设置窗口标题
          </button>
        </div>
        
        {/* 主窗口大小控制 */}
        <div className="row" style={{ marginBottom: "1rem" }}>
          <button type="button" onClick={() => setMainWindowSize("1000x700")}>
            设置大小：1000x700
          </button>
          <button type="button" onClick={() => setMainWindowSize("1200x800")}>
            设置大小：1200x800
          </button>
          <button type="button" onClick={() => setMainWindowSize("800x600")}>
            设置大小：800x600
          </button>
        </div>
        
        {/* 窗口居中 */}
        <div className="row">
          <button type="button" onClick={centerMainWindow}>
            居中窗口
          </button>
        </div>
        
        {/* 当前窗口信息 */}
        <p style={{ marginTop: "1rem", fontSize: "0.9em", color: "#666" }}>
          当前窗口大小：{windowSize}
        </p>
      </div>

      {/* ========== 文件系统操作 ========== */}
      <div style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>📁 文件系统操作</h2>

        {/* 文件读取和写入 */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>文件操作</h3>
          <div className="row" style={{ marginBottom: "1rem" }}>
            <button type="button" onClick={handleOpenFile}>
              打开文件
            </button>
            <button type="button" onClick={handleSaveFile}>
              保存文件
            </button>
            <button type="button" onClick={handleSaveAs}>
              另存为
            </button>
            {currentFile && (
              <button type="button" onClick={handleDeleteFile} style={{ backgroundColor: "#dc3545", color: "white" }}>
                删除文件
              </button>
            )}
          </div>
          
          {currentFile && (
            <p style={{ fontSize: "0.9em", color: "#666", marginBottom: "0.5rem" }}>
              当前文件: {currentFile}
            </p>
          )}
          
          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            placeholder="文件内容将显示在这里..."
            style={{
              width: "100%",
              height: "200px",
              padding: "0.5rem",
              fontSize: "0.9em",
              fontFamily: "monospace",
              border: "1px solid #ddd",
              borderRadius: "4px",
              resize: "vertical"
            }}
          />
        </div>

        {/* 目录列表 */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>目录操作</h3>
          <div className="row" style={{ marginBottom: "1rem" }}>
            <button type="button" onClick={handleSelectDirectory}>
              选择目录
            </button>
          </div>
          
          {currentDirectory && (
            <p style={{ fontSize: "0.9em", color: "#666", marginBottom: "0.5rem" }}>
              当前目录: {currentDirectory}
            </p>
          )}
          
          {directoryEntries.length > 0 && (
            <div style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "4px",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ddd"
            }}>
              <h4 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "0.9em" }}>目录内容:</h4>
              <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                {directoryEntries.map((entry, index) => (
                  <li key={index} style={{ marginBottom: "0.25rem" }}>
                    {entry.isDirectory ? "📁" : "📄"} {entry.name}
                    {entry.isDirectory && " (目录)"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 文件存在性检查 */}
        <div>
          <h3 style={{ marginBottom: "0.5rem" }}>文件存在性检查</h3>
          <div className="row" style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              value={filePathToCheck}
              onChange={(e) => setFilePathToCheck(e.target.value)}
              placeholder="输入文件路径"
              style={{ minWidth: "300px", padding: "0.5rem" }}
            />
            <button type="button" onClick={handleCheckFileExists}>
              检查文件
            </button>
          </div>
          
          {fileExists !== null && (
            <p style={{
              fontSize: "0.9em",
              color: fileExists ? "#28a745" : "#dc3545",
              fontWeight: "bold"
            }}>
              {fileExists ? "✓ 文件存在" : "✗ 文件不存在"}
            </p>
          )}
        </div>

        {/* 系统通知功能区域 */}
        <div>
          <h3 style={{ marginBottom: "0.5rem" }}>系统通知</h3>
          <div style={{ marginBottom: "1rem" }}>
            <div className="row" style={{ marginBottom: "0.5rem" }}>
              <label style={{ minWidth: "100px" }}>通知标题：</label>
              <input
                type="text"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="输入通知标题"
                style={{ flex: 1, padding: "0.5rem" }}
              />
            </div>
            <div className="row" style={{ marginBottom: "0.5rem" }}>
              <label style={{ minWidth: "100px" }}>通知内容：</label>
              <textarea
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                placeholder="输入通知内容"
                rows={3}
                style={{ flex: 1, padding: "0.5rem", fontFamily: "inherit" }}
              />
            </div>
            <button type="button" onClick={handleSendNotification}>
              发送通知
            </button>
          </div>
        </div>

        {/* 消息对话框功能区域 */}
        <div>
          <h3 style={{ marginBottom: "0.5rem" }}>消息对话框</h3>
          <div className="row" style={{ gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <button type="button" onClick={handleShowInfoDialog}>
              显示信息对话框
            </button>
            <button type="button" onClick={handleShowWarningDialog}>
              显示警告对话框
            </button>
            <button type="button" onClick={handleShowErrorDialog}>
              显示错误对话框
            </button>
            <button type="button" onClick={handleShowConfirmDialog}>
              显示确认对话框
            </button>
          </div>
          <div className="row" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" onClick={handleChainDialogs} style={{ backgroundColor: "#28a745", color: "white" }}>
              对话框链式操作（选做任务8）
            </button>
          </div>
        </div>

        {/* 任务7：自定义通知样式测试 */}
        <div>
          <h3 style={{ marginBottom: "0.5rem" }}>自定义通知样式（选做任务7）</h3>
          <div className="row" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" onClick={async () => await sendSuccessNotification('这是一个成功通知示例')} style={{ backgroundColor: "#28a745", color: "white" }}>
              发送成功通知
            </button>
            <button type="button" onClick={async () => await sendErrorNotification('这是一个错误通知示例')} style={{ backgroundColor: "#dc3545", color: "white" }}>
              发送错误通知
            </button>
            <button type="button" onClick={async () => await sendWarningNotification('这是一个警告通知示例')} style={{ backgroundColor: "#ffc107", color: "black" }}>
              发送警告通知
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
