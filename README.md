English | [简体中文](./README_zh-CN.md)

# Tanfu

[![NPM version](https://img.shields.io/npm/v/tanfu-core?label=npm)](https://github.com/Leman-li/tanfu.js)
[![NPM Stars](https://img.shields.io/github/stars/Leman-li/tanfu.js)](https://github.com/Leman-li/tanfu.js)
[![LICENSE](https://img.shields.io/github/license/Leman-li/tanfu.js?logo=MIT)](https://github.com/Leman-li/tanfu.js)

A development framework with high scalability, easy to customize development, business logic and view separation

---

## Features

* **Easy to learn, easy to use**，Concepts are few and concentrated, user-friendly for front-end development
* **Tanfu concepts**，View components, Controller plugins, providers, etc
* **Logic and view separation**，The controller separates the page rendering view from the business logic, making the business logic and view highly reusable
* **Plugin system**，Plug-in mechanisms can inject global functionality and view rendering into the framework

## Install

```bash
npm install tanfu-core --save
npm install tanfu-react-plugin --save
npm install tanfu-loader --save
```

```bash
yarn add tanfu-core
yarn add tanfu-react-plugin
yarn add tanfu-loader
```

## Configuration

1. The tsconfig.json file needs the following Settings to support decorators and metadata

```json
  {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
     ...
  }
```
2. Webpack loader needs to add ```tanfu-loader```, used to resolve the relevant ```js | ts | tsx``` composite file

```js
   rules : [
    {
      test: /\.(js|ts|tsx)$/,
      loader: 'tanfu-loader',
      exclude: /node_modules/,
    },
    ...
   ]
  
```

## Usage

```jsx
import Tanfu, { TanfuView, html, Component } from 'tanfu-core'
import TanfuReactPlugin from 'tanfu-react-plugin'

// Just load the plugin at the entrance of the App
Tanfu.use(new TanfuReactPlugin())

@Component()
class RootView extends TanfuView {

  template(){
    return html`<div>这是一个view</div>`
  }
}

const App = Tanfu.createApp(RootView)

export default () => App

```

## How do I add logical control to a view

```jsx

// You need to create a Controller
import { Controller, EventListener, TanfuController } from 'tanfu-core'
@Controller()
class RootController extends TanfuController {

  @EventListener('elementA','onClick')
   handleClick(){
     this.setState({
       elementA: {
         text: 1
       }
     })
   }
}

function ElementA = ({text, onClick}) => {
  return <div onClick={onClick}>{text}</div>
}

@Component({
  controllers: [RootController],
  declarations: { ElementA }
})
class RootView extends TanfuView {

  template(){
    return html`<element-a element-id="elementA"/>`
  }
}


const App = Tanfu.createApp(RootView)

export default () => App

```

## FAQ

### Why is Tanfu needed

In daily front-end development, we often put business logic and component rendering together. When we need special customization, we need to change the original component file, which not only contaminate the original component, but also may destroy the original function. So how can you customize the logic or view of an existing component without changing the existing component (extension), and the TANfu framework can easily meet this need

## License

[MIT](https://tldrlegal.com/license/mit-license)
