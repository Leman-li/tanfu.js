import React from 'react';
import Tanfu, { createUI, createContainer, Engine, Controller, Template } from '../index'
export default ({ title }: { title: string }) => <Root />;

interface ControllerIntance extends Controller {
    getMyName: string
}

Tanfu.use(function () {
    Tanfu.setPrototypeOfController('getMyName', 'dsasfsafds')
})
Tanfu.use(function () {
    Tanfu.element('myelementId', function ({ text }) {
        return <div>这是我的自定义组件{text}</div>
    })
})

class ControllerA extends Controller {
    apply(engine: Engine<ViewModel>, controller: ControllerIntance): void {
        engine.didMount('elementA', () => {
            console.log('a加载完成了')
        })
        engine.didMount('elementB', () => {
            console.log('B加载完成了')
        })
        engine.injectCallback('elementB', 'onClick', function () {
            console.log('点击了')
            engine.setState({
                elementA: {
                    text: controller.getMyName
                },
                myelementId: {
                    text: '黎明宇'
                }
            })
        })

        engine.watchElement('elementA', () => {
            console.log('text变化了', engine.getState('elementA').text)
        }, ['text'])
    }
}

const Root = createContainer(function () {
    return (
        <React.StrictMode>
        <div>
            <A elementId='elementA' />
            <Template elementId='myelementId' />
            <B elementId='elementB' />
        </div>
        </React.StrictMode>
    )
}, [new ControllerA()]).extend({
    // elements:{
    //     'elementA': function({text}){
    //         return <div>这是从写的A{text}</div>
    //     }
    // }
})

type ViewModel = {
    elementA: Aprops,
    elementB: Bprops,
    myelementId: Aprops
}

type Aprops = {
    text?: string
}

type Bprops = {
    onClick?: () => void
}

const A = createUI<Aprops>(function ({ text }) {
    return <div>这是A组件{text}</div>
})

const B = createUI<Bprops>(function ({ onClick }) {
    return <div onClick={onClick}>这是B组件</div>
})
