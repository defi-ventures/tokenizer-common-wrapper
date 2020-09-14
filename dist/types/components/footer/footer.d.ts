declare type CommonFooterLink = {
    position: number;
    url: string;
    title: string;
};
declare type CommonFooterSection = {
    title: string;
    position: number;
    link: CommonFooterLink[];
};
declare type CommonFooter = {
    copy: string;
    logo: {
        name: string;
        alternativeText: string;
        caption: string;
        url: string;
    };
    section: CommonFooterSection[];
};
export declare type Social = {
    name: string;
    href: string;
    logo: string;
};
export declare class Footer {
    footer: CommonFooter;
    hasAppsSideMenu: boolean;
    social: Social[];
    appsSideMenu(): Promise<void>;
    componentWillLoad(): void;
    render(): any;
}
export {};
