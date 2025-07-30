/**
 * 通信框架模块
 * 负责建立Chrome扩展各组件间的通信，支持消息路由和事件分发
 */

import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  type: 'detect' | 'inject' | 'debug' | 'response' | 'error';
  data: any;
  timestamp: number;
  source: 'content' | 'background' | 'inject' | 'devtools';
  target?: 'content' | 'background' | 'inject' | 'devtools';
}

export type MessageHandler = (message: Message) => void | Promise<void>;

export interface ConnectionStatus {
  connected: boolean;
  lastConnected: number;
  reconnectAttempts: number;
  errors: string[];
}

export class CommunicationManager {
  private port: chrome.runtime.Port | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private pendingMessages: Map<string, { resolve: Function; reject: Function; timeout: number }> = new Map();
  private connectionStatus: ConnectionStatus = {
    connected: false,
    lastConnected: 0,
    reconnectAttempts: 0,
    errors: []
  };
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageTimeout = 10000;

  /**
   * 连接到后台脚本
   */
  async connect(): Promise<void> {
    if (this.connectionStatus.connected) {
      return;
    }

    try {
      this.port = chrome.runtime.connect({ name: 'egret-inspector' });
      
      this.port.onMessage.addListener((message: Message) => {
        this.handleIncomingMessage(message);
      });

      this.port.onDisconnect.addListener(() => {
        this.handleDisconnect();
      });

      this.connectionStatus.connected = true;
      this.connectionStatus.lastConnected = Date.now();
      this.connectionStatus.reconnectAttempts = 0;
      this.connectionStatus.errors = [];

      console.log('Communication manager connected');
    } catch (error) {
      this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.port) {
      this.port.disconnect();
      this.port = null;
    }
    
    this.connectionStatus.connected = false;
    this.clearPendingMessages();
    
    console.log('Communication manager disconnected');
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.connectionStatus.connected && this.port !== null;
  }

  /**
   * 发送消息
   */
  async sendMessage(message: Message): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Not connected to background script');
    }

    try {
      this.port!.postMessage(message);
      console.log(`Message sent: ${message.type}`, message);
    } catch (error) {
      this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * 发送消息并等待响应
   */
  async sendMessageWithResponse(message: Message): Promise<Message> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingMessages.delete(message.id);
        reject(new Error('Message timeout'));
      }, this.messageTimeout);

      this.pendingMessages.set(message.id, {
        resolve,
        reject,
        timeout: timeoutId
      });

      this.sendMessage(message).catch(reject);
    });
  }

  /**
   * 注册消息处理器
   */
  onMessage(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  /**
   * 移除消息处理器
   */
  removeMessageHandler(type: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleIncomingMessage(message: Message): void {
    console.log(`Message received: ${message.type}`, message);

    // 检查是否是响应消息
    const pendingMessage = this.pendingMessages.get(message.id);
    if (pendingMessage) {
      clearTimeout(pendingMessage.timeout);
      this.pendingMessages.delete(message.id);
      pendingMessage.resolve(message);
      return;
    }

    // 调用注册的处理器
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Message handler error:', error);
        }
      });
    }
  }

  /**
   * 处理连接断开
   */
  private handleDisconnect(): void {
    this.connectionStatus.connected = false;
    this.clearPendingMessages();
    
    console.log('Connection disconnected, attempting to reconnect...');
    
    // 尝试重连
    if (this.connectionStatus.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.attemptReconnect();
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * 尝试重连
   */
  private async attemptReconnect(): Promise<void> {
    this.connectionStatus.reconnectAttempts++;
    
    try {
      await this.connect();
      console.log('Reconnection successful');
    } catch (error) {
      console.error('Reconnection failed:', error);
      this.connectionStatus.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      // 继续尝试重连
      if (this.connectionStatus.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.attemptReconnect();
        }, this.reconnectDelay * this.connectionStatus.reconnectAttempts);
      }
    }
  }

  /**
   * 处理连接错误
   */
  private handleConnectionError(error: any): void {
    this.connectionStatus.connected = false;
    this.connectionStatus.errors.push(error instanceof Error ? error.message : 'Unknown error');
    
    console.error('Connection error:', error);
  }

  /**
   * 清理待处理的消息
   */
  private clearPendingMessages(): void {
    this.pendingMessages.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Connection lost'));
    });
    this.pendingMessages.clear();
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * 设置连接参数
   */
  setConnectionParams(maxReconnectAttempts: number, reconnectDelay: number, messageTimeout: number): void {
    this.maxReconnectAttempts = maxReconnectAttempts;
    this.reconnectDelay = reconnectDelay;
    this.messageTimeout = messageTimeout;
  }

  /**
   * 创建消息
   */
  createMessage(type: Message['type'], data: any, source: Message['source'], target?: Message['target']): Message {
    return {
      id: uuidv4(),
      type,
      data,
      timestamp: Date.now(),
      source,
      target
    };
  }

  /**
   * 发送检测消息
   */
  async sendDetectionMessage(data: any): Promise<Message> {
    const message = this.createMessage('detect', data, 'content', 'background');
    return this.sendMessageWithResponse(message);
  }

  /**
   * 发送注入消息
   */
  async sendInjectionMessage(data: any): Promise<Message> {
    const message = this.createMessage('inject', data, 'content', 'background');
    return this.sendMessageWithResponse(message);
  }

  /**
   * 发送调试消息
   */
  async sendDebugMessage(data: any): Promise<Message> {
    const message = this.createMessage('debug', data, 'content', 'inject');
    return this.sendMessageWithResponse(message);
  }

  /**
   * 发送响应消息
   */
  async sendResponseMessage(originalMessageId: string, data: any, source: Message['source']): Promise<void> {
    const message = this.createMessage('response', data, source);
    message.id = originalMessageId;
    await this.sendMessage(message);
  }

  /**
   * 发送错误消息
   */
  async sendErrorMessage(error: Error, source: Message['source']): Promise<void> {
    const message = this.createMessage('error', {
      message: error.message,
      stack: error.stack
    }, source);
    await this.sendMessage(message);
  }
}

// 创建全局实例
export const communicationManager = new CommunicationManager(); 