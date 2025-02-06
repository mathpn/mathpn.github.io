---
title: "How LLMs generate structured outputs"
tags:
  - LLM
  - TIL
pubDatetime: 2025-02-03
lang: "en-us"
draft: false
---

Ollama has recently added support for [structured outputs](https://ollama.com/blog/structured-outputs). But how exactly does LLMs generate structured outputs?

I have used prompting tricks such as "_answer with a JSON only_" or showing examples, but they are not very reliable. Ollama can _very_ reliably produce structured outputs, either a valid JSON or any JSON-defined schema. Granted, sometimes an unexpected EOF error happens, but mostly with more complex schemas and small models (e.g. Llama 3.2 3B).

It's possible to create schemas using _pydantic_:

```python
from ollama import chat
from pydantic import BaseModel


class Joke(BaseModel):
    id: int
    setup: str
    punchline: str
    category: str | None = None
    tags: list[str] | None


response = chat(
    messages=[
        {
            "role": "user",
            "content": "Tell me a funny joke",
        }
    ],
    model="deepseek-r1",
    format=Joke.model_json_schema(),
)

country = Joke.model_validate_json(response.message.content)
print(country.model_dump_json(indent=2))
```

**Output:**

```json
{
  "id": 1,
  "setup": "Why did the chicken cross the road?",
  "punchline": "To get to the other side!",
  "category": null,
  "tags": ["chicken", "road", "joke"]
}
```

## Grammars

Ollama uses [llama.cpp](https://github.com/ggerganov/llama.cpp) under the hood to run LLMs.
Structured outputs, such as a valid JSON, are possible using constrained decoding.
This works by modifying how next tokens are selected: the model is only able to choose tokens that do not violate the grammar rules.

We can use the `llama_cpp` Python library to convert the JSON schema above to a grammar:

```text
category ::= string | null
category-kv ::= "\"category\"" space ":" space category
char ::= [^"\\] | "\\" (["\\/bfnrt] | "u" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F])
id-kv ::= "\"id\"" space ":" space integer
integer ::= ("-"? integral-part) space
integral-part ::= [0-9] | [1-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9] ([0-9])?)?)?)?)?)
?)?)?)?)?)?)?)?)?)?
null ::= "null" space
punchline-kv ::= "\"punchline\"" space ":" space string
root ::= "{" space id-kv "," space setup-kv "," space punchline-kv "," space tags-kv ( "," space ( category-kv ) )? "}" space
setup-kv ::= "\"setup\"" space ":" space string
space ::= " "?
string ::= "\"" char* "\"" space
tags ::= tags-0 | null
tags-0 ::= "[" space (string ("," space string)*)? "]" space
tags-kv ::= "\"tags\"" space ":" space tags
```

However, we are not limited to JSON outputs. For instance, if we want to rate movies, we can create a grammar that allows only valid ratings as outputs:

```python
from llama_cpp.llama import Llama, LlamaGrammar

grammar = LlamaGrammar.from_string(
    """
    root ::= "5.0" | leading "." trailing
    leading ::= [0-4]
    trailing ::= [0-9]
    """
)


llm = Llama.from_pretrained(
    repo_id="MaziyarPanahi/Llama-3.2-3B-Instruct-GGUF",
    filename="Llama-3.2-3B-Instruct.Q8_0.gguf",
)

response = llm("Rate the movie Dune: Part Two (2024)", grammar=grammar, max_tokens=-1)

print(response["choices"][0]["text"])
```

**Output:**

```text
3.5
```

This bridges an important gap in LLM usage in general by reliably generating output in a structured format.
The unstructured strategy of parsing strings with any content is error-prone.
Not only that, but there are claims that structured outputs with constrained decoding [outperforms unstructured outputs](https://blog.dottxt.co/say-what-you-mean.html) in some tasks.
