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

Here, again, the syntax tree comes in handy.
The concrete syntax tree is transformed into an abstract syntax tree, which is friendlier to navigate.
Then, we can traverse function definition nodes to extract their signature, that is, all argument names, defaults, and type hints (if available).
Hence, we do not rely on the LLM to get all arguments perfectly right every time nor with formatting.
We have the function signature and, with it, it's possible to generate correct argument lists with consistent formatting.

I then used structured output constraints to ensure the LLM outputs a string in the desired format.[^eol]
Structured outputs are incredibly useful to extract information from LLM outputs without complex parsing, but they do increase input token usage since the JSON schema is sent as part of the request.

[^eol]: it's still possible to get an unexpected EOL error with structured outputs. However, the request either fails or returns a string that is a valid JSON with the specified schema.

The structured output allowed me to build a docstring with a consistent format, listing arguments, defaults, types, and the return.
The LLM fills the slots with the overall summary and description of each argument or return.

This approach worked and generated good docstrings, but the user experience was still a bit lacking.
Installing a standalone Python CLI is easy using `pipx` or `uvx`, but it still required Ollama installed and running.
If I added OpenAI or Anthropic model support, then it would require configuring environment variables with API keys, which degrade user experience quite a lot.
The LLM tool (not to be confused with LLM models) mentioned earlier provides a [Python API](https://llm.datasette.io/en/stable/python-api.html) which can be used to execute prompts.
LLM has API key management built-in, with support for all major LLM providers through plugins.

Substituting the Ollama Python library for the LLM one was very easy, but transforming my little docstring tool into an LLM plugin would be even better.
