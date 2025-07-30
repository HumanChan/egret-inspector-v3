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
      console.log("Egret Inspector panel created");
      
      // 面板显示时的处理
      panel.onShown.addListener((window) => {
        console.log("Egret Inspector panel shown");
        // 可以在这里发送初始化消息
        bridge.send(Msg.RequestSupport, {});
      });
      
      // 面板隐藏时的处理
      panel.onHidden.addListener(() => {
        console.log("Egret Inspector panel hidden");
      });
    }
  );
}

/**
 * 初始化 DevTools
 */
export function init() {
  console.log("Initializing Egret Inspector DevTools...");
  
  // 注册面板
  registerPanel();
  
  // 监听消息
  bridge.on(Msg.ResponseSupport, (data) => {
    console.log("Support response received:", data);
  });
  
  bridge.on(Msg.ResponseTreeInfo, (data) => {
    console.log("Tree info response received:", data);
  });
  
  bridge.on(Msg.ResponseNodeInfo, (data) => {
    console.log("Node info response received:", data);
  });
  
  bridge.on(Msg.ResponseError, (data) => {
    console.error("Error response received:", data);
  });
  
  console.log("Egret Inspector DevTools initialized");
}

// 自动初始化
if (chrome.devtools) {
  init();
} 