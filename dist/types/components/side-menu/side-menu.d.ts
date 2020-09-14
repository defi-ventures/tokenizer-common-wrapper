export declare class SideMenu {
    isOpen: boolean;
    isFooterFixed: boolean;
    open(open: boolean): Promise<void>;
    footerFixed(fixed: boolean): Promise<void>;
    render(): any;
}
