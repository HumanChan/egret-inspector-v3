/**
 * 调试脚本核心模块
 * 负责与Egret引擎建立连接，提供基础的调试API
 */

import { DisplayNode, Property, DebugRequest, DebugResponse, DebugOptions } from '../shared/types';

// 全局类型声明
declare global {
  interface Window {
    egret?: any;
    lark?: any;
  }
}

export interface EgretInspectorConfig {
  showPrivate: boolean;
  showMethods: boolean;
  maxDepth: number;
  enablePerformance: boolean;
}

export class EgretInspector {
  private connected = false;
  private engineType: 'egret' | 'lark' | null = null;
  private config: EgretInspectorConfig = {
    showPrivate: true,
    showMethods: false,
    maxDepth: 10,
    enablePerformance: true
  };
  private nodeCache = new Map<string, DisplayNode>();
  private propertyCache = new Map<string, Property[]>();

  /**
   * 连接到Egret引擎
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      // 检测引擎类型
      if (this.detectEgretEngine()) {
        this.engineType = 'egret';
      } else if (this.detectLarkEngine()) {
        this.engineType = 'lark';
      } else {
        throw new Error('No supported engine detected');
      }

      this.connected = true;
      console.log(`Egret Inspector connected to ${this.engineType} engine`);
    } catch (error) {
      console.error('Failed to connect to engine:', error);
      throw error;
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.connected && this.engineType !== null;
  }

  /**
   * 获取显示对象树
   */
  async getDisplayTree(): Promise<DisplayNode[]> {
    if (!this.isConnected()) {
      throw new Error('Not connected to engine');
    }

    try {
      const rootNodes = this.getRootDisplayObjects();
      const tree: DisplayNode[] = [];

      for (const root of rootNodes) {
        const node = await this.parseDisplayNode(root, 0);
        if (node) {
          tree.push(node);
        }
      }

      return tree;
    } catch (error) {
      console.error('Failed to get display tree:', error);
      throw error;
    }
  }

  /**
   * 获取节点属性
   */
  async getNodeProperties(nodeId: string, options?: DebugOptions): Promise<Property[]> {
    if (!this.isConnected()) {
      throw new Error('Not connected to engine');
    }

    const cacheKey = `${nodeId}-${JSON.stringify(options)}`;
    if (this.propertyCache.has(cacheKey)) {
      return this.propertyCache.get(cacheKey)!;
    }

    try {
      const displayObject = this.getDisplayObjectById(nodeId);
      if (!displayObject) {
        throw new Error(`Display object not found: ${nodeId}`);
      }

      const properties = this.parseObjectProperties(displayObject, options);
      this.propertyCache.set(cacheKey, properties);

      return properties;
    } catch (error) {
      console.error('Failed to get node properties:', error);
      throw error;
    }
  }

  /**
   * 选中节点
   */
  async selectNode(nodeId: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Not connected to engine');
    }

    try {
      const displayObject = this.getDisplayObjectById(nodeId);
      if (!displayObject) {
        throw new Error(`Display object not found: ${nodeId}`);
      }

      // 高亮选中的对象
      this.highlightDisplayObject(displayObject);
      
      console.log(`Node selected: ${nodeId}`);
    } catch (error) {
      console.error('Failed to select node:', error);
      throw error;
    }
  }

  /**
   * 处理调试请求
   */
  async handleDebugRequest(request: DebugRequest): Promise<DebugResponse> {
    try {
      switch (request.type) {
        case 'getDisplayTree':
          const tree = await this.getDisplayTree();
          return {
            success: true,
            data: tree,
            timestamp: Date.now()
          };

        case 'getNodeProperties':
          if (!request.nodeId) {
            throw new Error('Node ID is required');
          }
          const properties = await this.getNodeProperties(request.nodeId, request.options);
          return {
            success: true,
            data: properties,
            timestamp: Date.now()
          };

        case 'selectNode':
          if (!request.nodeId) {
            throw new Error('Node ID is required');
          }
          await this.selectNode(request.nodeId);
          return {
            success: true,
            data: { nodeId: request.nodeId },
            timestamp: Date.now()
          };

        case 'getFPS':
          const fps = this.getFPS();
          return {
            success: true,
            data: fps,
            timestamp: Date.now()
          };

        case 'getPerformance':
          const performance = this.getPerformance();
          return {
            success: true,
            data: performance,
            timestamp: Date.now()
          };

        default:
          throw new Error(`Unknown debug request type: ${request.type}`);
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<EgretInspectorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.nodeCache.clear();
    this.propertyCache.clear();
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.connected = false;
    this.engineType = null;
    this.clearCache();
    console.log('Egret Inspector disconnected');
  }

  // 私有方法

  /**
   * 检测Egret引擎
   */
  private detectEgretEngine(): boolean {
    try {
      return !!(window.egret && (window.egret.Sprite || window.egret.getQualifiedClassName));
    } catch (error) {
      return false;
    }
  }

  /**
   * 检测Lark引擎
   */
  private detectLarkEngine(): boolean {
    try {
      return !!(window.lark && (window.lark.Types || window.lark.__classFlag__));
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取根显示对象
   */
  private getRootDisplayObjects(): any[] {
    if (this.engineType === 'egret') {
      return this.getEgretRootObjects();
    } else if (this.engineType === 'lark') {
      return this.getLarkRootObjects();
    }
    return [];
  }

  /**
   * 获取Egret根对象
   */
  private getEgretRootObjects(): any[] {
    try {
      const stage = window.egret?.MainContext?.instance?.stage;
      if (stage) {
        return [stage];
      }
      return [];
    } catch (error) {
      console.warn('Failed to get Egret root objects:', error);
      return [];
    }
  }

  /**
   * 获取Lark根对象
   */
  private getLarkRootObjects(): any[] {
    try {
      // Lark引擎的根对象获取逻辑
      return [];
    } catch (error) {
      console.warn('Failed to get Lark root objects:', error);
      return [];
    }
  }

  /**
   * 解析显示对象节点
   */
  private async parseDisplayNode(displayObject: any, depth: number): Promise<DisplayNode | null> {
    if (!displayObject || depth > this.config.maxDepth) {
      return null;
    }

    try {
      const node: DisplayNode = {
        id: this.getObjectId(displayObject),
        name: this.getObjectName(displayObject),
        type: this.getObjectType(displayObject),
        visible: this.isObjectVisible(displayObject),
        children: [],
        properties: [],
        hashCode: this.getObjectHashCode(displayObject),
        parentHash: this.getParentHashCode(displayObject),
        memberName: this.getObjectMemberName(displayObject),
        selected: false,
        expandable: this.hasChildren(displayObject)
      };

      // 缓存节点
      this.nodeCache.set(node.id, node);

      // 解析子节点
      if (depth < this.config.maxDepth) {
        const children = this.getObjectChildren(displayObject);
        for (const child of children) {
          const childNode = await this.parseDisplayNode(child, depth + 1);
          if (childNode) {
            node.children.push(childNode);
          }
        }
      }

      return node;
    } catch (error) {
      console.warn('Failed to parse display node:', error);
      return null;
    }
  }

  /**
   * 解析对象属性
   */
  private parseObjectProperties(obj: any, options?: DebugOptions): Property[] {
    const properties: Property[] = [];
    const showPrivate = options?.showPrivate ?? this.config.showPrivate;
    const showMethods = options?.showMethods ?? this.config.showMethods;

    try {
      for (const key in obj) {
        // 过滤私有属性
        if (!showPrivate && key.startsWith('_')) {
          continue;
        }

        // 过滤方法
        if (!showMethods && typeof obj[key] === 'function') {
          continue;
        }

        const property: Property = {
          name: key,
          value: this.safeGetValue(obj, key),
          type: typeof obj[key],
          isGetter: this.isGetter(obj, key),
          isSetter: this.isSetter(obj, key),
          isPrivate: key.startsWith('_'),
          expandable: this.isExpandable(obj[key])
        };

        properties.push(property);
      }

      // 按名称排序
      properties.sort((a, b) => a.name.localeCompare(b.name));

      return properties;
    } catch (error) {
      console.warn('Failed to parse object properties:', error);
      return [];
    }
  }

  /**
   * 获取对象ID
   */
  private getObjectId(obj: any): string {
    return obj.hashCode?.toString() || obj.__hashCode__?.toString() || `obj_${Date.now()}_${Math.random()}`;
  }

  /**
   * 获取对象名称
   */
  private getObjectName(obj: any): string {
    return obj.name || obj.getDisplayName?.() || obj.constructor?.name || 'Unknown';
  }

  /**
   * 获取对象类型
   */
  private getObjectType(obj: any): string {
    if (this.engineType === 'egret') {
      return window.egret?.getQualifiedClassName?.(obj) || obj.constructor?.name || 'Unknown';
    }
    return obj.constructor?.name || 'Unknown';
  }

  /**
   * 检查对象是否可见
   */
  private isObjectVisible(obj: any): boolean {
    return !!(obj.visible && obj.alpha !== 0);
  }

  /**
   * 获取对象哈希码
   */
  private getObjectHashCode(obj: any): number {
    return obj.hashCode || obj.__hashCode__ || 0;
  }

  /**
   * 获取父对象哈希码
   */
  private getParentHashCode(obj: any): number | undefined {
    return obj.parent?.hashCode || obj.parent?.__hashCode__;
  }

  /**
   * 获取对象成员名称
   */
  private getObjectMemberName(obj: any): string | undefined {
    return obj.name;
  }

  /**
   * 检查是否有子对象
   */
  private hasChildren(obj: any): boolean {
    return !!(obj.numChildren && obj.numChildren > 0);
  }

  /**
   * 获取对象子节点
   */
  private getObjectChildren(obj: any): any[] {
    try {
      if (obj.numChildren) {
        const children: any[] = [];
        for (let i = 0; i < obj.numChildren; i++) {
          const child = obj.getChildAt(i);
          if (child) {
            children.push(child);
          }
        }
        return children;
      }
      return [];
    } catch (error) {
      console.warn('Failed to get object children:', error);
      return [];
    }
  }

  /**
   * 安全获取值
   */
  private safeGetValue(obj: any, key: string): any {
    try {
      return obj[key];
    } catch (error) {
      return '[Error: Cannot access property]';
    }
  }

  /**
   * 检查是否为getter
   */
  private isGetter(obj: any, key: string): boolean {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      return !!descriptor?.get;
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查是否为setter
   */
  private isSetter(obj: any, key: string): boolean {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      return !!descriptor?.set;
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查是否可展开
   */
  private isExpandable(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * 根据ID获取显示对象
   */
  private getDisplayObjectById(nodeId: string): any {
    // 从缓存中查找
    const cachedNode = this.nodeCache.get(nodeId);
    if (cachedNode) {
      // 这里需要实现从哈希码到对象的映射
      return this.findObjectByHashCode(cachedNode.hashCode);
    }
    return null;
  }

  /**
   * 根据哈希码查找对象
   */
  private findObjectByHashCode(hashCode: number): any {
    // 遍历显示对象树查找
    const rootObjects = this.getRootDisplayObjects();
    for (const root of rootObjects) {
      const found = this.findObjectRecursive(root, hashCode);
      if (found) {
        return found;
      }
    }
    return null;
  }

  /**
   * 递归查找对象
   */
  private findObjectRecursive(obj: any, hashCode: number): any {
    if (!obj) return null;
    
    if (this.getObjectHashCode(obj) === hashCode) {
      return obj;
    }

    const children = this.getObjectChildren(obj);
    for (const child of children) {
      const found = this.findObjectRecursive(child, hashCode);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * 高亮显示对象
   */
  private highlightDisplayObject(obj: any): void {
    try {
      // 实现高亮逻辑
      console.log('Highlighting display object:', obj);
    } catch (error) {
      console.warn('Failed to highlight display object:', error);
    }
  }

  /**
   * 获取FPS
   */
  private getFPS(): number {
    try {
      // 实现FPS获取逻辑
      return 60; // 默认值
    } catch (error) {
      console.warn('Failed to get FPS:', error);
      return 0;
    }
  }

  /**
   * 获取性能数据
   */
  private getPerformance(): any {
    try {
      // 实现性能数据获取逻辑
      return {
        fps: this.getFPS(),
        memory: performance.memory || { used: 0, total: 0 },
        timestamp: Date.now()
      };
    } catch (error) {
      console.warn('Failed to get performance data:', error);
      return null;
    }
  }
}

// 创建全局实例
export const egretInspector = new EgretInspector(); 