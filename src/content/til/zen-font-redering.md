---
title: "Fixing blurry fonts on Zen Browser"
tags:
  - Tips
pubDatetime: 2024-12-29
lang: "en-us"
---

I've been enjoying using [Zen Browser](https://zen-browser.app/) lately, thanks to its sleek and user-friendly interface. However, I noticed that the fonts and certain elements appeared a bit blurry in a display with fractional scaling while using Fedora (Linux). It seems this issue isn't limited to my setup, as others have reported similar problems on various operating systems.

Fortunately, I found a straightforward solution! By adjusting the `zen.view.experimental-rounded-view` setting to `false` in `about:config`, I was able to clear up the display issues. The fix is in [this issue](https://github.com/zen-browser/desktop/issues/2375#issuecomment-2441900369).

Zen Browser is being actively developed by its community. If you want to try a fresh browser UI, maybe give it a try.
