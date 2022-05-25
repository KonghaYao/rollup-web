# shim packages

1. 在源代码中直接写 nodejs 环境的库的名称
2. 在 rollup.config.js 中使用 alias 导向到这个包内
3. 在 shim 文件内使用 添加后缀名"-bundle" 对原有库进行导向
4. 在 rollup.config.js 中使用 path 替换 "-bundle" 后缀名的包
