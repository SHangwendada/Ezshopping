#!/bin/bash

# 替换 server.js 中的 'fakeflag' 字符串为环境变量 GZCTF_FLAG 的值
sed -i "s/fakeflag/${GZCTF_FLAG}/g" server.js

# 启动 Node.js 应用
node server.js
