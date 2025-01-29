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
If you haven't already, consider reading the first part of this series: it discusses fundamental concepts that are required to understand the implementation we'll build.

## Climbing trees series

- [Climbing trees 1: what are decision trees?](/posts/climbing-trees-1)
- **Climbing trees 2: implementing decision trees** (_you are here_)

---

If things become too complicated, try to read the provided references.
I've drawn upon various sources instrumental to my understanding of decision trees, including books, documentation, articles, blog posts and lectures.
Even if you understand everything, check the [references](#references): there is great content there.

The code snippets below sometimes present partial implementation for brevity or to avoid repetition.
Complete code is available at the [climbing trees repository](https://github.com/mathpn/climbing-trees).

## Defining our building blocks

We will use Python's standard library and _numpy_ and _pandas_ as the only external dependencies.
This seems like a reasonable compromise between implementing everything from scratch and delegating some parts to external libraries (in our case, mathematical operations and table-like data structures).

### Nodes

First things first: let's define nodes and leaf nodes.

```python
@dataclass
class LeafNode:
    value: np.ndarray

split_value = float | set

@dataclass
class Node:
    feature_idx: int
    split_value: split_value
    left: Node | LeafNode
    right: Node | LeafNode
```

Leaf nodes only need to store a _value_, which is a numpy array.
In classification settings the value is an array of probabilities and in regression, a single-element array with a constant.

Internal nodes (referred to only as _nodes_ from here on) need to store extra information: the ID of the feature chosen to split the node, the split value, the left child node, and the right child node.
The split value can be either a float (for numerical features) or a set (for categorical features).
We'll first implement the numerical feature case and later extend the implementation for the categorical case.

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
That is, samples with higher weight will be given more importance to when finding splits.

```python
def _class_probabilities(labels, sample_weights=None):
    if sample_weights is None:
        return np.mean(labels, axis=0)

    sample_weights = sample_weights.reshape((-1, 1))
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
    split_value: split_value
    left_index: np.ndarray
    right_index: np.ndarray
    left_value: np.ndarray
    right_value: np.ndarray


def _find_best_split(
    X, y, criterion_fn, sample_weights, min_samples_leaf
) -> Split | None:
    min_criterion = np.inf
    split = None

    for feat_idx in range(X.shape[1]):
        feature = X[:, feat_idx]
        sort_idx = np.argsort(feature)
        feature_sort = feature[sort_idx]
        y_sort = y[sort_idx]
        weights_sort = sample_weights[sort_idx]

        n_samples = len(sort_idx)
        for idx in range(1, n_samples):
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

This is the core of the algorithm, so let's break this function down.
First we define some variables: `min_criterion` is the lowest observed criterion value (initialized as infinity), `split` is the best split so far (initialized as `None`).
The split contains the following:

- Criterion value.
- Feature ID: column position starting from 0.
- Split value: values smaller or equal to it belong to the left child node (we're still dealing only with numerical features).
- Left indices: the indices of samples that belong to the left child node.
- Right indices: the indices of samples that belong to the right child node.
- Left value: the predicted value for the left child node.
- Right value: the predicted value for the right child node.

We loop over all features and, for each one, sort the features and the outcome based on the value of the selected feature.
Then, we divide the samples of candidate child nodes around each split point (`left` and `right`) and compute the weighted averaged criterion.
If the criterion value is the lowest observed so far, this is the current best split point.
Notice that this works for both classification and regression.
The regression case is straightforward: each node predicts the average outcome of its samples.
We assign the mean outcome value of each child node to `left_value` and `right_value`.
The classification case requires an assumption: the outcome variable `y` must be previously [one-hot](https://en.wikipedia.org/wiki/One-hot) encoded.
For instance, if we have three classes, instead of a vector of class labels this functions receives a matrix with N rows and 3 columns.
Each row has only one column set to 1 and the rest to 0 -- that is, each column represents one class.
We can think of this one-hot encoded matrix as a multi-output regression problem: the model is trying to predict three continuous outcomes, it just happens that they encode class labels.
Hence, the mean over all N samples of each column is equivalent to the proportion of such label in the node.

## The greedy algorithm

Now that we have a function to find the best split of a node, we can build the greedy algorithm.
We start with a node containing all samples and a naive prediction (the average outcome).
The child nodes are then split recursively.
The first base case is when there is a single sample in the node -- it cannot be split again.

```python
def split_node(
    node: Node | LeafNode,
    X: pd.DataFrame,
    y: np.ndarray,
    value: np.ndarray,
    depth: int,
    criterion,
    sample_weights: np.ndarray,
) -> LeafNode | Node | None:
    if X.shape[0] <= 1:
        return LeafNode(value)

    split = _find_best_split(X, y, criterion, sample_weights, min_samples_leaf)
    if split is None:
        return None

    X_left = X.iloc[split.left_index, :]
    X_right = X.iloc[split.right_index, :]
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
        criterion=criterion,
        sample_weights=sample_weights[split.left_index],
    )
    right = split_node(
        node=node,
        X=X_right,
        y=y_right,
        value=split.right_value,
        depth=depth + 1,
        criterion=criterion,
        sample_weights=sample_weights[split.right_index],
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
    node: Node | LeafNode,
    X: pd.DataFrame,
    y: np.ndarray,
    value: np.ndarray,
    depth: int,
    criterion,
    sample_weights: np.ndarray,
    max_depth: int = 0,
    min_samples_leaf: int = 0,
) -> LeafNode | Node | None:
    if X.shape[0] <= 1 or (max_depth and depth >= max_depth):
        return LeafNode(value)

    if X.shape[0] < 2 * min_samples_leaf:
        return LeafNode(value)

    # [...]
```

> Notice that if the node has less than twice the minimum number of samples per leaf, all possible child nodes will violate the constraint.
> The split search function should also consider only splits that do not violate this constraint.

We must add another base case: a _pure_ node, that is, a node with samples from a single class (classification) or with samples with a single outcome value (regression) should not be split further.
All our objective functions yield a value of 0 with pure nodes, so this is easy to implement.
We can also add the constraint of a minimum criterion reduction -- even though I've argued in the previous post that this is generally a bad idea.

```python
def split_node(
    node: Node | LeafNode,
    X: pd.DataFrame,
    y: np.ndarray,
    value: np.ndarray,
    depth: int,
    criterion,
    sample_weights: np.ndarray,
    max_depth: int = 0,
    min_samples_leaf: int = 0,
    min_criterion_reduction: float = 0,
) -> LeafNode | Node | None:
    if X.shape[0] <= 1 or (max_depth and depth >= max_depth):
        return LeafNode(value)

    if X.shape[0] < 2 * min_samples_leaf:
        return LeafNode(value)

    prior_criterion = criterion.node_impurity(y, sample_weights)
    if np.isclose(prior_criterion, 0):
        return LeafNode(value)

    split = _find_best_split(X, y, criterion, sample_weights, min_samples_leaf)
    if split is None:
        return None

    criterion_reduction = prior_criterion - split.criterion
    if min_criterion_reduction and criterion_reduction < min_criterion_reduction:
        return None

    # [...]
```

At this point we already have a somewhat functional decision tree constructor.
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
With some clever strategies we can also reuse the sorted features, giving us an average time complexity of $O(D\ N \log{N})$[^not_implemented].

[^not_implemented]: We will not implement this kind of optimization.

### Optimizing classification split search

In our current implementation, the run time to compute the best split per feature is $O(N^2)$.
For each split (and we have $N - 1$ of them) we have to go over all samples in each child node to compute the objective function -- this is, effectively, a nested loop.
We start by sorting the samples by feature value, which means that each new split in the loop moves exactly one sample from one child node to the other.
It's for this reason that we don't have to go over all samples every time: the objective function can be recomputed in constant time by moving a single point for each iteration.

We'll abstract our criterion to accommodate different ways to compute it.
When searching for the best split, we need to keep track of some values depending on the criterion.

```python
@dataclass
class BaseSplitStats:
    left_weight: float
    right_weight: float


S = TypeVar("S", bound=BaseSplitStats)


@dataclass
class ClassificationSplitStats(BaseSplitStats):
    left_class_count: np.ndarray
    right_class_count: np.ndarray
```

Regardless of the criterion, we need to keep track of the number of samples in each child node.
Notice they're named `weight` and not `count` because when sample weights are present they are no longer integer counts.
For instance, a sample with a weight of 2 acts as if we had an extra copy of it.
It can be a bit weird to think about _fractional_ counts, but they are an extrapolation of the integer example.
For instance, a sample with weight 2.5 will have 2.5 times more impact on the criterion value.

Our criterion abstraction should provide a way to measure node impurity given `y` as well as methods to track values during split search and compute the objective function in $O(1)$ time.
It should also provide a method to estimate the optimal value of a node given `y`.
Depending on the criterion, the optimal node value -- that is, the node value that minimizes the criterion given `y` -- is estimated differently.
This was overlooked earlier since for all the objective functions we've implemented the optimal value is simply the mean outcome.

```python
class Criterion(Protocol, Generic[S]):
    def node_impurity(self, y: np.ndarray, sample_weights: np.ndarray) -> float: ...

    def node_optimal_value(self, y: np.ndarray) -> np.ndarray: ...

    def init_split_stats(self, y: np.ndarray, sample_weights: np.ndarray) -> S: ...

    def update_split_stats(
        self, stats: S, y_value: np.ndarray, weight: float
    ) -> None: ...

    def split_impurity(self, stats: S) -> float: ...
```

Both Gini impurity and entropy take the exact same values as input, so we can create a single classification criterion:

```python
class ClassificationCriterion(Criterion):
    def __init__(self, objective_fn: Callable[[np.ndarray], float]):
        self.objective = objective_fn

    def node_optimal_value(self, y: np.ndarray) -> np.ndarray:
        return np.mean(y, axis=0)

    def node_impurity(self, y: np.ndarray, sample_weights: np.ndarray) -> float:
        # For binary classification with single column
        if y.shape[1] == 1:
            y = np.hstack((y, 1 - y))
        return self.objective(_class_probabilities(y, sample_weights))

    def init_split_stats(
        self, y: np.ndarray, sample_weights: np.ndarray
    ) -> ClassificationSplitStats:
        sample_weights = sample_weights.reshape((-1, 1))

        # For binary classification with single column
        if y.shape[1] == 1:
            y = np.hstack((y, 1 - y))

        return ClassificationSplitStats(
            left_weight=0,
            right_weight=np.sum(sample_weights),
            left_class_count=np.zeros(y.shape[1], dtype=sample_weights.dtype),
            right_class_count=np.sum(
                y * sample_weights, axis=0, dtype=sample_weights.dtype
            ),
        )

    def update_split_stats(
        self,
        stats: ClassificationSplitStats,
        y_value: np.ndarray,
        weight: float,
    ) -> None:
        stats.left_weight += weight
        stats.right_weight -= weight

        # For binary classification with single column
        if len(y_value) == 1:
            y_value = np.hstack((y_value, 1 - y_value))

        stats.left_class_count += y_value * weight
        stats.right_class_count -= y_value * weight

    def split_impurity(self, stats: ClassificationSplitStats) -> float:
        criterion_l = self.objective(stats.left_class_count / stats.left_weight)
        criterion_r = self.objective(stats.right_class_count / stats.right_weight)

        total_weight = stats.left_weight + stats.right_weight
        p_l = stats.left_weight / total_weight
        p_r = stats.right_weight / total_weight
        return float(p_l * criterion_l + p_r * criterion_r)

```

> Notice that we treat the binary classification case differently.
> When there are two possible outcomes, the `y` matrix can be encoded with a single binary column (either 1 or 0).
> Thus, one-hot encoding two classes into two columns is wasteful.
> Since the objective functions still require the proportion of both classes, we add the second column here.

Then, we adapt the split search function to use this criterion.

```python
def _find_best_split(
    X, y, criterion: Criterion, sample_weights: np.ndarray
) -> Split | None:
    min_score = np.inf
    best_split = None

    for feat_idx in range(X.shape[1]):
        sort_idx = np.argsort(X[:, feat_idx])
        x_sorted = X[sort_idx, feat_idx]
        y_sorted = y[sort_idx]
        weights_sorted = sample_weights[sort_idx]

        stats = criterion.init_split_stats(y_sorted, weights_sorted)

        for i in range(1, len(y_sorted)):
            criterion.update_split_stats(stats, y_sorted[i - 1], weights_sorted[i - 1])
            if x_sorted[i] != x_sorted[i - 1]:
                score = criterion.split_impurity(stats)
                if score < min_score:
                    min_score = score
                    best_split = Split(
                        criterion=min_score,
                        feature_idx=feat_idx,
                        split_value=x_sorted[i - 1],
                        left_index=sort_idx[:i],
                        right_index=sort_idx[i:],
                        left_value=criterion.node_optimal_value(y_sorted[:i]),
                        right_value=criterion.node_optimal_value(y_sorted[i:]),
                    )

    return best_split
```

There is an edge case when two consecutive samples have the exact same sample value.
We're moving samples one by one, but when applying the decision rule all tied samples will belong to the same child node.
To avoid this issue, we check whether the split value has changed from the previous iteration.
If it has not changed, we skip the iteration -- it's not a valid split point.

### Optimizing regression split search

Recalling what we've seen previously, the squared loss is defined as follows:

$$
L(\mathcal{D}) = \frac{1}{N} \sum_{i=1}^N (y_{i} - \bar{y})^2
$$

This function quantifies the _within-node variance_ of the target variable.
Let's expand the quadratic term:

$$
\sum_{i=1}^N (y_{i} - \bar{y})^2 = \sum_{i=1}^N (y_{i}^2 - 2 y_{i} \bar{y} + \bar{y}^2) = \sum_{i=1}^N y_{i}^2 - 2 \bar{y} \sum_{i=1}^N y_{i} + N \bar{y}^2
$$

We know that $\bar{y}$ is _not a parameter_, it's the average outcome of the node:

$$
\bar{y} = \frac{1}{N} \sum_{i=1}^N y_{i}
$$

Substituting $\bar{y}$:

$$
\sum_{i=1}^N y_{i}^2 - 2 \bar{y} \sum_{i=1}^N y_{i} + N \bar{y}^2 = \sum_{i=1}^N y_{i}^2 - \frac{1}{N} \Big( \sum_{i=1}^N y_{i} \Big)^2
$$

Thus, the loss becomes:

$$
L(\mathcal{D}) = \frac{\sum_{i=1}^N y_{i}^2}{N} - \Big(\frac{\sum_{i=1}^N y_{i}}{N}\Big)^2
$$

The first term is the sum of squares divided by $N$ and the second is the squared mean.
If we track the squared sum, the sum, and $N$, we can compute the objective in constant time.

```python
@dataclass
class SquaredLossSplitStats(BaseSplitStats):
    left_sum: np.ndarray
    right_sum: np.ndarray
    left_sum_squared: np.ndarray
    right_sum_squared: np.ndarray


class SquaredLossCriterion(Criterion):
    def node_impurity(self, y: np.ndarray, sample_weights: np.ndarray) -> float:
        sample_weights = sample_weights.reshape(-1, 1)
        weighted_mean = np.average(y, weights=sample_weights)
        return float(np.average((y - weighted_mean) ** 2, weights=sample_weights))

    def node_optimal_value(self, y: np.ndarray) -> np.ndarray:
        return np.mean(y, axis=0)

    def init_split_stats(
        self, y: np.ndarray, sample_weights: np.ndarray
    ) -> SquaredLossSplitStats:
        sample_weights = sample_weights.reshape((-1, 1))
        return SquaredLossSplitStats(
            left_weight=0,
            right_weight=np.sum(sample_weights),
            left_sum=np.zeros(y.shape[1], dtype=y.dtype),
            right_sum=np.sum(y * sample_weights, axis=0),
            left_sum_squared=np.zeros(y.shape[1], dtype=y.dtype),
            right_sum_squared=np.sum(y * y * sample_weights, axis=0),
        )

    def update_split_stats(
        self,
        stats: SquaredLossSplitStats,
        y_value: np.ndarray,
        weight: float,
    ) -> None:
        stats.left_sum += weight * y_value
        stats.right_sum -= weight * y_value
        stats.left_weight += weight
        stats.right_weight -= weight
        stats.left_sum_squared += weight * y_value * y_value
        stats.right_sum_squared -= weight * y_value * y_value

    def split_impurity(self, stats: SquaredLossSplitStats) -> float:
        left_mean = stats.left_sum / stats.left_weight if stats.left_weight > 0 else 0
        right_mean = (
            stats.right_sum / stats.right_weight if stats.right_weight > 0 else 0
        )

        criterion_l = (
            np.sum(stats.left_sum_squared / stats.left_weight - left_mean * left_mean)
            if stats.left_weight > 0
            else 0
        )
        criterion_r = (
            np.sum(
                stats.right_sum_squared / stats.right_weight - right_mean * right_mean
            )
            if stats.right_weight > 0
            else 0
        )

        total_weight = stats.left_weight + stats.right_weight
        p_l = stats.left_weight / total_weight
        p_r = stats.right_weight / total_weight
        return float(p_l * criterion_l + p_r * criterion_r)
```

## Categorical features

In the previous post we've seen that decision trees accept both numerical and categorical features, yet our implementation can only handle numerical ones.
One possibility is to one-hot encode categorical features into numerical ones. Since the time complexity of fitting a tree scales linearly with the number of features, this doesn't hurt performance catastrophically.
In fact, the _scikit-learn_ implementation [still doesn't support](https://scikit-learn.org/stable/modules/tree.html#tree-algorithms:~:text=Able%20to%20handle%20both%20numerical%20and%20categorical%20data.%20However%2C%20the%20scikit%2Dlearn%20implementation%20does%20not%20support%20categorical%20variables%20for%20now.) categorical features directly and requires numerical encoding.
One-hot encoding shifts the complexity from combinations in each split to the tree structure: many splits are required to capture a relationship that is true for a group of category levels of a feature.
Moreover, the encoding process makes the `X` feature matrix much larger in memory.

In the CART-based family of decision tree algorithms, a categorical split may consider one category at a time (one _vs_ rest) or combinations of categories.
The problem is that there are $2^{d-1} - 1$ possible combinations of categories, where $d$ is the number of levels (distinct categories) in a feature.
If we have 100 levels, that's already 524287 combinations to try for _every_ split.
The tree structure produced by a one _vs_ rest strategy is effectively equivalent to one produced using one-hot encoded features, but it requires less memory for the feature matrix.

### One _vs_ rest strategy

In this strategy, the split search considers all levels of a feature individually and compares them with all other levels combined.
In other words, the left child node contains samples of a single level while the right child node contains all other levels.
The split can be quite uneven and result in less balanced trees, but the performance trade-off can be worth it.
We avoid the exponential number of combinations seen above and don't expand the memory footprint of the `X` matrix with many one-hot encoded columns.

The criterion interface should have new methods to handle the categorical split, preferably in constant time.
Each feature level is considered individually, thus we only need to pre-compute the indices of each level.
This can be done in $O(N \log{N})$ time by lexicographically sorting the feature.

```python
cat_indices = {}
sort_idx = np.argsort(x)
x_sorted = x[sort_idx]
y_sorted = y[sort_idx]
weights_sorted = sample_weights[sort_idx]

start_idx = 0
for i in range(1, len(x_sorted) + 1):
    if i == len(x_sorted) or x_sorted[i] != x_sorted[start_idx]:
        cat_indices[x_sorted[start_idx]] = {
            "indices": sort_idx[start_idx:i],
            "y": y_sorted[start_idx:i],
            "weights": weights_sorted[start_idx:i],
        }
        start_idx = i
```

Whenever the feature value changes, we've reached a new level and therefore can compute the indices, the subset of `y`, and the subset of `sample_weights` that belong to this level.
The criterion of the left child node can be directly computed using the subset of `y` defined above, whereas the criterion for the right child node can be found removing the class counts of the level from the total.
You may have noticed this is not a $O(1)$ operation because we have to sum over subsets of `y`.
Still, this is done once per level, and we avoid any quadratic or exponential operations.

The split stats are initialized the same way as before.
We implement a new method to make new stats for a categorical group with the logic we've just described:

```python
class ClassificationCriterion(Criterion):
    # [...]

    def make_stats_from_categorical_level(
        self,
        stats: ClassificationSplitStats,
        y: np.ndarray,
        sample_weights: np.ndarray,
        is_left: bool,
    ) -> ClassificationSplitStats:
        level_weights = sample_weights.reshape(-1, 1)
        level_weight = np.sum(sample_weights)

        # For binary classification with single column
        if y.shape[1] == 1:
            y = np.hstack((y, 1 - y))

        level_sum = np.sum(y * level_weights, axis=0)

        if is_left:
            stats = replace(
                stats,
                left_weight=level_weight,
                right_weight=stats.right_weight - level_weight,
                left_class_count=level_sum,
                right_class_count=stats.right_class_count - level_sum,
            )
        else:
            stats = replace(
                stats,
                left_weight=stats.left_weight - level_weight,
                right_weight=level_weight,
                left_class_count=stats.left_class_count - level_sum,
                right_class_count=level_sum,
            )
        return stats
```

An analogous method has been implemented for the squared loss criterion.
Then, we use this method in the new `_best_categorical_split` function:

```python
def _best_categorical_split(
    x: np.ndarray,
    y: np.ndarray,
    feat_idx: int,
    criterion: Criterion,
    sample_weights: np.ndarray,
    min_samples_leaf: int,
):
    min_score = np.inf
    best_split = None
    unique_values = np.unique(x)

    stats = criterion.init_split_stats(y.astype(np.float64), sample_weights)

    # Pre-compute category indices
    cat_indices = {}
    sort_idx = np.argsort(x)
    x_sorted = x[sort_idx]
    y_sorted = y[sort_idx]
    weights_sorted = sample_weights[sort_idx]

    start_idx = 0
    for i in range(1, len(x_sorted) + 1):
        if i == len(x_sorted) or x_sorted[i] != x_sorted[start_idx]:
            cat_indices[x_sorted[start_idx]] = {
                "indices": sort_idx[start_idx:i],
                "y": y_sorted[start_idx:i],
                "weights": weights_sorted[start_idx:i],
            }
            start_idx = i

    stats = criterion.init_split_stats(y, sample_weights)

    n_samples = len(y_sorted)
    for value in unique_values:
        cat_data = cat_indices[value]
        level_size = len(cat_data["indices"])
        if level_size == 0 or level_size == len(x):
            continue

        if level_size < min_samples_leaf or (n_samples - level_size) < min_samples_leaf:
            continue

        level_stats = criterion.make_stats_from_categorical_level(
            stats, cat_data["y"], cat_data["weights"], is_left=True
        )
        score = criterion.split_impurity(level_stats)

        if score < min_score:
            min_score = score
            left_indices = cat_data["indices"]
            right_indices = np.setdiff1d(np.arange(len(x)), left_indices)
            best_split = Split(
                criterion=score,
                feature_idx=feat_idx,
                split_value=set([value]),
                left_index=left_indices,
                right_index=right_indices,
                left_value=criterion.node_optimal_value(y[left_indices]),
                right_value=criterion.node_optimal_value(y[right_indices]),
            )

    return min_score, best_split
```

### Optimal partitioning

Luckily, there is a very handy optimization to find the optimal partitioning of levels when the output is univariate -- that is, when we're dealing with binary classification or univariate regression.
It was first proposed by [Fisher in 1958](https://www.tandfonline.com/doi/abs/10.1080/01621459.1958.10501479) as a method to group a set of numbers so that the variance within groups is minimized. Here, again, the number of possible combinations grow exponentially.
The proof states that we only need to look at the sorted partitions by average outcome instead of all possible permutations.
Consider we want to ...

# TODO continue

This method is used by [LightGBM](https://lightgbm.readthedocs.io/en/latest/Advanced-Topics.html#categorical-feature-support) and [XGBoost](https://xgboost.readthedocs.io/en/latest/tutorials/categorical.html#optimal-partitioning), both gradient-boosted tree libraries[^gbdt].

[^gbdt]: We'll cover gradient-boosted decision trees (GBDT) in the future.

The average outcome is computed by grouping the outcome vector `y` by feature `x` and applying sample weights:

```python
df = pd.DataFrame({"x": x, "y": y.ravel(), "w": sample_weights})

cat_stats = df.groupby("x").agg(
    y_avg=pd.NamedAgg(
        column="y", aggfunc=lambda x: np.average(x, weights=df.loc[x.index, "w"])
    ),
    y_count=pd.NamedAgg(column="y", aggfunc=len),
    w=pd.NamedAgg(column="w", aggfunc="sum"),
)

cat_stats = cat_stats.sort_values("y_avg")
```

After sorting by the average outcome, we split this predictor as if it were an ordered predictor.
In other words, we go over the levels sorted by average outcome and move one by one to the left child node, computing the criterion at each step.
Note that, unlike in previous cases, the feature is _not sorted by its values_, rather by the average outcome.

The criterion can be updated with a constant time operation by treating the feature level as a single sample.
The idea of using an average outcome as a single sample may require some intuition massaging, but it does make sense.
Consider a level with 8 samples of outcome `1` and 2 samples of outcome `0`.
The average outcome is 0.8[^avg_outcome].
Considering uniform sample weights, the weight is 10 (equal to the number of samples).
We can expand the average outcome to a two class vector $[0.8, 0.2]$ and multiply it by the weight, resulting in the vector $[8, 2]$.
This vector will be subtracted from the left child node and added to the right child node label count.
Hence, moving one average outcome "sample" with a sum of sample weights is equivalent to moving each sample individually.
After computing and ordering by average outcomes, the implementation closely resembles the numerical feature split search and won't be shown here for brevity.

[^avg_outcome]: The average outcome can be seen as the proportion of positive (1) outcomes.

### Combining split search methods

Finally, we combine our three split search functions into one.
This function applies numerical split search to numerical features (of course).
For categorical features, optimal partitioning is used if the `y` outcome is univariate.
Otherwise, a one _vs_ rest approach is used.

```python
def _find_best_split(
    X: pd.DataFrame,
    y: np.ndarray,
    criterion: Criterion,
    sample_weights: np.ndarray,
    min_samples_leaf: int,
) -> Split | None:
    min_score = np.inf
    best_split = None

    categorical_splitter = (
        _best_categorical_optimal_partitioning
        if y.shape[1] == 1
        else _best_categorical_split
    )

    feature_types = np.array(
        [np.issubdtype(X.iloc[:, i].dtype, np.number) for i in range(X.shape[1])]
    )
    feature_values = [X.iloc[:, i].values for i in range(X.shape[1])]

    for feat_idx in range(X.shape[1]):
        splitter = (
            _best_numerical_split if feature_types[feat_idx] else categorical_splitter
        )

        score, split = splitter(
            feature_values[feat_idx],
            y,
            feat_idx,
            criterion,
            sample_weights,
            min_samples_leaf,
        )

        if split is not None and score < min_score:
            min_score = score
            best_split = split

    return best_split
```

## Training and inference

The _scikit-learn_ interface has become so ubiquitous in the Python world that it seems only reasonable to use it here.
Let's define two interfaces (in _scikit-learn_ style), one for classification and the other for regression:

```python
class Regressor(Protocol):
    def fit(
        self, X: pd.DataFrame, y: np.ndarray, sample_weights: np.ndarray | None = None
    ) -> None: ...

    def predict(self, X: pd.DataFrame) -> np.ndarray: ...


class Classifier(Protocol):
    def fit(
        self, X: pd.DataFrame, y: np.ndarray, sample_weights: np.ndarray | None = None
    ) -> None: ...

    def predict(self, X: pd.DataFrame) -> np.ndarray: ...

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray: ...
```

The classes following these interfaces are mostly boilerplate code, but the inference code is new.
To make predictions for a single feature, we check if the feature lies on the left or on the right side of the root node split.
We repeat this process until we reach a leaf node, and then return the leaf node value as the prediction.
It's quite a simple inference process with a $O(\log{N})$ average time complexity, that is, proportional to the depth of the tree[^depth].

For the regression case:

```python
class DecisionTreeRegressor:
    # [...]

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        if self._root_node is None:
            raise ValueError("model must be trained before prediction")

        def traverse_tree(x, node):
            while isinstance(node, Node):
                feature_val = x.iloc[node.feature_idx]
                if isinstance(node.split_value, set):
                    node = node.left if feature_val in node.split_value else node.right
                else:
                    node = node.left if feature_val <= node.split_value else node.right
            return node.value

        y_pred = np.array([traverse_tree(x, self._root_node) for _, x in X.iterrows()])
        return y_pred
```

For classification, this method becomes `predict_proba`, which returns vectors of probabilities[^calibration].
The `predict` method then chooses the most likely class as the prediction for each instance using the following function:

[^calibration]: These probabilities are not well calibrated and _are not_ a good measure of the uncertainty of the model.

```python
def _prob_to_class(prob: np.ndarray) -> np.ndarray:
    if prob.shape[1] > 1:
        return np.argmax(prob, axis=1)

    return (prob.squeeze(1) >= 0.5).astype(int)
```

[^depth]: We assume roughly balanced trees and therefore the depth of the tree is proportional to $\log {N}$.

## Conclusion

...

## References

- [Climbing Trees Repository - Github](https://github.com/mathpn/climbing-trees)
- [One-hot - Wikipedia](https://en.wikipedia.org/wiki/One-hot)
- [Scikit-learn documentation on trees](https://scikit-learn.org/stable/modules/tree.html)
- [Time complexity - Wikipedia](https://en.wikipedia.org/wiki/Time_complexity)
- Fisher, W. D. (1958). [On Grouping for Maximum Homogeneity](https://doi.org/10.1080/01621459.1958.10501479). Journal of the American Statistical Association, 53(284), 789–798.
- [LightGBM documentation - Categorical Feature Support](https://lightgbm.readthedocs.io/en/latest/Advanced-Topics.html#categorical-feature-support)
- [XGboost documentation - Categorical Data](https://xgboost.readthedocs.io/en/latest/tutorials/categorical.html#optimal-partitioning)
