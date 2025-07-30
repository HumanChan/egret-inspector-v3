import { debugLog, Msg, Page, PluginEvent } from "../../core/types";
import { DocumentEvent } from "../const";
import { Terminal } from "../terminal";

export class InjectEvent {
  protected terminal = new Terminal("Inject ");
  
  constructor() {
    document.addEventListener(DocumentEvent.Content2Inject, (event: CustomEvent) => {
      const pluginEvent: PluginEvent = PluginEvent.create(event.detail);
      debugLog && console.log(...this.terminal.chunkMessage(pluginEvent.toChunk()));
      this.onMessage(pluginEvent);
    });
  }
  
  onMessage(data: PluginEvent) {}
  
  sendMsgToContent(msg: Msg, data: any) {
    const detail = new PluginEvent(Page.Inject, Page.Content, msg, data);
    debugLog && console.log(...this.terminal.chunkSend(detail.toChunk()));
    const event = new CustomEvent(DocumentEvent.Inject2Content, { detail });
    document.dispatchEvent(event);
  }
} 