/**
 * 白鹭引擎检测模块
 * 负责检测页面中的Egret引擎，支持Egret 2.4+和2.5版本，兼容Lark引擎
 */

// 全局类型声明
declare global {
  interface Window {
    egret?: any;
    lark?: any;
  }
}

export interface DetectionResult {
  isEgret: boolean;
  version: string;
  engineType: 'egret' | 'lark' | null;
  timestamp: number;
}

export interface EngineInfo {
  type: 'egret' | 'lark';
  version: string;
  features: string[];
}

export class EgretDetector {
  private maxRetries = 10;
  private timeout = 30000;
  private retryDelay = 1000;
  private detectionInterval: number | null = null;
  private isDetecting = false;
  private messageIdCounter = 0;

  /**
   * 检测页面是否包含Egret引擎
   */
  async isEgretEngine(): Promise<boolean> {
    // 使用异步检测，因为内容脚本无法直接访问页面上下文
    const hasEgret = await this.detectEgretEngineInPageContext();
    const hasLark = await this.detectLarkEngineInPageContext();
    return hasEgret || hasLark;
  }

  /**
   * 获取引擎版本
   */
  async getEngineVersion(): Promise<string> {
    const engineInfo = await this.getEngineInfo();
    return engineInfo?.version || 'unknown';
  }

  /**
   * 获取引擎类型
   */
  async getEngineType(): Promise<'egret' | 'lark' | null> {
    const engineInfo = await this.getEngineInfo();
    return engineInfo?.type || null;
  }

  /**
   * 获取引擎特性
   */
  async getEngineFeatures(): Promise<string[]> {
    const engineInfo = await this.getEngineInfo();
    return engineInfo?.features || [];
  }

  /**
   * 等待引擎加载完成
   */
  async waitForEngine(): Promise<boolean> {
    // 使用异步检测，因为内容脚本无法直接访问页面上下文
    return new Promise((resolve) => {
      let retryCount = 0;
      const checkEngine = async () => {
        try {
          // 使用异步检测方法
          const hasEgret = await this.detectEgretEngineInPageContext();
          const hasLark = await this.detectLarkEngineInPageContext();
          
          if (hasEgret || hasLark) {
            resolve(true);
            return;
          }

          retryCount++;
          if (retryCount >= this.maxRetries) {
            resolve(false);
            return;
          }

          setTimeout(checkEngine, this.retryDelay);
        } catch (error) {
          console.warn('Engine detection error:', error);
          retryCount++;
          if (retryCount >= this.maxRetries) {
            resolve(false);
            return;
          }
          setTimeout(checkEngine, this.retryDelay);
        }
      };

      checkEngine();
    });
  }

  /**
   * 执行引擎检测
   */
  async detectEngine(): Promise<DetectionResult> {
    if (this.isDetecting) {
      throw new Error('Detection already in progress');
    }

    this.isDetecting = true;

    try {
      const result = await this.performDetection();
      return result;
    } finally {
      this.isDetecting = false;
    }
  }

  /**
   * 同步检测引擎 - 通过页面上下文检测
   */
  private detectEngineSync(): boolean {
    // 由于内容脚本无法直接访问页面的JavaScript上下文
    // 我们需要通过注入脚本或页面上下文来检测
    // 这里暂时返回false，实际的检测逻辑将在异步方法中实现
    return false;
  }

  /**
   * 通过页面上下文检测Egret引擎
   */
  private async detectEgretEngineInPageContext(): Promise<boolean> {
    return new Promise((resolve) => {
      const messageId = `egret-detection-${++this.messageIdCounter}`;
      
      // 设置响应监听器
      const responseHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'EGRET_ENGINE_DETECTION_RESPONSE' && event.data.messageId === messageId) {
          window.removeEventListener('message', responseHandler);
          resolve(event.data.hasEgret);
        }
      };
      
      window.addEventListener('message', responseHandler);
      
      // 发送检测请求到页面上下文
      window.postMessage({
        type: 'EGRET_ENGINE_DETECTION_REQUEST',
        messageId: messageId
      }, '*');
      
      // 设置超时
      setTimeout(() => {
        window.removeEventListener('message', responseHandler);
        resolve(false);
      }, 5000);
    });
  }

  /**
   * 通过页面上下文检测Lark引擎
   */
  private async detectLarkEngineInPageContext(): Promise<boolean> {
    return new Promise((resolve) => {
      const messageId = `lark-detection-${++this.messageIdCounter}`;
      
      // 设置响应监听器
      const responseHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'LARK_ENGINE_DETECTION_RESPONSE' && event.data.messageId === messageId) {
          window.removeEventListener('message', responseHandler);
          resolve(event.data.hasLark);
        }
      };
      
      window.addEventListener('message', responseHandler);
      
      // 发送检测请求到页面上下文
      window.postMessage({
        type: 'LARK_ENGINE_DETECTION_REQUEST',
        messageId: messageId
      }, '*');
      
      // 设置超时
      setTimeout(() => {
        window.removeEventListener('message', responseHandler);
        resolve(false);
      }, 5000);
    });
  }

  /**
   * 获取引擎信息 - 通过页面上下文
   */
  private async getEngineInfoFromPageContext(): Promise<EngineInfo | null> {
    return new Promise((resolve) => {
      const messageId = `engine-info-${++this.messageIdCounter}`;
      
      // 设置响应监听器
      const responseHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'ENGINE_INFO_RESPONSE' && event.data.messageId === messageId) {
          window.removeEventListener('message', responseHandler);
          resolve(event.data.engineInfo);
        }
      };
      
      window.addEventListener('message', responseHandler);
      
      // 发送获取引擎信息请求到页面上下文
      window.postMessage({
        type: 'ENGINE_INFO_REQUEST',
        messageId: messageId
      }, '*');
      
      // 设置超时
      setTimeout(() => {
        window.removeEventListener('message', responseHandler);
        resolve(null);
      }, 5000);
    });
  }

  /**
   * 获取引擎信息
   */
  private async getEngineInfo(): Promise<EngineInfo | null> {
    try {
      // 检测Egret引擎
      const hasEgret = await this.detectEgretEngineInPageContext();
      if (hasEgret) {
        return this.getEgretEngineInfoFromPageContext();
      }

      // 检测Lark引擎
      const hasLark = await this.detectLarkEngineInPageContext();
      if (hasLark) {
        return this.getLarkEngineInfoFromPageContext();
      }
    } catch (error) {
      console.warn('Engine info detection error:', error);
    }

    return null;
  }

  /**
   * 获取Egret引擎信息 - 通过页面上下文
   */
  private async getEgretEngineInfoFromPageContext(): Promise<EngineInfo> {
    return new Promise((resolve) => {
      const messageId = `egret-info-${++this.messageIdCounter}`;
      
      // 设置响应监听器
      const responseHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'EGRET_INFO_RESPONSE' && event.data.messageId === messageId) {
          window.removeEventListener('message', responseHandler);
          resolve(event.data.engineInfo);
        }
      };
      
      window.addEventListener('message', responseHandler);
      
      // 发送获取Egret信息请求到页面上下文
      window.postMessage({
        type: 'EGRET_INFO_REQUEST',
        messageId: messageId
      }, '*');
      
      // 设置超时
      setTimeout(() => {
        window.removeEventListener('message', responseHandler);
        resolve({
          type: 'egret',
          version: 'unknown',
          features: []
        });
      }, 5000);
    });
  }

  /**
   * 获取Lark引擎信息 - 通过页面上下文
   */
  private async getLarkEngineInfoFromPageContext(): Promise<EngineInfo> {
    return new Promise((resolve) => {
      const messageId = `lark-info-${++this.messageIdCounter}`;
      
      // 设置响应监听器
      const responseHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'LARK_INFO_RESPONSE' && event.data.messageId === messageId) {
          window.removeEventListener('message', responseHandler);
          resolve(event.data.engineInfo);
        }
      };
      
      window.addEventListener('message', responseHandler);
      
      // 发送获取Lark信息请求到页面上下文
      window.postMessage({
        type: 'LARK_INFO_REQUEST',
        messageId: messageId
      }, '*');
      
      // 设置超时
      setTimeout(() => {
        window.removeEventListener('message', responseHandler);
        resolve({
          type: 'lark',
          version: 'unknown',
          features: []
        });
      }, 5000);
    });
  }

  /**
   * 执行检测过程
   */
  private async performDetection(): Promise<DetectionResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let retryCount = 0;

      const performCheck = async () => {
        // 检查是否超时
        if (Date.now() - startTime > this.timeout) {
          reject(new Error('Detection timeout'));
          return;
        }

        try {
          // 执行检测
          const hasEgret = await this.detectEgretEngineInPageContext();
          const hasLark = await this.detectLarkEngineInPageContext();
          
          if (hasEgret || hasLark) {
            const engineInfo = await this.getEngineInfo();
            const result: DetectionResult = {
              isEgret: true,
              version: engineInfo?.version || 'unknown',
              engineType: engineInfo?.type || null,
              timestamp: Date.now()
            };
            resolve(result);
            return;
          }

          // 重试检测
          retryCount++;
          if (retryCount >= this.maxRetries) {
            const result: DetectionResult = {
              isEgret: false,
              version: 'unknown',
              engineType: null,
              timestamp: Date.now()
            };
            resolve(result);
            return;
          }

          // 延迟重试
          setTimeout(performCheck, this.retryDelay);
        } catch (error) {
          console.error('Detection error:', error);
          retryCount++;
          if (retryCount >= this.maxRetries) {
            const result: DetectionResult = {
              isEgret: false,
              version: 'unknown',
              engineType: null,
              timestamp: Date.now()
            };
            resolve(result);
            return;
          }
          setTimeout(performCheck, this.retryDelay);
        }
      };

      performCheck();
    });
  }

  /**
   * 设置检测参数
   */
  setDetectionParams(maxRetries: number, timeout: number, retryDelay: number): void {
    this.maxRetries = maxRetries;
    this.timeout = timeout;
    this.retryDelay = retryDelay;
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    this.isDetecting = false;
  }
}

// 创建全局实例
export const egretDetector = new EgretDetector(); 