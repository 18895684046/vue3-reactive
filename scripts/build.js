// 这里就是我们针对 monorepo 进行编译项目
// node 解析 packages 目录

const fs = require('fs')
const execa = require('execa')  // 可以打开一个进程，去做打包

// 读取目录中的 我要打包的文件夹，忽略掉纯文件（非文件夹）
const dirs = fs.readdirSync('packages').filter(p => fs.statSync(`packages/${p}`).isDirectory())

// 并行打包所有文件夹
async function build(target) {
    // xx -- 配置文件 -- 环境变量 --目标 
    // stdio:'inherit' 子进程的输出需要在父进程中打印
    await execa('rollup', ['-c', '--environment', `TARGET:${target}`],{stdio:'inherit'})
}

// 并发打包 每次打包都去调用 build 方法
async function runParallel(dirs, iterFn) {
    let result = [];
    for (let item of dirs) {
        result.push(iterFn(item))
    }
    // 存储打包的 promise，等待所有全部打包完毕后，调用成功
    return Promise.all(result)
}

runParallel(dirs, build).then(() => {
    console.log('打包成功!');
})


