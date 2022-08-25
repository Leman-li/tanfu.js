import { createMethodArgsDecorator, TanfuMethodParamType } from "./create-method-args-decorator";

export default function TId() {
    return createMethodArgsDecorator(TanfuMethodParamType.T_ID)()
}