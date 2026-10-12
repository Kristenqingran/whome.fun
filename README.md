# Whome Book Copywriter Workbench

邀请制内测版图书口播文案工作台。用户自行注册并完成邮箱验证后进入待审核状态；管理员批准后开通 30 天，并由平台承担最多 600 分（约 6 元）的模型调用成本。

当前版本不包含支付、订单、退款、邀请码、邀请链接或用户模型 Key 输入。DeepSeek Key 只允许配置在服务端环境变量中。

## Vercel Preview 验收

在 Vercel 的 Preview 环境配置以下变量：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
MODEL_PROVIDER=deepseek
DEEPSEEK_API_KEY
DEEPSEEK_API_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_INPUT_CENTS_PER_MILLION=14
DEEPSEEK_OUTPUT_CENTS_PER_MILLION=28
```

`NEXT_PUBLIC_*` 变量可以进入浏览器；`DEEPSEEK_API_KEY` 只能添加到 Vercel 的 Preview 环境变量，不能放进浏览器变量、Git 或 URL。只做本地界面验收时，可在本地服务端设置 `MODEL_PROVIDER=mock`，该模式不会调用 DeepSeek，也不会伪装成真实模型结果。

在 Supabase Dashboard 的 `Authentication → URL Configuration` 中，把当前 Vercel Preview 的完整回调地址加入 Redirect URLs：

```text
https://你的-preview-域名/zh/auth/callback
```

每次 Preview 域名变化时都要添加新的回调地址。不要修改正式站点域名或生产 Supabase 配置。

## 本地启动

```bash
cp .env.example .env.local
# 编辑 .env.local，填写 Supabase 公共配置和服务端 DeepSeek Key
npm install
npm run dev
```

数据库迁移按顺序执行 `supabase/migrations/001_workbench.sql`、`supabase/migrations/002_security_hardening.sql` 和 `supabase/migrations/003_audit_rls.sql`。第一次管理员初始化请在 Supabase SQL Editor 中手动把已验证账号的 `profiles.role` 改为 `admin`，不要增加公开 bootstrap 接口。

模型请求超时或服务中断时，系统会把请求标记为 `uncertain`，但不会自动释放预留额度；这部分额度会继续占用本周期额度，避免实际已产生模型费用却被重复使用。只有管理员通过 `resolve_uncertain_generation` 核实后，才能全额释放或按实际费用结算，操作会写入 `generation_resolution_audit`。`recover_expired_reservations` 只负责标记过期请求为 `uncertain`，不负责退款；应由受保护的服务端定时任务调用。相同用户的 `request_id` 不会再次调用模型。

## 检查

```bash
npm run lint
npx tsc --noEmit
npm run build
```

`.env.local` 不得提交。模型 Key 不会写入数据库、URL、前端构建产物或日志。
