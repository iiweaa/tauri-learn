# 第6课作业：系统通知与对话框

## 作业信息

- **课程编号**：第6课
- **课程标题**：系统通知与对话框
- **作业提交时间**：完成课程学习后
- **作业检查标准**：
  - 所有必做作业必须完成
  - 代码能够正常运行
  - 功能实现正确
  - 错误处理完善
  - 代码已提交到Git

## 必做作业

### 任务1：安装和配置通知插件

**要求**：
1. 在 `Cargo.toml` 中添加 `tauri-plugin-notification` 依赖
2. 在 `lib.rs` 中注册通知插件
3. 在 `capabilities/default.json` 中添加通知相关权限
4. 安装前端npm包 `@tauri-apps/plugin-notification`

**检查点**：
- [ ] Rust依赖已添加
- [ ] 插件已注册
- [ ] 权限已配置
- [ ] npm包已安装
- [ ] 项目能够正常编译

### 任务2：实现通知权限检查功能

**要求**：
1. 创建一个函数检查通知权限状态
2. 如果权限未授予，请求用户授权
3. 在应用启动时自动检查权限（可选）
4. 显示权限状态给用户

**检查点**：
- [ ] 能够检查权限状态
- [ ] 能够请求权限
- [ ] 正确处理权限被拒绝的情况
- [ ] 有友好的用户提示

**代码示例**：
```javascript
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
```

### 任务3：实现发送通知功能

**要求**：
1. 创建一个按钮，点击后发送系统通知
2. 通知包含标题和内容
3. 在发送前检查权限
4. 添加错误处理

**检查点**：
- [ ] 能够成功发送通知
- [ ] 通知内容正确显示
- [ ] 权限检查正常工作
- [ ] 错误处理完善

**功能要求**：
- 通知标题：可自定义
- 通知内容：可自定义
- 错误提示：友好的错误信息

### 任务4：实现消息对话框功能

**要求**：
1. 实现三种类型的消息对话框：
   - 信息对话框（info）
   - 警告对话框（warning）
   - 错误对话框（error）
2. 每个对话框有独立的按钮触发
3. 对话框标题和内容清晰明确

**检查点**：
- [ ] 信息对话框能够正常显示
- [ ] 警告对话框能够正常显示
- [ ] 错误对话框能够正常显示
- [ ] 对话框样式正确（不同颜色）

**代码示例**：
```javascript
// 信息对话框
async function showInfoDialog() {
  await message('这是信息对话框', {
    title: '信息',
    kind: 'info',
  });
}

// 警告对话框
async function showWarningDialog() {
  await message('这是警告对话框', {
    title: '警告',
    kind: 'warning',
  });
}

// 错误对话框
async function showErrorDialog() {
  await message('这是错误对话框', {
    title: '错误',
    kind: 'error',
  });
}
```

### 任务5：实现确认对话框功能

**要求**：
1. 创建一个确认对话框
2. 根据用户选择（是/否）执行不同操作
3. 显示用户的选择结果（可以用消息对话框或通知）

**检查点**：
- [ ] 确认对话框能够正常显示
- [ ] 能够正确获取用户选择
- [ ] 根据选择执行相应操作
- [ ] 有用户反馈

**代码示例**：
```javascript
async function showConfirmDialog() {
  try {
    const confirmed = await ask('确定要执行此操作吗？', {
      title: '确认',
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
  }
}
```

## 选做作业

### 任务6：通知与对话框结合使用

**要求**：
1. 在文件操作成功/失败时发送通知
2. 在删除文件前显示确认对话框
3. 根据用户选择决定是否执行操作
4. 操作完成后发送相应通知

**实现建议**：
- 修改文件保存功能，成功后发送通知
- 修改文件删除功能，删除前显示确认对话框
- 根据操作结果显示不同类型的通知

### 任务7：自定义通知样式

**要求**：
1. 尝试使用不同的通知标题和内容
2. 实现不同类型的通知（成功、错误、警告）
3. 创建通知发送的辅助函数

**实现建议**：
```javascript
// 发送成功通知
async function sendSuccessNotification(message) {
  const granted = await checkNotificationPermission();
  if (granted) {
    await sendNotification({
      title: '操作成功',
      body: message,
    });
  }
}

// 发送错误通知
async function sendErrorNotification(message) {
  const granted = await checkNotificationPermission();
  if (granted) {
    await sendNotification({
      title: '操作失败',
      body: message,
    });
  }
}
```

### 任务8：对话框链式操作

**要求**：
1. 实现多个对话框的链式调用
2. 例如：确认 → 信息 → 通知
3. 根据前一个对话框的结果决定是否显示下一个

**实现建议**：
```javascript
async function chainDialogs() {
  // 第一步：确认
  const confirmed = await ask('确定要继续吗？', {
    title: '第一步',
    kind: 'warning',
  });
  
  if (confirmed) {
    // 第二步：信息
    await message('操作进行中...', {
      title: '第二步',
      kind: 'info',
    });
    
    // 第三步：通知
    await sendNotification({
      title: '完成',
      body: '所有操作已完成',
    });
  }
}
```

## 作业提交要求

### 提交内容

1. **代码提交**：
   - 所有修改的代码文件
   - 确保代码能够正常运行
   - 添加适当的注释

2. **功能演示**：
   - 能够演示所有必做功能
   - 能够说明实现思路

3. **学习笔记**（可选但推荐）：
   - 记录遇到的问题和解决方法
   - 整理重要知识点
   - 保存到 `docs/notes/notes-06-notification-dialog.md`

### 提交方式

1. **Git提交**：
   ```bash
   git add .
   git commit -m "完成第6课作业：系统通知与对话框"
   git push origin master
   ```

2. **告知老师**：
   - 明确说明完成了哪些任务
   - 如有问题，说明遇到的问题
   - 等待老师检查

### 检查标准

**功能检查**：
- [ ] 所有必做任务已完成
- [ ] 功能能够正常运行
- [ ] 错误处理完善
- [ ] 用户体验良好

**代码质量**：
- [ ] 代码结构清晰
- [ ] 注释适当
- [ ] 错误处理完善
- [ ] 遵循最佳实践

**Git提交**：
- [ ] 代码已提交到Git
- [ ] 提交信息清晰
- [ ] 已推送到远程仓库

## 常见问题

### Q1: 通知不显示？

**可能原因**：
- 权限未授予
- 系统通知设置被禁用
- 开发模式下通知可能显示为终端

**解决方法**：
- 检查权限状态
- 检查系统设置
- 在打包后的应用中测试

### Q2: 对话框API找不到？

**解决方法**：
- 确保安装了 `@tauri-apps/plugin-dialog` npm包
- 检查权限配置
- 检查插件注册

### Q3: 确认对话框返回值不正确？

**解决方法**：
- 确认使用了 `ask` 而不是 `message`
- 检查返回值类型（boolean）
- 添加错误处理

## 学习建议

1. **循序渐进**：
   - 先完成通知功能
   - 再完成对话框功能
   - 最后尝试结合使用

2. **测试充分**：
   - 测试各种情况
   - 测试错误处理
   - 测试用户体验

3. **记录笔记**：
   - 记录遇到的问题
   - 记录解决方法
   - 整理知识点

4. **参考文档**：
   - Tauri官方文档
   - 课程讲义
   - 代码示例

---

**祝学习顺利！完成作业后记得提交并告知老师检查。** 🎉

