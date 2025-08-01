/**
 * 节点树处理类
 */

export interface PropertyInfo {
  name: string;
  value: any;
  type: string;
  expandable: boolean;
  readonly: boolean;
}

export interface TreeNode {
  id: string;
  name: string;
  type: string;
  uuid: string;
  children: TreeNode[];
  properties: PropertyInfo[];
  parent: TreeNode | null;
  expandable: boolean;
  visible: boolean;
  depth: number;
}

export class TreeNodeParser {
  private static nodeCache = new Map<string, TreeNode>();

  static getDisplayName(obj: any): string {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj === 'number') return String(obj);
    
    if (window.egret && window.egret.getQualifiedClassName) {
      try {
        return window.egret.getQualifiedClassName(obj);
      } catch (error) {
        // 忽略错误
      }
    }
    
    if (obj.constructor && obj.constructor.name) {
      return obj.constructor.name;
    }
    
    return typeof obj;
  }

  static getNodeProperties(obj: any): PropertyInfo[] {
    const properties: PropertyInfo[] = [];
    
    if (!obj || typeof obj !== 'object') {
      return properties;
    }

    try {
      const keys = Object.getOwnPropertyNames(obj);
      
      for (const key of keys) {
        if (key.startsWith('_') || key.startsWith('$')) {
          continue;
        }
        
        if (typeof obj[key] === 'function') {
          continue;
        }
        
        let value;
        try {
          value = obj[key];
        } catch (error) {
          value = '[Error: Cannot access property]';
        }
        
        const type = this.getPropertyType(value);
        const expandable = this.isExpandable(value);
        const readonly = this.isReadonly(obj, key);
        
        properties.push({
          name: key,
          value: value,
          type: type,
          expandable: expandable,
          readonly: readonly
        });
      }
      
      properties.sort((a, b) => a.name.localeCompare(b.name));
      
    } catch (error) {
      console.warn('Error getting node properties:', error);
    }
    
    return properties;
  }

  private static getPropertyType(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
  }

  private static isExpandable(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'object') return true;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  }

  private static isReadonly(obj: any, key: string): boolean {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      return descriptor && !descriptor.writable;
    } catch (error) {
      return false;
    }
  }

  static parseNode(obj: any, depth: number = 0): TreeNode | null {
    if (!obj) return null;
    
    try {
      const hashCode = this.getObjectHashCode(obj);
      
      if (this.nodeCache.has(hashCode)) {
        return this.nodeCache.get(hashCode)!;
      }
      
      const displayName = this.getDisplayName(obj);
      const uuid = this.generateUUID();
      
      const node: TreeNode = {
        id: hashCode,
        name: obj.name || displayName,
        type: displayName,
        uuid: uuid,
        children: [],
        properties: [],
        parent: null,
        expandable: false,
        visible: this.isVisible(obj),
        depth: depth
      };
      
      this.nodeCache.set(hashCode, node);
      
      if (depth < 3) {
        this.parseChildren(obj, node, depth + 1);
      }
      
      node.properties = this.getNodeProperties(obj);
      
      return node;
      
    } catch (error) {
      console.warn('Error parsing node:', error);
      return null;
    }
  }

  static parseChildren(obj: any, parentNode: TreeNode, depth: number = 0): void {
    try {
      if (obj.numChildren !== undefined && typeof obj.numChildren === 'number') {
        const numChildren = obj.numChildren;
        parentNode.expandable = numChildren > 0;
        
        for (let i = 0; i < numChildren && i < 100; i++) {
          try {
            const child = obj.getChildAt(i);
            if (child) {
              const childNode = this.parseNode(child, depth);
              if (childNode) {
                childNode.parent = parentNode;
                parentNode.children.push(childNode);
              }
            }
          } catch (error) {
            console.warn(`Error getting child at index ${i}:`, error);
          }
        }
      }
      else if (obj.children && Array.isArray(obj.children)) {
        parentNode.expandable = obj.children.length > 0;
        
        for (let i = 0; i < obj.children.length && i < 100; i++) {
          const child = obj.children[i];
          if (child) {
            const childNode = this.parseNode(child, depth);
            if (childNode) {
              childNode.parent = parentNode;
              parentNode.children.push(childNode);
            }
          }
        }
      }
      
    } catch (error) {
      console.warn('Error parsing children:', error);
    }
  }

  private static getObjectHashCode(obj: any): string {
    if (!obj) return 'null';
    
    if (obj.hashCode !== undefined) {
      return String(obj.hashCode);
    }
    
    return this.generateObjectId(obj);
  }

  private static generateObjectId(obj: any): string {
    if (!obj) return 'null';
    const id = Math.random().toString(36).substr(2, 9);
    return `obj_${id}`;
  }

  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private static isVisible(obj: any): boolean {
    if (!obj) return false;
    
    if (obj.visible !== undefined) {
      return Boolean(obj.visible);
    }
    
    if (obj.alpha !== undefined) {
      return obj.alpha > 0;
    }
    
    return true;
  }

  static clearCache(): void {
    this.nodeCache.clear();
  }

  static getRootNode(): TreeNode | null {
    try {
      if (window.egret && window.egret.MainContext && window.egret.MainContext.instance) {
        const stage = window.egret.MainContext.instance.stage;
        if (stage) {
          return this.parseNode(stage, 0);
        }
      }
      
      if (window.lark_stages && window.lark_stages.length > 0) {
        const stage = window.lark_stages[0];
        if (stage) {
          return this.parseNode(stage, 0);
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Error getting root node:', error);
      return null;
    }
  }
}
