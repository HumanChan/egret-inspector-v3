/**
 * Chrome扩展内容脚本
 * 负责检测白鹭引擎、注入调试脚本、建立通信连接
 */

import { egretDetector, DetectionResult } from './egret-detector';
import { scriptInjector, InjectionStatus } from './script-injector';
import { communicationManager, Message } from '../shared/communication';

// 全局状态
let isInitialized = false;
let engineDetected = false;
let scriptsInjected = false;

/**
 * 初始化Egret Inspector
 */
async function initializeEgretInspector(): Promise<void> {
  if (isInitialized) {
    console.log('Egret Inspector already initialized');
    return;
  }

  console.log('Initializing Egret Inspector...');

  try {
    // 1. 建立通信连接
    await communicationManager.connect();
    console.log('Communication manager connected');

    // 2. 注入引擎检测脚本
    await injectEngineDetectorScript();
    console.log('Engine detector script injected');

    // 3. 等待注入脚本初始化完成
    await waitForInjectScriptReady();
    console.log('Inject script ready');

    // 4. 检测白鹭引擎
    const detectionResult = await detectEngine();
    if (detectionResult.isEgret) {
      engineDetected = true;
      console.log(`Egret engine detected: ${detectionResult.engineType} ${detectionResult.version}`);

      // 5. 注入调试脚本
      await injectDebugScripts();
      scriptsInjected = true;
      console.log('Debug scripts injected successfully');  

      // 6. 设置消息处理器
      setupMessageHandlers();

      // 7. 通知后台脚本引擎已检测到
      await notifyEngineDetected(detectionResult);

      isInitialized = true;
      console.log('Egret Inspector initialization completed');
    } else {
      console.log('No Egret engine detected on this page');
    }
  } catch (error) {
    console.error('Failed to initialize Egret Inspector:', error);
    await handleInitializationError(error);
  }
}

/**
 * 等待注入脚本初始化完成
 */
async function waitForInjectScriptReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Inject script initialization timeout'));
    }, 10000);

    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'egret-inspector-ready') {
        window.removeEventListener('message', messageHandler);
        clearTimeout(timeout);
        resolve();
      }
    };

    window.addEventListener('message', messageHandler);
  });
}

/**
 * 注入引擎检测脚本
 */
async function injectEngineDetectorScript(): Promise<void> {
  console.log('Injecting engine detector script...');

  try {
    // 使用外部脚本文件而不是内联脚本，避免CSP错误
    const scriptPath = 'inject.js';  // 修改为正确的构建后文件名
    await scriptInjector.injectScript(scriptPath);
    console.log('Engine detector script injected successfully');
  } catch (error) {
    console.error('Failed to inject engine detector script:', error);
    throw error;
  }
}

/**
 * 检测引擎
 */
async function detectEngine(): Promise<DetectionResult> {
  console.log('Detecting Egret engine...');
  
  try {
    // 等待引擎加载
    const engineLoaded = await egretDetector.waitForEngine();
    if (!engineLoaded) {
      throw new Error('Engine not loaded within timeout');
    }

    // 执行详细检测
    const result = await egretDetector.detectEngine();
    console.log('Engine detection result:', result);
    
    return result;
  } catch (error) {
    console.error('Engine detection failed:', error);
    throw error;
  }
}

/**
 * 注入调试脚本
 */
async function injectDebugScripts(): Promise<void> {
  console.log('Injecting debug scripts...');

  try {
    // 注入核心调试脚本
    const debugScripts = [
      'inject.js'  // 修改为正确的构建后文件名
    ];

    await scriptInjector.injectScripts(debugScripts);
    console.log('Debug scripts injected successfully');
  } catch (error) {
    console.error('Failed to inject debug scripts:', error);
    throw error;
  }
}

/**
 * 设置消息处理器
 */
function setupMessageHandlers(): void {
  // 处理检测消息
  communicationManager.onMessage('detect', async (message: Message) => {
    try {
      const result = await detectEngine();
      await communicationManager.sendResponseMessage(message.id, result, 'content');
    } catch (error) {
      await communicationManager.sendErrorMessage(error as Error, 'content');
    }
  });

  // 处理注入消息
  communicationManager.onMessage('inject', async (message: Message) => {
    try {
      const status = scriptInjector.getInjectionStatus();
      await communicationManager.sendResponseMessage(message.id, status, 'content');
    } catch (error) {
      await communicationManager.sendErrorMessage(error as Error, 'content');
    }
  });

  // 处理调试消息
  communicationManager.onMessage('debug', async (message: Message) => {
    try {
      if (message.data?.action === 'getEngineInfo') {
        // 处理获取引擎信息的请求
        const engineInfo = {
          type: engineDetected ? 'egret' : null,
          version: engineDetected ? await egretDetector.getEngineVersion() : 'unknown',
          features: engineDetected ? await egretDetector.getEngineFeatures() : [],
          timestamp: Date.now()
        };
        
        await communicationManager.sendResponseMessage(message.id, {
          engineInfo,
          detected: engineDetected
        }, 'content');
      } else {
        // 转发给注入脚本
        window.postMessage({
          type: 'egret-inspector-debug',
          data: message.data,
          id: message.id
        }, '*');
      }
    } catch (error) {
      await communicationManager.sendErrorMessage(error as Error, 'content');
    }
  });

  // 处理来自注入脚本的响应
  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'egret-inspector-response') {
      try {
        await communicationManager.sendResponseMessage(
          event.data.id,
          event.data.data,
          'content'
        );
      } catch (error) {
        console.error('Failed to forward response:', error);
      }
    }
  });
}

/**
 * 通知后台脚本引擎已检测到
 */
async function notifyEngineDetected(detectionResult: DetectionResult): Promise<void> {
  try {
    await communicationManager.sendDetectionMessage({
      detected: true,
      engineType: detectionResult.engineType,
      version: detectionResult.version,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to notify engine detection:', error);
  }
}

/**
 * 处理初始化错误
 */
async function handleInitializationError(error: any): Promise<void> {
  console.error('Initialization error:', error);

  try {
    await communicationManager.sendErrorMessage(error as Error, 'content');
  } catch (sendError) {
    console.error('Failed to send error message:', sendError);
  }
}

/**
 * 获取当前状态
 */
function getCurrentStatus(): {
  initialized: boolean;
  engineDetected: boolean;
  scriptsInjected: boolean;
  connected: boolean;
} {
  return {
    initialized: isInitialized,
    engineDetected,
    scriptsInjected,
    connected: communicationManager.isConnected()
  };
}

/**
 * 清理资源
 */
function cleanup(): void {
  console.log('Cleaning up Egret Inspector...');

  try {
    // 清理脚本注入器
    scriptInjector.cleanup();

    // 断开通信连接
    communicationManager.disconnect();

    // 清理引擎检测器
    egretDetector.destroy();

    // 重置状态
    isInitialized = false;
    engineDetected = false;
    scriptsInjected = false;

    console.log('Egret Inspector cleanup completed');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

/**
 * 监听来自background script的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);

  if (message.type === "ping") {
    sendResponse({
      response: "Content script is alive!",
      status: getCurrentStatus()
    });
  }

  if (message.type === "getStatus") {
    sendResponse(getCurrentStatus());
  }

  if (message.type === "cleanup") {
    cleanup();
    sendResponse({ success: true });
  }

  return true;
});

/**
 * 向background script发送hello消息
 */
chrome.runtime.sendMessage({
  type: "hello",
  from: "content",
  status: getCurrentStatus()
}, (response) => {
  console.log("Response from background:", response);
});

/**
 * 页面加载完成后初始化
 */
function onPageLoaded(): void {
  console.log('Page loaded, starting Egret Inspector initialization...');

  // 延迟初始化，确保页面完全加载
  setTimeout(() => {
    initializeEgretInspector().catch(error => {
      console.error('Failed to initialize Egret Inspector:', error);
    });
  }, 2000);
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
  initializeEgretInspector,
  getCurrentStatus,
  cleanup,
  egretDetector,
  scriptInjector,
  communicationManager
}; 