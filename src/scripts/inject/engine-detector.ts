/**
 * 引擎检测脚本 - 运行在页面上下文中
 * 负责处理来自内容脚本的引擎检测请求
 */

// 全局类型声明
declare global {
  interface Window {
    egret?: any;
    lark?: any;
  }
}

interface EngineInfo {
  type: 'egret' | 'lark';
  version: string;
  features: string[];
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
function getEgretEngineInfo(): EngineInfo {
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
function getLarkEngineInfo(): EngineInfo {
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
function getEngineInfo(): EngineInfo | null {
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
 * 设置消息监听器
 */
function setupMessageListeners(): void {
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
 * 初始化引擎检测器
 */
function initializeEngineDetector(): void {
  console.log('Engine detector initialized in page context');
  setupMessageListeners();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEngineDetector);
} else {
  initializeEngineDetector();
}

// 导出供外部使用
export {
  detectEgretEngine,
  detectLarkEngine,
  getEngineInfo,
  getEgretEngineInfo,
  getLarkEngineInfo
}; 