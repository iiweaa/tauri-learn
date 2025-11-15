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
    </main>
  );
}

export default App;
