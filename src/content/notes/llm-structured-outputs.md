---
title: "How LLMs produce structured outputs"
tags:
  - TIL
pubDatetime: 2024-12-30
lang: "en-us"
draft: true
---

Ollama has recently added support for [structured outputs](https://ollama.com/blog/structured-outputs). But how exactly does LLMs produce structured outputs?

I have used prompting tricks such as "_answer with a JSON only_" or showing examples, but they are not very reliable. Ollama can _very_ reliably produce structured outputs, either a valid JSON or any JSON-defined schema. Granted, sometimes an unexpected EOF error happens, but mostly with more complex schemas and small models (e.g. Llama 3.2 3B).

## Constrained grammars

...
