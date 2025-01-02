---
title: "Climbing trees 1: what are decision trees?"
tags:
  - Machine learning
  - Decision trees
description: "This is the first in a series of posts about decision trees in the context of machine learning. The goal here is to provide a foundational understanding of decision trees and implement them."
pubDatetime: 1900-01-01
draft: true
lang: "en-us"
---

This is the first in a series of posts about decision trees in the context of machine learning. The goal here is to provide a foundational understanding of decision trees and implement them.

Decision trees are not amazing algorithms by themselves. They have limitations that can result in suboptimal and even weird predictions.
And yet, they have become extremely popular. Some would even say they are the _de facto_ go-to algorithm for many machine learning domains.
This is due to _bagging_ and _boosting_, techniques that turned subpar decision trees into state-of-the-art algorithms. We'll explore them in the future.

First, we'll build an intuition for what are decision trees and define them mathematically. Then, we'll explore how decision trees are built. This will allow us to grasp their main characteristics, advantages and disadvantages.

## What is a decision tree?

Imagine you're trying to decide whether to take an umbrella when leaving home. You might ask questions like: _"Are there clouds?"_. If yes, you might then ask _"What's the humidity level?"_. Each question helps you narrow down the decision. This is how a decision tree works.

Let's simulate this weather example:

![Scatter plot of humidity and cloud coverage showing that it's more likely to rain when its cloudy and humid](../../assets/images/climbing-trees-1/weather_conditions.png)

A decision tree can be thought of as making consecutive decisions by asking a series of questions about our data.
Each internal tree _node_ uses a certain feature (in our example, cloud cover or humidity) to divide its region into two using a split value.
Each new region can be further divided into two. A node that divides its region into two is called an _internal node_.

_Leaf (or terminal) nodes_ don't ask any more questions, but rather provide a prediction for its region. In our example, it might say _"Rain"_ or _"No rain"_. More precisely, it assigns a probability for each outcome.

Let's take a look at a decision tree fitted to our weather example:

![Graph of decision tree splits](../../assets/images/climbing-trees-1/weather_tree.svg)

This decision tree was kept intentionally small.
From top to bottom, this graph represents all decision boundaries of our simple tree.
Each internal node produces two _branches_, that is, two paths that can be followed. These branches recursively partitions the feature space such that the samples with the same labels or similar target values are grouped together.
For instance, we predict that it'll rain if humidity is above 59% and cloud cover is above 45% (rightmost path in the graph) because most points (_instances_) in this region are of the "Rain" class.

The class shown is only relevant for leaf nodes, that is, those at the bottom row.
The `value` property shows how many samples there are for each class in each region.
A _pure node_ has only instances of one class in its region. Since all nodes contain at least one instance of both classes (that is, "Rain" and "No Rain"), all nodes are _impure_.
The objective during training is to _reduce impurity_ as much as possible. If all nodes are pure, then the tree has _zero error_ on the training data set. This is how decision trees learn.

Unlike linear models, they do not model the entire data distribution. Rather, each region has independent predicted values.

This visualization of the tree is very easy to interpret. We can follow each path and clearly see why a prediction was made, that is, the model is easily _explainable_ (the opposite of a _black-box_ model). This is one of the reasons why decision trees are popular. Simple decision trees can even be applied in some practical settings (e.g. medicine) without machine assistance.

We can also visualize the decision boundaries of the tree by overlaying them onto the scatter plot of our data:

![Scatter plot of humidity and cloud coverage showing prediction regions from a decision tree](../../assets/images/climbing-trees-1/weather_conditions_with_tree.png)

We can see the straight boundaries between regions. More formally, a decision tree is a hierarchical structure that recursively divide our features into _cuboid regions_. Since we have 2 features (2 dimensions) in our example, the cuboid regions are squares.

## Mathematical definition

Mathematically, a decision tree can be described as:

$$
f(x) = \sum_{m=1}^{M} w_m \mathbf{I}(x \in R_m)
$$

Where $x$ are the input features, $R_m$ is the $m$'th region and $w_m$ is the model applied to this region. $\mathbf{I}(x \in R_m)$ is 1 if $x$ is contained in the $m$'th region, 0 otherwise. Each model $w$ provides a prediction for a region, and their combination defines the decision tree.
This model, which will be explored later, is typically a constant (regression) or a vector of probabilities (classification).

The regions cannot assume arbitrary boundaries, though. They are always _parallel_ to some axis and can only divide a previous region into two.
This can be a limitation, but it greatly reduces the computational complexity of constructing a decision tree. In our weather example, it's trivial to find the following decision boundary using other methods (I have used logistic regression):

![Weather scatter plot with diagonal decision boundary](../../assets/images/climbing-trees-1/weather_conditions_boundary.png)

However, axis-parallel splits (single feature) are much easier to compute than oblique splits (multiple features). Finding the best split of a single feature involves sorting the data and evaluating splits.
Since the latter is negligible compared to sorting, this operation has a time complexity of $O(n \log n)$, where $n$ is the number of data points.
To find the best oblique split combining two features, however, we must first consider all possible $O(n^2)$ lines formed by pairs of points.
For each line, you need to evaluate which side each point falls on: $O(n)$. This amounts to a total time complexity of $O(n^3)$.
More generally, an oblique split has a time complexity of $O(n^{d+1})$, in which $d$ is the number of features.
Therefore, we compromise on using only axis-parallel splits, which define cuboid regions.

Each region $R_m$ is defined by a path from the root to the $m$'th leaf of the tree. For instance, consider the path that defines the region $R = \{(Humidity,\ Cloud)\ |\ Humidity > 59\ \text{and}\ Cloud > 45\}$.

![Path between the root node and a leaf node](../../assets/images/climbing-trees-1/weather_tree_path.svg)

![Defined region in scatter plot](../../assets/images/climbing-trees-1/weather_conditions_region.png)

For each split, we test many split points for all features and use the one that improves our metric the most. We'll discuss this metric later.
Without the constraint that boundaries must be parallel to one axis, the line defining the region would depend on two or more features, thus increasing by a lot the number of regions we'd have to test to find the best one.

This constraint may impair the model's ability to learn relationships that depend on two variables. However, given enough splits (larger tree size), it's easy to see that _any_ relationship can be approximated.
