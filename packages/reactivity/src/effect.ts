import { isArray, isIntegerKey } from "@vue/shared";

export function effect(fn, options: any = {}) {
    const effect = createReactiveEffect(fn, options)
    if (!options.lazy) {
        effect()
    }
    return effect  // 返回响应式的 effect
}

const effectStack = []; // 收集用的 栈
let activeEffect;
let id = 0
function createReactiveEffect(fn, options) {
    const effect = function reactiveEffect() {
        try {
            effectStack.push(effect)
            activeEffect = effect
            return fn();
        } finally {
            effectStack.pop()
            activeEffect = effectStack[effectStack.length - 1]
        }
    }
    effect.id = id++ // 构建一个 id
    effect.__isEffect = true;
    effect.options = options
    effect.deps = []; // effect 用来收集依赖了哪些属性
    return effect
}


// 映射表  -- 类似于数组 每一项是 一个索引对应下方的一个 对象
// WeekMap{
//     {name:"张三2",age:6}:{
//         name:new Set(effect,effect), //  多个
//         age: new Set (effect)
//     }
// }
//  收集依赖
const targetMap = new WeakMap;

export function track(target, type, key) {
    // console.log('track',key);

    if (activeEffect === undefined) {
        return // 用户只是取值了，而且这个值不是在 effect 中使用的，什么都不用收集
    }
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect)
    }
    // console.log(targetMap, '依赖');
}

// 触发更新
export function trigger(target, type, key, newValue, oldValue?) {
    // console.log('trigger');

    //  去映射表中找到属性对应的 effect 让它重新执行
    let depsMap = targetMap.get(target)
    if (!depsMap) return // 只是改了属性，这个属性没有在effect中使用，因为使用的话，肯定收集了依赖

    const effectSet = new Set()
    const add = (effectAdd) => { // 如果同时有多个 依赖的是同一个 effect，还用了 set 做了过滤
        if (effectAdd) {
            effectAdd.forEach(effect => effectSet.add(effect))
        }
    }
    console.log(key, '外部key');
    //  1. 如果 更改的数组长度 小于依赖收集的长度 要重新触发渲染
    //  2. 如果调用了 push 方法，或者其他新增数组的方法 (必须能改变长度的方法)，也需要触发更新 
    if (key === 'length' && isArray(target)) { // 是数组 并且修改了 length
        console.log(depsMap,'121');
        console.log(targetMap,'targetMap');
        
        depsMap.forEach((dep, key) => {
            console.log(dep, key, '--', newValue); // 我对 2 的这一项收集了 effect
            if (key > newValue || key === 'length') {
                add(dep) // 更改的数组长度 比收集到的属性值小
            }
        })
    } else {
        console.log('222');
        add(depsMap.get(key))
        
        switch (type) {
            case 'add':
                if (isArray(target) && isIntegerKey(key)) {
                    add(depsMap.get('length'))  // 增加属性 需要触发 length的依赖收集
                }
        }
    }
    effectSet.forEach((effect: any) => effect())
}

/**
 * [fn1] activeEffect = fn1 proxy.name
 * [fn1,fn2] activeEffect = fn2 proxy.age
 * pop() 之后
 * [fn1]  activeEffect = fn1 proxy.address
 */
// effect(()=>{ // fn1
//     proxy.name
//     effect(()=>{ // fn2
//         proxy.age
//     })
//     proxy.address
// })