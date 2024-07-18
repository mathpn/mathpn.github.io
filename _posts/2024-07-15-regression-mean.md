---
title: Regression to the mean
header:
  overlay_image: /assets/images/default_overlay.jpg
  show_overlay_excerpt: false
categories:
  - Blog
tags:
  - Statistics
excerpt: something something
---
Regression to the mean is the statistical tendency for extreme measurements to be followed by values closer to the mean. In simpler terms, things tend to even out. Most of us have an intuitive grasp of this concept, but it's useful to understand it in more depth.

Why do things tend to even out? Why do measurements tend towards the mean? When should we expect regression to the mean to happen? Isn't all of this too obvious? I'll try to answer these questions here.

## Why do measurements tend towards the mean?

Let's consider a series of independent events. For instance, the score of a sequence of dart throws. Extremely low and high score are unlikely due to the typical design of dartboards. Therefore, The distribution of dart throw scores will approximate a normal distribution.

Now, let's consider the relationship between two consecutive dart throws. Since they are independent, we expect on average 0 correlation between their scores. Therefore, if the first throw had a high score, we can't infer anything about the second throw. This is the most extreme form of regression to the mean, since the first measurement has no influence over the second one.

Therefore, a lucky throw doesn't change the probability of getting extreme (high or low) scores on the next throw. The score of the second throw will be centered - of course - around the mean, regardless of the first score.

This example may seem useless, but it lies on the heart of regression to the mean. Values tend to regress to the mean simply because the mean is the most likely values when the variable is approximately normally distributed. The normality assumption may seem restrictive, but a huge number of things are somewhat normally distributed. Even when the distribution is skewed, some form of regression still happens.
