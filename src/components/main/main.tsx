import { Component, h, Listen, State, Prop } from '@stencil/core';

@Component({
  tag: 'tok-main',
  styleUrl: 'main.css',
  shadow: false
})
export class Main {
  @State() hasAppsSideMenu: boolean = false;
  
  @Prop() hasHeader: boolean = false;
  
  @Listen('appsSideMenu')
  sideMenuHandler() {
    this.hasAppsSideMenu = true;
    const footer = document.querySelector('tok-footer');
    footer.appsSideMenu();  
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
          'with-header': this.hasHeader,
          'with-apps-side-menu': this.hasAppsSideMenu,
        }}
      >
        <slot />
      </div>
    );
  }
}
