![](/img/docker_cli.jpg)

## 基本概念

### 三要素
- 镜像(Image)
- 容器(container)
- 仓库(repository)

镜像是一个打包模版，可以创建多个容器，每个容器都是相互隔离的微版`linux`环境

镜像可以是看做一个千层卷的文件系统，可以在构建的容器中利用commit来构建新的images

### 数据卷(volume)

用于容器的数据持久化和数据共享

- 命令：`docker run -it /data:/containerData  centos`
- Dockerfile中`VOLUME`指令， 主机的目录为默认，通过docker inspect查询

## 常用命令

### 帮助命令

`docker info` ：本机docker的运行实例等信息

`docker --help`:  命令列表

### 镜像命令

`docker images`: 本机存在的镜像
​  -a:  列出包含中间镜像层的所有images
​  -q:  只显示镜像id

`docker search`：在远程仓库查询镜像资源
​	  -s: 指定超过一定星的镜像

`docker pull`: 拉取镜像 

`docker rmi`:  删除镜像
​   -f: 强制删除

### 容器命令

`docker run`: 用一个镜像新建并运行容器

  -i：已交互方式运行  

​  -t:  新开一个终端运行

  -d:  后台运行容器

​  --name：容器名字

  -v :  配置容器数据卷   -v  主机目录路径:容器目录路径

`docker ps`: 列出正在运行的容器  -a  列出所有容器

`exit`: 推出+停止容器   ctrl+q+p  推出容器

`docker start`: 启动容器

`docker restart`: 重启容器

`docker stop`: 停止容器

`docker rm`: 删除容器   docker rm -f $(docker ps -a -q)  删除所有容器

`docker logs`: 容器日志

​	 -t: 显示时间戳

  -f：可以追加显示

  --tail: 显示后面倒数几条

`docker top`: 查看容器里跑的进程

`docker inspect`: 以json格式显示容器的信息

`docker attach`:  进入容器 

`docker exec`-it 容器id /bin/bash:  进入到容器的终端

`docker commit`: 把某个容器提交为新镜像

  ​-a： 作者信息  
  -m :  提交信息

`docker cp`:  拷贝容器文件到主机

## Dockerfile

镜像构建的描述性编程文件， 利用 `docker build` 生成新镜像

`FROM`: 从哪个基础镜像开始构建

`MAINTAINER`: 镜像维护者的名字和邮箱

`RUN`: 容器构建时需要运行的命令

`EXPOSE`: 当前容器对外暴露的接口

`WORKDIR`：指定创建容器后，终端默认的工作目录

`ENV`: 构建镜像过程中设置的环境变量

`ADD`:  将主机文件复制到容器并解压缩

`COPY`: 将主机文件复制到容器

`VOLUME`: 指定容器数据卷

`CMD`: 指定容器启动后要运行的命令，最后一个有效

`ENTRYPOINT`: 和CMD类似，但是可以追加命令参数

`ONBUILD`: 在子镜像构建时触发的钩子

## 例子