import { Component, h, Prop, State, Method } from '@stencil/core';

import { COMMON_FOOTER_URL, IMAGE_BASE_URL } from '../../url-mapping';

type CommonFooterLink = {
  position: number,
  url: string,
  title: string,
}

type CommonFooterSection = {
  title: string,
  position: number,
  link: CommonFooterLink[],
};

type CommonFooter = {
  copy: string,
  logo: {
    name: string,
    alternativeText: string,
    caption: string,
    url: string,
  },
  section: CommonFooterSection[],
};

export type Social = {
  name: string,
  href: string,
  logo: string
};

const facebookLogo = `<svg viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 10h-2v2h2v6h3v-6h1.82l.18-2h-2v-.833c0-.478.096-.667.558-.667h1.442v-2.5h-2.404c-1.798 0-2.596.792-2.596 2.308v1.692z"/></svg>`;
const twitterLogo = `<svg viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.5 8.778c-.441.196-.916.328-1.414.388.509-.305.898-.787 1.083-1.362-.476.282-1.003.487-1.564.597-.448-.479-1.089-.778-1.796-.778-1.59 0-2.758 1.483-2.399 3.023-2.045-.103-3.86-1.083-5.074-2.572-.645 1.106-.334 2.554.762 3.287-.403-.013-.782-.124-1.114-.308-.027 1.14.791 2.207 1.975 2.445-.346.094-.726.116-1.112.042.313.978 1.224 1.689 2.3 1.709-1.037.812-2.34 1.175-3.647 1.021 1.09.699 2.383 1.106 3.773 1.106 4.572 0 7.154-3.861 6.998-7.324.482-.346.899-.78 1.229-1.274z"/></svg>`;
const linkedinLogo = `<svg viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 8c0 .557-.447 1.008-1 1.008s-1-.45-1-1.008c0-.557.447-1.008 1-1.008s1 .452 1 1.008zm0 2h-2v6h2v-6zm3 0h-2v6h2v-2.861c0-1.722 2.002-1.881 2.002 0v2.861h1.998v-3.359c0-3.284-3.128-3.164-4-1.548v-1.093z"/></svg>`;
const youtubeLogo = `<svg viewBox="0 0 24 24"><path d="M16.23 7.102c-2.002-.136-6.462-.135-8.461 0-2.165.148-2.419 1.456-2.436 4.898.017 3.436.27 4.75 2.437 4.898 1.999.135 6.459.136 8.461 0 2.165-.148 2.42-1.457 2.437-4.898-.018-3.436-.271-4.75-2.438-4.898zm-6.23 7.12v-4.444l4.778 2.218-4.778 2.226zm2-12.222c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z"/></svg>`;
const telegramLogo = `<svg viewBox="0 0 24 24"><path d="M12,0c-6.627,0 -12,5.373 -12,12c0,6.627 5.373,12 12,12c6.627,0 12,-5.373 12,-12c0,-6.627 -5.373,-12 -12,-12Zm0,2c5.514,0 10,4.486 10,10c0,5.514 -4.486,10 -10,10c-5.514,0 -10,-4.486 -10,-10c0,-5.514 4.486,-10 10,-10Zm2.692,14.889c0.161,0.115 0.368,0.143 0.553,0.073c0.185,-0.07 0.322,-0.228 0.362,-0.42c0.435,-2.042 1.489,-7.211 1.884,-9.068c0.03,-0.14 -0.019,-0.285 -0.129,-0.379c-0.11,-0.093 -0.263,-0.12 -0.399,-0.07c-2.096,0.776 -8.553,3.198 -11.192,4.175c-0.168,0.062 -0.277,0.223 -0.271,0.4c0.006,0.177 0.125,0.33 0.296,0.381c1.184,0.354 2.738,0.847 2.738,0.847c0,0 0.725,2.193 1.104,3.308c0.047,0.139 0.157,0.25 0.301,0.287c0.145,0.038 0.298,-0.001 0.406,-0.103c0.608,-0.574 1.548,-1.461 1.548,-1.461c0,0 1.786,1.309 2.799,2.03Zm-5.505,-4.338l0.84,2.769l0.186,-1.754c0,0 3.243,-2.925 5.092,-4.593c0.055,-0.048 0.062,-0.13 0.017,-0.188c-0.045,-0.057 -0.126,-0.071 -0.188,-0.032c-2.143,1.368 -5.947,3.798 -5.947,3.798Z"/></svg>`;

const defaultSocial: Social[] = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/xrwebnetwork',
    logo: facebookLogo,
  },
  {
    name: 'Twitter',
    href: 'https://www.twitter.com/xrwebnetwork',
    logo: twitterLogo,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/companygofind',
    logo: linkedinLogo,
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/channel/UC-x6e65y0c4-IvDrsQf55ew',
    logo: youtubeLogo,
  },
  {
    name: 'Telegram',
    href: 'https://t.me/gofindxr',
    logo: telegramLogo,
  }
];

@Component({
  tag: 'tok-footer',
  styleUrl: 'footer.css',
  shadow: true
})
export class Footer {
  @State() footer: CommonFooter;
  @State() hasAppsSideMenu: boolean;
  @Prop() social: Social[] = defaultSocial;

  @Method()
  async appsSideMenu() {
    this.hasAppsSideMenu = true;
  }

  componentWillLoad() {
    fetch(COMMON_FOOTER_URL)
      .then((response: Response) => response.json())
      .then((response: CommonFooter) => {
        this.footer = { ...response };
      });
  }

  render() {
    if (!this.footer) {
      return null;
    }

    const {
      logo,
      copy,
      section,
    } = this.footer;

    return (
      <div
        class={{
          footer: true,
          'apps-side-menu': this.hasAppsSideMenu,
        }}
      >
        <div class='copy'>
          <img
            alt={ logo.alternativeText }
            src={ `${IMAGE_BASE_URL}${logo.url}` }
          />
          <p>{ copy }</p>
        </div>
        <div class='sections'>
          { section.sort((a, b) => a.position - b.position).map(({title, link}) => (
            <div class='section'>
              <h3>{ title }</h3>
              { link.sort((a, b) => a.position - b.position).map(({url, title}) => (
                <a href={ url }>{ title }</a>
              ))}
            </div>
          ))}
        </div>
        
      </div>
    );
  }
}
