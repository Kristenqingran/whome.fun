# Book Copywriter Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the legacy quiz product with an invite-free, approval-gated book copywriting workbench.

**Architecture:** Next.js App Router with server route handlers, Supabase-compatible auth/database boundaries, and a server-only DeepSeek adapter. The first implementation includes a local/dev database adapter so the UI and quota rules can run without exposing secrets or requiring payment infrastructure.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Zod, server-side environment variables.

## Global Constraints

- Do not modify `main` or `master`.
- Preserve `.git`, Git history, remote, `AGENTS.md`, untracked `.claude/`, and `.env.local` if present.
- Delete all legacy quiz/personality product code and content.
- Users register themselves, verify SMTP email, then enter pending review.
- Only verified and approved users may use the workbench.
- Approval creates exactly 30 days and 600 cents of model quota.
- No payment, order, refund, payment callback, invitation, invite code, or invite link.
- No user model-key input and no model-test endpoint.
- DeepSeek keys are server-only and never persisted in application data.

## Review Focus

- Unverified or unapproved users must be rejected by server APIs, not only hidden in UI.
- Expired entitlements and zero quota must prevent provider calls.
- Concurrent generation requests must not overdraw the 600-cent period.
- Provider failure and invalid output must roll back reserved quota.
- Legacy quiz content must not remain reachable through routes or static assets.

### Task 1: Replace the application shell

Remove legacy app/components/content and create a minimal workbench shell, bilingual route, forms, result editor, and server-only environment contract.

### Task 2: Add copywriting validation and provider boundary

Create typed request/result schemas, prompt construction, and DeepSeek-compatible server client without a public model-test route.

### Task 3: Add approval and quota domain layer

Create server-side auth/entitlement interfaces, 30-day/600-cent approval behavior, reservations, usage ledger, and local adapter for development.

### Task 4: Add API routes and protected workbench flow

Implement registration status, admin approval/rejection, research, generate, regenerate, quota display, and server guards.

### Task 5: Verify, audit, commit, and push

Run lint, typecheck, build, tests, legacy route scan, and secret scan. Commit and push only the feature branch.
