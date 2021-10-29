# Git 速查

Git是一个免费的开源分布式版本控制系统，旨在快速高效地处理从小型到大型项目的所有内容。Git易于学习， 占地面积小，具有闪电般的快速性能。它具有Subversion，CVS，Perforce和ClearCase之类的SCM工具，具有廉价的本地分支，方便的暂存区域和多个工作流等功能。

## 配置

```bash
git config --global "Your Name"
git config --global "Email Address"
```

## 初始化
```bash
git init
```

## 提交修改
```bash
git status
git status -s 文件状态缩略信息, 常见 A:新增; M:文件变更; ?:未track; D:删除
git diff <file>
git diff HEAD -- <file>		查看工作区和版本库里面最新版本的区别
git diff --check <file>     检查是否有空白错误(regex:' \{1,\}$')
git diff --cached <file>    查看已add的内容(绿M)
```

## 查看历史版本、历史操作
```bash
git log
git reflog
git log -n                  最近n条的提交历史
git log <branch_name> -n    分支branch_name最近n条的提交历史
git log --stat              历次commit的文件变化
git log --shortstat         对比--stat只显示最后的总文件和行数变化统计(n file changed, n insertions(+), n deletion(-))
git log --name-status       显示新增、修改、删除的文件清单
git log lhs_hash..rhs_hash  对比两次commit的变化(增删的主语为lhs, 如git log HEAD~2..HEAD == git log HEAD -3)
git log -p                  历次commit的内容增删
git log -p -W               历次commit的内容增删, 同时显示变更内容的上下文
git log origin/EI-1024 -1 --stat -p -W 查看远端分支EI-1024前一次修改的详细内容
git log origin/master..dev --stat -p -W 查看本地dev分支比远端master分支变化(修改)的详细内容

git log <branch_name> --oneline   对提交历史单行排列
git log <branch_name> --graph     对提交历史图形化排列
git log <branch_name> --decorate  对提交历史关联相关引用, 如tag, 本地远程分支等
git log <branch_name> --oneline --graph --decorate 拼接一下, 树形化显示历史
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen%ai(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit 同上, 建议alais保存

git log --pretty=format 常用的选项(摘自progit_v2.1.9)
%H 提交对象（commit）的完整哈希字串
%h 提交对象的简短哈希字串
%T 树对象（tree）的完整哈希字串
%t 树对象的简短哈希字串
%P 父对象（parent）的完整哈希字串
%p 父对象的简短哈希字串
%an 作者（author）的名字
%ae 作者的电子邮件地址
%ad 作者修订日期（可以用 --date= 选项定制格式）
%ar 作者修订日期，按多久以前的方式显示
%cn 提交者（committer）的名字
%ce 提交者的电子邮件地址
%cd 提交日期
%cr 提交日期，按多久以前的方式显示
%s 提交说明

git log --since --after     显示时间之后的提交
git log --until --before    显示时间之前的提交
git --author                显示指定作者的提交
git --committer             显示指定committer的提交(注:committer不一定是author)
git log -S [keyword]        仅显示添加或移除了某个关键字的提交(某些场景比单独git log -p | grep [keyword] 好用很多)
git log origin/b3.3/master --author=yx-ren --since="2019-10-01" --before="2019-11-01" 查看某作者在某发布版本最近一个月的提交, 常见于线上背锅
git log origin/b3.0/master --author=some_leave --since="1 month ago" 查看某刚离职同事过去一个月的提交, 常见于背锅
git log --since=1.weeks     过去一周的提交(写周报的时候可以看看我这一周干了啥)
git log --since=1.days      过去一天的提交(下班的时候可以看看我这一天干了啥)
git log --since="1 weeks 2 days 3 hours 40 minutes 50 seconds ago" 过去1周2天3小时40分50秒之内的提交
```

## 版本回退、前进
```bash
git reset --hard HEAD^		回退到上1版本
git reset --hard HEAD~5		回退到上5个版本
git reset --hard id		回退到指定版本
```

## 撤销修改
```bash
git checkout -- <file>		撤销修改：误修改工作区文件，未git add/commit
git restore <file>		撤销修改：误修改工作区文件，未git add/commit
git reset HEAD <file>		撤销git add：误将文件加入暂存区（git add），未git commit
git reset --hard HEAD^		撤销git commit：误将文件提交（一旦提交，只能通过版本回退进行撤销）
```

## 删除与恢复
```bash
git rm/add <file>
git commit -m "remove <file>"	删除版本库中的<file>：删除工作区文件后，继续删除版本库中相应的文件
git checkout -- <file>		根据版本库中的<file>恢复工作区<file>
```

## 清理工作区
未track也未ignore的文件或文件夹(如各种临时.swp, .patch文件等)

```bash
git clean -i    #交互式清理, 不常用
git clean -n    #查看清理文件列表(不包括文件夹), 不执行实际清理动作
git clean -n -d #查看清理文件列表(包括文件夹), 不执行实际清理动作
git clean -f    #清理所有未track文件
git clean -df   #清理所有未track文件和文件夹, 常用, 但使用前确保新增加的文件或文件夹已add, 否则新创建的文件或者文件夹也会被强制删除
```

## 关联GitHub远程仓库

本地到远程

```bash
git remote add origin <remote address>	在本地工作区目录下按照 GitHub 提示进行关联
git remote rm origin			解除错误关联
git push -u origin master		第一次将本地仓库推送至远程仓库（每次在本地提交后进行操作）
git push origin master			以后每次将本地仓库推送至远程仓库（每次在本地提交后进行操作）
<remote address>:
	git@github.com:<username>/<repository>.git
	https://github.com/<username>/<repository>.git
```

## 克隆GitHub远程仓库
远程到本地
```bash
git clone <remote address>	git协议速度更快但通常公司内网不允许，https协议速度慢
```

## 分支管理
创建、切换、查看、合并、删除
```bash
git branch <branch name>	创建<branch name>分支
git checkout <branch name>	切换至<branch name>分支
git switch <branch name>	切换至<branch name>分支
git checkout -b <branch name>	创建并切换至<branch name>分支
git switch -c <branch name>	创建并切换至<branch name>分支
git branch			查看已有分支（* 表示当前分支）
git merge <branch name>		合并<branch name>到当前分支（通常在master分支下操作）
git branch -d <branch name>	删除分支
```

## 解决合并冲突
```bash
git log --graph --pretty=oneline --abbrev-commit
git log --graph
```

## 分支管理
合并后删除分支也在 log 中保留分支记录
```bash
git merge --no-ff -m "descriptions" <branch name>
```

## 开发流程
```bash
master分支		发布稳定版本
dev分支			发布开发版本
<developer name>分支	个人开发分支（个人开发完成将该分支并入dev，同时保留该分支，继续开发）
```

## References
```bash
https://github.com/skywind3000/awesome-cheatsheets/blob/master/tools/git.txt
https://www.liaoxuefeng.com/wiki/896043488029600
https://git-scm.com/book/en/v2
```