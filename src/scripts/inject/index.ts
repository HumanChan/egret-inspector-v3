// Inject script for Chrome extension
console.log("[Hello World Extension] Inject script loaded");

// 基本的注入功能
export function init() {
  console.log("[Hello World Extension] Inject script initialized");
  
  // 这里可以添加页面注入逻辑
  // 例如：注入调试工具、监听页面事件等
  
  // 示例：监听页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onPageLoaded);
  } else {
    onPageLoaded();
  }
}

function onPageLoaded() {
  console.log("[Hello World Extension] Page loaded, inject script ready");
  
  // 可以在这里添加页面特定的注入逻辑
  // 例如：注入调试面板、添加事件监听器等
}

// 自动初始化
init(); 