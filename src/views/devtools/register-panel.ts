import CCP from "cc-plugin/src/ccp/entry-render";
import { ChromeConst } from "cc-plugin/src/chrome/const";

export function init() {
  if (chrome && chrome.devtools) {
    // 创建devtools-panel
    let iconPath = "";
    const { icon } = CCP.manifest;
    if (icon && icon["48"]) {
      iconPath = icon["48"];
    }
    
    chrome.devtools.panels.create(CCP.manifest.name, iconPath, ChromeConst.html.devtools, (panel: chrome.devtools.panels.ExtensionPanel) => {
      console.log("[Hello World Extension] DevTools Panel Created!");
      
      panel.onShown.addListener((window) => {
        // 面板显示
        console.log("DevTools Panel shown");
      });
      
      panel.onHidden.addListener(() => {
        // 面板隐藏
        console.log("DevTools Panel hidden");
      });
      
      panel.onSearch.addListener(function (action, query) {
        // ctrl+f 查找触发
        console.log("DevTools Panel search:", action, query);
      });
    });
  }
} 