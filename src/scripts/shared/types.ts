/**
 * 共享类型定义
 * 定义整个项目中使用的通用类型接口
 */

// 消息相关类型
export interface Message {
  id: string;
  type: 'detect' | 'inject' | 'debug' | 'response' | 'error';
  data: any;
  timestamp: number;
  source: 'content' | 'background' | 'inject' | 'devtools';
  target?: 'content' | 'background' | 'inject' | 'devtools';
}

export type MessageHandler = (message: Message) => void | Promise<void>;

// 检测相关类型
export interface DetectionResult {
  isEgret: boolean;
  version: string;
  engineType: 'egret' | 'lark' | null;
  timestamp: number;
}

export interface EngineInfo {
  type: 'egret' | 'lark';
  version: string;
  features: string[];
}

// 注入相关类型
export interface InjectionStatus {
  injected: boolean;
  scripts: string[];
  errors: string[];
  timestamp: number;
}

export interface InjectionResult {
  success: boolean;
  scriptPath: string;
  error?: string;
  timestamp: number;
}

// 显示对象相关类型
export interface DisplayNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  children: DisplayNode[];
  properties: Property[];
  hashCode: number;
  parentHash?: number;
  memberName?: string;
  selected?: boolean;
  expandable?: boolean;
}

export interface Property {
  name: string;
  value: any;
  type: string;
  isGetter: boolean;
  isSetter: boolean;
  isPrivate: boolean;
  expandable?: boolean;
}

// 调试相关类型
export interface DebugRequest {
  type: 'getDisplayTree' | 'getNodeProperties' | 'selectNode' | 'getFPS' | 'getPerformance';
  nodeId?: string;
  options?: DebugOptions;
}

export interface DebugResponse {
  success: boolean;
  data: any;
  error?: string;
  timestamp: number;
}

export interface DebugOptions {
  showPrivate?: boolean;
  showMethods?: boolean;
  depth?: number;
  includeChildren?: boolean;
}

// 性能监控相关类型
export interface PerformanceData {
  fps: number;
  memory: {
    used: number;
    total: number;
  };
  cpu: {
    usage: number;
  };
  timestamp: number;
}

export interface FPSData {
  current: number;
  average: number;
  min: number;
  max: number;
  samples: number[];
  timestamp: number;
}

// 连接状态相关类型
export interface ConnectionStatus {
  connected: boolean;
  lastConnected: number;
  reconnectAttempts: number;
  errors: string[];
}

// 错误相关类型
export interface ErrorInfo {
  message: string;
  stack?: string;
  code?: string;
  timestamp: number;
  source: 'content' | 'background' | 'inject' | 'devtools';
}

export interface ErrorResult {
  success: false;
  error: ErrorInfo;
}

// 配置相关类型
export interface InspectorConfig {
  detection: {
    maxRetries: number;
    timeout: number;
    retryDelay: number;
  };
  injection: {
    maxRetries: number;
    timeout: number;
    retryDelay: number;
  };
  communication: {
    maxReconnectAttempts: number;
    reconnectDelay: number;
    messageTimeout: number;
  };
  debug: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

// 事件相关类型
export interface InspectorEvent {
  type: string;
  data: any;
  timestamp: number;
  source: string;
}

export type EventHandler = (event: InspectorEvent) => void;

// 状态相关类型
export interface InspectorState {
  connected: boolean;
  engineDetected: boolean;
  scriptsInjected: boolean;
  debugEnabled: boolean;
  lastUpdate: number;
}

// 工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 常量定义
export const MESSAGE_TYPES = {
  DETECT: 'detect',
  INJECT: 'inject',
  DEBUG: 'debug',
  RESPONSE: 'response',
  ERROR: 'error'
} as const;

export const SOURCES = {
  CONTENT: 'content',
  BACKGROUND: 'background',
  INJECT: 'inject',
  DEVTOOLS: 'devtools'
} as const;

export const ENGINE_TYPES = {
  EGRET: 'egret',
  LARK: 'lark'
} as const;

export const DEBUG_REQUEST_TYPES = {
  GET_DISPLAY_TREE: 'getDisplayTree',
  GET_NODE_PROPERTIES: 'getNodeProperties',
  SELECT_NODE: 'selectNode',
  GET_FPS: 'getFPS',
  GET_PERFORMANCE: 'getPerformance'
} as const;

// 默认配置
export const DEFAULT_CONFIG: InspectorConfig = {
  detection: {
    maxRetries: 10,
    timeout: 30000,
    retryDelay: 1000
  },
  injection: {
    maxRetries: 3,
    timeout: 10000,
    retryDelay: 1000
  },
  communication: {
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    messageTimeout: 10000
  },
  debug: {
    enabled: true,
    logLevel: 'info'
  }
}; 