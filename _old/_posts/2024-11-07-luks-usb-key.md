---
title: "Home server security: LUKS with USB unlock"
header:
  overlay_image: /assets/images/default_overlay.jpg
  show_overlay_excerpt: false
categories:
  - Blog
tags:
  - Security
  - Home server
---

I've been using [Linux Unified Key Setup (LUKS)](https://en.wikipedia.org/wiki/Linux_Unified_Key_Setup) for full disk encryption on my home server, but entering a long password on every boot can be quite inconvenient. That's why I was searching for a way to use a key file in a USB stick to unlock the root partition.

There are many blog posts and resources on how to do it, but many are outdated and none of them allowed me to enter the password if the key is not available. This can lead to mount failure during boot, which is extremely inconvenient for a headless computer.

Fortunately, I stumbled upon a blog post which describes a way to do what I wanted!

Read it here: [https://tqdev.com/2022-luks-with-usb-unlock](https://tqdev.com/2022-luks-with-usb-unlock)
