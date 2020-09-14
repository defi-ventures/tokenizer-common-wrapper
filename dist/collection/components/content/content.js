import { Component, h } from '@stencil/core';
export class Content {
    render() {
        return (h("div", null,
            h("slot", null)));
    }
    static get is() { return "tok-content"; }
    static get originalStyleUrls() { return {
        "$": ["content.css"]
    }; }
    static get styleUrls() { return {
        "$": ["content.css"]
    }; }
}
