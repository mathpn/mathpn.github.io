---
title: "llm-docsmith"
tags:
  - LLM
description: "..."
pubDatetime: 2999-01-28
draft: true
lang: "en-us"
---

I've been using Simon Willison's [LLM](https://llm.datasette.io/en/stable/) CLI to interact with LLMs for quite a while now, it's a great tool.
At this point, I think everyone in the software-adjacent world has seen some form of code autocompletion.
I've been seaching for a tool to generate docstrings for Python function and classes using LLMs.
There are a few solutions, but none worked just the way I wanted, so I've decided to reinvent the wheel and implement an AI docstring generator!

Why would I implement something that already exists? That is a fair question.
First, I have started this little project a while ago.
Models keep getting better at breakneck speed, so it's quite possible that soon (or even now) it's simply cheaper to have an LLM rewrite the entire file while adding the docstrings.
However, I wanted an approach that:

- Has good user experience, no need to worry about tons of dependencies and environment variables
- Does not edit the code in any way other than modifying or adding docstrings
- Extracts all available information from the source code (e.g. type hints)

I didn't find any tool that checked all those boxes.
And lastly, I just wanted to implement this.

## The approach

I have started with a naive approach: ask the LLM to generate a docstring using Ollama.
In order to add the docstrings to the source code, I've used a [concrete syntax tree](https://stackoverflow.com/questions/1888854/what-is-the-difference-between-an-abstract-syntax-tree-and-a-concrete-syntax-tre).
The source code is parsed into a concrete syntax tree, which retains all formatting details (comments, whitespaces, parentheses, etc) using [libcst](https://pypi.org/project/libcst/).

This representation aims to be lossless, thus it's possible to change the docstrings and rewrite the module without changing dozens of lines due to whitespace or formatting.
Also, it ensures that the LLM cannot accidentally change the code while (re)writing a docstring.

The system prompt is reasonably simple and inspired by the [PEP 257](https://peps.python.org/pep-0257/) guidelines.
However, quickly I've noticed that this naive approach yielded inconsistent results.
Sometimes the docstring would mention arguments in a sentence, others it would create a bullet-point Markdown-like list, and so on.
