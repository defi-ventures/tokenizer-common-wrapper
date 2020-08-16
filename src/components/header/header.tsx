import { Component, h, Host, State, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import { App } from '../apps-menu/apps-menu';
import logo from './logo';
import { appsMenu, hamburgerMenu } from './icons';

type Tile = {
  active: boolean,
  title: string,
  url: string,
  icon: {
    alternativeText: string,
    url: string,
  },
  description: string,
  id: string,
};

@Component({
  tag: 'tok-header',
  styleUrl: 'header.css',
  shadow: true,
  assetsDirs: ['assets'],
})
export class Header {
  @Prop() sideMenu: boolean = false;
  @Prop() logoHref: string = 'https://www.tokenizer.cc'
  @Prop() apps: App[];
  @Prop() pageTitle: string;
  @Event() sideMenuOpen: EventEmitter<boolean>;

  @State() isAppsMenuOpen = false;
  @State() isSideMenuOpen = false;

  componentWillLoad() {
    if (!this.apps) {
      fetch('https://cms.tokenizer.cc/tiles')
        .then((response: Response) => response.json())
        .then((response: Tile[]) => {
          this.apps = response.filter(({active}) => active).map(tile => ({
            title: tile.title,
            description: tile.description,
            logo: `https://cms.tokenizer.cc${tile.icon.url}`,
            logoAlt: tile.icon.alternativeText,
            url: tile.url,
          }));
        });
    }
  }

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
          <img src={ `data:image/png;base64,${logo}` } />
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
