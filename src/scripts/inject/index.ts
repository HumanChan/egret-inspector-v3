/**
 * 注入脚本入口
 * 负责引擎检测、初始化调试脚本核心、建立通信连接
 */

import { egretInspector } from './egret-inspector';
import { DebugRequest, DebugResponse } from '../shared/types';

// 全局类型声明
declare global {
  interface Window {
    egret?: any;
    lark?: any;
  }
}

// 全局状态
let isInitialized = false;
let isConnected = false;

/**
 * 初始化注入脚本
 */
async function initializeInjectScript(): Promise<void> {
  if (isInitialized) {
    console.log('Inject script already initialized');
    return;
  }

  console.log('Initializing inject script...');

  try {
    // 1. 设置引擎检测消息监听器
    setupEngineDetectionListeners();

    // 2. 连接到Egret引擎
    await egretInspector.connect();
    isConnected = true;
    console.log('Connected to Egret engine');

    // 3. 设置调试消息监听器
    setupDebugMessageListeners();

    // 4. 通知内容脚本初始化完成
    notifyInitializationComplete();

    isInitialized = true;
    console.log('Inject script initialization completed');
  } catch (error) {
    console.error('Failed to initialize inject script:', error);
    await handleInitializationError(error);
  }
}

/**
 * 设置引擎检测消息监听器
 */
function setupEngineDetectionListeners(): void {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
      switch (event.data.type) {
        case 'EGRET_ENGINE_DETECTION_REQUEST':
          handleEgretDetectionRequest(event.data);
          break;
        case 'LARK_ENGINE_DETECTION_REQUEST':
          handleLarkDetectionRequest(event.data);
          break;
        case 'ENGINE_INFO_REQUEST':
          handleEngineInfoRequest(event.data);
          break;
        case 'EGRET_INFO_REQUEST':
          handleEgretInfoRequest(event.data);
          break;
        case 'LARK_INFO_REQUEST':
          handleLarkInfoRequest(event.data);
          break;
      }
    }
  });
}

/**
 * 设置调试消息监听器
 */
function setupDebugMessageListeners(): void {
  // 监听来自内容脚本的调试消息
  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'egret-inspector-debug') {
      try {
        await handleDebugRequest(event.data);
      } catch (error) {
        console.error('Failed to handle debug request:', error);
        await sendErrorResponse(event.data.id, error as Error);
      }
    }
  });

  // 监听来自DevTools的消息
  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'egret-inspector-devtools') {
      try {
        await handleDevtoolsRequest(event.data);
      } catch (error) {
        console.error('Failed to handle devtools request:', error);
        await sendErrorResponse(event.data.id, error as Error);
      }
    }
  });
}

/**
 * 检测Egret引擎
 */
function detectEgretEngine(): boolean {
  try {
    // 检查全局egret对象
    if (typeof window !== 'undefined' && window.egret) {
      // 检查核心API
      if (window.egret.Sprite || window.egret.getQualifiedClassName) {
        return true;
      }
    }
  } catch (error) {
    console.warn('Egret engine detection error:', error);
  }
  return false;
}

/**
 * 检测Lark引擎
 */
function detectLarkEngine(): boolean {
  try {
    // 检查全局lark对象
    if (typeof window !== 'undefined' && window.lark) {
      // 检查Lark引擎特征
      if (window.lark.Types || window.lark.__classFlag__) {
        return true;
      }
    }
  } catch (error) {
    console.warn('Lark engine detection error:', error);
  }
  return false;
}

/**
 * 获取Egret引擎信息
 */
function getEgretEngineInfo(): any {
  const version = getEgretVersion();
  const features = getEgretFeatures();

  return {
    type: 'egret',
    version,
    features
  };
}

/**
 * 获取Lark引擎信息
 */
function getLarkEngineInfo(): any {
  const version = getLarkVersion();
  const features = getLarkFeatures();

  return {
    type: 'lark',
    version,
    features
  };
}

/**
 * 获取Egret版本
 */
function getEgretVersion(): string {
  try {
    if (window.egret) {
      // 尝试获取版本信息
      if (window.egret.Capabilities && window.egret.Capabilities.engineVersion) {
        return window.egret.Capabilities.engineVersion;
      }
      if (window.egret.VERSION) {
        return window.egret.VERSION;
      }
    }
  } catch (error) {
    console.warn('Egret version detection error:', error);
  }
  return 'unknown';
}

/**
 * 获取Lark版本
 */
function getLarkVersion(): string {
  try {
    if (window.lark) {
      // Lark引擎版本检测
      if (window.lark.VERSION) {
        return window.lark.VERSION;
      }
    }
  } catch (error) {
    console.warn('Lark version detection error:', error);
  }
  return 'unknown';
}

/**
 * 获取Egret引擎特性
 */
function getEgretFeatures(): string[] {
  const features: string[] = [];
  
  try {
    if (window.egret) {
      if (window.egret.Sprite) features.push('Sprite');
      if (window.egret.getQualifiedClassName) features.push('getQualifiedClassName');
      if (window.egret.MainContext) features.push('MainContext');
      if (window.egret.Stage) features.push('Stage');
      if (window.egret.Capabilities) features.push('Capabilities');
    }
  } catch (error) {
    console.warn('Egret features detection error:', error);
  }

  return features;
}

/**
 * 获取Lark引擎特性
 */
function getLarkFeatures(): string[] {
  const features: string[] = [];
  
  try {
    if (window.lark) {
      if (window.lark.Types) features.push('Types');
      if (window.lark.__classFlag__) features.push('__classFlag__');
    }
  } catch (error) {
    console.warn('Lark features detection error:', error);
  }

  return features;
}

/**
 * 获取引擎信息
 */
function getEngineInfo(): any {
  try {
    // 检测Egret引擎
    if (detectEgretEngine()) {
      return getEgretEngineInfo();
    }

    // 检测Lark引擎
    if (detectLarkEngine()) {
      return getLarkEngineInfo();
    }
  } catch (error) {
    console.warn('Engine info detection error:', error);
  }

  return null;
}

/**
 * 处理Egret引擎检测请求
 */
function handleEgretDetectionRequest(data: any): void {
  const hasEgret = detectEgretEngine();
  
  window.postMessage({
    type: 'EGRET_ENGINE_DETECTION_RESPONSE',
    messageId: data.messageId,
    hasEgret
  }, '*');
}

/**
 * 处理Lark引擎检测请求
 */
function handleLarkDetectionRequest(data: any): void {
  const hasLark = detectLarkEngine();
  
  window.postMessage({
    type: 'LARK_ENGINE_DETECTION_RESPONSE',
    messageId: data.messageId,
    hasLark
  }, '*');
}

/**
 * 处理引擎信息请求
 */
function handleEngineInfoRequest(data: any): void {
  const engineInfo = getEngineInfo();
  
  window.postMessage({
    type: 'ENGINE_INFO_RESPONSE',
    messageId: data.messageId,
    engineInfo
  }, '*');
}

/**
 * 处理Egret信息请求
 */
function handleEgretInfoRequest(data: any): void {
  const engineInfo = getEgretEngineInfo();
  
  window.postMessage({
    type: 'EGRET_INFO_RESPONSE',
    messageId: data.messageId,
    engineInfo
  }, '*');
}

/**
 * 处理Lark信息请求
 */
function handleLarkInfoRequest(data: any): void {
  const engineInfo = getLarkEngineInfo();
  
  window.postMessage({
    type: 'LARK_INFO_RESPONSE',
    messageId: data.messageId,
    engineInfo
  }, '*');
}

/**
 * 处理调试请求
 */
async function handleDebugRequest(data: any): Promise<void> {
  const request: DebugRequest = data.data;
  const requestId = data.id;

  console.log('Handling debug request:', request);

  try {
    const response = await egretInspector.handleDebugRequest(request);
    await sendResponse(requestId, response);
  } catch (error) {
    console.error('Debug request failed:', error);
    await sendErrorResponse(requestId, error as Error);
  }
}

/**
 * 处理DevTools请求
 */
async function handleDevtoolsRequest(data: any): Promise<void> {
  const request: DebugRequest = data.data;
  const requestId = data.id;

  console.log('Handling devtools request:', request);

  try {
    const response = await egretInspector.handleDebugRequest(request);
    await sendResponse(requestId, response);
  } catch (error) {
    console.error('DevTools request failed:', error);
    await sendErrorResponse(requestId, error as Error);
  }
}

/**
 * 发送响应
 */
async function sendResponse(requestId: string, response: DebugResponse): Promise<void> {
  const message = {
    type: 'egret-inspector-response',
    id: requestId,
    data: response
  };

  window.postMessage(message, '*');
  console.log('Response sent:', response);
}

/**
 * 发送错误响应
 */
async function sendErrorResponse(requestId: string, error: Error): Promise<void> {
  const errorResponse: DebugResponse = {
    success: false,
    data: null,
    error: error.message,
    timestamp: Date.now()
  };

  await sendResponse(requestId, errorResponse);
}

/**
 * 通知初始化完成
 */
function notifyInitializationComplete(): void {
  const message = {
    type: 'egret-inspector-ready',
    data: {
      connected: isConnected,
      timestamp: Date.now()
    }
  };

  window.postMessage(message, '*');
  console.log('Initialization complete notification sent');
}

/**
 * 处理初始化错误
 */
async function handleInitializationError(error: any): Promise<void> {
  console.error('Initialization error:', error);
  
  const errorMessage = {
    type: 'egret-inspector-error',
    data: {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now()
    }
  };

  window.postMessage(errorMessage, '*');
}

/**
 * 获取当前状态
 */
function getCurrentStatus(): {
  initialized: boolean;
  connected: boolean;
  engineType: string | null;
} {
  return {
    initialized: isInitialized,
    connected: isConnected,
    engineType: egretInspector.isConnected() ? 'egret' : null
  };
}

/**
 * 清理资源
 */
function cleanup(): void {
  console.log('Cleaning up inject script...');
  
  try {
    // 断开与引擎的连接
    egretInspector.disconnect();
    
    // 重置状态
    isInitialized = false;
    isConnected = false;
    
    console.log('Inject script cleanup completed');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

/**
 * 页面加载完成后初始化
 */
function onPageLoaded(): void {
  console.log('Page loaded, starting inject script initialization...');
  
  // 延迟初始化，确保引擎完全加载
  setTimeout(() => {
    initializeInjectScript().catch(error => {
      console.error('Failed to initialize inject script:', error);
    });
  }, 1000);
}

/**
 * 页面卸载时清理
 */
function onPageUnload(): void {
  cleanup();
}

// 页面加载事件处理
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onPageLoaded);
} else {
  onPageLoaded();
}

// 页面卸载事件处理
window.addEventListener('beforeunload', onPageUnload);

// 导出供外部使用
export {
  initializeInjectScript,
  getCurrentStatus,
  cleanup,
  egretInspector
}; 