import { Component, h, State, Event, Prop } from '@stencil/core';
import { TILES_URL, COMMON_ASM_URL, IMAGE_BASE_URL } from '../../url-mapping';
const appSort = (a, b) => a.position - b.position;
const Separator = () => (h("div", { class: 'separator' },
    h("div", null)));
const AppItem = ({ title, icon, active, current, url, }) => (h("a", { class: {
        'app-item': true,
        'disabled': !active,
        'active': current,
    }, href: current ? '#' : url },
    h("div", { class: 'app-icon' },
        h("div", { style: {
                'mask': `url(${IMAGE_BASE_URL}${icon.url}) center center / contain no-repeat`,
                '-webkit-mask': `url(${IMAGE_BASE_URL}${icon.url}) center center / contain no-repeat`,
            } })),
    h("div", { class: 'app-title' }, title)));
export class AppsSideMenu {
    constructor() {
        this.apps = [];
        this.showDisabled = true;
    }
    connectedCallback() {
        this.appsSideMenu.emit();
    }
    componentWillLoad() {
        fetch(TILES_URL)
            .then((response) => response.json())
            .then((response) => {
            this.apps = response.filter(({ active }) => this.showDisabled || active);
        });
        fetch(COMMON_ASM_URL)
            .then((response) => response.json())
            .then((response) => {
            this.common = Object.assign({}, response);
        });
    }
    render() {
        const logo = this.common && this.common.logo;
        const apps = this.apps.sort(appSort);
        const current = apps
            .map(({ url }) => window.location.href.includes(url) ? url.length : 0)
            .reduce((match, length, index) => length > match.length ? { length, index } : match, { length: 0, index: 0 })
            .index;
        return (h("div", { class: {
                'apps-side-menu': true,
            } },
            logo && (h("a", { href: logo.caption, class: 'logo', title: logo.name },
                h("img", { alt: logo.alternativeText, src: `${IMAGE_BASE_URL}${logo.url}` }))),
            h("div", { class: 'apps-container' }, this.apps.sort(appSort).map((app, index) => (app.separator
                ? h(Separator, null)
                : h(AppItem, Object.assign({}, app, { current: index === current }))))),
            h("div", { class: 'profile-container' })));
    }
    static get is() { return "tok-apps-side-menu"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["apps-side-menu.css"]
    }; }
    static get styleUrls() { return {
        "$": ["apps-side-menu.css"]
    }; }
    static get properties() { return {
        "showDisabled": {
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
            "attribute": "show-disabled",
            "reflect": false,
            "defaultValue": "true"
        }
    }; }
    static get states() { return {
        "apps": {},
        "common": {}
    }; }
    static get events() { return [{
            "method": "appsSideMenu",
            "name": "appsSideMenu",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "void",
                "resolved": "void",
                "references": {}
            }
        }]; }
}
