/**
 * 错误处理机制
 * 负责处理各种错误场景，包括重试机制、超时处理和错误日志记录
 */

import { ErrorInfo, ErrorResult } from './types';

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  exponentialBackoff: boolean;
}

export interface ErrorHandlerConfig {
  detection: RetryConfig;
  injection: RetryConfig;
  communication: RetryConfig;
  debug: RetryConfig;
}

export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorLog: ErrorInfo[] = [];
  private maxErrorLogSize = 100;

  constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = {
      detection: {
        maxRetries: 10,
        retryDelay: 1000,
        timeout: 30000,
        exponentialBackoff: true
      },
      injection: {
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 10000,
        exponentialBackoff: false
      },
      communication: {
        maxRetries: 5,
        retryDelay: 1000,
        timeout: 10000,
        exponentialBackoff: true
      },
      debug: {
        maxRetries: 3,
        retryDelay: 500,
        timeout: 5000,
        exponentialBackoff: false
      },
      ...config
    };
  }

  /**
   * 执行带重试的操作
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryConfig: RetryConfig,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount <= retryConfig.maxRetries) {
      try {
        // 设置超时
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timeout')), retryConfig.timeout);
        });

        const result = await Promise.race([operation(), timeoutPromise]);
        return result;
      } catch (error) {
        lastError = error as Error;
        retryCount++;

        if (retryCount > retryConfig.maxRetries) {
          break;
        }

        // 计算延迟时间
        const delay = retryConfig.exponentialBackoff
          ? retryConfig.retryDelay * Math.pow(2, retryCount - 1)
          : retryConfig.retryDelay;

        console.warn(`${context} failed (attempt ${retryCount}/${retryConfig.maxRetries}), retrying in ${delay}ms:`, error);
        
        // 记录错误
        this.logError(error as Error, context, retryCount);

        // 等待后重试
        await this.delay(delay);
      }
    }

    // 所有重试都失败了
    const finalError = new Error(`${context} failed after ${retryConfig.maxRetries} retries: ${lastError?.message}`);
    this.logError(finalError, context, retryConfig.maxRetries);
    throw finalError;
  }

  /**
   * 处理检测失败
   */
  async handleDetectionFailure(error: Error, retryCount: number): Promise<void> {
    console.error('Detection failure:', error);
    
    if (retryCount >= this.config.detection.maxRetries) {
      // 检测失败，降级处理
      console.warn('Detection failed, proceeding with limited functionality');
      // 可以在这里实现降级逻辑
    }
  }

  /**
   * 处理注入失败
   */
  async handleInjectionFailure(error: Error, scriptPath: string): Promise<void> {
    console.error('Injection failure:', error);
    
    // 尝试使用备用脚本路径
    const backupPaths = this.getBackupScriptPaths(scriptPath);
    
    for (const backupPath of backupPaths) {
      try {
        console.log(`Trying backup script path: ${backupPath}`);
        // 这里可以调用脚本注入器重试
        return;
      } catch (backupError) {
        console.warn(`Backup script path also failed: ${backupPath}`, backupError);
      }
    }
    
    // 所有备用路径都失败了
    throw new Error(`All injection attempts failed for: ${scriptPath}`);
  }

  /**
   * 处理通信失败
   */
  async handleCommunicationFailure(error: Error): Promise<void> {
    console.error('Communication failure:', error);
    
    // 尝试重新建立连接
    try {
      // 这里可以调用通信管理器重连
      console.log('Attempting to reconnect...');
    } catch (reconnectError) {
      console.error('Reconnection failed:', reconnectError);
      throw reconnectError;
    }
  }

  /**
   * 处理调试失败
   */
  async handleDebugFailure(error: Error, request: any): Promise<void> {
    console.error('Debug failure:', error);
    
    // 根据请求类型处理不同的错误
    switch (request.type) {
      case 'getDisplayTree':
        console.warn('Failed to get display tree, returning empty result');
        break;
      case 'getNodeProperties':
        console.warn('Failed to get node properties, returning empty result');
        break;
      case 'selectNode':
        console.warn('Failed to select node');
        break;
      default:
        console.warn('Unknown debug request type:', request.type);
    }
  }

  /**
   * 记录错误
   */
  logError(error: Error, context: string, retryCount?: number): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      code: this.getErrorCode(error),
      timestamp: Date.now(),
      source: 'content' // 这里应该根据实际上下文设置
    };

    this.errorLog.push(errorInfo);

    // 限制错误日志大小
    if (this.errorLog.length > this.maxErrorLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxErrorLogSize);
    }

    console.error(`[${context}] Error (retry ${retryCount || 0}):`, errorInfo);
  }

  /**
   * 获取错误代码
   */
  private getErrorCode(error: Error): string {
    if (error.message.includes('timeout')) {
      return 'TIMEOUT';
    }
    if (error.message.includes('network')) {
      return 'NETWORK_ERROR';
    }
    if (error.message.includes('permission')) {
      return 'PERMISSION_DENIED';
    }
    if (error.message.includes('not found')) {
      return 'NOT_FOUND';
    }
    return 'UNKNOWN_ERROR';
  }

  /**
   * 获取备用脚本路径
   */
  private getBackupScriptPaths(originalPath: string): string[] {
    const baseName = originalPath.split('/').pop();
    const backupPaths = [
      `backup/${baseName}`,
      `scripts/backup/${baseName}`,
      `fallback/${baseName}`
    ];
    return backupPaths;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取错误日志
   */
  getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  /**
   * 清理错误日志
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    totalErrors: number;
    errorTypes: Record<string, number>;
    recentErrors: number;
  } {
    const errorTypes: Record<string, number> = {};
    const recentErrors = this.errorLog.filter(error => 
      Date.now() - error.timestamp < 60000 // 最近1分钟
    ).length;

    this.errorLog.forEach(error => {
      const code = error.code || 'UNKNOWN';
      errorTypes[code] = (errorTypes[code] || 0) + 1;
    });

    return {
      totalErrors: this.errorLog.length,
      errorTypes,
      recentErrors
    };
  }

  /**
   * 检查是否应该继续重试
   */
  shouldRetry(error: Error, retryCount: number, maxRetries: number): boolean {
    // 某些错误不应该重试
    if (error.message.includes('permission denied') || 
        error.message.includes('not found')) {
      return false;
    }

    return retryCount < maxRetries;
  }

  /**
   * 创建错误结果
   */
  createErrorResult(error: Error, context: string): ErrorResult {
    return {
      success: false,
      error: {
        message: error.message,
        stack: error.stack,
        code: this.getErrorCode(error),
        timestamp: Date.now(),
        source: 'content' // 这里应该根据实际上下文设置
      }
    };
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): ErrorHandlerConfig {
    return { ...this.config };
  }
}

// 创建全局错误处理器实例
export const errorHandler = new ErrorHandler(); 