import { Component, FunctionalComponent, h, State, Event, Prop, EventEmitter } from '@stencil/core';
import { TILES_URL, COMMON_ASM_URL, IMAGE_BASE_URL } from '../../url-mapping';

type App = {
  position: number,
  separator: boolean,
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

type CommonAppsSideMenu = {
  _id: string,
  expand: string,
  collapse: string,
  logo: { 
    name: string,
    alternativeText: string,
    caption: string,
    url: string,
  },
};

const appSort = (a: App, b: App) => a.position - b.position;

const Separator = () => (
  <div class='separator'><div /></div>
);

const AppItem: FunctionalComponent<App> = ({
  title,
  icon,
  active,
  url,
}) => (
  <a 
    class={{
      'app-item': true,
      'disabled': !active,
      'active': url.includes(window.location.host),
    }}
    href={ url.includes(window.location.host) ? '#' : url }
  >
    <div class='app-icon'>
      <div
        style={{
          'mask': `url(${IMAGE_BASE_URL}${icon.url}) center center / contain no-repeat`,
          '-webkit-mask': `url(${IMAGE_BASE_URL}${icon.url}) center center / contain no-repeat`,
        }}
      />
    </div>
    <div class='app-title'>{ title }</div>
  </a>
)

@Component({
  tag: 'tok-apps-side-menu',
  styleUrl: 'apps-side-menu.css',
  shadow: true
})
export class AppsSideMenu {
  @State() apps: App[] = [];
  @State() common: CommonAppsSideMenu;
  @Event() appsSideMenu: EventEmitter<void>;

  @Prop() showDisabled = true;

  connectedCallback() {
    this.appsSideMenu.emit();
  }

  componentWillLoad() {
    fetch(TILES_URL)
      .then((response: Response) => response.json())
      .then((response: App[]) => {
        this.apps = response.filter(({active}) => this.showDisabled || active);
      });

    fetch(COMMON_ASM_URL)
      .then((response: Response) => response.json())
      .then((response: CommonAppsSideMenu) => {
        this.common = { ...response };
      });
  }

  render() {
    const logo = this.common && this.common.logo;

    return (
      <div
        class={{
          'apps-side-menu': true,
        }}
      >
        { logo && (
          <a
            href={ logo.caption }
            class='logo'
            title={ logo.name }
          >
            <img
              alt={ logo.alternativeText }
              src={ `${IMAGE_BASE_URL}${logo.url}` }
            />
          </a>
        )}
        <div class='apps-container'>
          { this.apps.sort(appSort).map(app => app.separator
            ? <Separator />
            : <AppItem {...app}/>  
          )}
        </div>
        <div class='profile-container'>

        </div>
      </div>
    );
  }
}