import { Injectable } from "tanfu-core";


@Injectable()
export default class Model {

    // 可视区域的高度
    screenHeight: number = 0;
    // 渲染数据
    listData: any[] = [];
    // 每项高度
    itemHeight: number = 0;
    // 滑动scrollTop
    scrollTop: number = 0;
    
    // 获取开始的索引
    getStartIndex(){
        return Math.floor(this.scrollTop / this.itemHeight)
    }

    // 获取偏移距离
    getOffset(){
        return Math.floor(this.getStartIndex() * this.itemHeight)
    }

    // 获取可视数据
    getVisibleData(){
        return this.listData.slice(this.getStartIndex(), this.getEndIndex())
    }
    // 获取可视数量
    getVisibleCount(){
        return Math.ceil(this.screenHeight / this.itemHeight)
    }
    // 获取结尾索引
    getEndIndex(){
        return Math.min(this.getStartIndex() + this.getVisibleCount(), this.listData.length)
    }
    // 获取总高度
    getTotalHeight(){
        return this.itemHeight * this.listData.length
    }


}