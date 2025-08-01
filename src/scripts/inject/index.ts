import { Inspector } from "./inspector";
const inspector = new Inspector();
inspector.init();
window["EgretInspector"] = inspector;
