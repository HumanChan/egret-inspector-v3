import CCP from "cc-plugin/src/ccp/entry-main";
import { BuilderOptions } from "cc-plugin/src/declare";
import pluginConfig from "../cc-plugin.config";

CCP.init(pluginConfig, {
  load: () => {
    console.log("Egret Inspector loaded successfully!");
  },
  builder: {
    onAfterBuild(target: BuilderOptions) {
      console.log(`Build completed for target: ${target}`);
    },
  },
  messages: {
    showPanel() {
      CCP.Adaptation.Panel.open("self.main");
    },
  },
}); 