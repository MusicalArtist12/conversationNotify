import {ExtensionWebExports} from "@moonlight-mod/types";


// upstream/source: https://git.slonk.ing/slonk/moonlight-extensions/src/branch/main/src/notificationContent/index.tsx
//

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  conversation: {
    dependencies: [{ext: "notificationLib", id: "lib"}],
    entrypoint: true
  },

};
