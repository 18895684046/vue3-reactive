export function effect(fn, options:any = {}) {
    const effect = createReactiveEffect(fn,options)
    if(!options.lazy){
        effect()
    }
    return effect  // 返回响应式的 effect
}

function createReactiveEffect(fn,options){
    return function reactiveEffect(){
        console.log('111');
        
    }
}