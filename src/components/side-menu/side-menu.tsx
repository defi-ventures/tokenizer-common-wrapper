import { Component, h, State, Method } from '@stencil/core';

@Component({
  tag: 'tok-side-menu',
  styleUrl: 'side-menu.css',
  shadow: true
})
export class SideMenu {
  @State() isOpen = false;
  @State() isFooterFixed = false;

  @Method()
  async open(open: boolean) {
    this.isOpen = open;
  }

  @Method()
  async footerFixed(fixed: boolean) {
    this.isFooterFixed = fixed;
  }

  render() {
    if (!this.isOpen) {
      return null;
    }

    return (
      <div
        class={{
          menu: true,
          'footer-fixed': this.isFooterFixed,
        }}
      >
        <slot />
      </div>
    );
  }
}
