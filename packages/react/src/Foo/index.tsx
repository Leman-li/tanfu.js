import React from 'react';
import { createUI, createContainer, Engine, Plugin } from '../index'
export default ({ title }: { title: string }) => <Root />;


class PluginA extends Plugin {
    apply(engine: Engine<ViewModel>): void {
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
                    text: '点击了'
                }
            })
        })

        engine.watchElement('elementA', () => {
            console.log('text变化了', engine.getState('elementA').text)
        }, ['text'])
    }
}

const Root = createContainer([new PluginA], function () {
    return (
        <div>
            <A elementId='elementA' />
            <B elementId='elementB' />
        </div>
    )
})

type ViewModel = {
    elementA: Aprops,
    elementB: Bprops,
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
