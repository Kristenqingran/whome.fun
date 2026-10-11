# Whome Book Copywriter Workbench

邀请制内测版图书口播文案工作台。用户自行注册并完成邮箱验证后进入待审核状态；管理员批准后开通 30 天，并由平台承担最多 600 分（约 6 元）的模型调用成本。

当前版本不包含支付、订单、退款、邀请码、邀请链接或用户模型 Key 输入。DeepSeek Key 只允许配置在服务端环境变量中。

## 本地启动

```bash
cp .env.example .env.local
# 编辑 .env.local，填写 Supabase 公共配置和服务端 DeepSeek Key
npm install
npm run dev
```

数据库迁移位于 `supabase/migrations/001_workbench.sql`。第一次管理员初始化请在 Supabase SQL Editor 中手动把已验证账号的 `profiles.role` 改为 `admin`，不要增加公开 bootstrap 接口。

## 检查

```bash
npm run lint
npx tsc --noEmit
npm run build
```

`.env.local` 不得提交。模型 Key 不会写入数据库、URL、前端构建产物或日志。
