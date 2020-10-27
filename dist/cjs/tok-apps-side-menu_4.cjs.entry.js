'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-91559952.js');

const API_URL = 'https://cms.tokenizer.cc';
const IMAGE_BASE_URL = API_URL;
const TILES_URL = `${API_URL}/tiles`;
const COMMON_ASM_URL = `${API_URL}/tokenizer-common`;
const COMMON_FOOTER_URL = `${API_URL}/common-footer`;

const appsSideMenuCss = "*{-webkit-box-sizing:border-box;box-sizing:border-box}.apps-side-menu{position:fixed;top:0;left:0;bottom:0;width:var(--apps-side-menu-width);background-color:var(--asm-bg);z-index:1000;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:start;justify-content:flex-start;-ms-flex-align:center;align-items:center;padding:30px 0;font-size:0.875rem}.apps-side-menu .logo{text-decoration:none;cursor:pointer}.apps-side-menu .logo img{width:67px}.apps-side-menu .apps-container{width:100%;margin-top:46px;overflow-y:auto}.apps-side-menu .apps-container .app-item,.apps-side-menu .apps-container .separator{width:100%;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:center;justify-content:center;-ms-flex-align:center;align-items:center;padding:8px 0}.apps-side-menu .apps-container .app-item{color:var(--asm-app-text);text-decoration:none;cursor:pointer}.apps-side-menu .apps-container .app-item.active,.apps-side-menu .apps-container .app-item.disabled{cursor:default}.apps-side-menu .apps-container .app-item.disabled{color:var(--grey-dark)}.apps-side-menu .apps-container .app-item .app-icon{border-radius:4px;width:42px;height:42px;padding:6px;margin-bottom:4px;background-color:var(--asm-app-bg)}.apps-side-menu .apps-container .app-item .app-icon div{height:100%;width:100%;background-color:var(--asm-app-text)}.apps-side-menu .apps-container .app-item:hover div{color:var(--asm-app-text-hover)}.apps-side-menu .apps-container .app-item:hover .app-icon{background-color:var(--asm-app-bg-hover)}.apps-side-menu .apps-container .app-item:hover .app-icon div{background-color:var(--asm-app-text-hover)}.apps-side-menu .apps-container .app-item.active div,.apps-side-menu .apps-container .app-item.active:hover div{color:var(--asm-app-text-active)}.apps-side-menu .apps-container .app-item.active .app-icon,.apps-side-menu .apps-container .app-item.active:hover .app-icon{background-color:var(--asm-app-bg-active)}.apps-side-menu .apps-container .app-item.active .app-icon div,.apps-side-menu .apps-container .app-item.active:hover .app-icon div{background-color:var(--asm-app-text-active)}.apps-side-menu .apps-container .app-item.disabled div{color:var(--asm-app-text-disabled)}.apps-side-menu .apps-container .app-item.disabled .app-icon{background-color:var(--asm-app-bg-disabled)}.apps-side-menu .apps-container .app-item.disabled .app-icon div{background-color:var(--asm-app-text-disabled)}.apps-side-menu .apps-container .separator div{width:100%;border-top:1px solid var(--asm-separator)}@media (max-width: 600px){.apps-side-menu{width:var(--apps-side-menu-mobile-width);padding:16px 0;font-size:0.625rem}.apps-side-menu .logo img{width:47px}.apps-side-menu .apps-container .app-item,.apps-side-menu .apps-container .separator{padding:7px 0}.apps-side-menu .apps-container{margin-top:34px}.apps-side-menu .apps-container .app-item .app-icon{width:38px;height:38px;padding:5px;margin-bottom:2px}}";

const appSort = (a, b) => a.position - b.position;
const Separator = () => (index.h("div", { class: 'separator' }, index.h("div", null)));
const AppItem = ({ title, icon, active, current, url, }) => (index.h("a", { class: {
        'app-item': true,
        'disabled': !active,
        'active': current,
    }, href: current ? '#' : url }, index.h("div", { class: 'app-icon' }, index.h("div", { style: {
        'mask': `url(${IMAGE_BASE_URL}${icon.url}) center center / contain no-repeat`,
        '-webkit-mask': `url(${IMAGE_BASE_URL}${icon.url}) center center / contain no-repeat`,
    } })), index.h("div", { class: 'app-title' }, title)));
const AppsSideMenu = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.appsSideMenu = index.createEvent(this, "appsSideMenu", 7);
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
        return (index.h("div", { class: {
                'apps-side-menu': true,
            } }, logo && (index.h("a", { href: logo.caption, class: 'logo', title: logo.name }, index.h("img", { alt: logo.alternativeText, src: `${IMAGE_BASE_URL}${logo.url}` }))), index.h("div", { class: 'apps-container' }, this.apps.sort(appSort).map((app, index$1) => (app.separator
            ? index.h(Separator, null)
            : index.h(AppItem, Object.assign({}, app, { current: index$1 === current }))))), index.h("div", { class: 'profile-container' })));
    }
};
AppsSideMenu.style = appsSideMenuCss;

const contentCss = "tok-content{display:block;-ms-flex-positive:1;flex-grow:1;width:100%;position:relative}";

const Content = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    render() {
        return (index.h("div", null, index.h("slot", null)));
    }
};
Content.style = contentCss;

const footerCss = "*{-webkit-box-sizing:border-box;box-sizing:border-box}.footer{display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row;-ms-flex-pack:justify;justify-content:space-between;-ms-flex-align:start;align-items:flex-start;-ms-flex-wrap:wrap;flex-wrap:wrap;padding:60px 20px 30px 20px;background-color:var(--main-bg);width:100%}.footer.apps-side-menu{left:var(--apps-side-menu-width)}.footer .copy{padding:0 70px}.footer .copy img{width:200px}.footer .copy p{color:var(--grey-dark);font-size:0.875rem}.footer .sections{display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row;-ms-flex-positive:1;flex-grow:1}.footer .sections .section{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-positive:1;flex-grow:1;padding:0 30px}.footer .sections .section h3{color:var(--text);font-size:1.125rem;line-height:1.3125rem;margin:0.4375rem 0}.footer .sections .section a{color:var(--grey-dark);font-size:0.875rem;line-height:1rem;margin:0.4375rem 0;text-decoration:none;cursor:pointer}.footer .sections .section a:hover{color:var(--grey-light)}@media (max-width: 1200px){.footer .copy{padding:0 20px}.footer .sections .section{padding:0 10px}}@media (max-width: 900px){.footer{-ms-flex-direction:column;flex-direction:column;-ms-flex-align:center;align-items:center}.footer .sections{width:100%;padding-left:20px}}@media (max-width: 600px){.footer{padding:60px 20px 20px 20px}.footer.apps-side-menu{left:var(--apps-side-menu-mobile-width)}.footer .sections{-ms-flex-wrap:wrap;flex-wrap:wrap}.footer .sections .section{width:50%}}";

const facebookLogo = `<svg viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 10h-2v2h2v6h3v-6h1.82l.18-2h-2v-.833c0-.478.096-.667.558-.667h1.442v-2.5h-2.404c-1.798 0-2.596.792-2.596 2.308v1.692z"/></svg>`;
const twitterLogo = `<svg viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.5 8.778c-.441.196-.916.328-1.414.388.509-.305.898-.787 1.083-1.362-.476.282-1.003.487-1.564.597-.448-.479-1.089-.778-1.796-.778-1.59 0-2.758 1.483-2.399 3.023-2.045-.103-3.86-1.083-5.074-2.572-.645 1.106-.334 2.554.762 3.287-.403-.013-.782-.124-1.114-.308-.027 1.14.791 2.207 1.975 2.445-.346.094-.726.116-1.112.042.313.978 1.224 1.689 2.3 1.709-1.037.812-2.34 1.175-3.647 1.021 1.09.699 2.383 1.106 3.773 1.106 4.572 0 7.154-3.861 6.998-7.324.482-.346.899-.78 1.229-1.274z"/></svg>`;
const linkedinLogo = `<svg viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 8c0 .557-.447 1.008-1 1.008s-1-.45-1-1.008c0-.557.447-1.008 1-1.008s1 .452 1 1.008zm0 2h-2v6h2v-6zm3 0h-2v6h2v-2.861c0-1.722 2.002-1.881 2.002 0v2.861h1.998v-3.359c0-3.284-3.128-3.164-4-1.548v-1.093z"/></svg>`;
const youtubeLogo = `<svg viewBox="0 0 24 24"><path d="M16.23 7.102c-2.002-.136-6.462-.135-8.461 0-2.165.148-2.419 1.456-2.436 4.898.017 3.436.27 4.75 2.437 4.898 1.999.135 6.459.136 8.461 0 2.165-.148 2.42-1.457 2.437-4.898-.018-3.436-.271-4.75-2.438-4.898zm-6.23 7.12v-4.444l4.778 2.218-4.778 2.226zm2-12.222c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z"/></svg>`;
const telegramLogo = `<svg viewBox="0 0 24 24"><path d="M12,0c-6.627,0 -12,5.373 -12,12c0,6.627 5.373,12 12,12c6.627,0 12,-5.373 12,-12c0,-6.627 -5.373,-12 -12,-12Zm0,2c5.514,0 10,4.486 10,10c0,5.514 -4.486,10 -10,10c-5.514,0 -10,-4.486 -10,-10c0,-5.514 4.486,-10 10,-10Zm2.692,14.889c0.161,0.115 0.368,0.143 0.553,0.073c0.185,-0.07 0.322,-0.228 0.362,-0.42c0.435,-2.042 1.489,-7.211 1.884,-9.068c0.03,-0.14 -0.019,-0.285 -0.129,-0.379c-0.11,-0.093 -0.263,-0.12 -0.399,-0.07c-2.096,0.776 -8.553,3.198 -11.192,4.175c-0.168,0.062 -0.277,0.223 -0.271,0.4c0.006,0.177 0.125,0.33 0.296,0.381c1.184,0.354 2.738,0.847 2.738,0.847c0,0 0.725,2.193 1.104,3.308c0.047,0.139 0.157,0.25 0.301,0.287c0.145,0.038 0.298,-0.001 0.406,-0.103c0.608,-0.574 1.548,-1.461 1.548,-1.461c0,0 1.786,1.309 2.799,2.03Zm-5.505,-4.338l0.84,2.769l0.186,-1.754c0,0 3.243,-2.925 5.092,-4.593c0.055,-0.048 0.062,-0.13 0.017,-0.188c-0.045,-0.057 -0.126,-0.071 -0.188,-0.032c-2.143,1.368 -5.947,3.798 -5.947,3.798Z"/></svg>`;
const defaultSocial = [
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/xrwebnetwork',
        logo: facebookLogo,
    },
    {
        name: 'Twitter',
        href: 'https://www.twitter.com/xrwebnetwork',
        logo: twitterLogo,
    },
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/companygofind',
        logo: linkedinLogo,
    },
    {
        name: 'YouTube',
        href: 'https://www.youtube.com/channel/UC-x6e65y0c4-IvDrsQf55ew',
        logo: youtubeLogo,
    },
    {
        name: 'Telegram',
        href: 'https://t.me/gofindxr',
        logo: telegramLogo,
    }
];
const Footer = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.social = defaultSocial;
    }
    async appsSideMenu() {
        this.hasAppsSideMenu = true;
    }
    componentWillLoad() {
        fetch(COMMON_FOOTER_URL)
            .then((response) => response.json())
            .then((response) => {
            this.footer = Object.assign({}, response);
        });
    }
    render() {
        if (!this.footer) {
            return null;
        }
        const { logo, copy, section, } = this.footer;
        return (index.h("div", { class: {
                footer: true,
                'apps-side-menu': this.hasAppsSideMenu,
            } }, index.h("div", { class: 'copy' }, index.h("img", { alt: logo.alternativeText, src: `${IMAGE_BASE_URL}${logo.url}` }), index.h("p", null, copy)), index.h("div", { class: 'sections' }, section.sort((a, b) => a.position - b.position).map(({ title, link }) => (index.h("div", { class: 'section' }, index.h("h3", null, title), link.sort((a, b) => a.position - b.position).map(({ url, title }) => (index.h("a", { href: url }, title)))))))));
    }
};
Footer.style = footerCss;

const mainCss = "tok-main>div{overflow-y:auto;position:absolute;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;top:0;bottom:0;left:0;right:0}tok-main>div.footer-fixed{bottom:var(--footer-height)}tok-main>div.with-header{top:var(--header-height)}tok-main>div.with-apps-side-menu{left:var(--apps-side-menu-width)}@media (max-width: 600px){tok-main>div.with-apps-side-menu{left:var(--apps-side-menu-mobile-width)}}";

const Main = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
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
        return (index.h("div", { class: {
                'with-header': this.hasHeader,
                'with-apps-side-menu': this.hasAppsSideMenu,
            } }, index.h("slot", null)));
    }
};
Main.style = mainCss;

exports.tok_apps_side_menu = AppsSideMenu;
exports.tok_content = Content;
exports.tok_footer = Footer;
exports.tok_main = Main;
