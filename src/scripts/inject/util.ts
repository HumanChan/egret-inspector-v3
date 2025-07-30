/**
 * 注入脚本工具函数
 */

/**
 * 检查对象是否具有指定属性
 */
export function isHasProperty(obj: any, key: string): boolean {
  try {
    return obj.hasOwnProperty(key);
  } catch (error) {
    return false;
  }
}

/**
 * 安全获取对象属性
 */
export function safeGetProperty(obj: any, key: string): any {
  try {
    return obj[key];
  } catch (error) {
    return undefined;
  }
}

/**
 * 检查是否为有效值
 */
export function isValidValue(value: any): boolean {
  return value !== null && value !== undefined;
}

/**
 * 获取对象类型名称
 */
export function getObjectTypeName(obj: any): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj === 'function') return 'function';
  if (Array.isArray(obj)) return 'array';
  return obj.constructor?.name || typeof obj;
}

/**
 * 深度克隆对象
 */
export function deepClone(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * 格式化对象为字符串
 */
export function formatObject(obj: any, maxDepth: number = 3, currentDepth: number = 0): string {
  if (currentDepth >= maxDepth) {
    return '[Object]';
  }
  
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj === 'string') return `"${obj}"`;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  
  if (Array.isArray(obj)) {
    const items = obj.slice(0, 10).map(item => formatObject(item, maxDepth, currentDepth + 1));
    const suffix = obj.length > 10 ? `... (${obj.length} items)` : '';
    return `[${items.join(', ')}${suffix}]`;
  }
  
  if (typeof obj === 'object') {
    const keys = Object.keys(obj).slice(0, 10);
    const items = keys.map(key => `${key}: ${formatObject(obj[key], maxDepth, currentDepth + 1)}`);
    const suffix = Object.keys(obj).length > 10 ? `... (${Object.keys(obj).length} properties)` : '';
    return `{${items.join(', ')}${suffix}}`;
  }
  
  return String(obj);
}

/**
 * 生成唯一ID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 防抖函数
 */
export function debounce(func: Function, wait: number): Function {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 */
export function throttle(func: Function, limit: number): Function {
  let inThrottle: boolean;
  return function executedFunction(...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
} 