import { Component, h } from '@stencil/core';

@Component({
  tag: 'tok-content',
  styleUrl: 'content.css',
  shadow: false,
})
export class Content {
  render() {
    return (
      <div>
        <slot />
      </div>
    );
  }
}
