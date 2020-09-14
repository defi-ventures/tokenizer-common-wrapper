import { Component, h, Listen, State, Prop } from '@stencil/core';
export class Main {
    constructor() {
        this.hasAppsSideMenu = false;
        this.hasHeader = false;
    }
    sideMenuHandler() {
        this.hasAppsSideMenu = true;
        const footer = document.querySelector('tok-footer');
        footer.appsSideMenu();
    }
    sideMenuOpenHandler(open) {
        const sideMenu = document.querySelector('tok-side-menu');
        if (sideMenu) {
            sideMenu.open(open.detail);
        }
    }
    render() {
        return (h("div", { class: {
                'with-header': this.hasHeader,
                'with-apps-side-menu': this.hasAppsSideMenu,
            } },
            h("slot", null)));
    }
    static get is() { return "tok-main"; }
    static get originalStyleUrls() { return {
        "$": ["main.css"]
    }; }
    static get styleUrls() { return {
        "$": ["main.css"]
    }; }
    static get properties() { return {
        "hasHeader": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "has-header",
            "reflect": false,
            "defaultValue": "false"
        }
    }; }
    static get states() { return {
        "hasAppsSideMenu": {}
    }; }
    static get listeners() { return [{
            "name": "appsSideMenu",
            "method": "sideMenuHandler",
            "target": undefined,
            "capture": false,
            "passive": false
        }, {
            "name": "sideMenuOpen",
            "method": "sideMenuOpenHandler",
            "target": undefined,
            "capture": false,
            "passive": false
        }]; }
}
