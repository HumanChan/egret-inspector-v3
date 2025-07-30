# Egret Inspector 开发指南

## 概述

本文档为 Egret Inspector 项目的开发者提供详细的开发指导，包括环境设置、代码规范、开发流程和最佳实践。

## 环境设置

### 系统要求

- **Node.js**: 版本 16.0 或更高
- **npm**: 版本 8.0 或更高
- **Chrome**: 版本 88 或更高
- **TypeScript**: 版本 4.5 或更高

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd egret-inspector-v3
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **开发模式**
   ```bash
   npm run dev
   ```

4. **构建项目**
   ```bash
   npm run build
   ```

## 项目结构

```
egret-inspector-v3/
├── src/
│   ├── core/                    # 核心类型定义
│   │   └── types.ts
│   ├── scripts/                 # 脚本文件
│   │   ├── background/          # 后台脚本
│   │   ├── content/             # 内容脚本
│   │   ├── inject/              # 注入脚本
│   │   ├── terminal.ts          # 终端工具
│   │   └── const.ts             # 常量定义
│   ├── views/                   # 视图文件
│   │   ├── devtools/            # DevTools 面板
│   │   ├── popup/               # 弹窗页面
│   │   └── options/             # 选项页面
│   └── i18n/                    # 国际化
├── docs/                        # 文档
├── icons/                       # 图标资源
└── package.json
```

## 开发规范

### 代码风格

#### TypeScript 规范

1. **类型定义**
   ```typescript
   // 使用接口定义对象类型
   interface User {
     id: string;
     name: string;
     email: string;
   }
   
   // 使用枚举定义常量
   enum Status {
     Active = 'active',
     Inactive = 'inactive'
   }
   ```

2. **函数定义**
   ```typescript
   // 使用箭头函数
   const handleClick = (event: MouseEvent): void => {
     console.log('Button clicked');
   };
   
   // 使用 async/await
   const fetchData = async (url: string): Promise<any> => {
     const response = await fetch(url);
     return response.json();
   };
   ```

3. **类定义**
   ```typescript
   export class MyClass {
     private readonly name: string;
     
     constructor(name: string) {
       this.name = name;
     }
     
     public getName(): string {
       return this.name;
     }
   }
   ```

#### 命名规范

1. **文件命名**
   - 使用 kebab-case: `my-component.vue`
   - TypeScript 文件使用 PascalCase: `MyClass.ts`

2. **变量命名**
   - 使用 camelCase: `userName`, `isActive`
   - 常量使用 UPPER_SNAKE_CASE: `MAX_RETRY_COUNT`

3. **函数命名**
   - 使用 camelCase: `getUserInfo()`, `handleClick()`
   - 布尔函数使用 is/has/can: `isValid()`, `hasPermission()`

### 通信规范

#### 消息定义

1. **消息类型**
   ```typescript
   export enum Msg {
     RequestSupport = "request-support",
     ResponseSupport = "response-support",
     // ... 其他消息类型
   }
   ```

2. **消息数据接口**
   ```typescript
   export interface RequestSupportData {
     // 请求数据定义
   }
   
   export interface ResponseSupportData {
     support: boolean;
     msg: string;
   }
   ```

3. **消息发送**
   ```typescript
   // 使用 PluginEvent 发送消息
   const event = new PluginEvent(Page.Devtools, Page.Background, Msg.RequestSupport, data);
   bridge.send(Msg.RequestSupport, data);
   ```

#### 错误处理

1. **异常捕获**
   ```typescript
   try {
     const result = await riskyOperation();
     return result;
   } catch (error) {
     console.error('Operation failed:', error);
     throw new Error('Operation failed');
   }
   ```

2. **错误消息**
   ```typescript
   const errorEvent = new PluginEvent(Page.Background, Page.Devtools, Msg.ResponseError, {
     message: 'Operation failed',
     code: 'E001'
   });
   ```

### 组件开发

#### Vue 组件规范

1. **组件结构**
   ```vue
   <template>
     <div class="my-component">
       <!-- 模板内容 -->
     </div>
   </template>
   
   <script lang="ts">
   import { defineComponent, ref, onMounted } from 'vue';
   
   export default defineComponent({
     name: 'MyComponent',
     setup() {
       const data = ref(null);
       
       onMounted(() => {
         // 初始化逻辑
       });
       
       return {
         data
       };
     }
   });
   </script>
   
   <style scoped>
   .my-component {
     /* 样式定义 */
   }
   </style>
   ```

2. **Props 定义**
   ```typescript
   interface Props {
     title: string;
     count?: number;
   }
   
   const props = withDefaults(defineProps<Props>(), {
     count: 0
   });
   ```

3. **事件定义**
   ```typescript
   const emit = defineEmits<{
     click: [event: MouseEvent];
     change: [value: string];
   }>();
   ```

## 开发流程

### 功能开发

1. **需求分析**
   - 明确功能需求
   - 设计数据流
   - 定义接口

2. **代码实现**
   - 创建类型定义
   - 实现核心逻辑
   - 添加错误处理

3. **测试验证**
   - 单元测试
   - 集成测试
   - 手动测试

4. **文档更新**
   - 更新 API 文档
   - 更新使用说明
   - 更新变更日志

### 调试流程

1. **本地调试**
   ```bash
   # 启动开发服务器
   npm run dev
   
   # 在 Chrome 中加载扩展
   # 打开 chrome://extensions/
   # 启用开发者模式
   # 点击"加载已解压的扩展程序"
   # 选择项目目录
   ```

2. **DevTools 调试**
   - 打开 Chrome DevTools
   - 切换到 "Sources" 标签
   - 在扩展目录中设置断点

3. **日志调试**
   ```typescript
   // 启用调试日志
   export const debugLog: boolean = true;
   
   // 使用终端工具
   const terminal = new Terminal('MyComponent');
   debugLog && console.log(...terminal.log('Debug message'));
   ```

### 发布流程

1. **代码审查**
   - 代码质量检查
   - 功能测试
   - 性能测试

2. **构建打包**
   ```bash
   npm run build
   ```

3. **版本管理**
   ```bash
   # 更新版本号
   npm version patch|minor|major
   
   # 创建发布标签
   git tag v1.0.0
   git push origin v1.0.0
   ```

## 最佳实践

### 性能优化

1. **消息优化**
   - 减少消息大小
   - 批量处理消息
   - 使用缓存机制

2. **内存管理**
   - 及时清理事件监听器
   - 避免内存泄漏
   - 使用弱引用

3. **异步处理**
   - 使用 async/await
   - 避免阻塞操作
   - 实现超时机制

### 安全考虑

1. **数据验证**
   ```typescript
   // 验证输入数据
   function validateInput(data: any): boolean {
     if (!data || typeof data !== 'object') {
       return false;
     }
     return true;
   }
   ```

2. **权限控制**
   ```typescript
   // 检查权限
   function checkPermission(permission: string): boolean {
     return chrome.permissions.contains({ permissions: [permission] });
   }
   ```

3. **错误边界**
   ```typescript
   // 全局错误处理
   window.addEventListener('error', (event) => {
     console.error('Global error:', event.error);
   });
   ```

### 代码复用

1. **工具函数**
   ```typescript
   // 创建可复用的工具函数
   export function debounce<T extends (...args: any[]) => any>(
     func: T,
     wait: number
   ): (...args: Parameters<T>) => void {
     let timeout: NodeJS.Timeout;
     return (...args: Parameters<T>) => {
       clearTimeout(timeout);
       timeout = setTimeout(() => func(...args), wait);
     };
   }
   ```

2. **组件复用**
   ```typescript
   // 创建可复用的组件
   export const MyComponent = defineComponent({
     name: 'MyComponent',
     props: {
       // 定义 props
     },
     emits: {
       // 定义事件
     },
     setup(props, { emit }) {
       // 组件逻辑
     }
   });
   ```

## 常见问题

### Q: 如何处理 Chrome 扩展的权限问题？

A: 使用 `chrome.permissions` API 检查和请求权限：

```typescript
// 检查权限
chrome.permissions.contains({
  permissions: ['activeTab']
}, (result) => {
  if (!result) {
    // 请求权限
    chrome.permissions.request({
      permissions: ['activeTab']
    });
  }
});
```

### Q: 如何调试注入脚本？

A: 在注入脚本中添加调试代码：

```typescript
// 在 inject/inspector.ts 中
console.log('Inject script loaded');
debugLog && console.log(...this.terminal.log('Debug message'));
```

### Q: 如何处理跨域问题？

A: 在 manifest.json 中配置权限：

```json
{
  "permissions": [
    "activeTab",
    "tabs"
  ],
  "host_permissions": [
    "<all_urls>"
  ]
}
```

## 资源链接

- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [Vue.js 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [CC-Inspector 参考](https://github.com/cc-inspector/cc-inspector)

## 总结

遵循本开发指南可以确保代码质量、提高开发效率，并为项目的长期维护奠定基础。如有疑问，请参考相关文档或联系项目维护者。 