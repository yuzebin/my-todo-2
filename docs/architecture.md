# 架构文档 - my-todo-2

## 1. 系统架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    浏览器（客户端）                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Next.js App Router 页面                 │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │  React 组件（form, list, dashboard）       │ │  │
│  │  │  - 状态管理：React Context + SWR           │ │  │
│  │  │  - 样式：Tailwind CSS                       │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└──────────┬──────────────────────────────────────────────┘
           │ HTTP requests
           ▼
┌─────────────────────────────────────────────────────────┐
│                  Vercel Edge Network                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │   Next.js Server          │
         │  (App Router + API Routes)│
         │                           │
         │ ┌─────────────────────┐   │
         │ │ Middleware          │   │
         │ │ - Auth 检查          │   │
         │ │ - Session 管理      │   │
         │ └─────────────────────┘   │
         │                           │
         │ ┌─────────────────────┐   │
         │ │ Route Handlers      │   │
         │ │ - /api/auth/*       │   │
         │ │ - /api/todos/*      │   │
         │ └─────────────────────┘   │
         │                           │
         │ ┌─────────────────────┐   │
         │ │ Server Actions      │   │
         │ │ - 数据验证          │   │
         │ │ - 权限检查          │   │
         │ │ - 业务逻辑          │   │
         │ └─────────────────────┘   │
         └────────────┬──────────────┘
                      │ SQL 查询
                      ▼
         ┌───────────────────────────┐
         │   Neon PostgreSQL         │
         │  （serverless database）   │
         │                           │
         │ ┌─────────────────────┐   │
         │ │ users 表             │   │
         │ │ todos 表             │   │
         │ └─────────────────────┘   │
         └───────────────────────────┘
```

## 2. 分层架构

### 2.1 表现层（Presentation Layer）

**职责**：用户界面和交互

**组件**：
- Next.js 页面 (`.tsx` 文件在 `app/` 目录)
- React 组件（`components/` 目录）
- 页面布局和样式（Tailwind CSS）

**技术**：
- Next.js 16 App Router
- React 19 组件
- Tailwind CSS v4

**数据流**：
```
用户交互 → React 组件 → SWR 钩子 → API 调用
```

### 2.2 应用层（Application Layer）

**职责**：业务逻辑和流程编排

**组件**：
- API 路由处理器 (`app/api/auth/`, `app/api/todos/`)
- Server Actions（Next.js 服务器函数）
- 验证和错误处理

**技术**：
- Better Auth（认证库）
- Zod（数据验证）
- TypeScript 类型

**关键职责**：
- 用户认证和会话管理
- 请求数据验证
- 业务规则检查（如权限验证）
- 错误统一处理

### 2.3 数据访问层（Data Access Layer）

**职责**：数据库操作和持久化

**组件**：
- Drizzle ORM（`lib/db/schema.ts`）
- 数据库客户端（`lib/db/client.ts`）
- 查询构建和执行

**技术**：
- Drizzle ORM
- PostgreSQL
- SQL 参数化查询

**特点**：
- 类型安全的查询
- 自动生成的类型定义
- 防止 SQL 注入

## 3. 认证和授权流程

### 3.1 注册流程

```
1. 用户访问 /auth/register
   │
2. 显示注册表单
   │
3. 用户填写并提交
   │
4. 客户端基础验证
   │
5. POST /api/auth/register
   │
6. 服务器端验证
   ├─ 检查邮箱是否已存在
   ├─ 验证密码强度
   └─ 验证其他字段
   │
7. 创建用户
   ├─ 密码加密 (bcryptjs)
   └─ 存储到 users 表
   │
8. 自动登录
   │
9. 重定向到 /dashboard
```

### 3.2 登录流程

```
1. 用户访问 /auth/login
   │
2. 显示登录表单
   │
3. 用户填写邮箱和密码
   │
4. 客户端基础验证
   │
5. POST /api/auth/login
   │
6. 服务器端验证
   ├─ 查询用户记录
   ├─ 比对密码哈希
   └─ 验证用户状态
   │
7. 创建会话
   ├─ Better Auth 生成 session token
   └─ 存储在 HTTP-Only Cookie
   │
8. 重定向到 /dashboard
```

### 3.3 授权检查（以获取待办事项为例）

```
1. 前端请求 GET /api/todos
   ├─ 自动携带 Cookie（会话 token）
   │
2. 中间件验证会话
   ├─ 检查 Cookie
   ├─ 验证 token 有效性
   └─ 提取 userId
   │
3. 路由处理器处理请求
   ├─ 获取当前用户 ID
   │
4. 查询数据库
   ├─ SELECT * FROM todos WHERE userId = $1
   │
5. 返回结果
   └─ 只包含该用户的待办事项
```

## 4. 数据库设计详解

### 4.1 用户表（users）

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT email_format CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

CREATE INDEX idx_users_email ON users(email);
```

**设计决策**：
- 使用 UUID 作为主键（跨数据库迁移更安全）
- email 添加 UNIQUE 约束（防止重复注册）
- 存储密码哈希值（永不存储明文密码）
- 添加 created_at 和 updated_at（审计追踪）

### 4.2 待办事项表（todos）

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high'))
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_status ON todos(user_id, status);
```

**设计决策**：
- 使用 user_id 外键链接用户（数据完整性）
- ON DELETE CASCADE（删除用户时自动删除其待办事项）
- Enum 约束保证数据有效性
- 复合索引优化查询性能

### 4.3 Drizzle Schema 定义

```typescript
// lib/db/schema.ts

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('pending'),
  priority: varchar('priority', { length: 50 }).default('medium'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

## 5. API 通信模式

### 5.1 请求/响应流

```
┌─ 客户端 ────────────────┐
│                         │
│ ┌────────────────────┐ │
│ │ React 组件         │ │
│ └──────────┬─────────┘ │
│            │ useFetch  │
│ ┌──────────▼─────────┐ │
│ │ API 调用函数        │ │
│ │ (fetch / SWR)      │ │
│ └──────────┬─────────┘ │
│            │ JSON      │
└────────────┼───────────┘
             │ HTTP + Cookie
             ▼
┌─ 服务器 ──────────────────┐
│                          │
│ ┌──────────────────────┐ │
│ │ 中间件               │ │
│ │ - 会话验证           │ │
│ │ - 权限检查           │ │
│ └──────────┬───────────┘ │
│            │             │
│ ┌──────────▼───────────┐ │
│ │ 路由处理器            │ │
│ │ - 参数验证           │ │
│ │ - 业务逻辑           │ │
│ │ - 错误处理           │ │
│ └──────────┬───────────┘ │
│            │             │
│ ┌──────────▼───────────┐ │
│ │ 数据库操作           │ │
│ │ - 查询               │ │
│ │ - 修改               │ │
│ └──────────┬───────────┘ │
│            │ JSON        │
└────────────┼──────────────┘
             │
┌────────────▼────────────┐
│ 客户端接收结果           │
│ 更新组件状态             │
└─────────────────────────┘
```

### 5.2 响应格式标准

**成功响应**：
```json
{
  "success": true,
  "data": { /* 实际数据 */ }
}
```

**错误响应**：
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 6. 状态管理

### 6.1 使用 SWR 进行数据获取和缓存

```typescript
// 获取待办事项列表
const { data: todos, isLoading, mutate } = useSWR(
  '/api/todos',
  fetcher,
  { revalidateOnFocus: false }
);

// 自动缓存和重新验证
// 使用 mutate 更新数据
mutate();
```

### 6.2 使用 React Context 管理全局状态

```typescript
// AuthContext 用于管理用户状态
const { user, isLoading, logout } = useAuth();

// TodoContext 用于管理待办事项状态（如果需要复杂交互）
const { todos, addTodo, updateTodo } = useTodos();
```

## 7. 安全实现

### 7.1 密码安全

```typescript
// 注册时加密密码
import bcryptjs from 'bcryptjs';

const salt = await bcryptjs.genSalt(10);
const passwordHash = await bcryptjs.hash(password, salt);

// 登录时验证密码
const isValid = await bcryptjs.compare(inputPassword, storedHash);
```

### 7.2 会话安全

```typescript
// 使用 HTTP-Only Cookie 存储会话 token
// Better Auth 自动处理：
// - token 签名和验证
// - 过期时间设置
// - HTTP-Only 标志
// - Secure 标志（HTTPS 环境）
```

### 7.3 权限检查

```typescript
// 每个涉及用户数据的操作都需要检查
export async function getTodos() {
  const session = await getSession(); // 获取当前会话
  if (!session) {
    return { error: 'Unauthorized' };
  }

  // 只查询当前用户的数据
  const todos = await db.query.todos.findMany({
    where: eq(todos.userId, session.user.id)
  });

  return todos;
}
```

### 7.4 输入验证

```typescript
import { z } from 'zod';

// 定义验证 schema
const CreateTodoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional(),
});

// 验证用户输入
const validatedData = CreateTodoSchema.parse(inputData);
```

## 8. 错误处理策略

### 8.1 错误分类

- **验证错误** (400): 输入数据无效
- **认证错误** (401): 用户未登录
- **授权错误** (403): 用户无权访问
- **不存在错误** (404): 资源不存在
- **服务器错误** (500): 内部错误

### 8.2 错误响应示例

```typescript
// 验证错误
{
  "success": false,
  "error": "Invalid input",
  "details": {
    "title": ["Title is required"]
  }
}

// 授权错误
{
  "success": false,
  "error": "You don't have permission to access this resource"
}

// 服务器错误
{
  "success": false,
  "error": "Internal server error"
}
```

## 9. 性能考虑

### 9.1 数据库优化
- 使用索引加快查询
- 限制 SELECT 返回的字段数
- 分页处理大量数据

### 9.2 前端优化
- SWR 缓存机制
- React 组件代码分割
- 图片懒加载
- CSS-in-JS 优化

### 9.3 API 优化
- 响应数据压缩
- 缓存 header 设置
- 减少不必要的数据传输

## 10. 扩展性设计

### 10.1 模块化架构
- 认证模块独立
- 待办事项模块独立
- 通用工具函数分离

### 10.2 易于添加新功能
- 遵循一致的 API 模式
- 可复用的组件设计
- 类型定义清晰

### 10.3 易于迁移
- 数据库抽象层
- 认证提供者可切换
- 业务逻辑与框架解耦
