
function Controller(): ClassDecorator {
    return function (target: any) {
      Reflect.defineMetadata('tanfu:isController', true, target)
      return target;
    }
  }
  
  function Injectable(): ClassDecorator {
    return function (target: any) {
      Reflect.defineMetadata('tanfu:isInjectable', true, target)
      return target
    }
  }
  
  
  @Controller()
  class A {
  
  }