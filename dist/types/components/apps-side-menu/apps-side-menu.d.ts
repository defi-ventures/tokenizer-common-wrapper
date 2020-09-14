import { EventEmitter } from '../../stencil-public-runtime';
declare type App = {
    position: number;
    separator: boolean;
    active: boolean;
    title: string;
    url: string;
    icon: {
        alternativeText: string;
        url: string;
    };
    description: string;
    id: string;
};
declare type CommonAppsSideMenu = {
    _id: string;
    expand: string;
    collapse: string;
    logo: {
        name: string;
        alternativeText: string;
        caption: string;
        url: string;
    };
};
export declare class AppsSideMenu {
    apps: App[];
    common: CommonAppsSideMenu;
    appsSideMenu: EventEmitter<void>;
    showDisabled: boolean;
    connectedCallback(): void;
    componentWillLoad(): void;
    render(): any;
}
export {};
