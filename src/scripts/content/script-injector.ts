/**
 * 动态脚本注入模块
 * 负责动态创建script标签注入调试脚本，支持异步加载和错误处理
 */

export interface InjectionStatus {
  injected: boolean;
  scripts: string[];
  errors: string[];
  timestamp: number;
}

export interface InjectionResult {
  success: boolean;
  scriptPath: string;
  error?: string;
  timestamp: number;
}

export class ScriptInjector {
  private injectedScripts: Set<string> = new Set();
  private injectionErrors: Map<string, string> = new Map();
  private maxRetries = 3;
  private retryDelay = 1000;
  private timeout = 10000;

  /**
   * 注入单个脚本
   */
  async injectScript(scriptPath: string): Promise<void> {
    if (this.injectedScripts.has(scriptPath)) {
      console.log(`Script already injected: ${scriptPath}`);
      return;
    }

    const result = await this.performInjection(scriptPath);
    
    if (result.success) {
      this.injectedScripts.add(scriptPath);
      console.log(`Script injected successfully: ${scriptPath}`);
    } else {
      this.injectionErrors.set(scriptPath, result.error || 'Unknown error');
      throw new Error(`Failed to inject script: ${scriptPath} - ${result.error}`);
    }
  }

  /**
   * 批量注入脚本
   */
  async injectScripts(scriptPaths: string[]): Promise<void> {
    const results: InjectionResult[] = [];
    
    for (const scriptPath of scriptPaths) {
      try {
        await this.injectScript(scriptPath);
        results.push({
          success: true,
          scriptPath,
          timestamp: Date.now()
        });
      } catch (error) {
        results.push({
          success: false,
          scriptPath,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        });
      }
    }

    // 检查是否有失败的注入
    const failedInjection = results.find(result => !result.success);
    if (failedInjection) {
      throw new Error(`Some scripts failed to inject: ${failedInjection.scriptPath}`);
    }
  }

  /**
   * 检查是否已注入
   */
  isInjected(): boolean {
    return this.injectedScripts.size > 0;
  }

  /**
   * 检查特定脚本是否已注入
   */
  isScriptInjected(scriptPath: string): boolean {
    return this.injectedScripts.has(scriptPath);
  }

  /**
   * 获取注入状态
   */
  getInjectionStatus(): InjectionStatus {
    return {
      injected: this.isInjected(),
      scripts: Array.from(this.injectedScripts),
      errors: Array.from(this.injectionErrors.values()),
      timestamp: Date.now()
    };
  }

  /**
   * 重试注入
   */
  async retryInjection(): Promise<void> {
    const failedScripts = Array.from(this.injectionErrors.keys());
    
    if (failedScripts.length === 0) {
      console.log('No failed injections to retry');
      return;
    }

    console.log(`Retrying injection for ${failedScripts.length} scripts`);
    
    // 清除错误记录
    this.injectionErrors.clear();
    
    // 重新注入失败的脚本
    for (const scriptPath of failedScripts) {
      this.injectedScripts.delete(scriptPath);
    }
    
    await this.injectScripts(failedScripts);
  }

  /**
   * 执行脚本注入
   */
  private async performInjection(scriptPath: string): Promise<InjectionResult> {
    return new Promise((resolve) => {
      let retryCount = 0;

      const attemptInjection = () => {
        try {
          const script = document.createElement('script');
          script.src = this.resolveScriptPath(scriptPath);
          script.async = false;
          
          // 设置超时
          const timeoutId = setTimeout(() => {
            resolve({
              success: false,
              scriptPath,
              error: 'Injection timeout',
              timestamp: Date.now()
            });
          }, this.timeout);

          // 监听加载事件
          script.onload = () => {
            clearTimeout(timeoutId);
            resolve({
              success: true,
              scriptPath,
              timestamp: Date.now()
            });
          };

          script.onerror = () => {
            clearTimeout(timeoutId);
            
            retryCount++;
            if (retryCount < this.maxRetries) {
              console.warn(`Script injection failed, retrying (${retryCount}/${this.maxRetries}): ${scriptPath}`);
              setTimeout(attemptInjection, this.retryDelay);
            } else {
              resolve({
                success: false,
                scriptPath,
                error: 'Script load failed after retries',
                timestamp: Date.now()
              });
            }
          };

          // 注入到页面
          document.head.appendChild(script);
          
        } catch (error) {
          retryCount++;
          if (retryCount < this.maxRetries) {
            console.warn(`Script injection error, retrying (${retryCount}/${this.maxRetries}): ${scriptPath}`, error);
            setTimeout(attemptInjection, this.retryDelay);
          } else {
            resolve({
              success: false,
              scriptPath,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: Date.now()
            });
          }
        }
      };

      attemptInjection();
    });
  }

  /**
   * 解析脚本路径
   */
  private resolveScriptPath(scriptPath: string): string {
    // 如果是绝对路径，直接返回
    if (scriptPath.startsWith('http://') || scriptPath.startsWith('https://')) {
      return scriptPath;
    }

    // 如果是相对路径，尝试从扩展获取
    if (scriptPath.startsWith('/')) {
      return scriptPath;
    }

    // 尝试从Chrome扩展获取
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL(scriptPath);
    }

    // 回退到相对路径
    return scriptPath;
  }

  /**
   * 注入内联脚本
   */
  async injectInlineScript(code: string, id?: string): Promise<void> {
    const scriptId = id || `inline-script-${Date.now()}`;
    
    if (document.getElementById(scriptId)) {
      console.log(`Inline script already exists: ${scriptId}`);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.textContent = code;
    
    document.head.appendChild(script);
    
    this.injectedScripts.add(scriptId);
    console.log(`Inline script injected: ${scriptId}`);
  }

  /**
   * 清理注入的脚本
   */
  cleanup(): void {
    // 移除注入的脚本标签
    for (const scriptPath of this.injectedScripts) {
      const scripts = document.querySelectorAll(`script[src*="${scriptPath}"]`);
      scripts.forEach(script => script.remove());
    }

    // 清理内联脚本
    for (const scriptId of this.injectedScripts) {
      if (scriptId.startsWith('inline-script-')) {
        const script = document.getElementById(scriptId);
        if (script) {
          script.remove();
        }
      }
    }

    this.injectedScripts.clear();
    this.injectionErrors.clear();
    
    console.log('Script injection cleanup completed');
  }

  /**
   * 设置注入参数
   */
  setInjectionParams(maxRetries: number, timeout: number, retryDelay: number): void {
    this.maxRetries = maxRetries;
    this.timeout = timeout;
    this.retryDelay = retryDelay;
  }

  /**
   * 获取注入统计信息
   */
  getInjectionStats(): {
    totalInjected: number;
    totalErrors: number;
    successRate: number;
  } {
    const totalInjected = this.injectedScripts.size;
    const totalErrors = this.injectionErrors.size;
    const totalAttempts = totalInjected + totalErrors;
    const successRate = totalAttempts > 0 ? (totalInjected / totalAttempts) * 100 : 0;

    return {
      totalInjected,
      totalErrors,
      successRate
    };
  }
}

// 创建全局实例
export const scriptInjector = new ScriptInjector(); 