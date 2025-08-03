// eval 注入脚本的代码,变量尽量使用var,后来发现在import之后,let会自动变为var
import { Msg, PluginEvent, RequestLogData, RequestNodeInfoData, RequestSetPropertyData, ResponseNodeInfoData, ResponseSetPropertyData, ResponseSupportData, ResponseTreeInfoData } from "../../core/types";
import { InjectEvent } from "./event";
import { DataType } from "../../views/devtools/data";

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
    }, 100);
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
        // RequestSetProperty received
        
        if (data.nodeId && data.propertyPath && data.value !== undefined) {
          const success = this.setNodeProperty(data.nodeId, data.propertyPath, data.value);
          
          // 发送响应
          const responseData = {
            success: success,
            nodeId: data.nodeId,
            propertyPath: data.propertyPath,
            value: data.value
          };
          
          this.sendMsgToContent(Msg.ResponseSetProperty, responseData);
          
          if (success) {
            // Property set successfully
          } else {
            console.warn('Failed to set property:', data.propertyPath.join('.'), '=', data.value);
          }
        } else {
          console.warn('Invalid RequestSetProperty data:', data);
          this.sendMsgToContent(Msg.ResponseSetProperty, {
            success: false,
            error: 'Invalid data'
          });
        }
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
    // Inspector initialized
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
    try {
      // Getting node info for uuid
      
      // 从存储中查找节点对象
      const node = this.inspectorGameMemoryStorage[uuid];
      if (!node) {
        console.warn('Node not found:', uuid);
        const nodeInfo = {
          uuid: uuid,
          properties: [],
          timestamp: Date.now()
        };
        this.sendMsgToContent(Msg.ResponseNodeInfo, nodeInfo as ResponseNodeInfoData);
        return;
      }

      // Found node

      // 获取节点属性
      const properties = this.getNodeProperties(node);
      
      const nodeInfo = {
        uuid: uuid,
        properties: properties,
        timestamp: Date.now()
      };
      
      // Node info for uuid
      this.sendMsgToContent(Msg.ResponseNodeInfo, nodeInfo as ResponseNodeInfoData);
    } catch (error) {
      console.error('Error getting node info:', error);
      const nodeInfo = {
        uuid: uuid,
        properties: [],
        timestamp: Date.now()
      };
      this.sendMsgToContent(Msg.ResponseNodeInfo, nodeInfo as ResponseNodeInfoData);
    }
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
   * 设置节点属性
   */
  setNodeProperty(nodeId: string, propertyPath: string[], value: any): boolean {
    try {
      // setNodeProperty called
      
      // 从存储中获取节点对象
      const node = this.inspectorGameMemoryStorage[nodeId];
      if (!node) {
        console.warn('Node not found:', nodeId);
        return false;
      }

      // Found node
      // Node type and constructor info

      // 验证属性值
      if (!this.validatePropertyValue(propertyPath[0], value)) {
        console.warn('Invalid property value:', propertyPath[0], value);
        return false;
      }

      // 设置属性值
      let currentObj = node;
      for (let i = 0; i < propertyPath.length - 1; i++) {
        currentObj = currentObj[propertyPath[i]];
        if (!currentObj) {
          console.warn('Property path not found:', propertyPath);
          return false;
        }
      }

      const propertyName = propertyPath[propertyPath.length - 1];
      
      // 特殊处理 Egret 引擎的属性
      if (propertyName === 'visible') {
        // Setting visible property
        // 确保设置的是布尔值
        const boolValue = Boolean(value);
        currentObj[propertyName] = boolValue;
        
        // 对于 Egret 引擎，可能还需要设置 $visible
        if (currentObj.$visible !== undefined) {
          currentObj.$visible = boolValue;
          // Also set $visible
        }
        
        // Visible property set successfully
      } else if (propertyName.toLowerCase().includes('color') || propertyName === 'tintRGB') {
        // Setting color property
        // 确保颜色值是有效的数字
        const colorValue = parseInt(value);
        if (!isNaN(colorValue)) {
          currentObj[propertyName] = colorValue;
          
          // 对于 Egret 引擎，可能还需要设置相关的颜色属性
          if (propertyName === 'tintRGB' && currentObj._tint !== undefined) {
            currentObj._tint = colorValue;
            // Also set _tint
          }
          
          // Color property set successfully
        } else {
          console.warn('Invalid color value:', value);
          return false;
        }
      } else {
        currentObj[propertyName] = value;
      }

      // Property updated successfully
      
      return true;
    } catch (error) {
      console.error('Error setting property:', error);
      console.error('Error stack:', error.stack);
      return false;
    }
  }

  /**
   * 验证属性值
   */
  private validatePropertyValue(propertyName: string, value: any): boolean {
    switch (propertyName) {
      case 'x':
      case 'y':
        return typeof value === 'number';
      case 'width':
      case 'height':
        return typeof value === 'number' && value >= 0;
      case 'scaleX':
      case 'scaleY':
        return typeof value === 'number';
      case 'rotation':
        return typeof value === 'number';
      case 'alpha':
        return typeof value === 'number' && value >= 0 && value <= 1;
      case 'visible':
        return typeof value === 'boolean';
      case 'touchEnabled':
      case 'touchChildren':
      case 'mouseEnabled':
      case 'mouseChildren':
        return typeof value === 'boolean';
      case 'name':
        return typeof value === 'string';
      default:
        // 检查是否为颜色属性
        if (propertyName.toLowerCase().includes('color') || propertyName === 'tintRGB') {
          return typeof value === 'number' && value >= 0 && value <= 0xFFFFFF;
        }
        return true; // 其他属性不做严格验证
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
      const uuid = this.generateUUID();
      const nodeHashCode = this.getObjectHashCode(node);
      
      const nodeInfo = {
        id: nodeHashCode,
        name: node.name || this.getDisplayName(node),
        type: this.getDisplayName(node),
        uuid: uuid,
        children: [],
        properties: this.getNodeProperties(node),
        expandable: this.hasChildren(node),
        visible: this.isVisible(node),
        depth: depth
      };
      
      // 存储节点对象到内存中，以便后续获取属性
      this.inspectorGameMemoryStorage[uuid] = node;
              // Stored node in memory
      
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
      // getNodeProperties: obj is not an object
      return properties;
    }

    try {
      // 获取对象自身的属性
      const ownKeys = Object.getOwnPropertyNames(obj);
      // getNodeProperties: own keys
      
      // 获取原型链上的属性
      let prototype = Object.getPrototypeOf(obj);
      const prototypeKeys: string[] = [];
      while (prototype && prototype !== Object.prototype) {
        const protoKeys = Object.getOwnPropertyNames(prototype);
        prototypeKeys.push(...protoKeys);
        prototype = Object.getPrototypeOf(prototype);
      }
      // getNodeProperties: prototype keys
      
      // 合并所有属性，去重
      const allKeys = [...new Set([...ownKeys, ...prototypeKeys])];
      // getNodeProperties: all keys
      
      for (const key of allKeys) {
        // 跳过私有属性（但不跳过Egret的内部属性）
        if (key.startsWith('_') && !key.startsWith('$')) {
          continue;
        }
        
        // 跳过事件相关属性（通常包含循环引用）
        // 但保留函数类型的属性，因为它们可能是有用的方法
        if ((key.includes('Event') || key.includes('Dispatcher')) && typeof obj[key] !== 'function') {
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
          continue; // 直接跳过循环引用的属性
        } else if (value && typeof value === 'object') {
          visited.add(value);
        }
        
        // 跳过纯对象类型（但保留数组和函数）
        if (value && typeof value === 'object' && !Array.isArray(value) && typeof value !== 'function') {
          continue;
        }
        
        const type = this.getPropertyType(value, key);
        const expandable = this.isExpandable(value);
        const readonly = this.isReadonly(obj, key);
        
        // 安全序列化值
        const safeValue = this.safeSerialize(value);
        
        properties.push({
          name: key,
          value: safeValue,
          type: type,
          expandable: expandable,
          readonly: readonly,
          path: [key]
        });
      }
      
      // 按属性分类排序
      properties.sort((a, b) => {
        const orderA = this.getPropertyOrder(a.name);
        const orderB = this.getPropertyOrder(b.name);
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.name.localeCompare(b.name);
      });
      
      // getNodeProperties: returning properties
      
    } catch (error) {
      console.warn('Error getting node properties:', error);
    }
    
    return properties;
  }

  /**
   * 获取属性显示顺序
   */
  private getPropertyOrder(propertyName: string): number {
    const transformProps = ['$x', '$y', '$scaleX', '$scaleY', '$rotation', '$skewX', '$skewY', '$anchorOffsetX', '$anchorOffsetY', 'x', 'y', 'scaleX', 'scaleY', 'rotation'];
    const displayProps = ['$alpha', '$visible', '$blendMode', '$tintRGB', '_tint', 'alpha', 'visible', 'blendMode'];
    const layoutProps = ['$mask', '$scrollRect', '$cacheAsBitmap', '$cacheDirty', 'mask', 'scrollRect', 'cacheAsBitmap'];
    const interactionProps = ['$touchEnabled', '$inputEnabled', 'touchEnabled', 'inputEnabled'];
    const containerProps = ['$children', '$parent', '$stage', '$nestLevel', 'children', 'parent', 'stage'];
    
    if (transformProps.includes(propertyName)) return 1;
    if (displayProps.includes(propertyName)) return 2;
    if (layoutProps.includes(propertyName)) return 3;
    if (interactionProps.includes(propertyName)) return 4;
    if (containerProps.includes(propertyName)) return 5;
    return 6; // 自定义属性
  }

  /**
   * 获取属性类型
   */
  private getPropertyType(value: any, propertyName?: string): DataType {
    if (value === null) return DataType.Null;
    if (value === undefined) return DataType.Undefined;
    if (typeof value === 'string') return DataType.String;
    if (typeof value === 'number') {
      // 检查是否为颜色属性
      if (propertyName && propertyName.toLowerCase().includes('color')) {
        return DataType.Color;
      }
      return DataType.Number;
    }
    if (typeof value === 'boolean') return DataType.Boolean;
    if (typeof value === 'function') return DataType.Function;
    if (Array.isArray(value)) return DataType.Array;
    if (typeof value === 'object') return DataType.Object;
    return DataType.Invalid;
  }

  /**
   * 判断属性是否可展开
   */
  private isExpandable(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'function') return false;
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
    if (typeof value === 'function') {
      // 尝试获取函数名称
      const funcName = value.name || 'anonymous';
      return `[Function: ${funcName}]`;
    }
    
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