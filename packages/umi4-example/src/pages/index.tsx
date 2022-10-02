import Tanfu, { Component, Controller, HostLifeCycle, html, TanfuController, TanfuView, TemplateObject } from 'tanfu-core';
import { TanfuReactView } from 'tanfu-react-plugin';
import yayJpg from '../assets/yay.jpg';
import React from 'react'

// export default function HomePage() {
//   return (
//     <div>
//       <h2>Yay! Welcome to umi!</h2>
//       <p>
//         <img src={yayJpg} width="388" />
//       </p>
//       <p>
//         To get started, edit <code>pages/index.tsx</code> and save to reload.
//       </p>
//     </div>
//   );
// }

@Controller()
class HomeController extends TanfuController {


  @HostLifeCycle('willMount')
  willMount(){
    this.setState({
      img: {
        src: yayJpg
      }
    })
  }
}


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
