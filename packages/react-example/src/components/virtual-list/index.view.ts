import React from "react";
import { Component, TanfuView, html } from "tanfu-core";
import { TemplateObject } from "tanfu-core/es/html";
import VirtualListController from "./index.controller";
import './index.css'
import Model from "./index.model";
import VirtualListContent from "./components/virtual-list-content";

export interface VirtualListProps {
    height: number;
    itemHeight: number;
    itemNode: React.ReactNode
}

@Component({
    controllers: [VirtualListController],
    providers: [Model],
    declarations: [VirtualListContent]
})
export default class VirtualList extends TanfuView {

    template(): TemplateObject {
        return html`
        <div class="virtual-list-container" t-id="v-list-container">
            <div class="virtual-list-inner" t-id="v-list-inner"></div>
            <virtual-list-content class="virtual-list-content" t-id="v-list-content">
                <slot name="itemNode"/>
            </virtual-list-content>
        </div>
        `
    }
}