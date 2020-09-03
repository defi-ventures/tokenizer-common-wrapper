import { Component, h, Listen, State, Prop } from '@stencil/core';

@Component({
  tag: 'tok-main',
  styleUrl: 'main.css',
  shadow: false
})
export class Main {
  @State() footerFixed: boolean = false;
  
  @Prop() hasHeader: boolean = false;
  @Prop() hasAppsSideMenu: boolean = true;

  @Listen('footerFixed')
  footerFixedHandler(fixed: CustomEvent<boolean>) {
    this.footerFixed = fixed.detail;
    const sideMenu = document.querySelector('tok-side-menu');
    if (sideMenu) {
      sideMenu.footerFixed(fixed.detail);  
    }

    const appsSideMenu = document.querySelector('tok-apps-side-menu');
    if (appsSideMenu) {
      appsSideMenu.footerFixed(fixed.detail);  
    }
  }  

  @Listen('sideMenuOpen')
  sideMenuOpenHandler(open: CustomEvent<boolean>) {
    const sideMenu = document.querySelector('tok-side-menu');
    if (sideMenu) {
      sideMenu.open(open.detail);  
    }
  }

  render() {
    return (
      <div
        class={{
          'footer-fixed': this.footerFixed,
          'with-header': this.hasHeader,
          'with-apps-side-menu': this.hasAppsSideMenu,
        }}
      >
        <slot />
      </div>
    );
  }
}
