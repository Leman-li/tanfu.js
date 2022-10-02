import Tanfu, { Component, html, TanfuView, TemplateObject } from 'tanfu-core';
import HomeController from './index.controller';

@Component({
  controllers: [HomeController]
})
class Home extends TanfuView {


  template(): TemplateObject {
    return html`
    <div>
      <h2>Yay! Welcome to umi!</h2>
      <p>
        <img t-id="img" width="388" />
      </p>
      <p>
        To get started, edit <code>pages/index.tsx</code> and save to reload.
      </p>
    </div>
    `
  }
}

export default () => Tanfu.createElement(Home)
