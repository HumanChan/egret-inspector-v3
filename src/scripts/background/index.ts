// Chrome Extension Background Script
console.log("Hello World Extension Background Script Loaded");

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details.reason);
  
  if (details.reason === "install") {
    // 首次安装时的初始化
    console.log("First time installation");
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  
  if (message.type === "hello") {
    sendResponse({ response: "Hello from background script!" });
  }
  
  return true; // 保持消息通道开放
});

// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked on tab:", tab.id);
  
  // 可以在这里添加打开弹窗或执行其他操作的逻辑
  chrome.action.setPopup({ tabId: tab.id, popup: "popup.html" });
});

export {}; 