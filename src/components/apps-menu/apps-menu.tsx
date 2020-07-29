import { Component, h, Prop, Event, EventEmitter, Element } from '@stencil/core';

export type App  = {
  title: string,
  description: string,
  logo: string,
  url: string,
};

@Component({
  tag: 'tok-apps-menu',
  styleUrl: 'apps-menu.css',
  shadow: true,
})
export class AppsMenu {
  @Element() el: HTMLElement;

  @Prop() apps: App[];

  @Event() close: EventEmitter<void>;

  clickEventHandlerRef;

  connectedCallback() {
    this.clickEventHandlerRef = this.clickEventHandler.bind(this);
    document.addEventListener('click', this.clickEventHandlerRef);
    
    this.el.addEventListener('mouseleave', this.mouseLeaveEventHandler.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.clickEventHandlerRef);
  }

  clickEventHandler(event: MouseEvent) {
    if (!this.el.contains(event.target as Node)) {
      this.close.emit();
    }
  }

  mouseLeaveEventHandler() {
    this.close.emit();
  }

  render() {
    return (
      <div class='apps-menu'>
        { this.apps.map(app => (
          <a class='app-menu-item' href={ app.url }>
          <div class='logo'><img src={ `data:image/png;base64,${app.logo}` }/></div>
          <div class='details'>
            <span class='title'>{ app.title }</span>
            <span class='description'>{ app.description }</span>
          </div>
          </a>
        ))}
      </div>
    );
  }
}
