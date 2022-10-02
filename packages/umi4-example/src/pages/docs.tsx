import Tanfu,  { Component, html, TanfuView, TemplateObject } from "tanfu-core";
import { Link } from "umi";


@Component({
  declarations: {
    'umi-link': Link
  }
})
class Docs extends TanfuView {
  template(): TemplateObject {
    return html`
    <div>
      <p>This is umi docs.</p>
      <umi-link to="/">跳转到主页</umi-link>
    </div>
    `
  }
}

export default () => Tanfu.createElement(Docs)
