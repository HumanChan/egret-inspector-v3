/**
 * Chrome扩展后台脚本
 * 负责处理消息路由、连接状态管理和端口管理
 */

import { debugLog, Msg, Page, PluginEvent, ResponseSupportData } from "../../core/types";
import { portMgr } from "./portMgr";
import { Terminal } from "../terminal";

const terminal = new Terminal(Page.Background);

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
      const status = {
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
  
  // 获取标签页信息
  const tab = port.sender?.tab;
  if (!tab) {
    console.error("No tab information available for port:", port.name);
    return;
  }
  
  if (port.name === Page.Content) {
    // 内容脚本端口
    const portMan = portMgr.addPort(tab, port);
    if (portMan) {
      portMan.init();
    }
  } else if (port.name === Page.Devtools) {
    // DevTools端口
    const portMan = portMgr.addPort(tab, port);
    if (portMan) {
      portMan.init();
    }
  }
});

/**
 * 监听扩展图标点击事件
 */
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked on tab:", tab.id);
  
  if (tab.id) {
    console.log("Egret Inspector clicked on this tab");
  }
});

/**
 * 监听标签页更新
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log("Tab updated:", tabId);
  }
});

/**
 * 监听标签页关闭
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("Tab closed:", tabId);
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
    contentPorts: portMgr.portArray.filter(p => p.isContent()).length,
    devtoolsPorts: portMgr.portArray.filter(p => p.isDevtools()).length,
    totalTabs: portMgr.portArray.length
  };
}

/**
 * 清理所有连接
 */
function cleanupAllConnections(): void {
  console.log("Cleaning up all connections...");
  
  // 断开所有端口
  portMgr.portArray.forEach((port) => {
    try {
      if (port.port) {
        port.port.disconnect();
      }
    } catch (error) {
      console.error("Error disconnecting port:", error);
    }
  });
  
  // 清理端口数组
  portMgr.portArray = [];
  
  console.log("All connections cleaned up");
}

// 导出供外部使用
export {
  getConnectionStats,
  cleanupAllConnections
}; 