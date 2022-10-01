import { extend, hasChanged, hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared"
import { reactive, readonly } from "./reactive";

function createGetter(isReadonly = false, shallow = false) {
    /**
     * @param {target} 目标元对象
     * @param {key}  去取的属性
     * @return {receiver} 代理对象 
     */
    return function get(target, key, receiver) {
        const res = Reflect.get(target, key)

        if (!isReadonly) {
            console.log('收集当前属性，如果这个属性变化了，稍后可能要更新视图', key);
        }
        if (shallow) {
            return res
        }
        //  这里是 懒递归 当我们取值的时候才去做递归代理，如果不取默认代理一层，性能好
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }
        return res
    }
}
/**
 * vue3 针对的是对象来进行劫持，不用改写原来的对象，如果是嵌套，当取值的时候才回代理
 * vue2 针对的是属性的劫持，改写了原来对象，一上来就进行递归
 * vue3 可以对不存在的属性进行获取，也会走 get 方法 ，prxoy 支持数组
 */

function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        const oldValue = target[key] // 获取老值

        // 有一个属性不能被修改 target[key] = value ，不会报错，但是通过 Reflect.set 会返回 false
        //  设置属性， 可能以前有 （修改）  以前没有（新增）
        // 如何判断数组是新增还是修改
        const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)
        
        //  放在这里 不房子最下面的原因 ： 待会需要获取 最新值
        const res = Reflect.set(target, key, value)

        if (!hadKey) {
            console.log('新增');
        } else if (hasChanged(oldValue, value)) {
            console.log('修改');
        }
        return res
    }
}

// get 方法
const get = createGetter() // 默认不是只读的， 也不是浅的
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)


// set 方法
const set = createSetter() // 默认不是只读的， 也不是浅的
const shallowSet = createSetter(true)
// 只读数据 set 应该提示错误 --- 【readonly 没有 set】
let readonlySet = {
    set(target, key) {
        console.warn(`cannot set ${JSON.stringify(target)} on key ${key} failed`);
    }
}
//  不同的处理函数
export const mutableHandler = {
    get: get,
    set

}
export const shallowReactiveHandlers = {
    get: shallowGet,
    set: shallowSet
}
export const readonlyHandlers = extend({
    get: readonlyGet,
}, readonlySet)

export const shallowReadonlyHandlers = extend({
    get: shallowReadonlyGet
}, readonlySet)