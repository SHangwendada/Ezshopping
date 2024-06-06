# 使用 Node.js 官方镜像作为基础镜像
FROM node:latest

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 文件
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制应用程序代码
COPY . .

# 暴露应用程序端口
ENV GZCTF_FLAG="defaultflagvalue"

# 运行应用程序
CMD ["node", "server.js"]
