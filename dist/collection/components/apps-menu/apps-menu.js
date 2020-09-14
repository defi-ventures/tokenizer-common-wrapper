import { Component, h, Prop, Event, Element } from '@stencil/core';
export class AppsMenu {
    connectedCallback() {
        this.clickEventHandlerRef = this.clickEventHandler.bind(this);
        document.addEventListener('click', this.clickEventHandlerRef);
        this.el.addEventListener('mouseleave', this.mouseLeaveEventHandler.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener('click', this.clickEventHandlerRef);
    }
    clickEventHandler(event) {
        if (!this.el.contains(event.target)) {
            this.close.emit();
        }
    }
    mouseLeaveEventHandler() {
        this.close.emit();
    }
    render() {
        return (h("div", { class: 'apps-menu' }, this.apps.map(app => (h("a", { class: 'app-menu-item', href: app.url },
            h("div", { class: 'logo' },
                h("img", { src: app.logo, alt: app.logoAlt })),
            h("div", { class: 'details' },
                h("span", { class: 'title' }, app.title),
                h("span", { class: 'description' }, app.description)))))));
    }
    static get is() { return "tok-apps-menu"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["apps-menu.css"]
    }; }
    static get styleUrls() { return {
        "$": ["apps-menu.css"]
    }; }
    static get properties() { return {
        "apps": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "App[]",
                "resolved": "App[]",
                "references": {
                    "App": {
                        "location": "local"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            }
        }
    }; }
    static get events() { return [{
            "method": "close",
            "name": "close",
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
    static get elementRef() { return "el"; }
}
