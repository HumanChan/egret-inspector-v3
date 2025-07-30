// @ts-ignore
import { CocosPluginManifest, CocosPluginOptions, Panel } from "cc-plugin/src/declare";

const pkgName = "egret-inspector";

function i18n(key: string) {
  return `i18n:${pkgName}.${key}`;
}

const manifest: CocosPluginManifest = {
  name: pkgName,
  version: "1.0.0",
  description: "A Chrome extension debug tool for Egret Engine, providing real-time debugging and performance monitoring for Egret game developers",
  author: "Egret Inspector Team",
  main: "./src/main.ts",
  panels: [
    {
      name: "main",
      type: Panel.Type.DockAble,
      main: "./src/panel/index.ts",
      title: "Egret Inspector",
      width: 500,
      height: 400,
      minWidth: 300,
      minHeight: 200,
    },
  ],
  menus: [
    {
      path: `${pkgName}/${i18n("title")}`,
      message: {
        name: "showPanel",
      },
    },
  ],
  i18n_en: "./src/i18n/en.ts",
  i18n_zh: "./src/i18n/zh.ts",
  icon: {
    "48": "./icons/48.png",
  },
  chrome: {
    version: 3,
    pem: "./crx-key.pem",
    view_devtools: "src/views/devtools/index.ts",
    view_popup: "src/views/popup/index.ts",
    view_options: "src/views/options/index.ts",
    script_background: "src/scripts/background/index.ts",
    script_content: "src/scripts/content/index.ts",
    script_inject: "src/scripts/inject/index.ts",
  },
};

const options: CocosPluginOptions = {
  server: {
    enabled: true,
    port: 2023,
    https: false,
    writeToDisk: true,
  },
  watchBuild: true,
  outputProject: {
    chrome: "./chrome",
  },
};

export default { manifest, options }; 