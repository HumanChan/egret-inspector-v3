import { bridge } from "./bridge";
import { Msg } from "../../core/types";

/**
 * 注册 DevTools 面板
 */
export function registerPanel() {
  // 创建面板
  chrome.devtools.panels.create(
    "Egret Inspector",
    "icons/48.png",
    "views/devtools/index.html",
    (panel) => {
      // Egret Inspector panel created
      
      // 面板显示时的处理
      panel.onShown.addListener((window) => {
        // Egret Inspector panel shown
        // 可以在这里发送初始化消息
        bridge.send(Msg.RequestSupport, {});
      });
      
      // 面板隐藏时的处理
      panel.onHidden.addListener(() => {
        // Egret Inspector panel hidden
      });
    }
  );
}

/**
 * 初始化 DevTools
 */
export function init() {
      // Initializing Egret Inspector DevTools
  
  // 注册面板
  registerPanel();
  
  // 监听消息
  bridge.on(Msg.ResponseSupport, (data) => {
          // Support response received
  });
  
  bridge.on(Msg.ResponseTreeInfo, (data) => {
          // Tree info response received
  });
  
  bridge.on(Msg.ResponseNodeInfo, (data) => {
          // Node info response received
  });
  
  bridge.on(Msg.ResponseError, (data) => {
    console.error("Error response received:", data);
  });
  
      // Egret Inspector DevTools initialized
}

// 自动初始化
if (chrome.devtools) {
  init();
} 