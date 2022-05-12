import { TANFU_INJECTABLE_WATER_MARK } from "../constants"

/** 用以表明该类是可注入的 */
export default function Injectable(): ClassDecorator {
    return function (target: any) {
        // 如果一个类没有定义contructor，则Reflect.getMetadata('design:paramtypes', )不能获取到正确的类型
        target.contructor = (target.contructor ?? function () { })
        Reflect.defineMetadata(TANFU_INJECTABLE_WATER_MARK, true, target)
    }
}