import { TinyEmitter } from "tiny-emitter";
import { debugLog, Msg, Page, PluginEvent } from "../../core/types";
import { Terminal } from "../../scripts/terminal";

export type BridgeCallback = (data: PluginEvent, sender: chrome.runtime.Port) => void;

if (chrome.devtools) {
  console.log("chrome devtools");
}

class Bridge {
  private emitter = new TinyEmitter();
  /**
   * 和background建立的链接
   */
  private connect: chrome.runtime.Port | null = null;
  private terminal = new Terminal(Page.Devtools);
  
  constructor() {
    this.init();
  }

  private init() {
    this.connect = chrome.runtime.connect({ name: Page.Devtools });
    this.connect.onDisconnect.addListener(() => {
      debugLog && console.log(...this.terminal.disconnect(""));
      this.connect = null;
    });

    this.connect.onMessage.addListener((event, sender: chrome.runtime.Port) => {
      const data = PluginEvent.create(event);
      debugLog && console.log(...this.terminal.chunkMessage(data.toChunk()));
      if (data.valid && data.isTargetDevtools()) {
        this.emitter.emit(data.msg, data);
      } else {
        console.log(JSON.stringify(event));
        debugger;
      }
    });
  }
  
  on(msg: Msg, callback: (data: PluginEvent) => void) {
    this.emitter.on(msg, callback);
  }
  
  recv(event: PluginEvent): void {
    this.emit(event);
  }
  
  emit(data: PluginEvent) {
    this.emitter.emit(data.msg, data);
  }
  
  send(msg: Msg, data?: any) {
    if (this.connect) {
      let sendData = new PluginEvent(Page.Devtools, Page.Background, msg, data);
      this.connect.postMessage(sendData);
    } else {
      console.warn(...this.terminal.log("重新和background建立链接"));
      this.init();
      this.send(msg, data);
    }
  }
}

export const bridge = new Bridge(); 