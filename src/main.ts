import CCP from "cc-plugin/src/ccp/entry-main";
import { BuilderOptions } from "cc-plugin/src/declare";
import pluginConfig from "../cc-plugin.config";

CCP.init(pluginConfig, {
  load: () => {
    // Egret Inspector loaded successfully
  },
  builder: {
    onAfterBuild(target: BuilderOptions) {
      // Build completed for target
    },
  },
  messages: {
    showPanel() {
      CCP.Adaptation.Panel.open("self.main");
    },
  },
}); 