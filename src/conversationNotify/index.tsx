import {ExtensionWebExports} from "@moonlight-mod/types";


// upstream/source: https://git.slonk.ing/slonk/moonlight-extensions/src/branch/main/src/notificationContent/index.tsx
//

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    //async function(t,n,i,e,l){var o,u,r,s;
    find: 'invoke("NOTIFICATIONS_REMOVE_NOTIFICATIONS"',
    replace: {
      match: /showNotification:(require\(.+?|\i),/,
      replacement: `showNotification:require('conversationNotify_conversation').wrapExpr($1),`
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  conversation: {
    dependencies: []
  }
};
