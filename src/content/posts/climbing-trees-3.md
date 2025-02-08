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

## Ensembles

What if we could build low bias and high variance models, then later reduce their variance _without_ increasing their bias?
There is a _theoretical_ way to do this: we obtain many independent data sets, train many different models and average their results.
As the number of models approaches infinity we converge towards the expected classifier for the true population distribution.
Since variance is a characteristic of each model, we _"average out"_ model variance without increasing bias.

More formally, consider we have access to the true population distribution $\mathcal{P}$.
Each training set $\mathcal{L}$ contains many $(x;y)$ cases independently drawn from the distribution $\mathcal{P}$, where $X$ and $Y$ are random variables.
The _average_ error for a single model can be expressed as:

$$
e = \mathbb{E}_{\mathcal{L}} \mathbb{E}_{X,Y} (Y - \varphi(x;\mathcal{L}))^2
$$

The model trained on the training set $\mathcal{L}$ is notated as $\varphi(x;\mathcal{L})$.
Since we're expressing the _average_ error, we take the _expectation_ over the distribution $E_{X,Y}$ and over the training sets $E_{\mathcal{L}}$.
That is, $e$ measures the expected squared error over different test points ($E_{X,Y}$) and over different training sets $E_{\mathcal{L}}$.

Now, let's consider an aggregated predictor averaged over _all_ possible training sets. Its error can be expressed as follows:

$$
e_a = \mathbb{E}_{X,Y} (Y - \varphi_a(x;P))^2
$$

There is no need to consider the expectation over all training sets since the model is already averaged.
Expanding the squared term in $e$:

$$
e = \mathbb{E}_{\mathcal{L}} \mathbb{E}_{X,Y} [Y^2 - 2 Y \varphi(x;\mathcal{L}) + \varphi^2(x;\mathcal{L})]
$$

Using linearity of expectation:

$$
e = \mathbb{E}_{X,Y} Y^2 - 2 \mathbb{E}_{X,Y} Y \mathbb{E}_\mathcal{L} \varphi(x;\mathcal{L}) + \mathbb{E}_{X,Y} \mathbb{E}_{\mathcal{L}} \varphi^2 (x;\mathcal{L})
$$

The expected value of individual predictors equals the aggregated predictor:

$$
\mathbb{E}_{\mathcal{L}} \varphi(x;\mathcal{L}) = \varphi_a(x;P)
$$

Using Jensen's inequality $(EZ)^2 <= E(Z)^2$ applied to $E_{\mathcal{L}} \varphi(x;L)$, we can conclude:

$$
\begin{aligned}
&e = \mathbb{E}_{X,Y} Y^2 - 2 \mathbb{E}_{X,Y} Y \varphi_a(x;P) + \mathbb{E}_{X,Y} \mathbb{E}_{\mathcal{L}} \varphi^2 (x;\mathcal{L})\\
&\hphantom{1} \ge \mathbb{E}_{X,Y} (Y - \varphi_a(x;P))^2 = e_a
\end{aligned}
$$

Thus, the aggregated predictor never has higher mean-squared error than any individual predictor.
The improvement we get from aggregating all possible models depends on how unequal are the two terms:

$$
[\mathbb{E} \varphi(x, \mathcal{L})]^2 \le \mathbb{E}_{\mathcal{L}} \varphi^2 (x, \mathcal{L})
$$

Rearranging, we get:

$$
\mathbb{E}_{\mathcal{L}} \varphi^2 (x, \mathcal{L}) - [\mathbb{E} \varphi(x, \mathcal{L})]^2 \ge 0
$$

This value is high when the training procedure is _unstable_, indicating that the model exhibits high _variance_.
As a result, decision trees are particularly well-suited for model aggregation, whereas _k_-nearest neighbor and ordinary least squared (OLS) regression do not benefit as much from this approach.

### Bagging

Unfortunately, we don't have infinite data sets -- it's usually hard enough to obtain one.
Dividing one set into many doesn't help either because this increases bias due to lower sample size.
The solution is to _create_ many data sets out of the one we have by _**b**ootstrap **agg**regat**ing**_ or _bagging_.

We start with a single training set $\mathcal{L} = \{(x_1, y_1), ..., (x_n, y_n)\}$ and generate new sets by _bootstrapping_.
That is, we randomly sample from the original set _with replacement_ and generate many new sets with $N$ elements each.
Some points will be represented more than once in a sampled set, while others will be absent.
That is, we treat our training set _as if_ it were the population distribution and sample from it.
This may sound like a gimmick[^bootstrap], but empirically it works. In fact, bootstrapping is widely used in statistics.

[^bootstrap]: It is believed that the name _bootstrapping_ comes from the saying [_"pull oneself up by one's bootstraps"_](https://en.wiktionary.org/wiki/pull_oneself_up_by_one%27s_bootstraps), implying an attempt to do something impossible.

Because we're not considering all points in every sampled set, we do increase bias -- the bootstrap is, after all, an approximation.
However, the decrease in variance can be higher than the increase in bias. The instability conclusion still holds, so unstable procedures benefit the most from bagging. Stable procedures, on the other hand, tend to produce _worse_ errors when bagged.

## Bagged trees

...

## References

- Breiman, L. [Bagging Predictors](https://www.stat.berkeley.edu/~breiman/bagging.pdf). Machine Learning 24, 123–140 (1996).
