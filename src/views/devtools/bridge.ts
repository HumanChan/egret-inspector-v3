// DevTools通信桥接
export const bridge = {
  send: (message: string, data: any) => {
    console.log(`[DevTools Bridge] Sending message: ${message}`, data);
    // 这里可以添加与background script的通信逻辑
  },
  
  onMessage: (callback: (message: string, data: any) => void) => {
    // 监听来自background script的消息
    console.log("[DevTools Bridge] Message listener registered");
  }
}; 