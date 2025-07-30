# Egret Inspector 架构说明文档

## 概述

Egret Inspector 是一个基于 Chrome 扩展的 Egret 引擎调试工具，采用 CC-Inspector 的成熟架构设计。本文档详细描述了系统的整体架构、组件关系和通信机制。

## 架构概览

### 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DevTools      │    │   Background    │    │   Content       │
│   Panel         │◄──►│   Script        │◄──►│   Script        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                                ▼                       ▼
                        ┌─────────────────┐    ┌─────────────────┐
                        │   Port Manager  │    │   Inject Script │
                        │   (PortMgr)     │    │   (DOM Events)  │
                        └─────────────────┘    └─────────────────┘
```

### 组件说明

#### 1. DevTools Panel
- **位置**: `src/views/devtools/`
- **功能**: 用户界面，提供调试工具界面
- **通信**: 通过 Bridge 与 Background Script 通信
- **技术栈**: Vue.js + TypeScript

#### 2. Background Script
- **位置**: `src/scripts/background/`
- **功能**: 中央消息路由，管理所有连接
- **核心组件**:
  - `portMgr.ts`: 端口管理器
  - `portMan.ts`: 端口基类
  - `portContent.ts`: 内容脚本端口
  - `portDevtools.ts`: DevTools 端口

#### 3. Content Script
- **位置**: `src/scripts/content/`
- **功能**: 页面内容脚本，注入调试脚本
- **通信**: 通过 DOM 事件与 Inject Script 通信

#### 4. Inject Script
- **位置**: `src/scripts/inject/`
- **功能**: 注入到页面，与 Egret 引擎交互
- **核心组件**:
  - `inspector.ts`: 主要检查器逻辑
  - `event.ts`: 事件处理基类
  - `util.ts`: 工具函数

## 通信机制

### 消息类型

系统定义了完整的消息类型系统：

```typescript
export enum Msg {
  // 引擎支持检测
  RequestSupport = "request-support",
  ResponseSupport = "response-support",
  
  // 节点树信息
  RequstTreeInfo = "request-tree-info",
  ResponseTreeInfo = "response-tree-info",
  
  // 节点信息
  RequestNodeInfo = "request-node-info",
  ResponseNodeInfo = "response-node-info",
  
  // 属性操作
  RequestSetProperty = "request-set-property",
  ResponseSetProperty = "response-set-property",
  
  // 错误处理
  ResponseError = "response-error",
}
```

### 通信流程

#### 正向通信 (DevTools → Inject)
1. DevTools Panel 发送请求
2. Background Script 接收并路由
3. Content Script 接收并转发
4. Inject Script 处理请求

#### 反向通信 (Inject → DevTools)
1. Inject Script 发送响应
2. Content Script 接收并转发
3. Background Script 接收并路由
4. DevTools Panel 接收响应

### 端口管理

#### PortMgr 类
- 管理所有连接端口
- 处理端口生命周期
- 实现消息路由

#### 端口类型
- **PortDevtools**: DevTools 面板连接
- **PortContent**: 内容脚本连接

## 数据流

### 引擎检测流程

```
DevTools Panel
    ↓ (RequestSupport)
Background Script
    ↓ (转发)
Content Script
    ↓ (DOM Event)
Inject Script
    ↓ (检测 Egret 引擎)
Egret Engine
    ↓ (返回检测结果)
Inject Script
    ↓ (DOM Event)
Content Script
    ↓ (转发)
Background Script
    ↓ (转发)
DevTools Panel
    ↓ (显示检测结果)
UI
```

### 节点树获取流程

```
DevTools Panel
    ↓ (RequestTreeInfo)
Background Script
    ↓ (转发)
Content Script
    ↓ (DOM Event)
Inject Script
    ↓ (获取节点树)
Egret Engine
    ↓ (返回节点数据)
Inject Script
    ↓ (DOM Event)
Content Script
    ↓ (转发)
Background Script
    ↓ (转发)
DevTools Panel
    ↓ (显示节点树)
UI
```

## 错误处理

### 连接断开处理
- 自动重连机制
- 状态监控和恢复
- 错误日志记录

### 消息验证
- 消息格式验证
- 源和目标验证
- 类型安全检查

## 性能优化

### 缓存机制
- 节点引用缓存
- 消息缓存
- 状态缓存

### 异步处理
- 异步消息处理
- 非阻塞操作
- 批量处理

## 安全考虑

### 消息安全
- 消息标识验证
- 源和目标验证
- 权限控制

### 数据安全
- 数据验证
- 类型检查
- 错误边界

## 扩展性设计

### 模块化架构
- 清晰的模块分离
- 可插拔的功能组件
- 统一的消息接口

### 多引擎支持
- 可扩展的引擎检测
- 统一的接口设计
- 插件化架构

## 调试支持

### 日志系统
- 分级日志输出
- 调试模式支持
- 错误追踪

### 开发工具
- 实时状态监控
- 消息追踪
- 性能分析

## 部署说明

### 构建流程
1. TypeScript 编译
2. 资源打包
3. 扩展打包
4. 签名和发布

### 安装要求
- Chrome 浏览器
- 开发者模式
- 扩展权限

## 开发指南

### 环境设置
1. 安装依赖: `npm install`
2. 开发模式: `npm run dev`
3. 构建: `npm run build`

### 代码规范
- TypeScript 严格模式
- ESLint 代码检查
- Prettier 代码格式化

### 测试策略
- 单元测试
- 集成测试
- 端到端测试

## 维护说明

### 版本管理
- 语义化版本控制
- 变更日志维护
- 向后兼容性

### 问题排查
- 日志分析
- 状态检查
- 连接诊断

## 总结

Egret Inspector 采用成熟的 CC-Inspector 架构，具有以下特点：

### 优势
1. **架构清晰**: 分层设计，职责明确
2. **通信可靠**: 完整的消息路由机制
3. **扩展性强**: 模块化设计，易于扩展
4. **性能优化**: 缓存机制和异步处理
5. **安全可靠**: 完善的错误处理和验证

### 应用场景
- Egret 引擎调试
- 游戏性能分析
- 实时数据监控
- 交互式调试工具

该架构为 Egret 引擎调试工具提供了坚实的基础，支持后续功能扩展和优化。 