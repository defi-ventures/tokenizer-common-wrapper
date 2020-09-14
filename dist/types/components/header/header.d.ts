import { EventEmitter } from '../../stencil-public-runtime';
import { App } from '../apps-menu/apps-menu';
export declare class Header {
    sideMenu: boolean;
    logoHref: string;
    apps: App[];
    pageTitle: string;
    sideMenuOpen: EventEmitter<boolean>;
    isAppsMenuOpen: boolean;
    isSideMenuOpen: boolean;
    componentWillLoad(): void;
    closeHandler(): void;
    appsMenuClickHandler(): void;
    sideMenuClickHandler(): void;
    render(): any;
}
