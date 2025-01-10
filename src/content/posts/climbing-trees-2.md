---
title: "Climbing trees 2: implementing decision trees"
tags:
  - Machine learning
  - Decision trees
description: "..."
pubDatetime: 2999-01-07
draft: true
lang: "en-us"
---

This is the second in a series of posts about decision trees in the context of machine learning.
In this post, we'll implement classification and regression trees in Python.

If things become too complicated, try to read the provided references.
I've drawn upon various sources instrumental to my understanding of decision trees, including books, documentation, articles, blog posts and lectures.
Even if you understand everything, check the [references](#references): there is great content there.

## Defining our building blocks

### Nodes

First things first: let's define nodes and leaf nodes. We will use Python's standard library and _numpy_ as the only external dependency.

```python
@dataclass
class LeafNode:
    value: np.ndarray


@dataclass
class Node:
    feature_idx: int
    split_value: float
    left: Node | LeafNode
    right: Node | LeafNode
```

Leaf nodes only need to store a _value_, which is a numpy array.
In classification settings the value is an array of probabilities and in regression, a single-element array with a constant.

Internal nodes (referred to only as _nodes_ for here on) need to store extra information: the ID of the feature chosen to split the node, the split value, the left child node, and the right child node.

TODO: categorical variables

### Objective functions

```python
def _entropy(prob):
    prob = prob[prob > 0]
    return np.sum(-prob * np.log2(prob))
```
