---
title: "Writing Change Logs for Kingfisher"
date: "2025-10-13"
tools: ["codex"]
category: "Work"
prompt: |
    # Update the Change Log

    ## Overview

    - Extract repository changes
    - Decide on the next version number
    - Update the change_log file, which is used by the release script.

    ## Details

    - Target file: change_log.yml
    - File format:

        ```yaml
        version: target version number
        name: version nickname
        add:
        - add content 1 [#{PR_NUMBER}]({LINK_OF_PR_NUMBER}) @{AUTHOR_OR_REPORTER_NAME}
        - add content 2
        fix:
        - fix content 1
        - fix content 2
        ```

        A sample:

        ```yaml
        version: 8.3.2
        name: Tariffisher
        fix:
        - Memory cache cleanning timer will now be correctly set when the cache configuration is set. [#2376](https://github.com/onevcat/Kingfisher/issues/2376) @erincolkan
        - Add `BUILD_LIBRARY_FOR_DISTRIBUTION` flag to podspec file. Now CocoaPods build can produce stabible module. [#2372](https://github.com/onevcat/Kingfisher/issues/2372) @gquattromani
        - Refactoring on cache file name method in `DiskStorage`. [#2374](https://github.com/onevcat/Kingfisher/issues/2374) @NeoSelf1
        ```

    - Task steps

    1. Read the changes and the related people
        - Review the changes between the current master branch and the previous tag (release)
        - Extract the change details together with the related GitHub PR/Issue and the contributors
        - If a PR fixes an issue, include the issue reporter in addition to the PR author
        - A single change can have multiple contributors
    2. Determine the version number according to the changes and the Semantic Versioning rules
    3. Coin a phrase (within three words) for the version name. Keep it fun and tied to the core change
    4. Update the change_log.yml file

---

For those repetitive and tedious tasks that still need human input, letting AI take over is the perfect use case.

A [Kingfisher](https://github.com/onevcat/Kingfisher) release usually spans multiple PRs and issues, and manual curation easily misses fine details; double-checking while crediting the right contributors is also a chore; to top it off, naming each release can keep me stuck all day. With this workflow, AI first lists every change on master since the previous tag, then parses PR descriptions to summarize features, fixes, and contributors. That frees me up to focus on reviewing and adding insights instead of gathering information from scratch.

To improve accuracy, I include one or two sample outputs in the prompt so the AI can populate the new entries in the change log file by analogy. As long as the instructions clearly state “don’t modify the YAML keys” and “each entry must include links and contributors,” the AI consistently produces release notes that satisfy the release script. I also ask it to explain how it derived the version number (for example, why it is a minor or a patch release), so I can quickly validate the Semantic Versioning decision during review. Combining these strategies turns the once tedious release prep into a relaxed catching-up session.
