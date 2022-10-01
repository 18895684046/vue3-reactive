
const execa = require('execa')

// 并行打包所有文件夹
async function build(target) {
    // xx -- 配置文件 -- 环境变量 --目标 
    // stdio:'inherit' 子进程的输出需要在父进程中打印
    await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], { stdio: 'inherit' })
}
build('reactivity').then((res)=>{
    console.log('单个打包成功!,可以添加-cw,监听文件改变');
})