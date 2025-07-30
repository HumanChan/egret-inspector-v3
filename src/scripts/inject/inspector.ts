// eval 注入脚本的代码,变量尽量使用var,后来发现在import之后,let会自动变为var
import { Msg, PluginEvent, RequestLogData, RequestNodeInfoData, RequestSetPropertyData, ResponseNodeInfoData, ResponseSetPropertyData, ResponseSupportData, ResponseTreeInfoData } from "../../core/types";
import { InjectEvent } from "./event";

// 全局类型声明
declare global {
  interface Window {
    egret?: any;
    lark?: any;
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
    this.sendMsgToContent(Msg.ResponseSupport, { support: b, msg: "" } as ResponseSupportData);
  }

  updateTreeInfo() {
    let isEgretGame = this._isEgretGame();
    if (isEgretGame) {
      // 暂时返回空的树数据，后续实现具体的节点树获取
      const treeData = {
        nodes: [],
        timestamp: Date.now()
      };
      this.sendMsgToContent(Msg.ResponseTreeInfo, treeData as ResponseTreeInfoData);
    } else {
      this.sendMsgToContent(Msg.ResponseTreeInfo, { nodes: [], timestamp: Date.now() } as ResponseTreeInfoData);
    }
  }

  _isEgretGame() {
    try {
      return !!(window.egret && (window.egret.Sprite || window.egret.getQualifiedClassName));
    } catch (error) {
      return false;
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
}

// 创建全局实例并初始化
const inspector = new Inspector();
inspector.init(); 