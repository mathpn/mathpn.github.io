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
class Split(NamedTuple):
    criterion: float
    feature_idx: int
    split_value: float
    left_index: np.ndarray
    right_index: np.ndarray
    left_value: np.ndarray
    right_value: np.ndarray


def _find_best_split(X, y, criterion_fn, sample_weights) -> Split | None:
    min_criterion = np.inf
    split = None

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
                split = Split(
                    criterion,
                    feat_idx,
                    feature_sort[idx],
                    left,
                    right,
                    np.mean(y_sort[:idx], axis=0),
                    np.mean(y_sort[idx:], axis=0),
                )

    return split

```

This is the core of the algorithm, so let's break this function down. First we define some variables: `min_criterion` is the lowest observed criterion value (initialized as infinity), `split` is the best split so far (initialized as `None`).
The split contains the following:

- Criterion value
- Feature ID: column position starting from 0
- Split value: values smaller or equal to it belong to the left child node
- Left indices: the indices of samples that belong to the left child node
- Right indices: the indices of samples that belong to the right child node
- Left value: the predicted value for the left child node
- Right value: the predicted value for the right child node

We loop over all features and, for each one, sort the features and the outcome based on the value of the selected feature.
Then, we divide the samples of candidate child nodes around each split point (`left` and `right`) and compute the weighted averaged criterion.
If the criterion value is the lowest observed so far, this is the current best split point. Notice that this works for both classification and regression. The regression case is straightforward: each node predicts the average outcome of its samples. We assign the mean outcome value of each child node to `left_value` and `right_value`.
The classification case requires an assumption: the outcome variable `y` must come [one-hot](https://en.wikipedia.org/wiki/One-hot) encoded. For instance, if we have three classes, instead of a vector of class labels this functions receives an N by 3 matrix where each row has only one column set to 1 and the rest to 0 -- each column represents one class.
We can think of this one-hot encoded matrix as a multi-output regression problem: the model is trying to predict three continuous outcomes, it just happens that they encode class labels.
Hence, the mean over all N samples of each column is equivalent to the proportion of such label in the node.

## The greedy algorithm

Now that we have a function to find the best split of a node, we can build the greedy algorithm.
We start with a node containing all samples and a naive prediction (the average outcome).
The child nodes are then split recursively. The first base case is when there is a single sample in the node -- it cannot be split again.

```python
def split_node(
    node,
    X,
    y,
    value,
    depth,
    criterion_fn,
    sample_weights=None,
) -> LeafNode | Node | None:
    if X.shape[0] <= 1:
        return LeafNode(value)

    split = _find_best_split(X, y, criterion_fn, sample_weights)
    if split is None:
        return None

    X_left = X[split.left_index, :]
    X_right = X[split.right_index, :]
    y_left = y[split.left_index]
    y_right = y[split.right_index]

    node = Node(
        split.feature_idx,
        split.split_value,
        LeafNode(split.left_value),
        LeafNode(split.right_value),
    )

    left = split_node(
        node=node,
        X=X_left,
        y=y_left,
        value=split.left_value,
        depth=depth + 1,
        criterion_fn=criterion_fn,
        sample_weights=sample_weights,
    )
    right = split_node(
        node=node,
        X=X_right,
        y=y_right,
        value=split.right_value,
        depth=depth + 1,
        criterion_fn=criterion_fn,
        sample_weights=sample_weights,
    )

    if left is not None:
        node.left = left
    if right is not None:
        node.right = right

    return node

```

Recursive calls increase the depth counter by 1. We can add a `max_depth` stopping criterion.
Similarly, we can check the number of samples in child nodes and enforce a minimum number of samples per leaf (`min_samples_leaf`) constraint.
These constraints are crucial to limit tree size and reduce _variance_ (overfitting).

```python
def split_node(
    node,
    X,
    y,
    value,
    depth,
    criterion_fn,
    sample_weights=None,
    max_depth: int = 0,
    min_samples_leaf: int = 0,
) -> LeafNode | Node | None:
    if X.shape[0] <= 1 or (max_depth and depth >= max_depth):
        return LeafNode(value)

    if sample_weights is None:
        sample_weights = _uniform_sample_weights(X)

    split = _find_best_split(X, y, criterion_fn, sample_weights)
    if split is None:
        return None

    X_left = X[split.left_index, :]
    X_right = X[split.right_index, :]
    y_left = y[split.left_index]
    y_right = y[split.right_index]

    if min_samples_leaf and (
        X_left.shape[0] <= min_samples_leaf or X_right.shape[0] <= min_samples_leaf
    ):
        return None

    node = Node(
        split.feature_idx,
        split.split_value,
        LeafNode(split.left_value),
        LeafNode(split.right_value),
    )

    left = split_node(
        node=node,
        X=X_left,
        y=y_left,
        value=split.left_value,
        depth=depth + 1,
        criterion_fn=criterion_fn,
        sample_weights=sample_weights,
        max_depth=max_depth,
        min_samples_leaf=min_samples_leaf,
    )
    right = split_node(
        node=node,
        X=X_right,
        y=y_right,
        value=split.right_value,
        depth=depth + 1,
        criterion_fn=criterion_fn,
        sample_weights=sample_weights,
        max_depth=max_depth,
        min_samples_leaf=min_samples_leaf,
    )

    if left is not None:
        node.left = left
    if right is not None:
        node.right = right

    return node
```

We must add another base case: a _pure_ node, that is, a node with samples from a single class (classification) or with samples with a single outcome value (regression) should not be split further.
All our objective functions yield a value of 0 with pure nodes, so this is easy to implement.
We can also add the constraint of a minimum criterion reduction -- even though I've argued in the previous post that this is generally a bad idea.

```python
def split_node(
    node,
    X,
    y,
    value,
    depth,
    criterion_fn,
    sample_weights=None,
    max_depth: int = 0,
    min_samples_leaf: int = 0,
    min_criterion_reduction: float = 0,
) -> LeafNode | Node | None:
    if X.shape[0] <= 1 or (max_depth and depth >= max_depth):
        return LeafNode(value)

    if sample_weights is None:
        sample_weights = _uniform_sample_weights(X)

    prior_criterion = criterion_fn(y)
    if prior_criterion == 0:
        return LeafNode(value)

    split = _find_best_split(X, y, criterion_fn, sample_weights)
    if split is None:
        return None

    criterion_reduction = prior_criterion - split.criterion
    if criterion_reduction < min_criterion_reduction:
        return None

    X_left = X[split.left_index, :]
    X_right = X[split.right_index, :]
    y_left = y[split.left_index]
    y_right = y[split.right_index]

    if min_samples_leaf and (
        X_left.shape[0] <= min_samples_leaf or X_right.shape[0] <= min_samples_leaf
    ):
        return None

    node = Node(
        split.feature_idx,
        split.split_value,
        LeafNode(split.left_value),
        LeafNode(split.right_value),
    )

    left = split_node(
        node=node,
        X=X_left,
        y=y_left,
        value=split.left_value,
        depth=depth + 1,
        criterion_fn=criterion_fn,
        sample_weights=sample_weights[split.left_index],
        max_depth=max_depth,
        min_samples_leaf=min_samples_leaf,
        min_criterion_reduction=min_criterion_reduction,
    )
    right = split_node(
        node=node,
        X=X_right,
        y=y_right,
        value=split.right_value,
        depth=depth + 1,
        criterion_fn=criterion_fn,
        sample_weights=sample_weights[split.right_index],
        max_depth=max_depth,
        min_samples_leaf=min_samples_leaf,
        min_criterion_reduction=min_criterion_reduction,
    )

    if left is not None:
        node.left = left
    if right is not None:
        node.right = right

    return node
```

At this point we already have a functional decision tree constructor. Here is an example:

```python
from sklearn.datasets import load_wine


def print_tree(node: Node | LeafNode, depth: int = 0):
    indent = "  " * depth
    if isinstance(node, LeafNode):
        print(f"{indent}LeafNode(value={np.array_str(node.value, precision=2)})")
    else:
        print(
            f"{indent}Node(feature_idx={node.feature_idx}, split_value={node.split_value:.2f})"
        )
        print(f"{indent}Left:")
        print_tree(node.left, depth + 1)
        print(f"{indent}Right:")
        print_tree(node.right, depth + 1)


X, y = load_wine(return_X_y=True)

y_oh = _one_hot_encode(y)
node = LeafNode(np.mean(y_oh, axis=0))
trained_node = split_node(
    node=node,
    X=X,
    y=y_oh,
    value=np.mean(y, axis=0),
    depth=0,
    criterion_fn=gini_criterion,
)
node = trained_node if trained_node is not None else node
print_tree(node)
```

> You may have noticed the `scikit-learn` dependency. Well, it's used only as a convenient way to load a toy dataset, so I think this is fair enough.

However, there are still major improvements to be made to this code: it's not very optimized, it can only handle numerical features, and there's no prediction (inference) implementation.

## Time complexity

Implementations of decision trees vary quite a lot in their details and the optimizations they employ.
Furthermore, the structure of the tree depends on the data.
Thus, it's not straightforward to estimate the average [time complexity](https://en.wikipedia.org/wiki/Time_complexity) of decision trees, but it's usually approximated as $O(D\ N \log^2{N})$, where $D$ is the number of dimensions (features) and $N$ is the number of training samples.
For each node, we have to try all possible splits, which involves sorting the training samples based on each feature in $O(N \log{N})$ time, then try $N - 1$ splits.
We must compute the objective function for each split, which increases the time complexity of this step to $O(N^2)$. Since this is done for all dimensions, we have a time complexity of $O(D\ N^2 \log{N})$ for each node.
This process is repeated for each new depth level added to the tree, whose maximum depth is _approximately_ $\log{N}$ (balanced trees), hence we have a time complexity of $O(D\ N^2 \log^2{N})$.
The $D$ and $log^2 N$ terms are not bad, but the $N^2$ term makes training trees on large number of samples infeasible.

Luckily, it's possible to compute the objective function in constant time, bringing us back to the usual $O(D\ N\ \log^2{N})$ time complexity.
With clever caching strategies we can also reuse the sorted features, giving us an average time complexity of $O(D\ N \log{N})$.

### Optimizing the objective function

In our current implementation, the run time to compute the best split per feature is $O(N^2)$. For each split we have to go over all samples in each child node to compute the objective function -- this is, effectively, a nested loop.
We sort the samples by feature value, which means that each new split in the loop moves exactly one sample from one child node to the other. It's for this reason that we don't have to go over all samples every time: the objective function can be recomputed in constant time by moving a single point for each iteration.

First, let's consider only the classification case without sample weights.

```python
def _find_best_split_classification(X, y, criterion_fn) -> Split | None:
    min_criterion = np.inf
    split = None
    previous_split_value = None
    y = y.astype(np.float64)

    for feat_idx in range(X.shape[1]):
        feature = X[:, feat_idx]
        sort_idx = np.argsort(feature)
        feature_sort = feature[sort_idx]
        y_sort = y[sort_idx]
        left_class_count = np.zeros(y.shape[1], dtype=np.float64)
        right_class_count = np.sum(y, axis=0)

        for idx in range(len(sort_idx) - 1):
            left_class_count += y_sort[idx]
            right_class_count -= y_sort[idx]

            split_value = feature_sort[idx]
            if previous_split_value == split_value:
                continue
            previous_split_value = split_value

            criterion_l = criterion_fn(left_class_count / (idx + 1))
            criterion_r = criterion_fn(right_class_count / (len(sort_idx) - idx - 1))

            p_l = (idx + 1) / len(sort_idx)
            p_r = (len(sort_idx) - idx - 1) / len(sort_idx)
            criterion = p_l * criterion_l + p_r * criterion_r
            if criterion < min_criterion:
                left = sort_idx[: idx + 1]
                right = sort_idx[idx + 1 :]
                min_criterion = criterion
                split = Split(
                    criterion=criterion,
                    feature_idx=feat_idx,
                    split_value=split_value,
                    left_index=left,
                    right_index=right,
                    left_value=np.mean(y_sort[: idx + 1], axis=0),
                    right_value=np.mean(y_sort[idx + 1 :], axis=0),
                )

    return split
```

There have been a number of changes in this function.
For each feature, we initialize two arrays of shape $c$ where $c$ is the number of classes that store the number of samples per class in each node.
For the left node we initialize the values as 0, whereas the right node starts with the counts of all samples (remember that the outcome is a one-hot encoded matrix).

Then, for each split point we add the label to the left class count vector and subtract it from the right class count vector.
To obtain class probabilities, we divide the class counts by the number of elements in each child node -- this number is trivially obtained using the `idx` loop variable.
Notice that we need to use the original objective functions that take probabilities as inputs, not the convenience functions we've implemented that convert class counts to probabilities.

There is an edge case when two consecutive samples have the exact same sample value.
We're moving samples one by one, but when applying the decision rule all tied samples will belong to the same child node.
To avoid this issue, we check whether the split value has changed from the previous iteration.
If it has not changed, we skip the iteration -- it's not a valid split point.

## References

- [One-hot - Wikipedia](https://en.wikipedia.org/wiki/One-hot)
- [Time complexity - Wikipedia](https://en.wikipedia.org/wiki/Time_complexity)
