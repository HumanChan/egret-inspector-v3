export enum DocumentEvent {
  /**
   * 从inject到content的事件
   */
  Inject2Content = "inject2content",
  /**
   * 从content到inject的事件
   */
  Content2Inject = "content2inject",
}

/**
 * Egret 引擎相关常量
 */
export const EGRET_CONSTANTS = {
  /**
   * Egret 引擎检测间隔时间（毫秒）
   */
  DETECTION_INTERVAL: 30,
  
  /**
   * Egret 引擎检测超时时间（毫秒）
   */
  DETECTION_TIMEOUT: 10000,
  
  /**
   * Egret 引擎检测重试次数
   */
  DETECTION_MAX_RETRIES: 10,
  
  /**
   * Egret 引擎检测重试延迟（毫秒）
   */
  DETECTION_RETRY_DELAY: 1000,
} as const;

/**
 * 调试相关常量
 */
export const DEBUG_CONSTANTS = {
  /**
   * 是否启用调试日志
   */
  ENABLE_DEBUG_LOG: false,
  
  /**
   * 调试日志级别
   */
  LOG_LEVEL: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  },
  
  /**
   * 默认调试日志级别
   */
  DEFAULT_LOG_LEVEL: 1,
} as const;

/**
 * 通信相关常量
 */
export const COMMUNICATION_CONSTANTS = {
  /**
   * 消息超时时间（毫秒）
   */
  MESSAGE_TIMEOUT: 10000,
  
  /**
   * 重连最大尝试次数
   */
  MAX_RECONNECT_ATTEMPTS: 5,
  
  /**
   * 重连延迟时间（毫秒）
   */
  RECONNECT_DELAY: 1000,
  
  /**
   * 端口连接超时时间（毫秒）
   */
  PORT_CONNECTION_TIMEOUT: 5000,
} as const; 