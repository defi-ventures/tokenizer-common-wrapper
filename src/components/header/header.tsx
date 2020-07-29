import { Component, h, getAssetPath, Host, State, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import { App } from '../apps-menu/apps-menu';

const appsMenu = `<svg viewBox="0 0 512 512"><path d="M186.2,139.6h139.6V0H186.2V139.6z M372.4,0v139.6H512V0H372.4z M0,139.6h139.6V0H0V139.6z M186.2,325.8h139.6V186.2H186.2 V325.8z M372.4,325.8H512V186.2H372.4V325.8z M0,325.8h139.6V186.2H0V325.8z M186.2,512h139.6V372.4H186.2V512z M372.4,512H512 V372.4H372.4V512z M0,512h139.6V372.4H0V512z"/></svg>`;
const hamburgerMenu = `<svg viewBox="0 0 24 24"><path d="M24 6h-24v-4h24v4zm0 4h-24v4h24v-4zm0 8h-24v4h24v-4z"/></svg>`;

const defaultApps: App[] = [{
  title: 'Issue',
  description: 'Tool to issue issues',
  logo: './assets/issue.png',
  url: 'https://issue.tokenizer.cc',
},{
  title: 'Invest',
  description: 'Tool to invest investments',
  logo: './assets/invest.png',
  url: 'https://issue.tokenizer.cc',
},{
  title: 'exchange',
  description: 'Tool to Exchange exchanges',
  logo: './assets/exchange.png',
  url: 'https://issue.tokenizer.cc',
}];

@Component({
  tag: 'tok-header',
  styleUrl: 'header.css',
  shadow: true,
  assetsDirs: ['assets'],
})
export class Header {
  @Prop() sideMenu: boolean = false;
  @Prop() logoHref: string = 'https://www.tokenizer.cc'
  @Prop() apps: App[] = defaultApps;
  @Prop() pageTitle: string;
  @Event() sideMenuOpen: EventEmitter<boolean>;

  @State() isAppsMenuOpen = false;
  @State() isSideMenuOpen = false;

  @Listen('close')
  closeHandler() {
    this.isAppsMenuOpen = false;
  }
  
  appsMenuClickHandler() {
    this.isAppsMenuOpen = !this.isAppsMenuOpen;
  }

  sideMenuClickHandler() {
    this.isSideMenuOpen = !this.isSideMenuOpen;
    this.sideMenuOpen.emit(this.isSideMenuOpen)
  }

  render() {
    const appMenu = this.isAppsMenuOpen && (
      <tok-apps-menu apps={ this.apps }/>
    );

    const appMenuButton = this.apps?.length && (
      <div
        class={{
          'flex center header-item square apps-menu': true,
          open: this.isAppsMenuOpen,
        }}
        innerHTML={ appsMenu }
        onClick={ this.appsMenuClickHandler.bind(this) }
      />
    );

    const hamburgerMenuButton = this.sideMenu && (
      <div
        class={{
          'flex center header-item square side-menu': true,
          open: this.isSideMenuOpen,
        }}
        innerHTML={ hamburgerMenu }
        onClick={ this.sideMenuClickHandler.bind(this) }
      />
    );

    return (
      <Host>
        { appMenuButton }
        <a class='flex center header-item logo' href={ this.logoHref }>
          <img src={getAssetPath('./assets/logo.png')} />
        </a>
        { this.pageTitle && (
          <div class='item-group'>
            <div class='separator wide line'></div> 
            <div class='page-title'>{ this.pageTitle }</div>
          </div>
        )}
        <div class='separator grow'></div>
        { hamburgerMenuButton }


        { appMenu }
      </Host>
    );
  }
}
