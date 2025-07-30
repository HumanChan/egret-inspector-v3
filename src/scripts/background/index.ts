/**
 * Chrome扩展后台脚本
 * 负责处理消息路由、连接状态管理和端口管理
 */

import { Message, communicationManager } from '../shared/communication';

// 全局状态
let contentPorts = new Map<number, chrome.runtime.Port>();
let devtoolsPorts = new Map<number, chrome.runtime.Port>();
let tabStates = new Map<number, {
  engineDetected: boolean;
  scriptsInjected: boolean;
  lastUpdate: number;
}>();

/**
 * 监听扩展安装事件
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Egret Inspector Extension installed:", details.reason);
  
  if (details.reason === "install") {
    console.log("First time installation - Egret Inspector");
    // 可以在这里添加首次安装的初始化逻辑
  }
});

/**
 * 监听来自content script的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message);
  
  if (message.type === "hello") {
    sendResponse({ 
      response: "Hello from background script!",
      timestamp: Date.now()
    });
  }
  
  if (message.type === "getStatus") {
    const tabId = sender.tab?.id;
    if (tabId) {
      const status = tabStates.get(tabId) || {
        engineDetected: false,
        scriptsInjected: false,
        lastUpdate: Date.now()
      };
      sendResponse(status);
    } else {
      sendResponse({ error: "No tab ID" });
    }
  }
  
  if (message.type === "updateStatus") {
    const tabId = sender.tab?.id;
    if (tabId && message.status) {
      tabStates.set(tabId, {
        ...message.status,
        lastUpdate: Date.now()
      });
      sendResponse({ success: true });
    } else {
      sendResponse({ error: "Invalid status update" });
    }
  }
  
  return true; // 保持消息通道开放
});

/**
 * 监听端口连接
 */
chrome.runtime.onConnect.addListener((port) => {
  console.log("Port connected:", port.name);
  
  const portId = Date.now() + Math.random();
  
  if (port.name === 'egret-inspector') {
    // 内容脚本端口
    contentPorts.set(portId, port);
    setupContentPort(port, portId);
  } else if (port.name === 'egret-inspector-devtools') {
    // DevTools端口
    devtoolsPorts.set(portId, port);
    setupDevtoolsPort(port, portId);
  }
});

/**
 * 设置内容脚本端口
 */
function setupContentPort(port: chrome.runtime.Port, portId: number): void {
  port.onMessage.addListener((message: Message) => {
    console.log("Content port message:", message);
    
    try {
      handleContentMessage(message, port);
    } catch (error) {
      console.error("Error handling content message:", error);
      sendErrorMessage(port, error as Error);
    }
  });
  
  port.onDisconnect.addListener(() => {
    console.log("Content port disconnected:", portId);
    contentPorts.delete(portId);
    cleanupTabState(portId);
  });
}

/**
 * 设置DevTools端口
 */
function setupDevtoolsPort(port: chrome.runtime.Port, portId: number): void {
  port.onMessage.addListener((message: Message) => {
    console.log("DevTools port message:", message);
    
    try {
      handleDevtoolsMessage(message, port);
    } catch (error) {
      console.error("Error handling devtools message:", error);
      sendErrorMessage(port, error as Error);
    }
  });
  
  port.onDisconnect.addListener(() => {
    console.log("DevTools port disconnected:", portId);
    devtoolsPorts.delete(portId);
  });
}

/**
 * 处理内容脚本消息
 */
function handleContentMessage(message: Message, port: chrome.runtime.Port): void {
  switch (message.type) {
    case 'detect':
      handleDetectionMessage(message, port);
      break;
      
    case 'inject':
      handleInjectionMessage(message, port);
      break;
      
    case 'debug':
      handleDebugMessage(message, port);
      break;
      
    case 'response':
      handleResponseMessage(message, port);
      break;
      
    case 'error':
      handleErrorMessage(message, port);
      break;
      
    default:
      console.warn("Unknown message type:", message.type);
  }
}

/**
 * 处理DevTools消息
 */
function handleDevtoolsMessage(message: Message, port: chrome.runtime.Port): void {
  switch (message.type) {
    case 'debug':
      // 转发给内容脚本
      forwardToContentScript(message);
      break;
      
    case 'response':
      // 转发给DevTools
      forwardToDevtools(message);
      break;
      
    default:
      console.warn("Unknown devtools message type:", message.type);
  }
}

/**
 * 处理检测消息
 */
function handleDetectionMessage(message: Message, port: chrome.runtime.Port): void {
  console.log("Handling detection message:", message.data);
  
  // 更新标签页状态
  const tabId = getTabIdFromPort(port);
  if (tabId) {
    const currentState = tabStates.get(tabId) || {
      engineDetected: false,
      scriptsInjected: false,
      lastUpdate: Date.now()
    };
    
    tabStates.set(tabId, {
      ...currentState,
      engineDetected: message.data?.detected || false,
      lastUpdate: Date.now()
    });
  }
  
  // 发送响应消息给内容脚本
  const responseMessage: Message = {
    id: message.id,
    type: 'response',
    data: { success: true, received: true },
    timestamp: Date.now(),
    source: 'background',
    target: 'content'
  };
  
  try {
    port.postMessage(responseMessage);
    console.log("Detection response sent to content script");
  } catch (error) {
    console.error("Failed to send detection response:", error);
  }
  
  // 转发给DevTools
  forwardToDevtools(message);
}

/**
 * 处理注入消息
 */
function handleInjectionMessage(message: Message, port: chrome.runtime.Port): void {
  console.log("Handling injection message:", message.data);
  
  // 更新标签页状态
  const tabId = getTabIdFromPort(port);
  if (tabId) {
    const currentState = tabStates.get(tabId) || {
      engineDetected: false,
      scriptsInjected: false,
      lastUpdate: Date.now()
    };
    
    tabStates.set(tabId, {
      ...currentState,
      scriptsInjected: message.data?.injected || false,
      lastUpdate: Date.now()
    });
  }
  
  // 发送响应消息给内容脚本
  const responseMessage: Message = {
    id: message.id,
    type: 'response',
    data: { success: true, received: true },
    timestamp: Date.now(),
    source: 'background',
    target: 'content'
  };
  
  try {
    port.postMessage(responseMessage);
    console.log("Injection response sent to content script");
  } catch (error) {
    console.error("Failed to send injection response:", error);
  }
  
  // 转发给DevTools
  forwardToDevtools(message);
}

/**
 * 处理调试消息
 */
function handleDebugMessage(message: Message, port: chrome.runtime.Port): void {
  console.log("Handling debug message:", message.data);
  
  if (message.source === 'devtools' && message.data?.action === 'getEngineInfo') {
    // 转发给内容脚本获取引擎信息
    forwardToContentScript(message);
  } else {
    // 转发给DevTools
    forwardToDevtools(message);
  }
}

/**
 * 处理响应消息
 */
function handleResponseMessage(message: Message, port: chrome.runtime.Port): void {
  console.log("Handling response message:", message.data);
  
  // 转发给DevTools
  forwardToDevtools(message);
}

/**
 * 处理错误消息
 */
function handleErrorMessage(message: Message, port: chrome.runtime.Port): void {
  console.error("Handling error message:", message.data);
  
  // 转发给DevTools
  forwardToDevtools(message);
}

/**
 * 转发给内容脚本
 */
function forwardToContentScript(message: Message): void {
  contentPorts.forEach((port) => {
    try {
      port.postMessage(message);
    } catch (error) {
      console.error("Failed to forward message to content script:", error);
    }
  });
}

/**
 * 转发给DevTools
 */
function forwardToDevtools(message: Message): void {
  devtoolsPorts.forEach((port) => {
    try {
      port.postMessage(message);
    } catch (error) {
      console.error("Failed to forward message to devtools:", error);
    }
  });
}

/**
 * 发送错误消息
 */
function sendErrorMessage(port: chrome.runtime.Port, error: Error): void {
  const errorMessage: Message = {
    id: Date.now().toString(),
    type: 'error',
    data: {
      message: error.message,
      stack: error.stack
    },
    timestamp: Date.now(),
    source: 'background'
  };
  
  try {
    port.postMessage(errorMessage);
  } catch (sendError) {
    console.error("Failed to send error message:", sendError);
  }
}

/**
 * 从端口获取标签页ID
 */
function getTabIdFromPort(port: chrome.runtime.Port): number | null {
  // 这里需要根据实际的端口实现来获取标签页ID
  // 暂时返回null，实际实现时需要根据端口信息获取
  return null;
}

/**
 * 清理标签页状态
 */
function cleanupTabState(portId: number): void {
  // 根据端口ID清理对应的标签页状态
  // 这里需要实现端口ID到标签页ID的映射
  console.log("Cleaning up tab state for port:", portId);
}

/**
 * 获取所有标签页状态
 */
function getAllTabStates(): Map<number, any> {
  return new Map(tabStates);
}

/**
 * 获取特定标签页状态
 */
function getTabState(tabId: number): any {
  return tabStates.get(tabId);
}

/**
 * 更新标签页状态
 */
function updateTabState(tabId: number, state: any): void {
  tabStates.set(tabId, {
    ...state,
    lastUpdate: Date.now()
  });
}

/**
 * 监听扩展图标点击事件
 */
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked on tab:", tab.id);
  
  if (tab.id) {
    const state = getTabState(tab.id);
    if (state?.engineDetected) {
      // 如果检测到引擎，可以执行特定操作
      console.log("Egret engine detected on this tab");
    } else {
      console.log("No Egret engine detected on this tab");
    }
  }
});

/**
 * 监听标签页更新
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log("Tab updated:", tabId);
    
    // 清理旧的状态
    if (tabStates.has(tabId)) {
      const state = tabStates.get(tabId);
      if (state && Date.now() - state.lastUpdate > 300000) { // 5分钟超时
        tabStates.delete(tabId);
        console.log("Cleaned up stale tab state:", tabId);
      }
    }
  }
});

/**
 * 监听标签页关闭
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("Tab closed:", tabId);
  
  // 清理标签页状态
  if (tabStates.has(tabId)) {
    tabStates.delete(tabId);
    console.log("Cleaned up tab state for closed tab:", tabId);
  }
});

/**
 * 获取连接统计信息
 */
function getConnectionStats(): {
  contentPorts: number;
  devtoolsPorts: number;
  totalTabs: number;
} {
  return {
    contentPorts: contentPorts.size,
    devtoolsPorts: devtoolsPorts.size,
    totalTabs: tabStates.size
  };
}

/**
 * 清理所有连接
 */
function cleanupAllConnections(): void {
  console.log("Cleaning up all connections...");
  
  // 断开所有内容脚本端口
  contentPorts.forEach((port) => {
    try {
      port.disconnect();
    } catch (error) {
      console.error("Error disconnecting content port:", error);
    }
  });
  contentPorts.clear();
  
  // 断开所有DevTools端口
  devtoolsPorts.forEach((port) => {
    try {
      port.disconnect();
    } catch (error) {
      console.error("Error disconnecting devtools port:", error);
    }
  });
  devtoolsPorts.clear();
  
  // 清理所有标签页状态
  tabStates.clear();
  
  console.log("All connections cleaned up");
}

// 导出供外部使用
export {
  getAllTabStates,
  getTabState,
  updateTabState,
  getConnectionStats,
  cleanupAllConnections
}; 