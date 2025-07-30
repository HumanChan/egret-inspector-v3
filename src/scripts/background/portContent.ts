import { PluginEvent } from "../../core/types";
import { PortMan } from "./portMan";
import { portMgr } from "./portMgr";

export class PortContent extends PortMan {
  protected frameID: number = 0;
  
  constructor(tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
    super(tab, port);
    this.frameID = port.sender.frameId || 0;
  }
  
  getFrameDetais(): any {
    return {
      tabID: this.tabID,
      url: this.url,
      frameID: this.frameID,
    };
  }
  
  init(): void {
    // 新的content连上来，需要更新devtools
    this.onDisconnect = (disPort: chrome.runtime.Port) => {
      // content失去链接需要更新Devtools
      portMgr.removePort(this);
      if (portMgr.tabUseFrameID[this.tabID] === this.frameID) {
        portMgr.useFrame(0, this.tabID);
      }
    };
    
    this.onMessage = (data: PluginEvent) => {
      // content的数据一般都是要同步到devtools
      if (data.isTargetDevtools()) {
        portMgr.sendDevtoolMsg(data, this.tabID);
      } else {
        debugger;
      }
    };
  }
} 