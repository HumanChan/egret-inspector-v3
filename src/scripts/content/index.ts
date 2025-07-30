/**
 * Chrome扩展内容脚本
 * 负责检测白鹭引擎、注入调试脚本、建立通信连接
 */

import { debugLog, Msg, Page, PluginEvent, ResponseSupportData } from "../../core/types";
import { DocumentEvent } from "../const";
import { Terminal } from "../terminal";

const terminal = new Terminal(Page.Content);
debugLog && console.log(...terminal.init());

// #region 注入脚本
export function injectScript(url: string) {
  if (chrome && chrome.runtime && chrome.runtime.getURL) {
    let content = chrome.runtime.getURL(url);
    const script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", content);
    script.onload = function () {
      document.head.removeChild(script);
    };
    document.head.appendChild(script);
    debugLog && console.log(...terminal.green(`inject script success: ${content}`));
  } else {
    debugLog && console.log(...terminal.red("inject script failed"));
  }
}

// #region 和Inject通讯
document.addEventListener(DocumentEvent.Inject2Content, (event: CustomEvent) => {
  try {
    let data: PluginEvent = PluginEvent.create(event.detail);
    if (data.valid && data.check(Page.Inject, Page.Content)) {
      debugLog && console.log(...terminal.chunkMessage(data.toChunk()));
      data.reset(Page.Content, Page.Devtools);
      if (connect) {
        // 接受来自inject.js的消息数据,然后中转到background.js
        connect.postMessage(data);
      } else {
        debugLog && console.log(...terminal.log(`connect is null`));
        console.error("Connection not available");
      }
    } else {
      console.error(`Invalid data received: ${event.detail}`);
    }
  } catch (error) {
    console.error("Error handling inject message:", error);
  }
});

// #region 和background通讯
let connect: chrome.runtime.Port | null = null;

function establishConnection() {
  try {
    connect = chrome.runtime.connect({ name: Page.Content });
    connect.onDisconnect.addListener(() => {
      debugLog && console.log(...terminal.disconnect(""));
      connect = null;
    });

    connect.onMessage.addListener((data: PluginEvent, sender: chrome.runtime.Port) => {
      const event = PluginEvent.create(data);
      if (event.valid && event.check(Page.Background, Page.Content)) {
        debugLog && console.log(...terminal.chunkMessage(event.toChunk()));
        event.reset(Page.Content, Page.Inject);
        const e = new CustomEvent(DocumentEvent.Content2Inject, { detail: event });
        debugLog && console.log(...terminal.chunkSend(event.toChunk()));
        document.dispatchEvent(e);
      } else {
        console.error(`Invalid data received: ${data}`);
      }
    });
  } catch (error) {
    console.error("Failed to establish connection:", error);
  }
}

// 建立连接
establishConnection();

function checkGame() {
  try {
    let gameCanvas = document.querySelector("#GameCanvas");
    const sendData = new PluginEvent(Page.Content, Page.Devtools, Msg.ResponseSupport, {
      support: !!gameCanvas,
      msg: "",
    } as ResponseSupportData);
    if (connect) {
      connect.postMessage(sendData);
    } else {
      debugLog && console.log(...terminal.log(`connect is null`));
      console.error("Connection not available for game check");
    }
  } catch (error) {
    console.error("Error checking game:", error);
  }
}

injectScript("inject.js");
// checkGame(); 