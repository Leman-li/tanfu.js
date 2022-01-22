English | [简体中文](./README_zh-CN.md)

# Tanfu

[![NPM version](https://img.shields.io/npm/v/tanfu-react?label=npm)](https://github.com/Leman-li/tanfu.js)
[![NPM Stars](https://img.shields.io/github/stars/Leman-li/tanfu.js)](https://github.com/Leman-li/tanfu.js)
[![LICENSE](https://img.shields.io/github/license/Leman-li/tanfu.js?logo=MIT)](https://github.com/Leman-li/tanfu.js)

A high expansion, easy to open, business logic and view separation, follow the MVC/MVVM model of the development framework

---

## Features

* **Easy to learn, easy to use**，There are only four concepts, which are user-friendly for front-end development
* **Tanfu concepts**，Container(Container component) UI (UI component) Controller Plugin
* **Logic and view separation**，The controller separates the page rendering view from the business logic, making the business logic and view highly reusable
* **Custom development**，Custom logic/views can be developed in a simple way without contaminating the original views and logic 
* **Plugin system**，Plug-in mechanisms can inject global functionality and view rendering into the framework

## 📦 Install

```bash
npm install tanfu-react --save
```

```bash
yarn add tanfu-react
```

## 🔨 Usage

```jsx
import { createContainer, createUI, Controller } from 'tanfu-react';

// Build UI component A
const A = createUI(function({ text }){
    return <div>A{text}</div>
})
// Build UI component B
const B = createUI(function({ onClick }){
    return <div onClick={onClick}> PRESS B </div>
})

// Inherit the Controller class and implement the Apply method for consumption by container components
class AppController extends Controller {

    apply(engine){
        engine.injectCallback('elementB', 'onClick', function(){
            engine.setState({
                elementA: {
                    text: 'B clicked'
                }
            })
        })
    }
}

// Build Container component C
const App = createContainer(function(){
    return (
        <div>
          <A elementId="elementA">
          <B elementId="elementB">
        </div>
    )
}, [new AppController()])

```

## License

[MIT](https://tldrlegal.com/license/mit-license)