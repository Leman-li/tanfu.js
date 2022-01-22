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

## 📦 安装

```bash
npm install tanfu-react --save
```

```bash
yarn add tanfu-react
```

## 🔨 示例

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

## License

[MIT](https://tldrlegal.com/license/mit-license)