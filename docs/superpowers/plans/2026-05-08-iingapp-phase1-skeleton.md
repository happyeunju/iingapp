# Phase 1 — Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PWA 껍데기와 백엔드 API 골격을 구축하고, iPhone에서 매직링크 + PIN 인증으로 로그인까지 가능한 상태를 만든다. DB 스키마(14테이블 + 1 view)도 모두 마이그레이션된 상태.

**Architecture:** pnpm 모노레포로 frontend(Vite+React+Tailwind PWA)와 backend(Cloudflare Workers + Hono) 두 앱과 shared types 패키지를 분리. Supabase Auth가 매직링크 발급·검증을 담당하고, 우리 Workers는 발급된 JWT를 검증하는 역할만 한다. PIN은 우리 DB에 별도 저장.

**Tech Stack:**
- Node 20+, pnpm 9+
- Frontend: Vite, React 18, TypeScript, Tailwind CSS, React Router 6
- Backend: Cloudflare Workers, Hono, Wrangler
- DB: Supabase Postgres
- Auth: Supabase Auth (Magic Link) + 자체 PIN
- Test: Vitest (양쪽 다)
- Deploy: Cloudflare Pages + Cloudflare Workers, GitHub Actions

**Reference:** `docs/superpowers/specs/2026-05-08-iingapp-design.md`

---

## File Structure (생성될 파일들)

```
iingApp/
├── package.json                        # 루트 (pnpm workspace 정의)
├── pnpm-workspace.yaml
├── tsconfig.base.json                  # 공통 TS 설정
├── .gitignore
├── .nvmrc                              # Node 20
│
├── packages/
│   └── shared/                         # 공통 타입·Zod 스키마
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── auth.schema.ts          # JWT payload, PIN
│       │   └── user.schema.ts          # User, Profile 등
│       └── test/
│           └── auth.schema.test.ts
│
├── apps/
│   ├── web/                            # PWA (Vite + React)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── index.html
│   │   ├── public/
│   │   │   ├── manifest.json           # PWA 매니페스트
│   │   │   ├── icon-192.png
│   │   │   ├── icon-512.png
│   │   │   └── icon-180.png            # iOS 홈화면
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── routes.tsx              # 라우트 정의
│   │   │   ├── pages/
│   │   │   │   ├── Today.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── AuthCallback.tsx
│   │   │   │   ├── PinSetup.tsx
│   │   │   │   └── PinEntry.tsx
│   │   │   ├── components/
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── lib/
│   │   │   │   ├── supabase.ts         # Supabase 클라이언트
│   │   │   │   └── api.ts              # 백엔드 API 호출 헬퍼
│   │   │   ├── sw-register.ts          # Service Worker 등록
│   │   │   └── styles.css              # Tailwind imports
│   │   └── public/sw.js                # Service Worker (스켈레톤)
│   │
│   └── api/                            # Cloudflare Workers
│       ├── package.json
│       ├── wrangler.toml
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── src/
│       │   ├── index.ts                # Hono 앱 엔트리
│       │   ├── middleware/
│       │   │   └── auth.ts             # JWT 검증
│       │   ├── routes/
│       │   │   ├── health.ts
│       │   │   └── pin.ts
│       │   └── lib/
│       │       └── supabase.ts         # 서버사이드 클라이언트
│       └── test/
│           ├── health.test.ts
│           ├── auth.middleware.test.ts
│           └── pin.test.ts
│
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 20260508000000_phase1_schema.sql   # 14 tables + 1 view
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
└── docs/
    ├── superpowers/
    │   ├── specs/2026-05-08-iingapp-design.md   # 이미 존재
    │   └── plans/2026-05-08-iingapp-phase1-skeleton.md  # 본 문서
    └── DEPLOY.md                       # iPhone 설치 가이드 등
```

---

## Task 1: 모노레포 초기화

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.nvmrc`

- [ ] **Step 1: pnpm 설치 확인**

Run: `pnpm --version`
Expected: `9.x.x` 이상. 없으면 `npm install -g pnpm`.

- [ ] **Step 2: 프로젝트 디렉토리에서 초기화**

```bash
cd D:\0.Study\00.iingApp
git init
```

- [ ] **Step 3: `.nvmrc` 작성**

Path: `.nvmrc`
```
20
```

- [ ] **Step 4: `package.json` 작성**

Path: `package.json`
```json
{
  "name": "iingapp",
  "private": true,
  "version": "0.1.0",
  "packageManager": "pnpm@9.0.0",
  "engines": { "node": ">=20.0.0" },
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "dev:web": "pnpm --filter @iingapp/web dev",
    "dev:api": "pnpm --filter @iingapp/api dev",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 5: `pnpm-workspace.yaml` 작성**

Path: `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 6: `tsconfig.base.json` 작성**

Path: `tsconfig.base.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

- [ ] **Step 7: `.gitignore` 작성**

Path: `.gitignore`
```
node_modules
dist
.wrangler
.dev.vars
.env
.env.local
*.log
.DS_Store
.vscode
coverage
```

- [ ] **Step 8: 의존성 설치**

Run: `pnpm install`
Expected: lockfile 생성, 0 packages installed (아직 워크스페이스 비어있음).

- [ ] **Step 9: 첫 커밋**

```bash
git add .
git commit -m "chore: initialize monorepo skeleton"
```

---

## Task 2: shared 패키지 (Zod 스키마)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/auth.schema.ts`
- Create: `packages/shared/src/user.schema.ts`
- Test: `packages/shared/test/auth.schema.test.ts`

- [ ] **Step 1: 디렉토리 + package.json**

Path: `packages/shared/package.json`
```json
{
  "name": "@iingapp/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "vitest": "^1.6.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: tsconfig**

Path: `packages/shared/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": true
  },
  "include": ["src/**/*", "test/**/*"]
}
```

- [ ] **Step 3: 테스트 먼저 작성 (auth.schema)**

Path: `packages/shared/test/auth.schema.test.ts`
```typescript
import { describe, it, expect } from "vitest";
import { PinSchema, JwtPayloadSchema } from "../src/auth.schema";

describe("PinSchema", () => {
  it("4자리 숫자만 허용", () => {
    expect(PinSchema.safeParse("1234").success).toBe(true);
    expect(PinSchema.safeParse("12345").success).toBe(false);
    expect(PinSchema.safeParse("abcd").success).toBe(false);
    expect(PinSchema.safeParse("123").success).toBe(false);
  });
});

describe("JwtPayloadSchema", () => {
  it("필수 필드 검증", () => {
    const valid = {
      sub: "00000000-0000-0000-0000-000000000001",
      email: "user@example.com",
      iat: 1700000000,
      exp: 1700100000,
    };
    expect(JwtPayloadSchema.safeParse(valid).success).toBe(true);

    const missingExp = { ...valid, exp: undefined };
    expect(JwtPayloadSchema.safeParse(missingExp).success).toBe(false);
  });
});
```

- [ ] **Step 4: 테스트 실행해 실패 확인**

Run: `pnpm --filter @iingapp/shared test`
Expected: FAIL ("Cannot find module ../src/auth.schema").

- [ ] **Step 5: auth.schema 구현**

Path: `packages/shared/src/auth.schema.ts`
```typescript
import { z } from "zod";

export const PinSchema = z.string().regex(/^\d{4}$/, "PIN은 4자리 숫자");

export const JwtPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  iat: z.number().int(),
  exp: z.number().int(),
});

export type PinValue = z.infer<typeof PinSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
```

- [ ] **Step 6: user.schema 작성**

Path: `packages/shared/src/user.schema.ts`
```typescript
import { z } from "zod";

export const CefrLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);

export const ProficiencyTestSchema = z.enum([
  "opic",
  "toeic_sp",
  "toefl_ibt",
  "ielts",
  "self",
  "none",
]);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  timezone: z.string().default("Asia/Seoul"),
  proficiency_test: ProficiencyTestSchema.nullable(),
  proficiency_score: z.string().nullable(),
  cefr_level: CefrLevelSchema.nullable(),
  has_pin: z.boolean().default(false),
});

export type User = z.infer<typeof UserSchema>;
export type CefrLevel = z.infer<typeof CefrLevelSchema>;
export type ProficiencyTest = z.infer<typeof ProficiencyTestSchema>;
```

- [ ] **Step 7: index.ts에서 re-export**

Path: `packages/shared/src/index.ts`
```typescript
export * from "./auth.schema";
export * from "./user.schema";
```

- [ ] **Step 8: 의존성 설치 + 테스트 통과 확인**

Run: `pnpm install`
Run: `pnpm --filter @iingapp/shared test`
Expected: `auth.schema.test.ts` 2 passed.

- [ ] **Step 9: 커밋**

```bash
git add packages/shared
git commit -m "feat(shared): add zod schemas for auth and user"
```

---

## Task 3: 웹 앱 부트스트랩 (Vite + React + Tailwind)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/styles.css`
- Test: `apps/web/src/App.test.tsx`

- [ ] **Step 1: package.json**

Path: `apps/web/package.json`
```json
{
  "name": "@iingapp/web",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host",
    "test": "vitest run",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@iingapp/shared": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "happy-dom": "^14.12.0",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.0",
    "vite": "^5.3.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: tsconfig**

Path: `apps/web/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: vite.config.ts**

Path: `apps/web/vite.config.ts`
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
  server: { host: true, port: 5173 },
});
```

- [ ] **Step 4: tailwind.config.ts + postcss.config.js**

Path: `apps/web/tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss";
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
```

Path: `apps/web/postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: 테스트 setup**

Path: `apps/web/src/test-setup.ts`
```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: 테스트 먼저 작성**

Path: `apps/web/src/App.test.tsx`
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("앱 제목을 보여준다", () => {
    render(<App />);
    expect(screen.getByText(/iingApp/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: 테스트 실행 → 실패 확인**

Run: `pnpm --filter @iingapp/web test`
Expected: FAIL ("Cannot find module ./App").

- [ ] **Step 8: index.html, styles.css, main.tsx, App.tsx 작성**

Path: `apps/web/index.html`
```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0f172a" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon-180.png" />
    <title>iingApp</title>
  </head>
  <body class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Path: `apps/web/src/styles.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Path: `apps/web/src/main.tsx`
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Path: `apps/web/src/App.tsx`
```typescript
export function App() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <h1 className="text-2xl font-bold">iingApp</h1>
    </main>
  );
}
```

- [ ] **Step 9: 의존성 설치 → 테스트 통과**

Run: `pnpm install`
Run: `pnpm --filter @iingapp/web test`
Expected: 1 passed.

- [ ] **Step 10: dev 서버 실행해 확인**

Run: `pnpm dev:web`
Open: `http://localhost:5173`
Expected: 화면에 "iingApp" 표시.
Press Ctrl+C 로 중지.

- [ ] **Step 11: 커밋**

```bash
git add apps/web
git commit -m "feat(web): bootstrap vite+react+tailwind app"
```

---

## Task 4: React Router + 빈 페이지 라우트

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/src/App.tsx`
- Create: `apps/web/src/routes.tsx`
- Create: `apps/web/src/pages/Today.tsx`
- Create: `apps/web/src/pages/Login.tsx`
- Create: `apps/web/src/pages/AuthCallback.tsx`
- Create: `apps/web/src/pages/PinSetup.tsx`
- Create: `apps/web/src/pages/PinEntry.tsx`
- Test: `apps/web/src/routes.test.tsx`

- [ ] **Step 1: react-router-dom 추가**

```bash
cd apps/web
pnpm add react-router-dom@^6.24.0
cd ../..
```

- [ ] **Step 2: 테스트 작성**

Path: `apps/web/src/routes.test.tsx`
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AppRoutes } from "./routes";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Routes", () => {
  it("/ 는 Today 페이지", () => {
    renderAt("/");
    expect(screen.getByTestId("page-today")).toBeInTheDocument();
  });
  it("/auth/login 은 Login 페이지", () => {
    renderAt("/auth/login");
    expect(screen.getByTestId("page-login")).toBeInTheDocument();
  });
  it("/auth/callback 은 Callback 페이지", () => {
    renderAt("/auth/callback");
    expect(screen.getByTestId("page-auth-callback")).toBeInTheDocument();
  });
  it("/auth/pin/setup", () => {
    renderAt("/auth/pin/setup");
    expect(screen.getByTestId("page-pin-setup")).toBeInTheDocument();
  });
  it("/auth/pin", () => {
    renderAt("/auth/pin");
    expect(screen.getByTestId("page-pin-entry")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**

Run: `pnpm --filter @iingapp/web test`
Expected: FAIL.

- [ ] **Step 4: 페이지 5개 작성 (data-testid 포함)**

Path: `apps/web/src/pages/Today.tsx`
```typescript
export function Today() {
  return <div data-testid="page-today">Today</div>;
}
```

Path: `apps/web/src/pages/Login.tsx`
```typescript
export function Login() {
  return <div data-testid="page-login">Login</div>;
}
```

Path: `apps/web/src/pages/AuthCallback.tsx`
```typescript
export function AuthCallback() {
  return <div data-testid="page-auth-callback">Auth Callback</div>;
}
```

Path: `apps/web/src/pages/PinSetup.tsx`
```typescript
export function PinSetup() {
  return <div data-testid="page-pin-setup">PIN Setup</div>;
}
```

Path: `apps/web/src/pages/PinEntry.tsx`
```typescript
export function PinEntry() {
  return <div data-testid="page-pin-entry">PIN Entry</div>;
}
```

- [ ] **Step 5: routes.tsx 작성**

Path: `apps/web/src/routes.tsx`
```typescript
import { Route, Routes } from "react-router-dom";
import { Today } from "./pages/Today";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";
import { PinSetup } from "./pages/PinSetup";
import { PinEntry } from "./pages/PinEntry";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Today />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/pin/setup" element={<PinSetup />} />
      <Route path="/auth/pin" element={<PinEntry />} />
    </Routes>
  );
}
```

- [ ] **Step 6: App.tsx 갱신**

Path: `apps/web/src/App.tsx`
```typescript
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen p-6">
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}
```

- [ ] **Step 7: App.test.tsx 갱신 (라우터 호환)**

Path: `apps/web/src/App.test.tsx`
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("기본 진입 시 Today 페이지가 보인다", () => {
    render(<App />);
    expect(screen.getByTestId("page-today")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: 테스트 통과 확인**

Run: `pnpm --filter @iingapp/web test`
Expected: 6 passed (App 1 + routes 5).

- [ ] **Step 9: 커밋**

```bash
git add apps/web
git commit -m "feat(web): add router with placeholder pages"
```

---

## Task 5: PWA 매니페스트 + Service Worker 등록

**Files:**
- Create: `apps/web/public/manifest.json`
- Create: `apps/web/public/sw.js`
- Create: `apps/web/public/icon-192.png` (placeholder)
- Create: `apps/web/public/icon-512.png` (placeholder)
- Create: `apps/web/public/icon-180.png` (placeholder)
- Create: `apps/web/src/sw-register.ts`
- Modify: `apps/web/src/main.tsx`

- [ ] **Step 1: manifest.json**

Path: `apps/web/public/manifest.json`
```json
{
  "name": "iingApp",
  "short_name": "iingApp",
  "description": "Personal English learning PWA",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "lang": "ko",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-180.png", "sizes": "180x180", "type": "image/png", "purpose": "any" }
  ]
}
```

- [ ] **Step 2: 임시 아이콘 3개 생성**

ImageMagick 또는 다른 도구로 단색 아이콘 생성. 임시로 [favicon.io](https://favicon.io)에서 텍스트 "i"를 사용해 192/512 PNG를 만들어 다운로드 후 배치하면 됨. 180px도 동일하게.

각 파일이 존재하는지만 확인:
Run: `ls apps/web/public/icon-*.png`
Expected: 3개 파일.

- [ ] **Step 3: Service Worker 스켈레톤**

Path: `apps/web/public/sw.js`
```javascript
const CACHE_NAME = "iingapp-v1";
const APP_SHELL = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
```

- [ ] **Step 4: Service Worker 등록 헬퍼**

Path: `apps/web/src/sw-register.ts`
```typescript
export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return; // 개발 중에는 등록 안 함

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[sw] register failed", err);
    });
  });
}
```

- [ ] **Step 5: main.tsx에서 호출**

Path: `apps/web/src/main.tsx`
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { registerServiceWorker } from "./sw-register";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

registerServiceWorker();
```

- [ ] **Step 6: 빌드 검증**

Run: `pnpm --filter @iingapp/web build`
Expected: dist/ 에 manifest.json, sw.js, icon-*.png 모두 복사됨.

- [ ] **Step 7: preview 확인 (실제 SW 등록 환경)**

Run: `pnpm --filter @iingapp/web preview`
Open: 표시된 URL을 Chrome 개발자 도구 → Application → Service Workers 에서 확인.
Expected: sw.js 가 activated and running.
Press Ctrl+C.

- [ ] **Step 8: 커밋**

```bash
git add apps/web
git commit -m "feat(web): add PWA manifest and service worker scaffold"
```

---

## Task 6: API 앱 부트스트랩 (Wrangler + Hono)

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/wrangler.toml`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/src/index.ts`

- [ ] **Step 1: Wrangler 글로벌 설치 (선택적, npx 가능)**

Run: `pnpm dlx wrangler --version`
Expected: 4.x 이상.

- [ ] **Step 2: package.json**

Path: `apps/api/package.json`
```json
{
  "name": "@iingapp/api",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev --port 8787",
    "build": "wrangler deploy --dry-run",
    "deploy": "wrangler deploy",
    "test": "vitest run",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@iingapp/shared": "workspace:*",
    "hono": "^4.5.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240620.0",
    "@cloudflare/vitest-pool-workers": "^0.4.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "wrangler": "^4.0.0"
  }
}
```

- [ ] **Step 3: tsconfig**

Path: `apps/api/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"],
    "noEmit": true
  },
  "include": ["src", "test"]
}
```

- [ ] **Step 4: wrangler.toml**

Path: `apps/api/wrangler.toml`
```toml
name = "iingapp-api"
main = "src/index.ts"
compatibility_date = "2026-05-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ENV = "development"

# 실제 secrets (SUPABASE_*, JWT_SECRET 등)는 wrangler secret 으로 별도 등록
```

- [ ] **Step 5: vitest config**

Path: `apps/api/vitest.config.ts`
```typescript
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
      },
    },
  },
});
```

- [ ] **Step 6: src/index.ts 최소 골격**

Path: `apps/api/src/index.ts`
```typescript
import { Hono } from "hono";

type Env = {
  ENV: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("iingapp api"));

export default app;
```

- [ ] **Step 7: 의존성 설치 + dev 서버 실행 검증**

Run: `pnpm install`
Run: `pnpm dev:api`
Open: `http://localhost:8787`
Expected: "iingapp api" 텍스트 표시.
Press Ctrl+C.

- [ ] **Step 8: 커밋**

```bash
git add apps/api
git commit -m "feat(api): bootstrap cloudflare workers + hono"
```

---

## Task 7: `/health` 엔드포인트 (TDD)

**Files:**
- Create: `apps/api/src/routes/health.ts`
- Modify: `apps/api/src/index.ts`
- Test: `apps/api/test/health.test.ts`

- [ ] **Step 1: 테스트 먼저 작성**

Path: `apps/api/test/health.test.ts`
```typescript
import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("GET /health", () => {
  it("200 with status JSON", async () => {
    const res = await SELF.fetch("http://localhost/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      status: "ok",
      version: expect.any(String),
    });
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `pnpm --filter @iingapp/api test`
Expected: FAIL (404 received instead of 200).

- [ ] **Step 3: 라우트 구현**

Path: `apps/api/src/routes/health.ts`
```typescript
import { Hono } from "hono";

export const healthRoute = new Hono();

healthRoute.get("/health", (c) =>
  c.json({
    status: "ok",
    version: "0.1.0",
    time: new Date().toISOString(),
  })
);
```

- [ ] **Step 4: 라우터 마운트**

Path: `apps/api/src/index.ts`
```typescript
import { Hono } from "hono";
import { healthRoute } from "./routes/health";

type Env = { ENV: string };

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("iingapp api"));
app.route("/", healthRoute);

export default app;
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `pnpm --filter @iingapp/api test`
Expected: 1 passed.

- [ ] **Step 6: 커밋**

```bash
git add apps/api
git commit -m "feat(api): add /health endpoint"
```

---

## Task 8: Supabase 프로젝트 셋업

**Files:**
- Create: `supabase/config.toml`
- Update README/instructions

- [ ] **Step 1: Supabase CLI 설치**

Run (Windows PowerShell):
```powershell
winget install Supabase.cli
```
또는 npm: `pnpm add -g supabase`
Run: `supabase --version`
Expected: 1.x.x 이상.

- [ ] **Step 2: Supabase 계정 생성 + 프로젝트 생성**

수동 단계:
1. https://supabase.com 가입 (GitHub 계정 추천)
2. New Project 생성
   - Name: `iingapp`
   - Region: `Northeast Asia (Seoul)` 또는 가까운 곳
   - Database Password: 강한 비밀번호 (저장 필수)
3. 프로젝트가 준비되면 Settings → API 에서 다음 값 복사 후 안전한 곳에 저장:
   - `Project URL`
   - `anon public` key
   - `service_role` secret key (절대 외부 노출 금지)
4. Settings → API → JWT Settings 에서 `JWT Secret` 복사 (워커가 토큰 검증할 때 사용)

- [ ] **Step 3: 로컬 supabase 디렉토리 초기화**

Run: `supabase init`
Expected: `supabase/` 디렉토리 + `config.toml` 생성.

- [ ] **Step 4: 원격 프로젝트 연결**

Run:
```bash
supabase login
supabase link --project-ref <PROJECT_REF>
```
(PROJECT_REF 는 대시보드 URL의 `https://supabase.com/dashboard/project/<ref>` 부분)

- [ ] **Step 5: Auth 설정 (대시보드)**

수동:
1. Authentication → Providers → Email 활성화
2. Authentication → URL Configuration:
   - Site URL: `http://localhost:5173` (개발 중)
   - Redirect URLs: `http://localhost:5173/auth/callback`, `https://<your-pages-domain>/auth/callback`
3. Authentication → Settings → Magic Link:
   - "Enable Magic Link" ON
   - Expiry: 300 (5분, W4 정책)
   - Single use: ON

- [ ] **Step 6: 커밋**

```bash
git add supabase
git commit -m "chore: init supabase project link"
```

---

## Task 9: DB 마이그레이션 (14 테이블 + 1 view)

**Files:**
- Create: `supabase/migrations/20260508000000_phase1_schema.sql`

- [ ] **Step 1: 마이그레이션 파일 생성**

Path: `supabase/migrations/20260508000000_phase1_schema.sql`
```sql
-- =============================================
-- iingApp Phase 1 Schema
-- 14 tables + 1 materialized view
-- =============================================

-- 확장 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- USERS ----------
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL UNIQUE,
  display_name        TEXT,
  timezone            TEXT NOT NULL DEFAULT 'Asia/Seoul',
  pin_hash            TEXT,
  pin_attempts        SMALLINT NOT NULL DEFAULT 0,
  pin_locked_until    TIMESTAMPTZ,
  vacation_until      TIMESTAMPTZ,
  proficiency_test    TEXT CHECK (proficiency_test IN
                        ('opic','toeic_sp','toefl_ibt','ielts','self','none')),
  proficiency_score   TEXT,
  cefr_level          TEXT CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  tested_at           DATE,
  target_test         TEXT,
  target_score        TEXT,
  target_date         DATE,
  goal_note           TEXT,
  native_lang         TEXT NOT NULL DEFAULT 'ko',
  onboarding_done     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CONTENT_SERIES ----------
CREATE TABLE content_series (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  title_ko      TEXT NOT NULL,
  title_en      TEXT,
  category      TEXT NOT NULL CHECK (category IN
                  ('grammar','conversation','speech','youtube')),
  cover_url     TEXT,
  episode_count INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CONTENT_EPISODES ----------
CREATE TABLE content_episodes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id       UUID NOT NULL REFERENCES content_series(id) ON DELETE CASCADE,
  episode_no      INT NOT NULL,
  title           TEXT NOT NULL,
  audio_url       TEXT,
  duration_sec    INT,
  transcript_url  TEXT,
  ingest_status   TEXT NOT NULL DEFAULT 'pending'
                  CHECK (ingest_status IN ('pending','processing','ready','failed')),
  source_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (series_id, episode_no)
);

-- ---------- SENTENCES ----------
CREATE TABLE sentences (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id     UUID NOT NULL REFERENCES content_episodes(id) ON DELETE CASCADE,
  idx            INT NOT NULL,
  start_ms       INT NOT NULL,
  end_ms         INT NOT NULL,
  text_en        TEXT NOT NULL,
  text_ko        TEXT,
  grammar_tags   TEXT[] NOT NULL DEFAULT '{}',
  difficulty     SMALLINT CHECK (difficulty BETWEEN 1 AND 5),
  quiz_eligible  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (episode_id, idx)
);

CREATE INDEX idx_sentences_episode ON sentences(episode_id);

-- ---------- SCHEDULE_SLOTS ----------
CREATE TABLE schedule_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weekday      SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  method       TEXT NOT NULL CHECK (method IN
                  ('shadowing','quiz_new','quiz_review','dictation',
                   'chunk_drill','free')),
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_schedule_user_weekday ON schedule_slots(user_id, weekday);

-- ---------- SLOT_CONTENT_MAP ----------
CREATE TABLE slot_content_map (
  slot_id    UUID NOT NULL REFERENCES schedule_slots(id) ON DELETE CASCADE,
  series_id  UUID NOT NULL REFERENCES content_series(id),
  priority   SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (slot_id, series_id)
);

-- ---------- SESSIONS ----------
CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot_id           UUID REFERENCES schedule_slots(id) ON DELETE SET NULL,
  episode_id        UUID NOT NULL REFERENCES content_episodes(id),
  method            TEXT NOT NULL,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at          TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress','completed','abandoned','postponed')),
  resume_position   INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_started ON sessions(user_id, started_at DESC);

-- ---------- ATTEMPTS ----------
CREATE TABLE attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sentence_id     UUID NOT NULL REFERENCES sentences(id),
  user_answer     TEXT NOT NULL,
  input_mode      TEXT NOT NULL CHECK (input_mode IN ('voice','typing')),
  score           SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  ai_feedback     TEXT,
  flagged         BOOLEAN NOT NULL DEFAULT FALSE,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attempts_sentence ON attempts(sentence_id);
CREATE INDEX idx_attempts_session ON attempts(session_id);

-- ---------- ERROR_TAGS ----------
CREATE TABLE error_tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id    UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  category      TEXT NOT NULL CHECK (category IN
                  ('tense','article','preposition','word_order','word_choice',
                   'agreement','spelling','capitalization','punctuation','idiomatic')),
  severity      SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 3),
  user_part     TEXT,
  correct_part  TEXT,
  note          TEXT
);

CREATE INDEX idx_error_tags_attempt ON error_tags(attempt_id);

-- ---------- BOOKMARKS ----------
CREATE TABLE bookmarks (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sentence_id  UUID NOT NULL REFERENCES sentences(id) ON DELETE CASCADE,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sentence_id)
);

-- ---------- VOCABULARY ----------
CREATE TABLE vocabulary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sentence_id     UUID REFERENCES sentences(id),
  phrase          TEXT NOT NULL,
  meaning_ko      TEXT,
  encounter_count INT NOT NULL DEFAULT 1,
  first_seen      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, phrase)
);

-- ---------- RECORDINGS ----------
CREATE TABLE recordings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id   UUID REFERENCES attempts(id) ON DELETE SET NULL,
  session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sentence_id  UUID NOT NULL REFERENCES sentences(id),
  audio_url    TEXT NOT NULL,
  stt_text     TEXT,
  similarity   NUMERIC(4,3),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- MONTHLY_REPORTS ----------
CREATE TABLE monthly_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month            DATE NOT NULL,
  stats_json       JSONB NOT NULL,
  ai_advice        TEXT,
  recommendations  JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);

-- ---------- INGESTION_JOBS ----------
CREATE TABLE ingestion_jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id   UUID NOT NULL REFERENCES content_episodes(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'queued'
               CHECK (status IN ('queued','running','done','failed')),
  error        TEXT,
  started_at   TIMESTAMPTZ,
  finished_at  TIMESTAMPTZ,
  retry_count  INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ingestion_status ON ingestion_jobs(status);

-- ---------- WEAKNESS_SCORES (materialized view) ----------
-- 약점 점수: 사용자별 문장별 누적 + 시간 감쇠
CREATE MATERIALIZED VIEW weakness_scores AS
SELECT
  a.sentence_id,
  s.user_id,
  SUM(et.severity)
    * EXP(-EXTRACT(EPOCH FROM (now() - a.created_at)) / 86400.0 * 0.3)
    AS score,
  MAX(a.created_at)                     AS last_attempted,
  0                                     AS correct_streak,
  FALSE                                 AS graduated
FROM attempts a
JOIN sessions s ON s.id = a.session_id
JOIN error_tags et ON et.attempt_id = a.id
WHERE a.flagged = FALSE
GROUP BY a.sentence_id, s.user_id;

CREATE UNIQUE INDEX idx_weakness_pk
  ON weakness_scores(sentence_id, user_id);

-- 매일 새벽 cron이 호출할 refresh 함수
CREATE OR REPLACE FUNCTION refresh_weakness_scores()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY weakness_scores;
END;
$$;

-- ---------- RLS (Row Level Security) ----------
-- 단일 사용자라도 보안상 켜둠
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary          ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports     ENABLE ROW LEVEL SECURITY;

-- 본인만 자기 행을 볼 수 있는 정책 (auth.uid() 는 Supabase 표준)
CREATE POLICY user_self_select  ON users           FOR SELECT  USING (auth.uid() = id);
CREATE POLICY user_self_update  ON users           FOR UPDATE  USING (auth.uid() = id);

CREATE POLICY slots_self        ON schedule_slots  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY sessions_self     ON sessions        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY attempts_self     ON attempts
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM sessions WHERE sessions.id = attempts.session_id)
  );
CREATE POLICY error_tags_self   ON error_tags
  FOR ALL USING (
    auth.uid() = (
      SELECT s.user_id FROM sessions s
      JOIN attempts a ON a.session_id = s.id
      WHERE a.id = error_tags.attempt_id
    )
  );
CREATE POLICY bookmarks_self    ON bookmarks       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY vocabulary_self   ON vocabulary      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY recordings_self   ON recordings
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM sessions WHERE sessions.id = recordings.session_id)
  );
CREATE POLICY reports_self      ON monthly_reports FOR ALL USING (auth.uid() = user_id);

-- 콘텐츠는 1인용이라 모두 읽기 허용
ALTER TABLE content_series   ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences        ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_read_all   ON content_series   FOR SELECT USING (TRUE);
CREATE POLICY episodes_read_all  ON content_episodes FOR SELECT USING (TRUE);
CREATE POLICY sentences_read_all ON sentences        FOR SELECT USING (TRUE);
```

- [ ] **Step 2: 원격 DB에 적용**

Run: `supabase db push`
Expected: "Applying migration 20260508000000_phase1_schema.sql ... Done."

- [ ] **Step 3: 검증 — 테이블 14개 + view 1개 확인**

대시보드 → Table Editor 에서 14개 테이블 + 1개 materialized view 표시되는지 확인.

또는 SQL Editor 에서:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';
```
Expected: 14 tables + 1 weakness_scores view.

- [ ] **Step 4: refresh 함수 동작 검증**

```sql
SELECT refresh_weakness_scores();
```
Expected: 에러 없이 실행 (빈 view 라도 OK).

- [ ] **Step 5: 커밋**

```bash
git add supabase/migrations
git commit -m "feat(db): add phase1 schema (14 tables + 1 mat view)"
```

---

## Task 10: Supabase 클라이언트 셋업 (frontend)

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/.env.local` (gitignored)
- Create: `apps/web/src/lib/supabase.ts`
- Create: `apps/web/src/lib/api.ts`
- Test: `apps/web/src/lib/supabase.test.ts`

- [ ] **Step 1: 의존성 추가**

```bash
cd apps/web
pnpm add @supabase/supabase-js@^2.45.0
cd ../..
```

- [ ] **Step 2: env 변수 설정**

Path: `apps/web/.env.local` (gitignored 확인 필수)
```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=http://localhost:8787
```

- [ ] **Step 3: env.example 도 만들어 두기 (커밋용)**

Path: `apps/web/.env.example`
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:8787
```

- [ ] **Step 4: 테스트**

Path: `apps/web/src/lib/supabase.test.ts`
```typescript
import { describe, it, expect } from "vitest";
import { getSupabase } from "./supabase";

describe("getSupabase", () => {
  it("required env 없으면 throw", () => {
    const orig = import.meta.env.VITE_SUPABASE_URL;
    // @ts-ignore
    import.meta.env.VITE_SUPABASE_URL = "";
    expect(() => getSupabase()).toThrowError(/VITE_SUPABASE_URL/);
    // @ts-ignore
    import.meta.env.VITE_SUPABASE_URL = orig;
  });
});
```

- [ ] **Step 5: supabase 클라이언트 작성**

Path: `apps/web/src/lib/supabase.ts`
```typescript
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url) throw new Error("VITE_SUPABASE_URL 누락");
  if (!anon) throw new Error("VITE_SUPABASE_ANON_KEY 누락");

  client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "iingapp.auth",
    },
  });

  return client;
}
```

- [ ] **Step 6: API 호출 헬퍼**

Path: `apps/web/src/lib/api.ts`
```typescript
import { getSupabase } from "./supabase";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${BASE_URL}${path}`, { ...init, headers });
}

export async function apiJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}
```

- [ ] **Step 7: 테스트 실행**

Run: `pnpm --filter @iingapp/web test`
Expected: all passed.

- [ ] **Step 8: 커밋**

```bash
git add apps/web
git commit -m "feat(web): add supabase client and api helpers"
```

---

## Task 11: 매직링크 로그인 화면

**Files:**
- Modify: `apps/web/src/pages/Login.tsx`
- Test: `apps/web/src/pages/Login.test.tsx`

- [ ] **Step 1: 테스트 작성**

Path: `apps/web/src/pages/Login.test.tsx`
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Login } from "./Login";

const signInWithOtpMock = vi.fn();

vi.mock("../lib/supabase", () => ({
  getSupabase: () => ({
    auth: { signInWithOtp: signInWithOtpMock },
  }),
}));

beforeEach(() => signInWithOtpMock.mockReset());

describe("Login", () => {
  it("이메일 입력 후 매직링크 발송 호출", async () => {
    signInWithOtpMock.mockResolvedValue({ error: null });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/이메일/i), {
      target: { value: "me@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /로그인/i }));

    await waitFor(() => {
      expect(signInWithOtpMock).toHaveBeenCalledWith({
        email: "me@example.com",
        options: {
          emailRedirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });
    expect(await screen.findByText(/메일/i)).toBeInTheDocument();
  });

  it("에러 발생 시 메시지 표시", async () => {
    signInWithOtpMock.mockResolvedValue({ error: { message: "rate limit" } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/이메일/i), {
      target: { value: "me@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /로그인/i }));

    expect(await screen.findByText(/rate limit/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `pnpm --filter @iingapp/web test`
Expected: FAIL.

- [ ] **Step 3: Login 컴포넌트 구현**

Path: `apps/web/src/pages/Login.tsx`
```typescript
import { useState } from "react";
import { getSupabase } from "../lib/supabase";

type Status = "idle" | "sending" | "sent" | "error";

export function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = getSupabase();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (err) {
      setStatus("error");
      setError(err.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div data-testid="page-login" className="max-w-sm mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">iingApp 로그인</h1>
      {status === "sent" ? (
        <p className="text-green-600">
          이메일을 보냈어요. 메일에서 링크를 눌러 진입하세요.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-white dark:bg-slate-800"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-slate-900 text-white rounded py-2 disabled:opacity-50"
          >
            {status === "sending" ? "보내는 중…" : "매직링크로 로그인"}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter @iingapp/web test`
Expected: 2 passed.

- [ ] **Step 5: 커밋**

```bash
git add apps/web
git commit -m "feat(web): add magic link login page"
```

---

## Task 12: AuthCallback + 세션 스토어

**Files:**
- Modify: `apps/web/src/pages/AuthCallback.tsx`
- Create: `apps/web/src/lib/session.ts` (현재 user 조회 헬퍼)
- Test: `apps/web/src/pages/AuthCallback.test.tsx`

- [ ] **Step 1: 테스트**

Path: `apps/web/src/pages/AuthCallback.test.tsx`
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthCallback } from "./AuthCallback";

const getSessionMock = vi.fn();

vi.mock("../lib/supabase", () => ({
  getSupabase: () => ({
    auth: { getSession: getSessionMock },
  }),
}));

describe("AuthCallback", () => {
  it("세션이 있으면 PIN 등록/입력으로 이동", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1", email: "x@y.z" } } },
    });

    render(
      <MemoryRouter initialEntries={["/auth/callback"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/pin/setup" element={<div>setup</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/setup/)).toBeInTheDocument();
    });
  });

  it("세션 없으면 /auth/login 으로 이동", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });

    render(
      <MemoryRouter initialEntries={["/auth/callback"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("login-page")).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `pnpm --filter @iingapp/web test`
Expected: FAIL.

- [ ] **Step 3: AuthCallback 구현**

Path: `apps/web/src/pages/AuthCallback.tsx`
```typescript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabase";

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const supabase = getSupabase();
    // detectSessionInUrl=true 이므로 자동 처리됨
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Phase 1: 일단 PIN 등록 화면으로 (이후 Task 16에서 has_pin 분기)
        navigate("/auth/pin/setup", { replace: true });
      } else {
        navigate("/auth/login", { replace: true });
      }
    });
  }, [navigate]);

  return <div data-testid="page-auth-callback">로그인 처리 중…</div>;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter @iingapp/web test`
Expected: 4 passed (Auth 2 + Login 2).

- [ ] **Step 5: 커밋**

```bash
git add apps/web
git commit -m "feat(web): handle magic link callback"
```

---

## Task 13: API 백엔드 — JWT 검증 미들웨어

**Files:**
- Create: `apps/api/src/middleware/auth.ts`
- Modify: `apps/api/src/index.ts`
- Test: `apps/api/test/auth.middleware.test.ts`

JWT 검증은 Supabase가 발급한 HS256 토큰을 우리 워커가 환경변수의 `JWT_SECRET`으로 검증.

- [ ] **Step 1: hono/jwt 의존성 확인 (이미 hono에 포함)**

Run: `pnpm --filter @iingapp/api list hono`
Expected: hono 4.5+

- [ ] **Step 2: 테스트 작성**

Path: `apps/api/test/auth.middleware.test.ts`
```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { sign } from "hono/jwt";
import { SELF, env } from "cloudflare:test";

describe("auth middleware", () => {
  beforeAll(() => {
    // JWT_SECRET 가 wrangler.toml [vars] 또는 vitest 환경에 주입되어 있어야 함
  });

  it("토큰 없이 요청 → 401", async () => {
    const res = await SELF.fetch("http://localhost/me");
    expect(res.status).toBe(401);
  });

  it("유효한 토큰 → 200", async () => {
    const token = await sign(
      {
        sub: "11111111-1111-1111-1111-111111111111",
        email: "test@example.com",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      (env as any).JWT_SECRET
    );
    const res = await SELF.fetch("http://localhost/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe("test@example.com");
  });

  it("만료된 토큰 → 401", async () => {
    const token = await sign(
      {
        sub: "11111111-1111-1111-1111-111111111111",
        email: "test@example.com",
        iat: Math.floor(Date.now() / 1000) - 7200,
        exp: Math.floor(Date.now() / 1000) - 3600,
      },
      (env as any).JWT_SECRET
    );
    const res = await SELF.fetch("http://localhost/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 3: vitest 환경에 JWT_SECRET 주입**

Path: `apps/api/wrangler.toml` (수정)
```toml
name = "iingapp-api"
main = "src/index.ts"
compatibility_date = "2026-05-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ENV = "development"
JWT_SECRET = "test-secret-do-not-use-in-prod"
```

> 주의: 실제 배포 시엔 `wrangler secret put JWT_SECRET` 으로 등록한 값이 우선 적용됨. 위 vars 의 JWT_SECRET 은 로컬·테스트 용도.

- [ ] **Step 4: 테스트 실행 → 실패 확인**

Run: `pnpm --filter @iingapp/api test`
Expected: FAIL (404 또는 미들웨어 미존재).

- [ ] **Step 5: 미들웨어 구현**

Path: `apps/api/src/middleware/auth.ts`
```typescript
import { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import { JwtPayloadSchema } from "@iingapp/shared";

// 전체 앱의 Bindings 타입 (모든 라우트에서 공유)
export type Env = {
  ENV: string;
  JWT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

export type AuthVars = {
  user: { id: string; email: string };
};

export const authMiddleware: MiddlewareHandler<{
  Bindings: Env;
  Variables: AuthVars;
}> = async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "missing_token" }, 401);
  }
  const token = header.slice("Bearer ".length).trim();

  let payload: unknown;
  try {
    payload = await verify(token, c.env.JWT_SECRET);
  } catch {
    return c.json({ error: "invalid_token" }, 401);
  }

  const parsed = JwtPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return c.json({ error: "bad_payload" }, 401);
  }

  c.set("user", { id: parsed.data.sub, email: parsed.data.email });
  await next();
  return;
};
```

- [ ] **Step 6: index.ts 에 /me 엔드포인트 + 미들웨어 적용**

Path: `apps/api/src/index.ts`
```typescript
import { Hono } from "hono";
import { healthRoute } from "./routes/health";
import { authMiddleware, AuthVars, Env } from "./middleware/auth";

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

app.get("/", (c) => c.text("iingapp api"));
app.route("/", healthRoute);

app.get("/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default app;
```

- [ ] **Step 7: 테스트 통과 확인**

Run: `pnpm --filter @iingapp/api test`
Expected: 4 passed (health 1 + auth 3).

- [ ] **Step 8: 커밋**

```bash
git add apps/api
git commit -m "feat(api): add JWT auth middleware and /me endpoint"
```

---

## Task 14: PIN 저장·검증 엔드포인트

**Files:**
- Create: `apps/api/src/routes/pin.ts`
- Create: `apps/api/src/lib/pin.ts` (해싱 유틸)
- Create: `apps/api/src/lib/supabase.ts` (서버 클라이언트)
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/wrangler.toml`
- Test: `apps/api/test/pin.test.ts`

PIN은 PBKDF2 (Web Crypto, 100,000 iter, SHA-256). bcrypt 의존성 회피.

- [ ] **Step 1: PIN 해싱 유틸 작성 + 테스트**

Path: `apps/api/test/pin-hash.test.ts`
```typescript
import { describe, it, expect } from "vitest";
import { hashPin, verifyPin } from "../src/lib/pin";

describe("pin hashing", () => {
  it("같은 PIN은 verify=true", async () => {
    const hash = await hashPin("1234");
    expect(await verifyPin("1234", hash)).toBe(true);
  });
  it("다른 PIN은 verify=false", async () => {
    const hash = await hashPin("1234");
    expect(await verifyPin("9999", hash)).toBe(false);
  });
  it("같은 PIN도 매번 다른 해시 (salt)", async () => {
    const a = await hashPin("1234");
    const b = await hashPin("1234");
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `pnpm --filter @iingapp/api test`
Expected: FAIL.

- [ ] **Step 3: PIN 유틸 구현**

Path: `apps/api/src/lib/pin.ts`
```typescript
const ITERATIONS = 100_000;
const KEY_LEN = 32;

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derive(
  pin: string,
  salt: Uint8Array
): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: ITERATIONS,
    },
    keyMaterial,
    KEY_LEN * 8
  );
}

export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(pin, salt);
  // 형식: pbkdf2$100000$<saltHex>$<hashHex>
  return `pbkdf2$${ITERATIONS}$${bytesToHex(salt.buffer)}$${bytesToHex(hash)}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const salt = hexToBytes(parts[2]);
  const expected = parts[3];
  const got = bytesToHex(await derive(pin, salt));
  // 시간 일정 비교
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) {
    diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter @iingapp/api test -- pin-hash`
Expected: 3 passed.

- [ ] **Step 5: Supabase 서버 클라이언트**

Path: `apps/api/src/lib/supabase.ts`
```typescript
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type AdminEnv = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

export function getAdminClient(env: AdminEnv): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

추가 의존성:
```bash
cd apps/api
pnpm add @supabase/supabase-js@^2.45.0
cd ../..
```

wrangler.toml 에 임시 환경변수 (실제 값은 `wrangler secret put` 으로 별도):
```toml
[vars]
ENV = "development"
JWT_SECRET = "test-secret-do-not-use-in-prod"
SUPABASE_URL = "https://example.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key"
```

- [ ] **Step 6: PIN 라우트 테스트**

Path: `apps/api/test/pin-route.test.ts`
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { sign } from "hono/jwt";
import { SELF, env } from "cloudflare:test";

vi.mock("../src/lib/supabase", () => {
  const data: Record<string, any> = {};
  return {
    getAdminClient: () => ({
      from: (table: string) => ({
        update: (patch: any) => ({
          eq: async (col: string, val: string) => {
            data[`${table}:${col}:${val}`] = patch;
            return { error: null };
          },
        }),
        select: (cols: string) => ({
          eq: (col: string, val: string) => ({
            single: async () => ({
              data: data[`${table}:${col}:${val}`] ?? null,
              error: null,
            }),
          }),
        }),
      }),
    }),
  };
});

async function makeToken() {
  return sign(
    {
      sub: "11111111-1111-1111-1111-111111111111",
      email: "test@example.com",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    (env as any).JWT_SECRET
  );
}

describe("pin routes", () => {
  it("POST /me/pin (PIN 등록) 성공", async () => {
    const token = await makeToken();
    const res = await SELF.fetch("http://localhost/me/pin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin: "1234" }),
    });
    expect(res.status).toBe(204);
  });

  it("POST /me/pin 잘못된 형식 → 400", async () => {
    const token = await makeToken();
    const res = await SELF.fetch("http://localhost/me/pin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin: "abcd" }),
    });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 7: 테스트 → 실패 확인**

Run: `pnpm --filter @iingapp/api test`
Expected: pin-route 테스트 FAIL.

- [ ] **Step 8: PIN 라우트 구현**

Path: `apps/api/src/routes/pin.ts`
```typescript
import { Hono } from "hono";
import { PinSchema } from "@iingapp/shared";
import { authMiddleware, AuthVars, Env } from "../middleware/auth";
import { hashPin, verifyPin } from "../lib/pin";
import { getAdminClient } from "../lib/supabase";

export const pinRoute = new Hono<{ Bindings: Env; Variables: AuthVars }>();

pinRoute.use("/me/pin", authMiddleware);
pinRoute.use("/auth/pin", authMiddleware);

// PIN 등록/변경
pinRoute.post("/me/pin", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = PinSchema.safeParse(body?.pin);
  if (!parsed.success) {
    return c.json({ error: "invalid_pin_format" }, 400);
  }
  const user = c.get("user");
  const supabase = getAdminClient(c.env);
  const hash = await hashPin(parsed.data);
  const { error } = await supabase
    .from("users")
    .update({ pin_hash: hash, pin_attempts: 0, pin_locked_until: null })
    .eq("id", user.id);
  if (error) return c.json({ error: "db_error", detail: error.message }, 500);
  return c.body(null, 204);
});

// PIN 검증
pinRoute.post("/auth/pin", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = PinSchema.safeParse(body?.pin);
  if (!parsed.success) return c.json({ error: "invalid_pin_format" }, 400);

  const user = c.get("user");
  const supabase = getAdminClient(c.env);

  const { data, error } = await supabase
    .from("users")
    .select("pin_hash, pin_attempts, pin_locked_until")
    .eq("id", user.id)
    .single();
  if (error || !data) return c.json({ error: "user_not_found" }, 404);

  const now = Date.now();
  if (data.pin_locked_until && new Date(data.pin_locked_until).getTime() > now) {
    return c.json({ error: "locked", until: data.pin_locked_until }, 423);
  }
  if (!data.pin_hash) return c.json({ error: "no_pin_set" }, 409);

  const ok = await verifyPin(parsed.data, data.pin_hash);
  if (!ok) {
    const attempts = (data.pin_attempts ?? 0) + 1;
    const patch: any = { pin_attempts: attempts };
    if (attempts >= 5) {
      patch.pin_locked_until = new Date(now + 60_000).toISOString();
      patch.pin_attempts = 0;
    }
    await supabase.from("users").update(patch).eq("id", user.id);
    return c.json({ error: "wrong_pin", attempts }, 401);
  }

  // 성공 시 카운터 초기화
  await supabase
    .from("users")
    .update({ pin_attempts: 0, pin_locked_until: null })
    .eq("id", user.id);
  return c.json({ ok: true });
});
```

- [ ] **Step 9: index.ts 에 라우트 등록**

Path: `apps/api/src/index.ts`
```typescript
import { Hono } from "hono";
import { healthRoute } from "./routes/health";
import { pinRoute } from "./routes/pin";
import { authMiddleware, AuthVars, Env } from "./middleware/auth";

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

app.get("/", (c) => c.text("iingapp api"));
app.route("/", healthRoute);
app.route("/", pinRoute);

app.get("/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default app;
```

- [ ] **Step 10: 테스트 전체 통과 확인**

Run: `pnpm --filter @iingapp/api test`
Expected: all passed (health + auth + pin-hash + pin-route).

- [ ] **Step 11: 커밋**

```bash
git add apps/api
git commit -m "feat(api): add PIN registration and verification with PBKDF2"
```

---

## Task 15: PIN UI (Setup + Entry)

**Files:**
- Modify: `apps/web/src/pages/PinSetup.tsx`
- Modify: `apps/web/src/pages/PinEntry.tsx`
- Test: `apps/web/src/pages/PinSetup.test.tsx`
- Test: `apps/web/src/pages/PinEntry.test.tsx`

- [ ] **Step 1: PinSetup 테스트 + 구현**

Path: `apps/web/src/pages/PinSetup.test.tsx`
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PinSetup } from "./PinSetup";

const apiFetchMock = vi.fn();
vi.mock("../lib/api", () => ({
  apiFetch: (...a: unknown[]) => apiFetchMock(...a),
}));

describe("PinSetup", () => {
  it("4자리 입력 후 제출 → API 호출 + Today 이동", async () => {
    apiFetchMock.mockResolvedValue({ ok: true });
    render(
      <MemoryRouter initialEntries={["/auth/pin/setup"]}>
        <Routes>
          <Route path="/auth/pin/setup" element={<PinSetup />} />
          <Route path="/" element={<div>today</div>} />
        </Routes>
      </MemoryRouter>
    );
    const input = screen.getByLabelText(/PIN/i);
    fireEvent.change(input, { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: /저장/i }));
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith("/me/pin", expect.objectContaining({
        method: "POST",
      }));
      expect(screen.getByText("today")).toBeInTheDocument();
    });
  });
});
```

Path: `apps/web/src/pages/PinSetup.tsx`
```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

export function PinSetup() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      setError("4자리 숫자를 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await apiFetch("/me/pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("저장 실패");
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div data-testid="page-pin-setup" className="max-w-sm mx-auto py-12">
      <h1 className="text-xl font-bold mb-4">PIN 설정</h1>
      <p className="text-sm text-slate-500 mb-6">
        앱을 빠르게 다시 열 때 입력합니다.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">PIN (4자리)</span>
          <input
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full mt-1 border rounded px-3 py-2 bg-white dark:bg-slate-800 tracking-[0.5em] text-center text-2xl"
          />
        </label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-slate-900 text-white rounded py-2 disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: PinEntry 테스트 + 구현**

Path: `apps/web/src/pages/PinEntry.test.tsx`
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PinEntry } from "./PinEntry";

const apiFetchMock = vi.fn();
vi.mock("../lib/api", () => ({
  apiFetch: (...a: unknown[]) => apiFetchMock(...a),
}));

describe("PinEntry", () => {
  it("정답 PIN → Today 이동", async () => {
    apiFetchMock.mockResolvedValue({ ok: true });
    render(
      <MemoryRouter initialEntries={["/auth/pin"]}>
        <Routes>
          <Route path="/auth/pin" element={<PinEntry />} />
          <Route path="/" element={<div>today</div>} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: "1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /확인/i }));
    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith("/auth/pin", expect.objectContaining({
        method: "POST",
      }));
      expect(screen.getByText("today")).toBeInTheDocument();
    });
  });

  it("틀린 PIN → 에러 메시지", async () => {
    apiFetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "wrong_pin", attempts: 1 }),
    });
    render(
      <MemoryRouter>
        <PinEntry />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/PIN/i), {
      target: { value: "0000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /확인/i }));
    expect(await screen.findByText(/PIN이 일치하지 않습니다/)).toBeInTheDocument();
  });
});
```

Path: `apps/web/src/pages/PinEntry.tsx`
```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

export function PinEntry() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await apiFetch("/auth/pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
    setSubmitting(false);
    if (res.ok) {
      navigate("/", { replace: true });
      return;
    }
    if (res.status === 423) setError("잠시 잠겼어요. 1분 뒤에 다시 시도해주세요.");
    else setError("PIN이 일치하지 않습니다.");
  }

  return (
    <div data-testid="page-pin-entry" className="max-w-sm mx-auto py-12">
      <h1 className="text-xl font-bold mb-6">PIN 입력</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm">PIN</span>
          <input
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full mt-1 border rounded px-3 py-2 bg-white dark:bg-slate-800 tracking-[0.5em] text-center text-2xl"
          />
        </label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-slate-900 text-white rounded py-2 disabled:opacity-50"
        >
          {submitting ? "확인 중…" : "확인"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: 테스트 통과 확인**

Run: `pnpm --filter @iingapp/web test`
Expected: 모든 테스트 통과.

- [ ] **Step 4: 커밋**

```bash
git add apps/web
git commit -m "feat(web): add PIN setup and entry pages"
```

---

## Task 16: 보호 라우트 (ProtectedRoute)

**Files:**
- Create: `apps/web/src/components/ProtectedRoute.tsx`
- Modify: `apps/web/src/routes.tsx`
- Test: `apps/web/src/components/ProtectedRoute.test.tsx`

- [ ] **Step 1: 테스트**

Path: `apps/web/src/components/ProtectedRoute.test.tsx`
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const getSessionMock = vi.fn();
vi.mock("../lib/supabase", () => ({
  getSupabase: () => ({
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }),
}));

describe("ProtectedRoute", () => {
  it("세션 없으면 /auth/login 으로 리다이렉트", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    render(
      <MemoryRouter initialEntries={["/secret"]}>
        <Routes>
          <Route path="/secret" element={
            <ProtectedRoute><div>SECRET</div></ProtectedRoute>
          } />
          <Route path="/auth/login" element={<div>LOGIN</div>} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText("LOGIN")).toBeInTheDocument());
  });

  it("세션 있으면 자식 렌더", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    });
    render(
      <MemoryRouter initialEntries={["/secret"]}>
        <Routes>
          <Route path="/secret" element={
            <ProtectedRoute><div>SECRET</div></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText("SECRET")).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: 구현**

Path: `apps/web/src/components/ProtectedRoute.tsx`
```typescript
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getSupabase } from "../lib/supabase";

type State = "loading" | "authed" | "anonymous";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setState(data.session ? "authed" : "anonymous");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState(session ? "authed" : "anonymous");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state === "loading") return <div className="p-6">로딩…</div>;
  if (state === "anonymous") return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}
```

- [ ] **Step 3: 라우트에 적용**

Path: `apps/web/src/routes.tsx`
```typescript
import { Route, Routes } from "react-router-dom";
import { Today } from "./pages/Today";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";
import { PinSetup } from "./pages/PinSetup";
import { PinEntry } from "./pages/PinEntry";
import { ProtectedRoute } from "./components/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute><Today /></ProtectedRoute>
      } />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/pin/setup" element={
        <ProtectedRoute><PinSetup /></ProtectedRoute>
      } />
      <Route path="/auth/pin" element={
        <ProtectedRoute><PinEntry /></ProtectedRoute>
      } />
    </Routes>
  );
}
```

- [ ] **Step 4: routes.test.tsx 갱신**

Path: `apps/web/src/routes.test.tsx`
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AppRoutes } from "./routes";

const getSessionMock = vi.fn();
vi.mock("./lib/supabase", () => ({
  getSupabase: () => ({
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  }),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Routes (보호)", () => {
  it("/auth/login 은 인증 없이도 접근", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    renderAt("/auth/login");
    expect(screen.getByTestId("page-login")).toBeInTheDocument();
  });

  it("/ 는 비인증 시 /auth/login 으로", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    renderAt("/");
    await waitFor(() => {
      expect(screen.getByTestId("page-login")).toBeInTheDocument();
    });
  });

  it("/ 는 인증되면 Today 표시", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    });
    renderAt("/");
    await waitFor(() => {
      expect(screen.getByTestId("page-today")).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 5: 테스트 전체 통과**

Run: `pnpm --filter @iingapp/web test`
Expected: 모든 테스트 통과.

- [ ] **Step 6: 커밋**

```bash
git add apps/web
git commit -m "feat(web): add ProtectedRoute and gate authenticated pages"
```

---

## Task 17: Cloudflare Pages 배포 셋업

**Files:**
- Create: `D:\0.Study\00.iingApp\docs\DEPLOY.md`

- [ ] **Step 1: Cloudflare 계정 + Pages 프로젝트 생성**

수동:
1. https://dash.cloudflare.com 가입
2. Workers & Pages → Create → Pages → "Connect to Git"
3. GitHub 계정 연결 → 본 리포지토리 선택
4. Build settings:
   - Framework preset: None
   - Build command: `pnpm install --frozen-lockfile && pnpm --filter @iingapp/web build`
   - Build output directory: `apps/web/dist`
   - Root directory: (비움)
5. Environment variables:
   - `VITE_SUPABASE_URL` = (Supabase 프로젝트 URL)
   - `VITE_SUPABASE_ANON_KEY` = (anon key)
   - `VITE_API_URL` = `https://iingapp-api.<account>.workers.dev` (Task 18 후 갱신)
6. Save and Deploy → 첫 빌드가 약 2분 후 완료
7. 발급된 URL 확인 (예: `iingapp.pages.dev`)

- [ ] **Step 2: Supabase Auth Redirect URL 갱신**

Supabase 대시보드 → Authentication → URL Configuration:
- Site URL: `https://iingapp.pages.dev`
- Redirect URLs 에 추가: `https://iingapp.pages.dev/auth/callback`

- [ ] **Step 3: 첫 배포 확인**

Open: `https://iingapp.pages.dev`
Expected:
- `/auth/login` 으로 자동 리다이렉트 (보호 라우트 동작)
- 매직링크 발송 가능
- 메일 링크 클릭 → callback 처리 → PIN 등록으로 이동

- [ ] **Step 4: DEPLOY.md 작성**

Path: `docs/DEPLOY.md`
```markdown
# 배포 가이드

## Cloudflare Pages (frontend)

자동 배포: GitHub main 푸시 시 빌드 + 배포.

수동 재배포: Cloudflare Dashboard → Pages → iingapp → "Retry deployment".

### 환경변수
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

## Cloudflare Workers (api)

```bash
cd apps/api
pnpm wrangler deploy
```

### 시크릿 등록 (1회)
```bash
wrangler secret put JWT_SECRET
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

## iPhone에 PWA 설치

1. Safari로 https://iingapp.pages.dev 접속
2. 하단 공유(↑) 버튼 → "홈 화면에 추가"
3. 이름 확인 후 "추가"
4. 홈 화면 아이콘 탭 → 풀스크린으로 실행
5. 매직링크 로그인 → PIN 설정

## 트러블슈팅

- 빌드 실패: `pnpm install --frozen-lockfile` 가 실패하면 lockfile 갱신 후 재커밋
- 매직링크 클릭이 무한 리다이렉트: Supabase Redirect URLs에 정확한 도메인 등록 확인
- PWA 설치 메뉴 안 보임: HTTPS, manifest.json 200 응답, sw.js 200 응답 모두 확인
```

- [ ] **Step 5: 커밋 + 푸시 (자동 재배포 트리거)**

```bash
git add docs/DEPLOY.md
git commit -m "docs: add deploy guide"
git push origin main
```

---

## Task 18: Cloudflare Workers 배포

**Files:**
- Modify: `apps/api/wrangler.toml`

- [ ] **Step 1: wrangler 로그인**

Run: `cd apps/api && pnpm wrangler login`
브라우저로 인증 → CLI 로 토큰 저장.

- [ ] **Step 2: 시크릿 등록**

```bash
cd apps/api
echo $JWT_SECRET_VALUE | pnpm wrangler secret put JWT_SECRET
echo $SUPABASE_URL | pnpm wrangler secret put SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY | pnpm wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

> JWT_SECRET 값은 Supabase Dashboard → Settings → API → JWT Secret 의 값 그대로.

- [ ] **Step 3: production 빌드 + 배포**

Run: `pnpm wrangler deploy`
Expected: `https://iingapp-api.<account>.workers.dev` 출력.

- [ ] **Step 4: production 도메인 확인**

Run: `curl https://iingapp-api.<account>.workers.dev/health`
Expected:
```json
{"status":"ok","version":"0.1.0","time":"..."}
```

- [ ] **Step 5: VITE_API_URL 갱신**

Cloudflare Pages 환경변수에서 `VITE_API_URL` 을 production Workers URL로 변경 후 Pages 재배포.

- [ ] **Step 6: CORS 화이트리스트 (W5)**

Path: `apps/api/src/index.ts` (수정)
```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRoute } from "./routes/health";
import { pinRoute } from "./routes/pin";
import { authMiddleware, AuthVars, Env } from "./middleware/auth";

const app = new Hono<{ Bindings: Env; Variables: AuthVars }>();

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://iingapp.pages.dev",
];

app.use(
  "*",
  cors({
    origin: (origin) => (ALLOWED_ORIGINS.includes(origin) ? origin : null),
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
  })
);

app.get("/", (c) => c.text("iingapp api"));
app.route("/", healthRoute);
app.route("/", pinRoute);

app.get("/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default app;
```

- [ ] **Step 7: 재배포**

Run: `pnpm wrangler deploy`

- [ ] **Step 8: 커밋**

```bash
cd ../..
git add apps/api
git commit -m "feat(api): add CORS whitelist and deploy to cloudflare"
git push
```

---

## Task 19: GitHub Actions CI/CD

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy-api.yml`

Pages는 GitHub 연동만으로 자동 배포되지만, Workers는 Action 트리거 필요.

- [ ] **Step 1: CI workflow (모든 PR + main 푸시)**

Path: `.github/workflows/ci.yml`
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm -r build
```

- [ ] **Step 2: API 배포 workflow (main 푸시 시)**

Path: `.github/workflows/deploy-api.yml`
```yaml
name: Deploy API
on:
  push:
    branches: [main]
    paths:
      - "apps/api/**"
      - "packages/shared/**"
      - ".github/workflows/deploy-api.yml"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @iingapp/api wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

- [ ] **Step 3: GitHub Secrets 등록**

GitHub 리포 → Settings → Secrets and variables → Actions → New repository secret:
- `CLOUDFLARE_API_TOKEN`: Cloudflare 대시보드 → My Profile → API Tokens → "Edit Cloudflare Workers" 템플릿으로 발급
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 대시보드 우측 사이드바의 Account ID

- [ ] **Step 4: 푸시해서 워크플로우 동작 확인**

```bash
git add .github
git commit -m "ci: add CI tests and api auto-deploy"
git push
```

GitHub Actions 탭에서 두 workflow 모두 녹색이면 OK.

---

## Task 20: iPhone PWA 수동 검증 + 체크리스트

**Files:**
- Modify: `docs/DEPLOY.md`

- [ ] **Step 1: iPhone에서 매직링크 로그인 끝까지 시도**

수동 절차 (iPhone Safari):
1. `https://iingapp.pages.dev` 접속
2. `/auth/login` 자동 리다이렉트 확인
3. 이메일 입력 후 "매직링크" 클릭
4. iPhone 메일 앱에서 메일 수신 → 링크 클릭
5. 자동으로 `/auth/callback` → `/auth/pin/setup` 진입
6. 4자리 PIN 등록 → "/" 진입 (Today 화면)

- [ ] **Step 2: 홈 화면에 추가**

1. Safari 하단 공유 버튼 → "홈 화면에 추가"
2. 이름 "iingApp" 확인 후 추가
3. 홈 아이콘 탭 → 풀스크린 모드 진입 확인

- [ ] **Step 3: PWA 풀스크린에서 재로그인**

홈 화면 PWA 에서 다시 매직링크 로그인 → 메일 링크 클릭이 PWA 안으로 들어오는지 확인 (iOS 16.4+ 에서는 PWA 안으로 들어옴, 그 이전은 Safari로 빠질 수 있음).

- [ ] **Step 4: 체크리스트 정리**

Path: `docs/DEPLOY.md` 끝에 추가:

```markdown
## Phase 1 검증 체크리스트

- [ ] `/health` 가 production Workers 에서 200 반환
- [ ] iPhone Safari → 매직링크 메일 도착
- [ ] 메일 링크 클릭 → `/auth/callback` 통과 → `/auth/pin/setup`
- [ ] PIN 4자리 저장 → Today 화면 (`page-today`) 표시
- [ ] 홈 화면에 추가 후 풀스크린으로 다시 열림
- [ ] DB users 테이블에 본인 행 1개 존재 (Supabase Table Editor)
```

- [ ] **Step 5: 모든 체크 통과 확인 후 마지막 커밋**

```bash
git add docs/DEPLOY.md
git commit -m "docs: add phase 1 validation checklist"
git push
```

---

## Phase 1 완료 게이트

다음 모두가 동작해야 Phase 1 종료, Phase 2 plan 작성으로 넘어갑니다:

- ✅ 단위 테스트 모두 통과 (`pnpm test`)
- ✅ Pages + Workers production 배포 완료
- ✅ iPhone Safari 에서 매직링크 로그인 + PIN + 홈 화면 추가 풀스크린
- ✅ Supabase 14 테이블 + 1 view 존재
- ✅ GitHub Actions CI 녹색

---

## 다음 단계

Phase 1 완료 후 **Phase 2 — Content Ingestion** plan을 별도 작성 예정. 작성 시점에 다음 학습 사항을 반영:

- Phase 1에서 발견한 토오링·환경 이슈
- 실제 Supabase / Cloudflare 응답 시간·한도 패턴
- iPhone PWA 동작 특이점 (특히 매직링크 콜백)

Phase 2 범위 미리보기:
- yt-dlp GitHub Actions 워크플로우
- R2 버킷 + 업로드 헬퍼
- Whisper 호출 모듈 (Groq)
- Gemini 번역+태깅 모듈 (P2)
- ingestion_jobs 큐 워커
- 일괄 업로드 스크립트 (`scripts/bulk-ingest.ts`)
- 라이브러리 화면 (콘텐츠 브라우저)
- 수동 보정 UI
