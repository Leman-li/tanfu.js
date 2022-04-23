[English](./README.md) | 简体中文

# Tanfu


[![NPM version](https://img.shields.io/npm/v/tanfu-core?label=npm)](https://github.com/Leman-li/tanfu.js)
[![NPM Stars](https://img.shields.io/github/stars/Leman-li/tanfu.js)](https://github.com/Leman-li/tanfu.js)
[![LICENSE](https://img.shields.io/github/license/Leman-li/tanfu.js?logo=MIT)](https://github.com/Leman-li/tanfu.js)

一个高扩展、易于定制化开发、业务逻辑与视图分离开发框架

---

## 特性

* **易学易用**，概念少且集中，对前端开发用户友好
* **Tanfu 概念**，View(视图组件) Controller(控制器) Plugin(插件) Provider(供应者)  等等
* **逻辑与视图分离**，通过控制器将页面渲染视图和业务逻辑区分开来，使得业务逻辑和视图可以高度复用
* **插件机制**，插件机制可以为框架注入全局功能和视图渲染

## 安装

```bash
npm install tanfu-core --save
npm install tanfu-react-plugin --save
```

```bash
yarn add tanfu-core
yarn add tanfu-react-plugin
```

## 示例

```jsx
import Tanfu, { TanfuView, html, Component } from 'tanfu-core'
import TanfuReactPlugin from 'tanfu-react-plugin'

// 在App入口加载插件即可
Tanfu.use(new TanfuReactPlugin())

@Component()
class RootView extends TanfuView {

  template(){
    return html`<div>这是一个view</div>`
  }
}


export default Tanfu.mountView(RootView)


```

## 如何对视图加入逻辑控制

```js
// 创建一个Controller
import { Controller, EventListener, Inject, Engine } from 'tanfu-core'
@Controller()
class RootController {

  @Inject('engine') engine: Engine

  @EventListener('elementA','onClick')
   handleClick(){
     engine.setState({
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
  declarations: [ElementA]
})
class RootView extends TanfuView {

  template(){
    return html`<element-a element-id="element-a"/>`
  }
}


export default Tanfu.mountView(RootView)

```



## 常见问题解答

### 为什么要使用 Tanfu

在前端日常开发中，我们经常将业务逻辑和组件渲染放在一起，当我们需要进行特殊定制的时候，需要对原有的组件文件进行更改，这不仅污染原有的组件，还可能对原有的功能进行破坏，那么怎样在不更改原有的组件的情况下对原有的组件的逻辑或者视图进行定制开发了（扩展），Tanfu 开发框架及能够很轻易的满足这个需求

## License

[MIT](https://tldrlegal.com/license/mit-license)
