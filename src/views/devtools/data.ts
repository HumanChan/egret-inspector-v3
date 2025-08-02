/**
 * DevTools 数据模型
 */

// 基础数据类型
export enum DataType {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Object = "object",
  Array = "array",
  Function = "function",
  Null = "null",
  Undefined = "undefined",
  Color = "color",
  Vec2 = "vec2",
  Vec3 = "vec3",
  Vec4 = "vec4",
  Image = "image",
  Circle = "circle",
  Invalid = "invalid"
}

// 基础数据接口
export interface BaseData {
  type: DataType;
  value: any;
  path: string[];
}

// 字符串数据
export interface StringData extends BaseData {
  type: DataType.String;
  value: string;
}

// 数字数据
export interface NumberData extends BaseData {
  type: DataType.Number;
  value: number;
}

// 布尔数据
export interface BoolData extends BaseData {
  type: DataType.Boolean;
  value: boolean;
}

// 对象数据
export interface ObjectData extends BaseData {
  type: DataType.Object;
  value: Record<string, any>;
  properties: Property[];
}

// 数组数据
export interface ArrayData extends BaseData {
  type: DataType.Array;
  value: any[];
  length: number;
}

// 函数数据
export interface FunctionData extends BaseData {
  type: DataType.Function;
  value: Function;
  name: string;
  parameters: string[];
}

// 颜色数据
export interface ColorData extends BaseData {
  type: DataType.Color;
  value: string;
  r: number;
  g: number;
  b: number;
  a: number;
}

// 向量数据
export interface Vec2Data extends BaseData {
  type: DataType.Vec2;
  value: { x: number; y: number };
  x: number;
  y: number;
}

export interface Vec3Data extends BaseData {
  type: DataType.Vec3;
  value: { x: number; y: number; z: number };
  x: number;
  y: number;
  z: number;
}

export interface Vec4Data extends BaseData {
  type: DataType.Vec4;
  value: { x: number; y: number; z: number; w: number };
  x: number;
  y: number;
  z: number;
  w: number;
}

// 图片数据
export interface ImageData extends BaseData {
  type: DataType.Image;
  value: string;
  width: number;
  height: number;
  src: string;
}

// 圆形数据
export interface ObjectCircleData extends BaseData {
  type: DataType.Circle;
  value: { x: number; y: number; radius: number };
  x: number;
  y: number;
  radius: number;
}

// 无效数据
export interface InvalidData extends BaseData {
  type: DataType.Invalid;
  value: any;
  error: string;
}

// 引擎数据
export interface EngineData extends BaseData {
  type: DataType.Object;
  value: any;
  engineType: string;
  version: string;
  features: string[];
}

// 分组数据
export interface Group {
  name: string;
  properties: Property[];
}

// 属性数据
export interface Property {
  name: string;
  value: any;
  type: DataType;
  path: string[];
  isGetter: boolean;
  isSetter: boolean;
  isPrivate: boolean;
  expandable: boolean;
  readonly: boolean;
}

// 信息数据
export interface Info {
  name: string;
  value: any;
  type: DataType;
  path: string[];
  expandable: boolean;
  readonly: boolean;
}

// 节点信息数据
export interface NodeInfoData {
  uuid: string;
  name: string;
  type: string;
  properties: Property[];
  children: NodeInfoData[];
  timestamp: number;
}

// 帧详情数据
export interface FrameDetails {
  tabID: number;
  url: string;
  frameID: number;
}

// 构建选项
export interface BuildVecOptions {
  value: any;
  path: string[];
  data: any;
}

export interface BuildImageOptions {
  value: any;
  path: string[];
  data: any;
}

export interface BuildObjectOptions {
  value: any;
  path: string[];
  data: any;
}

export interface BuildArrayOptions {
  value: any[];
  path: string[];
  data: any;
  keys: string[];
}

// 适配cc-ui的树形数据结构
export class TreeData {
  id: string = "";
  active: boolean = true;
  text: string = "";
  children: TreeData[] = [];

  constructor(id: string = "", text: string = "") {
    this.id = id;
    this.text = text;
  }

  // 从NodeInfoData转换为TreeData
  static fromNodeInfo(nodeInfo: NodeInfoData): TreeData {
    console.log('fromNodeInfo called with:', nodeInfo);
    
    const treeData = new TreeData(nodeInfo.uuid, nodeInfo.name);
    treeData.active = true;
    treeData.id = nodeInfo.uuid; // 确保 id 被正确设置
    
    console.log('Created TreeData:', treeData);

    // 递归转换子节点
    if (nodeInfo.children && nodeInfo.children.length > 0) {
      treeData.children = nodeInfo.children.map(child => TreeData.fromNodeInfo(child));
    }

    return treeData;
  }

  // 从TreeData数组转换为cc-ui需要的格式
  static fromTreeDataArray(treeDataArray: TreeData[]): TreeData[] {
    return treeDataArray.map(item => {
      const treeData = new TreeData(item.id, item.text);
      treeData.active = item.active;
      treeData.children = TreeData.fromTreeDataArray(item.children);
      return treeData;
    });
  }

  // 从扁平数组构建树形结构
  static buildTreeFromFlatArray(nodes: NodeInfoData[]): TreeData[] {
    console.log('buildTreeFromFlatArray called with nodes:', nodes);
    
    const nodeMap = new Map<string, NodeInfoData>();
    const rootNodes: NodeInfoData[] = [];

    // 创建节点映射
    nodes.forEach(node => {
      nodeMap.set(node.uuid, node);
    });

    // 构建树形结构
    nodes.forEach(node => {
      // 这里假设根节点没有父节点，或者通过其他方式识别
      // 暂时将所有节点作为根节点处理
      rootNodes.push(node);
    });

    const result = rootNodes.map(node => TreeData.fromNodeInfo(node));
    console.log('buildTreeFromFlatArray result:', result);
    return result;
  }
} 