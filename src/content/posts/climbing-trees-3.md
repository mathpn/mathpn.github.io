---
title: "Climbing trees 3: from trees to forests"
tags:
  - Machine learning
  - Decision trees
description: "..."
pubDatetime: 2999-01-28
draft: true
lang: "en-us"
---

This is the third in a series of posts about decision trees in the context of machine learning.
In this post, we'll explore _bagging_, a popular strategy to reduce model variance, and random forests, an algorithm that uses decision trees and bagging.
Random forests are very easy to use and usually deliver good performance in real-world problems.
If you haven't already, consider reading the previous parts of this series.

## Climbing trees series

- [Climbing trees 1: what are decision trees?](/posts/climbing-trees-1)
- [Climbing trees 2: implementing decision trees](/posts/climbing-trees-2)
- **Climbing trees 3: from trees to forests** (_you are here_)

---

If things become too complicated, try to read the provided references.
I've drawn upon various sources instrumental to my understanding of decision trees, including books, documentation, articles, blog posts and lectures.
Even if you understand everything, check the [references](#references): there is great content there.

## The variance problem

In the [first part](/posts/climbing-trees-1) of this series, we've seen that decision trees often have poor variance.
Their limitations, namely axis-aligned splits and the greedy approximation, limit their ability to separate signal from the noise.
Moreover, we've seen that it may not be trivial to tune decision trees and achieve a good bias-variance balance for a few reasons.
Most regularization strategies (such as setting a maximum tree depth) rely on integer values and are thus less tunable than fractional counterparts of other machine learning algorithms.
Decision trees are also _unstable_ due to the greedy strategy: small changes in the training data can completely change the final model.

Models with high variance achieve low (or even 0) training error but fail to generalize to new examples.

## Bagging

What if we could build low bias and high variance models, then later reduce their variance _without_ increasing their bias?
There is a _theoretical_ way to do this: we obtain many independent data sets, train many different models and average their results.
As the number of models approaches infinity we converge towards the expected classifier for the true population distribution.
Since variance is a characteristic of each model, we'd _"average out"_ model variance without increasing bias.

Unfortunately, we don't have infinite data sets -- it's usually hard enough to obtain one.
Dividing one set into many doesn't help either because this increases bias.

This is the motivation behind _bootstrap aggregation_ or _bagging_.
