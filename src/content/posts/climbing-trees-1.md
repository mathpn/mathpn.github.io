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

## What is a decision tree

Imagine you're trying to decide whether to take an umbrella when leaving home. You might ask questions like: _"Are there clouds?"_. If yes, you might then ask _"What's the humidity level?"_. Each question helps you narrow down the decision. This is how a decision tree works.

Let's simulate this weather example:

![Scatter plot of humidity and cloud coverage showing that it's more likely to rain when its cloudy and humid](../../assets/images/climbing-trees-1/weather_conditions.png)

A decision tree is a hierarchical structure that recursively divide our features into cuboid regions.
This can be thought of as making consecutive decisions by asking a series of questions about our data.
Each internal tree node divides its region into two using a split value of a feature.
Using our weather example, we might take different decisions if the humidity is above a certain threshold.

Leaf (or terminal) nodes don't ask any more questions, but rather provide a prediction for its region. In our example, it might say _"Rain"_ or _"No rain"_. More precisely, it assigns a probability for each outcome.

Let's take a look at a decision tree fitted to our weather example:

![Graph of decision tree splits](../../assets/images/climbing-trees-1/weather_tree.svg)

From top to bottom, this graph represents all decision boundaries of our simple decision tree.
We only predict that it'll rain if humidity is above 68% and cloud cover is above 42%.
The class shown is only relevant for leaf nodes, that is, those at the bottom.
The `value` property shows how many samples there are for each class in each region.
We can see that there is no _pure node_, that is, a node with samples from only one class.

Let's overlay these regions onto the scatter plot of our data:

![Scatter plot of humidity and cloud coverage showing prediction regions from a decision tree](../../assets/images/climbing-trees-1/weather_conditions_with_tree.png)

## Mathematical definition

Mathematically, a decision tree can be described as:

$$
f(x) = \sum_{m=1}^{M} c_m \phi(x;v_m)
$$

Where $\phi(x;v_m)$ is a function that defines each region and $c_m$ is the model applied to this region. Each model $c$ provides a prediction for a region, and their combination defines the decision tree. Typically, this model is simply a constant (regression) or a vector of probabilities (classification). We'll dive deeper into this definition later.

The regions cannot assume arbitrary boundaries, though. They are always _parallel_ to some axis and can only divide a previous region into two.
This can be a limitation, but it greatly reduces the computational complexity of constructing a decision tree. In our weather example, it's trivial to find the following decision boundary using other methods (I have used logistic regression):

![Weather scatter plot with diagonal decision boundary](../../assets/images/climbing-trees-1/weather_conditions_boundary.png)

For each split, we test many split points for all features and use the one that improves our metric the most. We'll discuss this metric later.
Without the constraint that boundaries must be parallel to one axis, the line defining the region would depend on two or more features, thus increasing by a lot the number of regions we'd have to test to find the best one.

This constraint may impair the model's ability to learn relationships that depend on two variables. However, given enough splits (larger tree size), it's easy to see that _any_ relationship can be approximated.
