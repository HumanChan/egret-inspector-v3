// eval 注入脚本的代码,变量尽量使用var,后来发现在import之后,let会自动变为var
import { Msg, PluginEvent, RequestLogData, RequestNodeInfoData, RequestSetPropertyData, ResponseNodeInfoData, ResponseSetPropertyData, ResponseSupportData, ResponseTreeInfoData } from "../../core/types";
import { InjectEvent } from "./event";

// 全局类型声明
declare global {
  interface Window {
    egret?: any;
    lark?: any;
    lark_stages?: any[];
  }
}

export class Inspector extends InjectEvent {
  inspectorGameMemoryStorage: Record<string, any> = {};

  private watchIsEgretGame() {
    const timer = setInterval(() => {
      if (this._isEgretGame()) {
        clearInterval(timer);
        // 检测到 Egret 引擎后的处理
        const isEgretGame = this._isEgretGame();
        this.notifySupportGame(isEgretGame);
      }
    }, 300);
  }

  onMessage(pluginEvent: PluginEvent): void {
    switch (pluginEvent.msg) {
      case Msg.RequestSupport: {
        const isEgretGame = this._isEgretGame();
        this.notifySupportGame(isEgretGame);
        break;
      }
      case Msg.RequstTreeInfo: {
        this.updateTreeInfo();
        break;
      }
      case Msg.RequestNodeInfo: {
        const data = pluginEvent.data as RequestNodeInfoData;
        this.getNodeInfo(data.uuid);
        break;
      }
      case Msg.RequestSetProperty: {
        const data: RequestSetPropertyData = pluginEvent.data;
        // 暂时不实现属性设置功能
        console.warn("Property setting not implemented yet");
        break;
      }
      case Msg.RequestLogData: {
        const data: RequestLogData = pluginEvent.data;
        const value = this.getValue(this.inspectorGameMemoryStorage, data);
        const logFunction = console.log;
        logFunction(value);
        break;
      }
      case Msg.RequestVisible: {
        const uuid: string = pluginEvent.data;
        const node = this.inspectorGameMemoryStorage[uuid];
        if (node) {
          // 暂时不实现可见性切换功能
          console.warn("Visibility toggle not implemented yet");
        }
        break;
      }
      case Msg.RequestDestroy: {
        const uuid: string = pluginEvent.data;
        const node = this.inspectorGameMemoryStorage[uuid];
        if (node && node.isValid && node.destroy) {
          // 暂时不实现销毁功能
          console.warn("Destroy not implemented yet");
        }
        break;
      }
    }
  }

  init() {
    console.log(...this.terminal.init());
    this.watchIsEgretGame();
  }

  notifySupportGame(b: boolean) {
    const version = this._getEgretVersion();
    const engineType = 'egret';
    
    this.sendMsgToContent(Msg.ResponseSupport, { 
      support: b, 
      msg: "", 
      version: version,
      engineType: engineType
    } as ResponseSupportData);
  }

  updateTreeInfo() {
    let isEgretGame = this._isEgretGame();
    if (isEgretGame) {
      try {
        // 获取根节点
        const rootNode = this.getRootNode();
        
        if (rootNode) {
          // 将树结构转换为数组格式
          const nodes = this.treeNodeToArray(rootNode);
          
          const treeData = {
            nodes: nodes,
            timestamp: Date.now()
          };
          
          this.sendMsgToContent(Msg.ResponseTreeInfo, treeData as ResponseTreeInfoData);
        } else {
          // 没有找到根节点，返回空数据
          this.sendMsgToContent(Msg.ResponseTreeInfo, { 
            nodes: [], 
            timestamp: Date.now() 
          } as ResponseTreeInfoData);
        }
      } catch (error) {
        console.error('Error getting tree info:', error);
        this.sendMsgToContent(Msg.ResponseTreeInfo, { 
          nodes: [], 
          timestamp: Date.now() 
        } as ResponseTreeInfoData);
      }
    } else {
      this.sendMsgToContent(Msg.ResponseTreeInfo, { 
        nodes: [], 
        timestamp: Date.now() 
      } as ResponseTreeInfoData);
    }
  }

  _isEgretGame() {
    try {
      return !!(window.egret && (window.egret.Sprite || window.egret.getQualifiedClassName));
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取白鹭引擎版本号
   */
  _getEgretVersion(): string {
    try {
      if (!window.egret) {
        return 'unknown';
      }

      const egret = window.egret;
      
      if (egret.Capabilities && egret.Capabilities.engineVersion) {
        return egret.Capabilities.engineVersion;
      }
      
      return 'unknown';
    } catch (error) {
      console.warn('Failed to get Egret version:', error);
      return 'unknown';
    }
  }

  getNodeInfo(uuid: string) {
    // 暂时返回空的节点信息，后续实现具体的节点信息获取
    const nodeInfo = {
      uuid: uuid,
      properties: [],
      timestamp: Date.now()
    };
    this.sendMsgToContent(Msg.ResponseNodeInfo, nodeInfo as ResponseNodeInfoData);
  }

  getValue(obj: any, path: string[]): any {
    try {
      let current = obj;
      for (const key of path) {
        current = current[key];
      }
      return current;
    } catch (error) {
      return undefined;
    }
  }

  setValue(pathArray: Array<string>, value: string): boolean {
    try {
      let obj = this.inspectorGameMemoryStorage[pathArray[0]];
      for (let i = 1; i < pathArray.length - 1; i++) {
        obj = obj[pathArray[i]];
      }
      obj[pathArray[pathArray.length - 1]] = value;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取根节点
   */
  private getRootNode(): any {
    try {
      // 尝试获取 Egret 舞台
      if (window.egret && window.egret.MainContext && window.egret.MainContext.instance) {
        const stage = window.egret.MainContext.instance.stage;
        if (stage) {
          return stage;
        }
      }
      
      // 尝试获取 lark 舞台
      if (window.lark_stages && window.lark_stages.length > 0) {
        const stage = window.lark_stages[0];
        if (stage) {
          return stage;
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Error getting root node:', error);
      return null;
    }
  }

  /**
   * 将树节点转换为数组格式
   */
  private treeNodeToArray(rootNode: any): any[] {
    const rootNodeInfo = this.processNode(rootNode, 0);
    return rootNodeInfo ? [rootNodeInfo] : [];
  }

  /**
   * 处理单个节点，返回树形结构
   */
  private processNode(node: any, depth: number): any {
    if (!node) return null;
    
    try {
      const nodeInfo = {
        id: this.getObjectHashCode(node),
        name: node.name || this.getDisplayName(node),
        type: this.getDisplayName(node),
        uuid: this.generateUUID(),
        children: [],
        properties: this.getNodeProperties(node),
        expandable: this.hasChildren(node),
        visible: this.isVisible(node),
        depth: depth
      };
      
      // 处理子节点
      if (depth < 3) { // 限制深度避免性能问题
        nodeInfo.children = this.processChildren(node, depth + 1);
      }
      
      return nodeInfo;
      
    } catch (error) {
      console.warn('Error processing node:', error);
      return null;
    }
  }

  /**
   * 处理子节点，返回子节点数组
   */
  private processChildren(obj: any, depth: number): any[] {
    const children: any[] = [];
    
    try {
      // 检查 Egret 显示对象的子节点
      if (obj.numChildren !== undefined && typeof obj.numChildren === 'number') {
        const numChildren = Math.min(obj.numChildren, 100);
        
        for (let i = 0; i < numChildren; i++) {
          try {
            const child = obj.getChildAt(i);
            if (child) {
              const childNode = this.processNode(child, depth);
              if (childNode) {
                children.push(childNode);
              }
            }
          } catch (error) {
            console.warn(`Error getting child at index ${i}:`, error);
          }
        }
      }
      // 检查普通对象的子节点
      else if (obj.children && Array.isArray(obj.children)) {
        for (let i = 0; i < obj.children.length && i < 100; i++) {
          const child = obj.children[i];
          if (child) {
            const childNode = this.processNode(child, depth);
            if (childNode) {
              children.push(childNode);
            }
          }
        }
      }
      
    } catch (error) {
      console.warn('Error processing children:', error);
    }
    
    return children;
  }

  /**
   * 获取对象的显示名称
   */
  private getDisplayName(obj: any): string {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj === 'number') return String(obj);
    
    // 尝试获取 Egret 引擎的类型名称
    if (window.egret && window.egret.getQualifiedClassName) {
      try {
        return window.egret.getQualifiedClassName(obj);
      } catch (error) {
        // 忽略错误，使用备用方法
      }
    }
    
    // 使用构造函数名称
    if (obj.constructor && obj.constructor.name) {
      return obj.constructor.name;
    }
    
    // 使用对象类型
    return typeof obj;
  }

  /**
   * 获取节点属性
   */
  private getNodeProperties(obj: any): any[] {
    const properties: any[] = [];
    const visited = new WeakSet();
    
    if (!obj || typeof obj !== 'object') {
      return properties;
    }

    try {
      const keys = Object.getOwnPropertyNames(obj);
      
      for (const key of keys) {
        // 跳过私有属性和内部属性
        if (key.startsWith('_') || key.startsWith('$')) {
          continue;
        }
        
        // 跳过函数
        if (typeof obj[key] === 'function') {
          continue;
        }
        
        // 跳过事件相关属性（通常包含循环引用）
        if (key.includes('Event') || key.includes('Dispatcher')) {
          continue;
        }
        
        let value;
        try {
          value = obj[key];
        } catch (error) {
          value = '[Error: Cannot access property]';
        }
        
        // 检查循环引用
        if (value && typeof value === 'object' && visited.has(value)) {
          value = '[Circular Reference]';
        } else if (value && typeof value === 'object') {
          visited.add(value);
        }
        
        const type = this.getPropertyType(value);
        const expandable = this.isExpandable(value);
        const readonly = this.isReadonly(obj, key);
        
        // 安全序列化值
        const safeValue = this.safeSerialize(value);
        
        properties.push({
          name: key,
          value: safeValue,
          type: type,
          expandable: expandable,
          readonly: readonly
        });
      }
      
      // 按名称排序
      properties.sort((a, b) => a.name.localeCompare(b.name));
      
    } catch (error) {
      console.warn('Error getting node properties:', error);
    }
    
    return properties;
  }

  /**
   * 获取属性类型
   */
  private getPropertyType(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
  }

  /**
   * 判断属性是否可展开
   */
  private isExpandable(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'object') return true;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  }

  /**
   * 判断属性是否只读
   */
  private isReadonly(obj: any, key: string): boolean {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      return descriptor && !descriptor.writable;
    } catch (error) {
      return false;
    }
  }

  /**
   * 判断对象是否有子节点
   */
  private hasChildren(obj: any): boolean {
    if (!obj) return false;
    
    if (obj.numChildren !== undefined && typeof obj.numChildren === 'number') {
      return obj.numChildren > 0;
    }
    
    if (obj.children && Array.isArray(obj.children)) {
      return obj.children.length > 0;
    }
    
    return false;
  }

  /**
   * 判断对象是否可见
   */
  private isVisible(obj: any): boolean {
    if (!obj) return false;
    
    if (obj.visible !== undefined) {
      return Boolean(obj.visible);
    }
    
    if (obj.alpha !== undefined) {
      return obj.alpha > 0;
    }
    
    return true;
  }

  /**
   * 获取对象的哈希码
   */
  private getObjectHashCode(obj: any): string {
    if (!obj) return 'null';
    
    // 尝试获取 Egret 引擎的 hashCode
    if (obj.hashCode !== undefined) {
      return String(obj.hashCode);
    }
    
    // 使用对象引用作为备用方案
    return this.generateObjectId(obj);
  }

  /**
   * 生成对象ID
   */
  private generateObjectId(obj: any): string {
    if (!obj) return 'null';
    
    // 使用对象引用创建唯一ID
    const id = Math.random().toString(36).substr(2, 9);
    return `obj_${id}`;
  }

  /**
   * 生成UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 安全序列化值，避免循环引用
   */
  private safeSerialize(value: any, depth: number = 0): any {
    if (depth > 3) {
      return '[Max Depth Reached]';
    }
    
    if (value === null) return null;
    if (value === undefined) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'function') return '[Function]';
    
    if (Array.isArray(value)) {
      return value.slice(0, 10).map(item => this.safeSerialize(item, depth + 1));
    }
    
    if (typeof value === 'object') {
      try {
        // 尝试使用 JSON.stringify 进行安全序列化
        const serialized = JSON.stringify(value, (key, val) => {
          if (typeof val === 'function') return '[Function]';
          if (val && typeof val === 'object' && val.constructor && val.constructor.name) {
            return `[${val.constructor.name}]`;
          }
          return val;
        });
        return JSON.parse(serialized);
      } catch (error) {
        // 如果序列化失败，返回对象的基本信息
        return {
          type: value.constructor?.name || 'Object',
          keys: Object.keys(value).slice(0, 5)
        };
      }
    }
    
    return String(value);
  }
}