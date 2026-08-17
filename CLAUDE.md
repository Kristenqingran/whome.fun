# Whome.fun

A fun quiz aggregation platform for discovering personality, career, love, and fun quizzes.

## Tech Stack

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* MDX content management
* i18n (EN/ZH)

## Project Structure

* `app/[lang]/` - i18n routes (EN/ZH)
* `components/` - Reusable UI components
* `content/tests/` - MDX quiz files
* `lib/` - Utilities (MDX, quiz logic, i18n)
* `i18n/dictionaries/` - Translation files

## Key Commands

```bash
npm run dev    # Development server
npm run build  # Production build
```

## Skills

Use superpowers skills when relevant:

* `superpowers:brainstorming` - Before starting new features
* `superpowers:systematic-debugging` - When debugging issues
* `superpowers:test-driven-development` - Before writing implementation code

## Design Reference

See `docs/2026-08-16-whome-fun-design.md` for full design spec.

---

# UI Change Guardrail

**Do not modify existing UI, layout, styling, or shared components unless the user explicitly asks for a UI change.**

This rule has high priority.

When the user asks to add content, tests, quiz data, cards, metadata, routes, or other non-UI functionality:

* Preserve the existing visual design.
* Preserve the existing page layout.
* Preserve the existing Header and Footer.
* Preserve existing shared component styles.
* Preserve existing spacing, typography, colors, widths, responsive behavior, and card layout.
* Reuse existing components whenever possible.
* Do not redesign or "improve" existing pages unless explicitly requested.
* Do not perform unrelated visual cleanup.
* Do not refactor shared UI components unless required for the requested task.
* If an existing UI issue is noticed but was not requested, report it to the user instead of modifying it.

For content expansion tasks, such as adding new quizzes:

> Treat the task as **Content Expansion**, not **UI Redesign**.

If a UI or shared-component change is genuinely required to complete a non-UI task:

1. Explain why the change is necessary.
2. Keep the change minimal and backward-compatible.
3. Do not alter unrelated visual behavior.
4. Require User Acceptance before commit + push.

---

# Git Workflow

> Claude handles technical verification; User handles product/UI acceptance.
> Only commit + push after satisfying the respective acceptance criteria.
> If User is not satisfied with any version, safe Git rollback is available.

**Current phase: No hooks for auto-commit.**

---

## 一、整体工作流

```text
用户提出需求
↓
Claude 分析现有代码
↓
Claude 修改代码
↓
Technical Verification
↓
判断是否需要 User Acceptance
↓
需要人工验收？
├── 是
│   ↓
│   Claude 停止提交
│   ↓
│   告诉用户：可以在浏览器验收
│   ↓
│   用户确认
│   ├── 满意 → commit + push
│   └── 不满意 → 继续修改，不 commit，不 push
│
└── 否
    ↓
    commit
    ↓
    push
```

---

## 二、Technical Verification：Claude 自动技术验证

每次修改完成后，必须先进行技术验证。根据项目实际存在的 scripts 执行：

```bash
npm run lint
npm run typecheck
npm run build
```

如果项目没有某个 script，则跳过。

**技术验证通过的含义：**

* 没有明显语法错误
* TypeScript 类型检查正常
* 项目能够构建
* 已有自动化测试通过

**不等于：**

* 页面是否好看
* 留白是否合理
* 字体是否过大
* Footer 是否符合预期
* 按钮位置是否舒服
* 手机端 UI 是否自然
* Quiz 交互是否符合用户预期
* Result 页面是否有视觉问题
* 文案是否符合产品定位

---

## 三、需要人工验收的修改类型

以下类型的修改，Technical Verification 通过后，**默认必须等待用户人工验收**：

### UI / 样式

* 页面布局、Header、Footer、卡片样式、字体、字号、间距、宽度、颜色、对齐、响应式、Mobile UI

### 用户交互

* Quiz 上一题 / 下一题、点击答案交互、Progress、展开 / 收起、Modal、Tab、分类切换、Result 展示、页面跳转方式

### 页面结构

* 首页信息架构、分类页、测试详情页、Quiz 页面、Result 页面、SEO 内容区域、页面 section 增删

### 用户可见内容

* 测试题目、测试结果文案、页面标题、分类说明、推荐职业、用户直接可见的文字

---

## 四、人工验收时的行为

**不要 commit。不要 push。**

告诉用户：

```text
修改已经完成，技术验证通过。

请在浏览器中验收以下内容：
1. ...
2. ...

当前尚未 commit / push。

确认没有问题后，请回复：
"可以" / "OK" / "确认" / "push"
或类似明确确认。
```

---

## 五、用户确认规则

以下表达视为验收通过：

* `可以`
* `OK`
* `没问题`
* `确认`
* `提交吧`
* `push`
* `可以推了`
* `这个版本可以`
* `就这样`

确认后执行：

```bash
git status
git diff
```

确认无误后：

```bash
git add .
git commit -m "<commit message>"
git push
```

---

## 六、用户不满意时

如果用户说：

* `不对`
* `不好看`
* `继续改`
* `这里还有问题`
* `不是我要的`
* `先别提交`
* `这个版本不行`

则：

* 不 commit
* 不 push
* 保留当前工作区
* 根据反馈继续修改
* 修改后重新 Technical Verification
* 再次等待人工验收

---

## 七、可以不等待人工验收的情况

纯技术性、低风险修改，Technical Verification 通过后，可直接 commit + push：

* 修复 lint error
* 修复 TypeScript 类型错误
* 修复 build failure
* 修复明显 typo 且不影响产品含义
* 更新 `.gitignore`
* 移除死代码
* 内部 refactor 且行为完全不变
* 修复明确的测试失败
* 依赖锁文件的必要修复

**原则：如果修改会影响用户看到或操作到的东西，优先要求人工验收。**

如果不确定，**默认等待用户确认。**

---

## 八、Commit 规则

### 一个需求对应一个 Commit

```text
需求1：调整 Quiz 上一题 / 下一题 → 一个 commit
需求2：修改 Result 页面布局 → 一个 commit
需求3：简化 Footer → 一个 commit
```

### Commit 前检查

```bash
git status
git diff
```

确认：

* 只包含当前任务相关修改
* 没有调试代码
* 没有临时文件
* 没有敏感信息
* 没有用户不希望提交的内容

**禁止提交：**

* `.env`
* `.env.local`
* API keys
* Secrets
* Tokens
* Passwords
* `node_modules`
* 缓存文件
* 临时文件

### Commit Message 示例

```text
feat: add full INFP career quiz flow
fix: add previous and next quiz navigation
style: simplify quiz result layout
fix: remove duplicate brand from result page
```

**不要使用：**

```text
update
changes
fix stuff
test
```

---

## 九、Push 规则

Commit 完成后：

```bash
git push
```

如果当前 branch 没有 upstream：

```bash
git push -u origin <current-branch>
```

**禁止默认执行：**

```bash
git push --force
git push --force-with-lease
```

---

## 十、Push 完成后必须报告

每次 push 后告诉用户：

```text
Commit: <hash>
Message: <commit message>
Branch: <branch>
Verification: <执行过的验证>
User Acceptance: Required + Confirmed
```

或者：

```text
User Acceptance: Not required — technical-only change
```

---

## 十一、版本回退规则

如果用户说：

```text
回退刚才版本
撤销上一版
恢复到之前
```

### 未 Push 的版本如何取消

```bash
git status
git diff
```

确认当前工作区内容。

只撤销当前任务产生的修改，不要破坏用户已有的本地修改或其他未提交任务。

如果无法安全区分，先告诉用户风险。

### 已 Push 的版本如何回退

```bash
git log --oneline -10
git revert <commit-hash>
git push
```

会新增一个 revert commit，并保留完整历史。

**禁止默认执行：**

```bash
git reset --hard
git push --force
```

---

## 十二、危险 Git 操作

除非用户明确要求，否则不要执行：

```bash
git reset --hard
git clean -fd
git push --force
git push --force-with-lease
```

不要擅自删除 branch。

---

## 十三、当前不启用 Hook

**不创建以下自动化：**

* Stop Hook → git push
* PostToolUse Hook → git commit
* 自动 git add
* 自动 commit
* 自动 push

因为 Whome.fun 目前仍处于频繁 UI / 产品迭代阶段，很多版本技术上没有问题但用户视觉上不满意。
