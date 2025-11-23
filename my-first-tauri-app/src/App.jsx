import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
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
    </main>
  );
}

export default App;
