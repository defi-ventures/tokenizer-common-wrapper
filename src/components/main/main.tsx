import { Component, h, Listen, State } from '@stencil/core';

@Component({
  tag: 'tok-main',
  styleUrl: 'main.css',
  shadow: false
})
export class Main {
  @State() footerFixed: boolean;

  @Listen('footerFixed')
  footerFixedHandler(fixed: CustomEvent<boolean>) {
    this.footerFixed = fixed.detail;
    const sideMenu = document.querySelector('tok-side-menu');
    if (sideMenu) {
      sideMenu.footerFixed(fixed.detail);  
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
        }}
      >
        <slot />
      </div>
    );
  }
}
