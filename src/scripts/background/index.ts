import { ChromeConst } from "cc-plugin/src/chrome/const";
import { debugLog, Page, PluginEvent } from "../../core/types";
import { Terminal } from "../terminal";
import { PortMan } from "./portMan";
import { portMgr } from "./portMgr";
const terminal = new Terminal(Page.Background);
debugLog && console.log(...terminal.init());
function isDevtools(port: chrome.runtime.Port) {
  const devtoolsUrl = `chrome-extension://${port.sender?.id}/${ChromeConst.html.devtools}`;
  if (port.sender?.url === devtoolsUrl) {
  }
}
function onTabConnect(tab: chrome.tabs.Tab, port: chrome.runtime.Port) {
  if (tab.id === undefined || tab.id <= 0) {
    debugger;
    return;
  }
  const portMan = portMgr.addPort(tab, port);
  portMan.init();
}
chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  if (port.name === Page.Devtools) {
    // devtool链接过来没有port.sender.tab
    chrome.tabs.query({ active: true }, (tabs: chrome.tabs.Tab[]) => {
      tabs.forEach((tab) => {
        onTabConnect(tab, port);
      });
    });
  } else {
    const tab: chrome.tabs.Tab | undefined = port.sender?.tab;
    if (tab) {
      onTabConnect(tab, port);
    }
  }
});
chrome.runtime.onMessage.addListener((request: PluginEvent, sender: any, sendResponse: any) => {
  const event = PluginEvent.create(request);
  const tabID = sender.tab.id;
  const portMan: PortMan | undefined = portMgr.findPort(tabID);
  if (portMan) {
    if (event.check(Page.Content, Page.Background)) {
      //  监听来自content.js发来的事件，将消息转发到devtools
      event.reset(Page.Background, Page.Devtools);
      // Message received 
      portMgr.sendDevtoolMsg(request, tabID);
    }
  }
});
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 页面发生刷新，通知重新生成数据
  if (changeInfo.status === "complete") {
    const { id } = tab;
    // -1为自己
    if (id && id > -1) {
      portMgr.useFrame(0, id);
    }
  }
});
