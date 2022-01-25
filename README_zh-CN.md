[English](./README.md) | 简体中文

# Tanfu


[![NPM version](https://img.shields.io/npm/v/tanfu-react?label=npm)](https://github.com/Leman-li/tanfu.js)
[![NPM Stars](https://img.shields.io/github/stars/Leman-li/tanfu.js)](https://github.com/Leman-li/tanfu.js)
[![LICENSE](https://img.shields.io/github/license/Leman-li/tanfu.js?logo=MIT)](https://github.com/Leman-li/tanfu.js)

一个高扩展、易定开、业务逻辑与视图分离，遵循 MVC/MVVM 模式的开发框架

---

## 特性

* **易学易用**，仅有 4 个 概念，对前端开发用户友好
* **Tanfu 概念**，Container(容器组件) UI(ui组件) Controller(控制器) Plugin(插件)
* **逻辑与视图分离**，通过控制器将页面渲染视图和业务逻辑区分开来，使得业务逻辑和视图可以高度复用
* **定制化开发**，在不污染原有的视图和逻辑情况下，可通过简单的方法完成定制逻辑/视图的开发
* **插件机制**，插件机制可以为框架注入全局功能和视图渲染

## 安装

```bash
npm install tanfu-react --save
```

```bash
yarn add tanfu-react
```

## 示例

```jsx
import { createContainer, createUI, Controller } from 'tanfu-react';

// 构建 ui 组件 A
const A = createUI(function({ text }){
    return <div>A{text}</div>
})

// 构建 ui 组件 B
const B = createUI(function({ onClick }){
    return <div onClick={onClick}> PRESS B </div>
})

// 继承 Controller 类并实现 apply 方法，供容器组件消费
export class AppController extends Controller {

    // getName可不实现，当需要在扩展处替换该 Controller 时则需要实现
    getName(){
      return 'AppController'
    }
    
    // 此处模拟业务逻辑
    getText(){
      return 'B clicked'
    }

    apply(engine, controller){
        engine.injectCallback('elementB', 'onClick', function(){
            engine.setState({
                elementA: {
                    text: controller.getText()
                }
            })
        })
    }
}


// 构建容器组件
const App = createContainer(function(){
    return (
        <div>
          <A elementId="elementA">
          <B elementId="elementB">
        </div>
    )
}, [new AppController()])

```

## 如何进行扩展开发（定制化开发）

## 扩展逻辑

对逻辑的扩展很简单，如下所示，我们调用容器组件的 extend 方法传入扩展后的 Controller 即可

```jsx
class NewAppController extends AppController {
    // 模拟新的业务逻辑
    getText(){
      return 'new B clicked'
    }
}

// 通过容器组件的extend方法消费新的 Controller
// 此处注意 NewApp 并不会消费老的 AppController， 
// 因为 NewAppController 和 AppController 有共同的 name，后加入的 Controller 会将前面的 Controller 覆盖
const NewApp = App.extend({controllers: [new NewAppController()]})
```

## 扩展视图

对视图的扩展也很简单，如下所示，我们调用容器组件的 extend 方法传入扩展后的视图即可

```jsx
import { createUI } from 'tanfu-react'
const NewB = createUI(function({onClick}){
    return <div onClick={onClick}>PRESS NEW B</div>
})

const NewApp = App.extend({
  elements:{
    'elementB': NewB
  }
})
```

## 常见问题解答

### 为什么要使用 Tanfu

在前端日常开发中，我们经常将业务逻辑和组件渲染放在一起，当我们需要进行特殊定制的时候，需要对原有的组件文件进行更改，这不仅污染原有的组件，还可能对原有的功能进行破坏，那么怎样在不更改原有的组件的情况下对原有的组件的逻辑或者视图进行定制开发了（扩展），Tanfu 开发框架及能够很轻易的满足这个需求

## License

[MIT](https://tldrlegal.com/license/mit-license)
