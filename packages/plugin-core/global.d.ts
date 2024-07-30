import { CurPlugin } from './src/plugin.js';

declare global {
  var __ldkCliPluginCore__: {
    curPlugin: CurPlugin;
  };
}
