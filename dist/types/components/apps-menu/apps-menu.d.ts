import { EventEmitter } from '../../stencil-public-runtime';
export declare type App = {
    title: string;
    description: string;
    logo: string;
    logoAlt: string;
    url: string;
};
export declare class AppsMenu {
    el: HTMLElement;
    apps: App[];
    close: EventEmitter<void>;
    clickEventHandlerRef: any;
    connectedCallback(): void;
    disconnectedCallback(): void;
    clickEventHandler(event: MouseEvent): void;
    mouseLeaveEventHandler(): void;
    render(): any;
}
