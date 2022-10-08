
import ts from "rollup-plugin-typescript2" // 解析 ts 插件
import resolvePlugin from '@rollup/plugin-node-resolve' // 解析第三方模块
import path from 'path' // 处理路径 

// 获取 packages 目录
let packagesDir = path.resolve(__dirname, 'packages') // 获取 packages 的绝对路径
let packageDir = path.resolve(packagesDir, process.env.TARGET); // 获取对应要打包的绝对路径  process.env（node提供的）

// 获取这个路径下的 package.json
const resolve = p => path.resolve(packageDir, p); // 根据当前需要打包的路径解析

const pkg = require(resolve('package.json')); // 表示我要引用这个 json 文件
const packageOptions = pkg.buildOptions
const name = path.basename(packageDir); // 获取这个目录最后一个名字

// import require window.xxx
const outputConfig = {
    'esm-bundler': {
        file: resolve(`dist/${name}.esm-bundler.js`),
        format: "es"
    },
    'cjs': {
        file: resolve(`dist/${name}.cjs.js`),
        format: 'cjs'
    },
    'global': {
        file: resolve(`dist/${name}.global.js`),
        format: 'iife'
    }
}

function createConfig(format, output) {
    output.name = packageOptions.name // 用于 iife 在 window 上挂载的属性
    output.sourcemap = true // 稍后生成 sourcemap
    return {
        input: resolve(`src/index.ts`), // 打包入口
        output,
        plugins: [
            ts({  // ts 编译的时候用的文件是哪一个
                tsconfig: path.resolve(__dirname, 'tsconfig.json')
            }),
            resolvePlugin()
        ]
    }
}
// 根据用户提供的 formats 选项 去我们自己的配置取值进行生产配置文件

export default packageOptions.formats.map(format => createConfig(format, outputConfig[format]))

// 一个包要打包多个格式 esModule commonjs iife