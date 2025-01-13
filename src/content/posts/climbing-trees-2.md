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
In this post, we'll implement classification and regression trees (CART) in Python.

If things become too complicated, try to read the provided references.
I've drawn upon various sources instrumental to my understanding of decision trees, including books, documentation, articles, blog posts and lectures.
Even if you understand everything, check the [references](#references): there is great content there.

## Defining our building blocks

You should definitely read the first part of this series before this one as I'll use many concepts introduced there to implement the decision trees.
We will use Python's standard library and _numpy_ as the only external dependency.
This seems like a reasonable compromise between implementing everything from scratch and delegating some parts to external libraries (in our case, mathematical and vector operations).

### Nodes

First things first: let's define nodes and leaf nodes.

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

Internal nodes (referred to only as _nodes_ from here on) need to store extra information: the ID of the feature chosen to split the node, the split value, the left child node, and the right child node.

TODO: categorical variables

### Objective functions

Let's implement the three objective functions discussed previously: Gini impurity, entropy and squared loss.

```python
def entropy(prob):
    prob = prob[prob > 0]
    return np.sum(-prob * np.log2(prob))

def gini_impurity(prob):
    return 1 - np.sum(prob**2)
```

Here, both functions take an array of probabilities as input and return the objective value.
Notice that we ignore zero probability when calculating entropy -- their contribution is zero due to the multiplicative term (`-prob`), but 0 causes numerical instability problems when taking the log.

While evaluating a split, we only have the labels of samples in each candidate node, so it's convenient to have functions that accept labels as input.
It's also convenient to add support for _sample weights_ (spoiler alert: they'll come in handy in the future).
Sample weights redistribute the importance of each sample when computing the objective function.
Duplicating some samples has the same effect as setting a sample weight of 2 to them.
That is, samples with higher sample weight will be given more importance to when finding splits.

```python
def _class_probabilities(labels, sample_weights=None):
    if sample_weights is None:
        return np.mean(labels, axis=0)

    return (sample_weights * labels).sum(axis=0) / np.sum(sample_weights)
```

The default case (no sample weight provided) assumes uniform sample weights, or simply the average.
Now we write two functions that compute the objective functions given labels as inputs:

```python
def entropy_criterion(labels, sample_weights=None):
    return entropy(_class_probabilities(labels, sample_weights))


def gini_criterion(labels, sample_weights=None):
    return gini_impurity(_class_probabilities(labels, sample_weights))
```

In regression settings there is no need to compute class probabilities, therefore the objective function can be directly implemented as follows.

```python
def squared_loss_criterion(y, sample_weights=None):
    if sample_weights is None:
        sample_weights = np.ones_like(y) / y.shape[0]

    value = (sample_weights * y) / sample_weights.sum()
    return np.mean(np.power(y - value, 2))
```

## Finding the best split

Recapitulating the decision tree algorithm, we greedily search for the best possible split, recursively.
To find the best possible split, we simply test _all possible_ splits.
For each feature, we sort the values as well as the outcome. Then, for each split ($N - 1$), we calculate the weighted average criterion (the value of the objective function) of children nodes.

```python
def _find_best_split(X, y, criterion_fn, sample_weights):
    min_criterion = 1e9
    left_value = right_value = np.mean(y, axis=0)
    best_split = best_feat = 0
    best_left = best_right = None

    for feat_idx in range(X.shape[1]):
        feature = X[:, feat_idx]
        sort_idx = np.argsort(feature)
        feature_sort = feature[sort_idx]
        y_sort = y[sort_idx]
        weights_sort = sample_weights[sort_idx]

        for idx in range(1, len(sort_idx)):
            left = sort_idx[:idx]
            right = sort_idx[idx:]
            criterion_l = criterion_fn(y_sort[:idx], weights_sort[:idx])
            criterion_r = criterion_fn(y_sort[idx:], weights_sort[idx:])
            p_l = (idx) / len(sort_idx)
            p_r = (len(sort_idx) - idx) / len(sort_idx)
            criterion = p_l * criterion_l + p_r * criterion_r
            if criterion < min_criterion:
                min_criterion = criterion
                best_split = feature_sort[idx]
                best_feat = feat_idx
                best_left = left
                best_right = right
                left_value = np.mean(y_sort[:idx], axis=0)
                right_value = np.mean(y_sort[idx:], axis=0)

    return (
        min_criterion,
        best_feat,
        best_split,
        best_left,
        best_right,
        left_value,
        right_value,
    )
```

