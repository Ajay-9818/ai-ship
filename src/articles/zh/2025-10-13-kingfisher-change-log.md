---
title: "为 Kingfisher 编写版本更新说明"
date: "2025-10-13"
tools: ["codex"]
category: "工作"
prompt: |
    # 更新 Change Log

    ## 概述

    - 提取代码库变更
    - 确定下一个版本号
    - 更新 change_log 文件，该文件会被 release 脚本使用。

    ## 详细

    - 目标文件：change_log.yml
    - 文件格式：

        ```yaml
        version: 目标版本号
        name: 版本名字
        add:
        - add content 1 [#{PR_NUMBER}]({LINK_OF_PR_NUMBER}) @{AUTHOR_OR_REPORTER_NAME}
        - add content 2
        fix:
        - fix content 1
        - fix content 2
        ```

        一个 sample：

        ```yaml
        version: 8.3.2
        name: Tariffisher
        fix:
        - Memory cache cleanning timer will now be correctly set when the cache configuration is set. [#2376](https://github.com/onevcat/Kingfisher/issues/2376) @erincolkan
        - Add `BUILD_LIBRARY_FOR_DISTRIBUTION` flag to podspec file. Now CocoaPods build can produce stabible module. [#2372](https://github.com/onevcat/Kingfisher/issues/2372) @gquattromani
        - Refactoring on cache file name method in `DiskStorage`. [#2374](https://github.com/onevcat/Kingfisher/issues/2374) @NeoSelf1
        ```

    - 任务步骤

    1. 读取变更和相关人员
        - 读取当前 master branch 和上一个 tag （release）之间的变更
        - 提取变化内容和相关的 GitHub PR/Issue和相关人员
        - 如果 PR 是对某个 issue 的修复，那么除了 PR 作者之外，issue 报告者也是相关人员
        - 一个变更可以有多个相关人员
    2. 根据变化，按照 Semantic Versioning 的规则，确定版本号
    3. 为版本拟定一个短语（三个单词以内），作为版本名字。最好有趣一些，与当前版本的核心变化相关
    4. 更新 change_log.yml 文件
  
---

对于以前那类重复枯燥，但是又需要一定人为参与的任务，使用AI来进行替代简直是最理想的使用案例。

[Kingfisher](https://github.com/onevcat/Kingfisher) 的版本发布往往牵涉到多个 PR 和 Issue，人工整理会漏掉细节；手动核对并将改动归功到相应贡献者也很繁琐；最后，要给每个版本取名有时候也够我苦恼一整天。有了这套流程，AI 会先帮我罗列 master 相对上一个 tag 的所有变动，然后自动解析 PR 描述，汇总出功能、修复与贡献者。这样我就可以把注意力放在校对和补充洞察上，而不必重新搜集信息。

为了提升准确率，我还会在对话里附上一两个示例输出，让 AI 仿照示例把新的条目填入 change_log。只要提示词里明确「不要改动 YAML 的键名」以及「每条目必须附带链接和贡献者」，AI 就能稳定产出符合 release 脚本要求的版本说明。另外，我也会让它给出版本号推导过程（比如为什么是次要版本还是补丁版本），这样在审查时可以快速验证语义化版本的判定依据。把这些策略组合在一起，原本繁琐的 release 准备变成了一次轻松的审阅流程。
