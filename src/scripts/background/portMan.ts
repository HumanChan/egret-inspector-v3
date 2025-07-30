import { debugLog, Page, PluginEvent } from "../../core/types";
import { Terminal } from "../terminal";

export abstract class PortMan {
  /**
   * port的名字标识
   */
  public name: string = Page.None;
  /**
   * tab.id作为唯一标识
   */
  public tabID: number | null = null;
  public title: string = "";
  public url: string = "";
  public port: chrome.runtime.Port | null = null;
  public tab: chrome.tabs.Tab | null = null;
  public onDisconnect: (port: chrome.runtime.Port) => void | null = null;
  public onMessage: (data: PluginEvent) => void | null = null;
  public terminal: Terminal = null;
  public timestamp: number = 0;
  
  constructor(tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
    this.timestamp = Date.now();
    this.port = port;
    this.tab = tab;
    this.name = port.name;
    this.tabID = tab.id || null;
    this.url = port.sender?.url || "";
    this.title = tab.title || "";
    this.terminal = new Terminal(`Port-${this.name}`);
    
    port.onMessage.addListener((data: any, port: chrome.runtime.Port) => {
      const event = PluginEvent.create(data);
      debugLog && console.log(...this.terminal.chunkMessage(event.toChunk()));
      if (event.valid && this.onMessage) {
        this.onMessage(event);
      } else {
        debugLog && console.log(...this.terminal.log(JSON.stringify(data)));
      }
    });
    
    port.onDisconnect.addListener((port: chrome.runtime.Port) => {
      debugLog && console.log(...this.terminal.disconnect(""));
      if (this.onDisconnect) {
        this.onDisconnect(port);
      }
    });
  }
  
  abstract init(): void;

  isContent() {
    return this.name === Page.Content;
  }
  
  isDevtools() {
    return this.name === Page.Devtools;
  }
  
  isUseing(id: number) {
    if (!this.port) {
      return false;
    }
    if (!this.port.sender) {
      return false;
    }
    if (this.port.sender.frameId === undefined) {
      return false;
    }
    return this.port.sender.frameId === id;
  }
  
  send(data: PluginEvent) {
    if (this.port) {
      this.port.postMessage(data);
    }
  }
} 