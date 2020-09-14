import { r as registerInstance, c as createEvent, h, g as getElement } from './index-f2b0e712.js';

const appsMenuCss = "*{-webkit-box-sizing:border-box;box-sizing:border-box}.apps-menu{position:fixed;top:var(--header-height);left:0;max-width:350px;background-color:var(--panel-selected-color);z-index:1000;padding-bottom:10px}.app-menu-item{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;padding:0 20px;width:100%;height:var(--header-height);color:white;text-decoration:none}.app-menu-item:hover{background-color:var(--panel-hover-color)}.logo{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;height:100%;margin-right:20px}.logo img{height:30px}.details{height:100%;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:center;justify-content:center;-ms-flex-align:start;align-items:flex-start}.details span.title{font-size:0.875rem}.app-menu-item:hover .details span.title{color:orange}.details .description{font-size:0.7rem;margin-top:5px}";

const AppsMenu = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.close = createEvent(this, "close", 7);
    }
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
        return (h("div", { class: 'apps-menu' }, this.apps.map(app => (h("a", { class: 'app-menu-item', href: app.url }, h("div", { class: 'logo' }, h("img", { src: app.logo, alt: app.logoAlt })), h("div", { class: 'details' }, h("span", { class: 'title' }, app.title), h("span", { class: 'description' }, app.description)))))));
    }
    get el() { return getElement(this); }
};
AppsMenu.style = appsMenuCss;

export { AppsMenu as tok_apps_menu };
