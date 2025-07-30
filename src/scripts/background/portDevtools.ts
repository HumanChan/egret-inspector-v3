import { Msg, Page, PluginEvent, RequestUseFrameData, ResponseSupportData } from "../../core/types";
import { PortMan } from "./portMan";
import { portMgr } from "./portMgr";

export class PortDevtools extends PortMan {
  init(): void {
    this.onDisconnect = () => {
      portMgr.removePort(this);
    };
    
    this.onMessage = (data: PluginEvent) => {
      if (data.msg === Msg.RequestUseFrame) {
        // 因为devtool是定时器驱动，这里改变了content，后续就会将数据派发到对应的content中去
        portMgr.useFrame((data.data as RequestUseFrameData).id, this.tabID);
      } else {
        // 从devtools过来的消息统一派发到目标content中
        if (data.check(Page.Devtools, Page.Background)) {
          data.reset(Page.Background, Page.Content);
          const port = portMgr.getCurrentUsePort(this.tabID);
          if (port) {
            port.send(data);
          } else {
            const e = new PluginEvent(Page.Background, Page.Devtools, Msg.ResponseSupport, { support: false, msg: "disconnect with game, please refresh page" } as ResponseSupportData);
            this.send(e);
          }
        }
      }
    };
  }
} 