'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-91559952.js');

const sideMenuCss = "*{-webkit-box-sizing:border-box;box-sizing:border-box}.menu{position:fixed;top:var(--header-height);right:0;bottom:0;width:200px;background-color:var(--panel-selected-color);z-index:1000;color:white}.menu.footer-fixed{bottom:var(--footer-height)}";

const SideMenu = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.isOpen = false;
        this.isFooterFixed = false;
    }
    async open(open) {
        this.isOpen = open;
    }
    async footerFixed(fixed) {
        this.isFooterFixed = fixed;
    }
    render() {
        if (!this.isOpen) {
            return null;
        }
        return (index.h("div", { class: {
                menu: true,
                'footer-fixed': this.isFooterFixed,
            } }, index.h("slot", null)));
    }
};
SideMenu.style = sideMenuCss;

exports.tok_side_menu = SideMenu;
