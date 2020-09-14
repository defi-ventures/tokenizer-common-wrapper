import { Component, h, State, Method } from '@stencil/core';
export class SideMenu {
    constructor() {
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
        return (h("div", { class: {
                menu: true,
                'footer-fixed': this.isFooterFixed,
            } },
            h("slot", null)));
    }
    static get is() { return "tok-side-menu"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["side-menu.css"]
    }; }
    static get styleUrls() { return {
        "$": ["side-menu.css"]
    }; }
    static get states() { return {
        "isOpen": {},
        "isFooterFixed": {}
    }; }
    static get methods() { return {
        "open": {
            "complexType": {
                "signature": "(open: boolean) => Promise<void>",
                "parameters": [{
                        "tags": [],
                        "text": ""
                    }],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<void>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        },
        "footerFixed": {
            "complexType": {
                "signature": "(fixed: boolean) => Promise<void>",
                "parameters": [{
                        "tags": [],
                        "text": ""
                    }],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<void>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        }
    }; }
}
