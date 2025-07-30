// Chrome Extension Content Script
console.log("Hello World Extension Content Script Loaded");

// 向页面注入Hello World消息
function injectHelloWorld() {
  const div = document.createElement('div');
  div.id = 'hello-world-extension';
  div.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #2196f3;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  div.textContent = 'Hello World Extension Active!';
  
  document.body.appendChild(div);
  
  // 3秒后自动隐藏
  setTimeout(() => {
    if (div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }, 3000);
}

// 页面加载完成后执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectHelloWorld);
} else {
  injectHelloWorld();
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.type === "ping") {
    sendResponse({ response: "Content script is alive!" });
  }
  
  return true;
});

// 向background script发送hello消息
chrome.runtime.sendMessage({ type: "hello", from: "content" }, (response) => {
  console.log("Response from background:", response);
});

export {}; 