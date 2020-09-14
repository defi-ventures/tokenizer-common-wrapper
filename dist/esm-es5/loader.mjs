import { b as bootstrapLazy } from './index-f2b0e712.js';
import { a as patchEsm } from './patch-78dfdf7d.js';
var defineCustomElements = function (win, options) {
    if (typeof window === 'undefined')
        return Promise.resolve();
    return patchEsm().then(function () {
        return bootstrapLazy([["tok-header", [[1, "tok-header", { "sideMenu": [4, "side-menu"], "logoHref": [1, "logo-href"], "apps": [16], "pageTitle": [1, "page-title"], "isAppsMenuOpen": [32], "isSideMenuOpen": [32] }, [[0, "close", "closeHandler"]]]]], ["tok-apps-side-menu_4", [[1, "tok-apps-side-menu", { "showDisabled": [4, "show-disabled"], "apps": [32], "common": [32] }], [4, "tok-content"], [1, "tok-footer", { "social": [16], "footer": [32], "hasAppsSideMenu": [32], "appsSideMenu": [64] }], [4, "tok-main", { "hasHeader": [4, "has-header"], "hasAppsSideMenu": [32] }, [[0, "appsSideMenu", "sideMenuHandler"], [0, "sideMenuOpen", "sideMenuOpenHandler"]]]]], ["tok-side-menu", [[1, "tok-side-menu", { "isOpen": [32], "isFooterFixed": [32], "open": [64], "footerFixed": [64] }]]], ["tok-apps-menu", [[1, "tok-apps-menu", { "apps": [16] }]]]], options);
    });
};
export { defineCustomElements };
