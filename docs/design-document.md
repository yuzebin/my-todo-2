# 设计文档 - my-todo-2

## 1. 项目概述

**项目名称**: my-todo-2  
**项目描述**: 一个多用户待办事项管理应用，允许用户注册、登录，并管理个人的任务列表。  
**部署平台**: Vercel  
**技术栈**: TypeScript, Next.js 16, React 19, Tailwind CSS, Neon PostgreSQL, Better Auth

## 2. 产品目标

为用户提供一个安全、易用的待办事项管理平台，使每个已认证用户能够安全地访问和管理仅属于自己的任务。

## 3. 核心功能

### 3.1 用户认证
- 用户注册（邮箱、密码）
- 用户登录
- 用户登出
- 会话管理
- 密码安全存储

### 3.2 待办事项管理
- 创建待办事项
- 查看待办事项列表
- 编辑待办事项
- 删除待办事项
- 标记完成/未完成
- 按状态筛选

### 3.3 用户体验
- 响应式设计（移动端、桌面端）
- 实时反馈
- 清晰的错误提示
- 流畅的过渡动画

## 4. 数据模型

### 4.1 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户唯一标识 |
| email | String | 用户邮箱（唯一） |
| name | String | 用户名称 |
| passwordHash | String | 密码哈希值 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### 4.2 待办事项表 (todos)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 事项唯一标识 |
| userId | UUID | 所属用户ID（外键） |
| title | String | 事项标题 |
| description | String | 事项描述（可选） |
| status | Enum | 状态：pending/completed |
| priority | Enum | 优先级：low/medium/high |
| dueDate | DateTime | 到期日期（可选） |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### 4.3 关系
- 一个用户有多个待办事项（一对多）
- 删除用户时级联删除其待办事项

## 5. API 接口设计

### 5.1 认证接口

#### 注册
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "User registered successfully"
}
```

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### 登出
```
POST /api/auth/logout
Response: 200 OK
{
  "success": true,
  "message": "Logout successful"
}
```

### 5.2 待办事项接口

#### 获取列表
```
GET /api/todos?status=pending
Authorization: Bearer token

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Task Title",
      "description": "Task Description",
      "status": "pending",
      "priority": "high",
      "dueDate": "2026-07-15T00:00:00Z",
      "createdAt": "2026-06-30T12:00:00Z",
      "updatedAt": "2026-06-30T12:00:00Z"
    }
  ]
}
```

#### 创建待办事项
```
POST /api/todos
Authorization: Bearer token
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task Description",
  "priority": "high",
  "dueDate": "2026-07-15"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "New Task",
    ...
  }
}
```

#### 更新待办事项
```
PATCH /api/todos/:id
Authorization: Bearer token
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "completed"
}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### 删除待办事项
```
DELETE /api/todos/:id
Authorization: Bearer token

Response: 200 OK
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

## 6. 用户界面设计

### 6.1 页面结构

#### 认证页面
- 注册表单
- 登录表单
- 表单验证反馈
- 错误提示

#### 主仪表板
- 待办事项列表
- 添加新任务表单
- 筛选和排序选项
- 用户菜单（个人资料、登出）

#### 任务编辑页面
- 编辑表单
- 删除确认
- 返回列表

### 6.2 设计规范

#### 颜色方案
- 主色：Blue (#3B82F6)
- 辅助色：Teal (#14B8A6)
- 背景色：Neutral (#F9FAFB)
- 文本色：Dark Gray (#1F2937)
- 错误色：Red (#EF4444)
- 成功色：Green (#10B981)

#### 排版
- 标题字体：Inter（无衬线字体）
- 正文字体：Inter
- 代码字体：JetBrains Mono

#### 间距
- 基础单位：4px
- 使用 Tailwind CSS spacing scale

#### 组件
- 按钮：带圆角、阴影、hover 状态
- 输入框：清晰的边框、焦点状态
- 卡片：浅色背景、阴影、圆角
- 模态框：全屏遮罩、居中内容

## 7. 安全设计

### 7.1 认证安全
- 使用 Better Auth 进行会话管理
- 密码使用 bcryptjs 加密存储
- 登录信息存储在安全的 HTTP-Only Cookie 中

### 7.2 授权安全
- 每个待办事项操作前验证用户所有权
- 使用服务器端认证检查
- 防止用户访问他人的任务

### 7.3 输入验证
- 客户端基础验证（快速反馈）
- 服务器端完整验证（安全保障）
- SQL 参数化查询防止注入

### 7.4 敏感信息保护
- 密钥存储在环境变量中
- 数据库连接使用环境变量
- 不在客户端暴露敏感信息

## 8. 架构设计

### 8.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 16 | 服务器端渲染和客户端应用 |
| UI 框架 | React 19 | 用户界面组件 |
| 样式 | Tailwind CSS + CSS 变量 | 响应式设计 |
| 状态管理 | React Context + SWR | 客户端状态和数据获取 |
| 认证 | Better Auth | 会话和认证管理 |
| 数据库 | Neon PostgreSQL | 关系型数据库 |
| ORM | Drizzle | 类型安全的数据库访问 |
| 验证 | Zod | 运行时类型验证 |
| 工具链 | TypeScript, ESLint, Prettier | 开发工具 |

### 8.2 目录结构

```
my-todo-2/
├── app/
│   ├── layout.tsx                 # 根布局
│   ├── page.tsx                   # 首页
│   ├── auth/
│   │   ├── register/page.tsx      # 注册页
│   │   └── login/page.tsx         # 登录页
│   ├── dashboard/
│   │   └── page.tsx               # 仪表板
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       └── todos/
│           ├── route.ts            # GET 和 POST
│           └── [id]/route.ts       # PATCH 和 DELETE
├── components/
│   ├── auth/
│   │   ├── RegisterForm.tsx
│   │   └── LoginForm.tsx
│   ├── todos/
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   └── AddTodoForm.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts              # Drizzle 数据库架构
│   │   └── client.ts              # 数据库客户端
│   ├── auth.ts                    # Better Auth 配置
│   ├── validation.ts              # Zod 验证 schemas
│   ├── types.ts                   # TypeScript 类型定义
│   └── utils.ts                   # 工具函数
├── styles/
│   └── globals.css                # 全局样式和 CSS 变量
├── public/
│   └── ...                        # 静态资源
├── docs/
│   ├── design-document.md         # 本文档
│   ├── development-guide.md       # 开发指南
│   └── architecture.md            # 架构详解
├── .env.example                   # 环境变量示例
├── next.config.js                 # Next.js 配置
├── tailwind.config.ts             # Tailwind 配置
├── tsconfig.json                  # TypeScript 配置
├── package.json                   # 项目依赖
└── README.md                      # 项目说明

```

## 9. 实现流程

### 9.1 第一阶段：基础搭建
1. 初始化 Next.js 项目
2. 配置 TypeScript 和开发工具
3. 连接 Neon 数据库
4. 设置 Tailwind CSS

### 9.2 第二阶段：认证系统
1. 配置 Better Auth
2. 实现用户数据模型
3. 创建注册接口和页面
4. 创建登录接口和页面

### 9.3 第三阶段：待办事项功能
1. 创建待办事项数据模型
2. 实现 CRUD API 接口
3. 添加授权检查
4. 创建前端组件

### 9.4 第四阶段：UI 和交互
1. 设计整体布局
2. 实现响应式设计
3. 添加过渡动画
4. 优化用户体验

### 9.5 第五阶段：测试和部署
1. 添加单元测试
2. 手动集成测试
3. 部署到 Vercel
4. 性能优化

## 10. 成功标准

- 用户能成功注册和登录
- 已认证用户能创建、查看、编辑、删除任务
- 用户只能访问自己的任务
- 界面响应快速流畅
- 清晰的错误提示和验证反馈
- 代码易于维护和扩展

## 11. 风险和限制

### 风险
- 密码安全性：需要严格的密码验证规则
- 并发操作：同时编辑可能导致数据不一致
- 数据库连接：需要妥善处理连接池和超时

### 限制
- 初版不支持团队协作
- 不支持离线使用
- 无实时多人编辑

## 12. 未来扩展方向

- 任务标签和分类
- 任务提醒和通知
- 共享和协作列表
- 数据导出（CSV、JSON）
- 移动端原生应用
- 暗黑主题支持
- 国际化（多语言）
