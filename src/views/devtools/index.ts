import ccui from "@xuyanfeng/cc-ui";
import "@xuyanfeng/cc-ui/dist/ccui.css";
import "@xuyanfeng/cc-ui/iconfont/iconfont.css";
import CCP from "cc-plugin/src/ccp/entry-render";
import { createApp } from "vue";
import pluginConfig from "../../../cc-plugin.config";
import App from "./index.vue";
import { init } from "./register-panel";

export default CCP.init(pluginConfig, {
  ready: function (rootElement: any, args: any) {
    init();
    const app = createApp(App);
    app.use(ccui);
    app.mount(rootElement);
  },
}); 