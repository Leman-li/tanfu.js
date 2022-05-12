import { DESIGN_PARAMTERS, TANFU_CONTROLLER_WATER_MARK } from "../constants";
import { getParameterNames } from "../util";

/** 用以表明该类属于 Controller */
export default function Controller(): ClassDecorator {
    return function (target: any) {
        Reflect.defineMetadata(DESIGN_PARAMTERS, getParameterNames(target), target);
        Reflect.defineMetadata(TANFU_CONTROLLER_WATER_MARK, true, target)
    }
}