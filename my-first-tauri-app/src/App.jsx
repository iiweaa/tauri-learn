import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, Window, LogicalSize } from "@tauri-apps/api/window";
import "./App.css";

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

  // 监听窗口事件
  useEffect(() => {
    const setupWindowListeners = async () => {
      try {
        const mainWindow = getCurrentWindow();
        
        // 监听窗口关闭事件
        await mainWindow.onCloseRequested((event) => {
          console.log("窗口即将关闭");
          // 不调用 event.preventDefault()，允许窗口正常关闭
        });
        
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
    
    setupWindowListeners();
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
    </main>
  );
}

export default App;
