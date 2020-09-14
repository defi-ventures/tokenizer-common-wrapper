import { Component, h, Host, State, Prop, Listen, Event } from '@stencil/core';
import logo from './logo';
import { appsMenu, hamburgerMenu } from './icons';
export class Header {
    constructor() {
        this.sideMenu = false;
        this.logoHref = 'https://www.tokenizer.cc';
        this.apps = [];
        this.isAppsMenuOpen = false;
        this.isSideMenuOpen = false;
    }
    componentWillLoad() {
        if (this.apps.length === 0) {
            fetch('https://cms.tokenizer.cc/tiles')
                .then((response) => response.json())
                .then((response) => {
                this.apps = response.filter(({ active }) => active).map(tile => ({
                    title: tile.title,
                    description: tile.description,
                    logo: `https://cms.tokenizer.cc${tile.icon.url}`,
                    logoAlt: tile.icon.alternativeText,
                    url: tile.url,
                }));
            });
        }
    }
    closeHandler() {
        this.isAppsMenuOpen = false;
    }
    appsMenuClickHandler() {
        this.isAppsMenuOpen = !this.isAppsMenuOpen;
    }
    sideMenuClickHandler() {
        this.isSideMenuOpen = !this.isSideMenuOpen;
        this.sideMenuOpen.emit(this.isSideMenuOpen);
    }
    render() {
        const appMenu = this.isAppsMenuOpen && (h("tok-apps-menu", { apps: this.apps }));
        const appMenuButton = (h("div", { class: {
                'flex center header-item square apps-menu': true,
                open: this.isAppsMenuOpen,
            }, innerHTML: appsMenu, onClick: this.appsMenuClickHandler.bind(this) }));
        const hamburgerMenuButton = this.sideMenu && (h("div", { class: {
                'flex center header-item square side-menu': true,
                open: this.isSideMenuOpen,
            }, innerHTML: hamburgerMenu, onClick: this.sideMenuClickHandler.bind(this) }));
        return (h(Host, null,
            appMenuButton,
            h("a", { class: 'flex center header-item logo', href: this.logoHref },
                h("img", { src: `data:image/png;base64,${logo}` })),
            this.pageTitle && (h("div", { class: 'item-group' },
                h("div", { class: 'separator wide line' }),
                h("div", { class: 'page-title' }, this.pageTitle))),
            h("div", { class: 'separator grow' }),
            hamburgerMenuButton,
            appMenu));
    }
    static get is() { return "tok-header"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["header.css"]
    }; }
    static get styleUrls() { return {
        "$": ["header.css"]
    }; }
    static get assetsDirs() { return ["assets"]; }
    static get properties() { return {
        "sideMenu": {
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
            "attribute": "side-menu",
            "reflect": false,
            "defaultValue": "false"
        },
        "logoHref": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "logo-href",
            "reflect": false,
            "defaultValue": "'https://www.tokenizer.cc'"
        },
        "apps": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "App[]",
                "resolved": "App[]",
                "references": {
                    "App": {
                        "location": "import",
                        "path": "../apps-menu/apps-menu"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "defaultValue": "[]"
        },
        "pageTitle": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "page-title",
            "reflect": false
        }
    }; }
    static get states() { return {
        "isAppsMenuOpen": {},
        "isSideMenuOpen": {}
    }; }
    static get events() { return [{
            "method": "sideMenuOpen",
            "name": "sideMenuOpen",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            }
        }]; }
    static get listeners() { return [{
            "name": "close",
            "method": "closeHandler",
            "target": undefined,
            "capture": false,
            "passive": false
        }]; }
}
