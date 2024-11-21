---
title: "Survival analysis with Cox reggression - heart failure data"
categories:
tags:
  - R
  - Data Analysis
  - Statistics
description: "Last time, we used decision trees, binarization and logistic regression to predict heart failure mortality in a public dataset. Here, we'll use Cox regression to more adequately model survival data."
pubDatetime: 2021-12-16
lang: "en-us"
---

Last time, we used decision trees, binarization and logistic regression to predict heart failure mortality in a public dataset. This approach yielded a very simple model, which, when dealing with noisy biological data and not many observations, is crucial to improve generalization.

The original data is described in [this paper](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0181001).
As we’ve discussed previously, the _time_ variable refers to follow-up
time, that is, for how long each patient was observed. Whenever a patient that has not died reaches its follow-up time, it’s no longer
observed and thus is a [censored observation](https://en.wikipedia.org/wiki/Survival_analysis#Censoring).

Machine learning approaches applied to this dataset generally ignore the censoring problem, which can seriously distort the results. In our
previous post, we used a gimmick of filtering observations to mitigate this issue.

Nonetheless, survival analysis is the most appropriate method to analyze this dataset, as it was used in the original study. So, let’s build some
survival curves and then a predictive model based on survival probability.

Let’s load the data just like last time.

```r
library(tidyverse)
library(magrittr)
library(survival)
library(ggfortify)
library(gridExtra)
library(survminer)
library(knitr)
library(ranger)
library(riskRegression)

data <- read.csv("./heart_failure_clinical_records_dataset.csv")
factor_cols <- c("anaemia", "diabetes", "high_blood_pressure", "smoking")

data %<>% mutate_at(factor_cols, factor)
data$sex <- factor(data$sex, labels = c("female", "male"))
```

Using the `survival` package, we’ll build a survival object and plot a
survival curve:

```r
surv_obj <- with(data, Surv(time, DEATH_EVENT))
surv_fit <- survfit(surv_obj ~ 1, data = data)

autoplot(surv_fit) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw()
```

![Survival curve of patients. The y-axis shows the percentage of individuals who have survived at each point in time, while the x-axis represents time measured in days.](@assets/images/cox-regression/figure-gfm/unnamed-chunk-2-1.png)

By the end of the study, only 55-60% of patients were still alive. Each _+_ sign represents a censoring, that is, the end of one patient’s
follow-up period. Let’s plot survival curves splitting by different variables:

```r
p_anaemia <- autoplot(survfit(surv_obj ~ anaemia, data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("Anaemia") + theme(plot.title = element_text(hjust = 0.5))

p_diabetes <- autoplot(survfit(surv_obj ~ diabetes, data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("Diabetes") + theme(plot.title = element_text(hjust = 0.5))

p_pressure <- autoplot(survfit(surv_obj ~ high_blood_pressure, data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("High blood pressure") + theme(plot.title = element_text(hjust = 0.5))

p_sex <- autoplot(survfit(surv_obj ~ sex, data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("Sex") + theme(plot.title = element_text(hjust = 0.5))

p_smoking <- autoplot(survfit(surv_obj ~ smoking, data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("Smoking") + theme(plot.title = element_text(hjust = 0.5))


grid.arrange(p_anaemia, p_diabetes, p_pressure, p_sex, p_smoking, nrow = 3)
```

![Survival curve of patients divided into groups for each categorical variable.](@assets/images/cox-regression/figure-gfm/unnamed-chunk-3-1.png)

Survival may differ only by anemia and high blood pressure status. We’ll use the log-rank test to compare survival distributions:

```r
survdiff(surv_obj ~ data$anaemia)
```

```text
## Call:
## survdiff(formula = surv_obj ~ data$anaemia)
##
##                  N Observed Expected (O-E)^2/E (O-E)^2/V
## data$anaemia=0 170       50     57.9      1.07      2.73
## data$anaemia=1 129       46     38.1      1.63      2.73
##
##  Chisq= 2.7  on 1 degrees of freedom, p= 0.1
```

```r
survdiff(surv_obj ~ data$high_blood_pressure)
```

```text
## Call:
## survdiff(formula = surv_obj ~ data$high_blood_pressure)
##
##                              N Observed Expected (O-E)^2/E (O-E)^2/V
## data$high_blood_pressure=0 194       57     66.4      1.34      4.41
## data$high_blood_pressure=1 105       39     29.6      3.00      4.41
##
##  Chisq= 4.4  on 1 degrees of freedom, p= 0.04
```

Survival distribution only differs significantly according to high blood pressure status. However, we’ve only looked at categorical variables. In
fact, survival plots are not practical to visualize the effect of continuous variables on survival. In order to explore these variables,
we’ll transform them into categorical ones splitting them by their median value:

```r
# Binning using the ntile function from dplyr
# ntile(data$serum_creatinine, 2) generates a new factor variable with
# two levels, that is, two 50th quantiles

p_age <- autoplot(survfit(surv_obj ~ ntile(log(data$age), 2), data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("Age") + theme(plot.title = element_text(hjust = 0.5))

p_cpk <- autoplot(survfit(surv_obj ~ ntile(log(data$creatinine_phosphokinase), 2), data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("CPK") + theme(plot.title = element_text(hjust = 0.5))

p_ef <- autoplot(survfit(surv_obj ~ ntile(log(data$ejection_fraction), 2), data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("Ejection fraction") + theme(plot.title = element_text(hjust = 0.5))

p_platelets <- autoplot(survfit(surv_obj ~ ntile(log(data$platelets), 2), data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("Platelets") + theme(plot.title = element_text(hjust = 0.5))

p_creatinine <- autoplot(survfit(surv_obj ~ ntile(log(data$serum_creatinine), 2), data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("Serum creatinine") + theme(plot.title = element_text(hjust = 0.5))

p_sodium <- autoplot(survfit(surv_obj ~ ntile(log(data$serum_sodium), 2), data = data)) + ylab("Survival Probability") + xlab("Time (days)") + theme_bw() + theme(legend.position = "none") + ggtitle("Serum sodium") + theme(plot.title = element_text(hjust = 0.5))

grid.arrange(p_age, p_cpk, p_ef, p_platelets, p_creatinine, p_sodium, nrow = 3)
```

![Survival curves for continuous variables split by their median value.](@assets/images/cox-regression/figure-gfm/unnamed-chunk-5-1.png)

Here, ejection fraction, serum creatinine, serum sodium and (perhaps)
age quantiles appear to be associated with a difference in survival. We
could (and in fact I did) apply log-rank tests here, but we’ll use these
variables without binning in a [Cox regression](https://en.wikipedia.org/wiki/Proportional_hazards_model).
All these plots are exploratory, that is, they allow us to grasp the
general tendencies and possible associations between variables. Still,
they should be taken with a grain of salt because variables may have
interactions and significant effects may be hidden when we split the
survival curve by one variable at a time.

## Cox regression

This kind of model accepts categorical and continuous variables as
predictors and estimates _hazard ratios_, that is, _relative risks_
compared to a reference factor level or numerical value. It is widely
used in survival analysis as it can take as input a survival curve -- a
very peculiar type of data. Fitting survival data with normal linear
models is troublesome (among other reasons) due to high censoring
frequency (inherent to survival studies). Let’s fit a simple model:

```r
cox_m <- coxph(Surv(time, DEATH_EVENT) ~ age + anaemia + creatinine_phosphokinase + diabetes + ejection_fraction + high_blood_pressure + platelets + serum_creatinine + serum_sodium + sex + smoking, data = data, x = TRUE)

broom::tidy(cox_m) %>% kable()
```

| term                     | estimate | std.error | statistic |  p.value |
| :----------------------- | -------: | --------: | --------: | -------: |
| age                      |     0.05 |      0.01 |      4.98 | 0.000001 |
| anaemia1                 |     0.46 |      0.22 |      2.12 | 0.033835 |
| creatinine_phosphokinase |     0.00 |      0.00 |      2.23 | 0.026048 |
| diabetes1                |     0.14 |      0.22 |      0.63 | 0.530745 |
| ejection_fraction        |    -0.05 |      0.01 |     -4.67 | 0.000003 |
| high_blood_pressure1     |     0.48 |      0.22 |      2.20 | 0.027769 |
| platelets                |    -0.00 |      0.00 |     -0.41 | 0.680638 |
| serum_creatinine         |     0.32 |      0.07 |      4.58 | 0.000005 |
| serum_sodium             |    -0.04 |      0.02 |     -1.90 | 0.057531 |
| sexmale                  |    -0.24 |      0.25 |     -0.94 | 0.345165 |
| smoking1                 |     0.13 |      0.25 |      0.51 | 0.607828 |

There are 6 significant predictors. Adding more variables will always
reduce the error of a linear model. However, variables with little
predictive power are most likely just adding noise to the model, and the
reduced error comes from modeling random error, that is, overfitting.
Just like last time, we shall keep this model simple. This is even more
important considering the nature of the dataset, that is, biological
data from humans, which is very noisy. There are only 96 death events,
so including too many variables might quickly result in overfitting.

Thus, let's reduce the model removing the variables which contribute
very little to the final model above.

```r
cox_m_reduced <- coxph(Surv(time, DEATH_EVENT) ~ age + anaemia + creatinine_phosphokinase + ejection_fraction + high_blood_pressure + serum_creatinine, data = data, x = TRUE)

broom::tidy(cox_m_reduced) %>% kable
```

| term                     | estimate | std.error | statistic |  p.value |
| :----------------------- | -------: | --------: | --------: | -------: |
| age                      |     0.04 |      0.01 |      4.93 | 0.000001 |
| anaemia1                 |     0.39 |      0.21 |      1.85 |  0.06477 |
| creatinine_phosphokinase |     0.00 |      0.00 |      2.00 |  0.04623 |
| ejection_fraction        |    -0.05 |      0.01 |     -5.15 | 0.000003 |
| high_blood_pressure1     |     0.47 |      0.21 |      2.19 |  0.02839 |
| serum_creatinine         |     0.35 |      0.07 |      5.32 | 0.000001 |

So far so good, or is it? The cox regression model, like all models,
makes a few assumptions. We’ll check for proportional hazards,
influential observations and linearity in the covariates.

Cox regression models are also called proportional hazards models. This
means that these models assume that the effect of a covariate is
constant throughout the time, that is, residuals are independent of
time. We can check this using the `cox.zph` function from the _Survival_
package and by graphically inspecting if Schoenfeld residuals are
independent of time.

```r
print(cox.zph(cox_m))
```

```text
##                             chisq df    p
## age                      1.03e-01  1 0.75
## anaemia                  1.69e-02  1 0.90
## creatinine_phosphokinase 1.02e+00  1 0.31
## diabetes                 1.92e-01  1 0.66
## ejection_fraction        4.69e+00  1 0.03
## high_blood_pressure      8.23e-03  1 0.93
## platelets                5.69e-06  1 1.00
## serum_creatinine         1.52e+00  1 0.22
## serum_sodium             1.10e-01  1 0.74
## sex                      7.63e-02  1 0.78
## smoking                  4.79e-01  1 0.49
## GLOBAL                   1.17e+01 11 0.39
```

It seems that ejection fraction does not follow the proportional hazards
assumption. Still, let’s check the other assumptions, and we’ll later
come back to this issue. Using functions from the `survminer` package,
let’s check for influential observations and non-linearity in the covariates.

First, let’s plot the estimated change in coefficients when each observation is removed from the model.

```r
ggcoxdiagnostics(cox_m, type = 'dfbeta')
```

![Scatter plots of changes to coefficients when each observation is removed](@assets/images/cox-regression/figure-gfm/unnamed-chunk-9-1.png)

It seems that creatinine phosphokinase, serum creatinine and maybe
serum sodium have a few very influential observations. Finally,
continuous covariate effects are assumed to be linear. We can check this
assumption plotting Martingale residuals using the `ggcoxfunctional`
function from the _survminer_ package:

```r
ggcoxfunctional(with(data, Surv(time, DEATH_EVENT)) ~ age + creatinine_phosphokinase + ejection_fraction + serum_creatinine + serum_sodium, data = data, ylim = c(-1, 1))
```

![Martingale residuals of null Cox Model for each continuous variable](@assets/images/cox-regression/figure-gfm/unnamed-chunk-10-1.png)

Now it’s clear why there are very influential observations. As the model
assumes linear covariate effects, extremely high
creatinine phosphokinase and serum creatinine values become largely
influential. In the previous post we used binning, thus this issue
became irrelevant. Here, we can address right-skewed distributions by
using a simple log. The slight left-skewed distribution of serum sodium
might not be a problem. We’ll see.

Let’s fit a new model using some log-transformed variables:

```r
cox_m_log <- coxph(Surv(time, DEATH_EVENT) ~ age + anaemia + log(creatinine_phosphokinase) + diabetes + ejection_fraction + high_blood_pressure + platelets + log(serum_creatinine) + serum_sodium + sex + smoking, data = data, x = TRUE)

broom::tidy(cox_m_log) %>% kable()
```

| term                          | estimate | std.error | statistic |   p.value |
| :---------------------------- | -------: | --------: | --------: | --------: |
| age                           |     0.04 |      0.01 |      4.52 | 0.0000063 |
| anaemia1                      |     0.47 |      0.21 |      2.20 | 0.0280328 |
| log(creatinine_phosphokinase) |     0.09 |      0.10 |      0.92 | 0.3595379 |
| diabetes1                     |     0.14 |      0.22 |      0.64 | 0.5194190 |
| ejection_fraction             |    -0.04 |      0.01 |     -4.13 | 0.0000361 |
| high_blood_pressure1          |     0.50 |      0.21 |      2.35 | 0.0185782 |
| platelets                     |    -0.00 |      0.00 |     -0.39 | 0.6991078 |
| log(serum_creatinine)         |     0.96 |      0.21 |      4.66 | 0.0000032 |
| serum_sodium                  |    -0.03 |      0.02 |     -1.41 | 0.1587203 |
| sexmale                       |    -0.26 |      0.25 |     -1.05 | 0.2936010 |
| smoking1                      |     0.21 |      0.25 |      0.83 | 0.4086007 |

Interestingly, the log-transformed creatinine phosphokinase variable
was no longer a significant predictor. It looks like the fitted
coefficient was largely due to extreme observations. Although omitted
here, variables which contribute the least to the final model were
removed in a stepwise manner, resulting in the following model:

```r
cox_m_log <- coxph(Surv(time, DEATH_EVENT) ~ age + anaemia + ejection_fraction + high_blood_pressure + log(serum_creatinine), data = data, x = TRUE)

broom::tidy(cox_m_log) %>% kable()
```

| term                  | estimate | std.error | statistic |   p.value |
| :-------------------- | -------: | --------: | --------: | --------: |
| age                   |     0.04 |      0.01 |      4.39 | 0.0000112 |
| anaemia1              |     0.40 |      0.21 |      1.92 | 0.0553363 |
| ejection_fraction     |    -0.04 |      0.01 |     -4.46 | 0.0000084 |
| high_blood_pressure1  |     0.51 |      0.21 |      2.41 | 0.0161065 |
| log(serum_creatinine) |     1.00 |      0.19 |      5.25 | 0.0000002 |

The non-proportional hazard issue, however, persists:

```r
cox.zph(cox_m_log)
```

```text
##                         chisq df    p
## age                   0.17720  1 0.67
## anaemia               0.00755  1 0.93
## ejection_fraction     4.73124  1 0.03
## high_blood_pressure   0.02384  1 0.88
## log(serum_creatinine) 2.11537  1 0.15
## GLOBAL                6.65288  5 0.25
```

```r
plot(cox.zph(cox_m_log)[3])
abline(c(0,0), col = 2)
abline(h = cox_m_log$coefficients[3], col = 3, lty = 2)
```

![Beta coefficient for ejection fraction over time](@assets/images/cox-regression/figure-gfm/unnamed-chunk-13-1.png)

In the plot above, the green dotted line is at the fitted coefficient
for ejection fraction. Although ejection fraction is a very important
predictor, its effect is not constant over time. Early on it has a small
negative effect on survival (close to 0 on the graph), but after 60 days
its effect is much more pronounced. This is why this predictor violates
the proportional hazards assumption.

A possible solution is to fit different coefficients over different time
intervals (as described in this excellent
[vignette](https://cran.r-project.org/web/packages/survival/vignettes/timedep.pdf)).
Visually, it seems that splitting the data at day 50 provide a good
separation of distinct ejection fraction effects.

```r
data_split <- survSplit(Surv(time, DEATH_EVENT) ~ ., data = data, cut = 50, episode = "tgroup", id = "id")

cox_m_split <- coxph(Surv(tstart, time, DEATH_EVENT) ~ age + anaemia + ejection_fraction:strata(tgroup) + high_blood_pressure + log(serum_creatinine), data = data_split, x = TRUE)

broom::tidy(cox_m_split) %>% kable()
```

| term                                     | estimate | std.error | statistic |   p.value |
| :--------------------------------------- | -------: | --------: | --------: | --------: |
| age                                      |     0.04 |      0.01 |      4.53 | 0.0000058 |
| anaemia1                                 |     0.44 |      0.21 |      2.12 | 0.0341384 |
| high_blood_pressure1                     |     0.54 |      0.21 |      2.54 | 0.0110057 |
| log(serum_creatinine)                    |     0.97 |      0.19 |      5.13 | 0.0000003 |
| ejection_fraction:strata(tgroup)tgroup=1 |    -0.02 |      0.01 |     -1.60 | 0.1105482 |
| ejection_fraction:strata(tgroup)tgroup=2 |    -0.09 |      0.02 |     -4.91 | 0.0000009 |

The ejection fraction now only has a significant effect on tgroup = 2,
that is, after day 50. This should remove the issue with the
non-proportional hazard. Let's check:

```r
print(cox.zph(cox_m_split))
```

```text
##                                    chisq df    p
## age                              0.02004  1 0.89
## anaemia                          0.15881  1 0.69
## high_blood_pressure              0.00366  1 0.95
## log(serum_creatinine)            1.35157  1 0.25
## ejection_fraction:strata(tgroup) 1.13453  2 0.57
## GLOBAL                           3.14512  6 0.79
```

Great! The assumption is not violated anymore. Now we'll compare the
models we have built so far. For this step, we’ll split the data into
training (70% of original data) and test (30%) datasets and refit the
previous models using the training data.

```r
set.seed(12)
train_size = floor(0.7 * nrow(data))
train_ind <- sample(seq_len(nrow(data)), size = train_size)

train_data <- data[train_ind, ]
test_data <- data[-train_ind, ]

cox_m_log <- coxph(Surv(time, DEATH_EVENT) ~ age + anaemia + log(creatinine_phosphokinase) + diabetes + ejection_fraction + high_blood_pressure + platelets + log(serum_creatinine) + serum_sodium + sex + smoking, data = train_data, x = TRUE)
cox_m_log_reduced <- coxph(Surv(time, DEATH_EVENT) ~ age + anaemia + ejection_fraction + high_blood_pressure + log(serum_creatinine), data = train_data, x = TRUE)

train_data_split <- survSplit(Surv(time, DEATH_EVENT) ~ ., data = train_data, cut = 50, episode = "tgroup", id = "id")

cox_m_split <- coxph(Surv(tstart, time, DEATH_EVENT) ~ age + anaemia + ejection_fraction:strata(tgroup) + high_blood_pressure + log(serum_creatinine), data = train_data_split, x = TRUE)


models = list(cox_m_log, cox_m_log_reduced, cox_m_split)
concordances = sapply(models, function(x) concordance(x)$concordance)
aics = sapply(models, AIC)

models_metrics = data.frame(Model = c('All variables', 'Selected variables', 'Split time, selected var.'), Concordance = concordances, AIC = aics)
models_metrics %>% kable()
```

| Model                     | Concordance |   AIC |
| :------------------------ | ----------: | ----: |
| All variables             |       0.746 | 606.5 |
| Selected variables        |       0.740 | 599.1 |
| Split time, selected var. |       0.746 | 593.9 |

Our final model, which doesn’t violate the core model assumptions,
presents better AIC compared to the previous ones and a very similar
concordance compared to the model with all variables. But in practice
this model will predict two separate survival curves, one for each
_tgroup_ (before or after day 50). Therefore, this model may be great to
interpret the contribution of each variable, but it’s not very practical
for prediction.

Finally, we’ll build a random survival forest model using the `ranger`
function from the _ranger_ package. However, we’ll not go deep into this
model. We’ll limit tree depth (`max.depth`) and set a higher minimal node
size (`min.node.size`) to avoid overfitting.

```r
ranger_m <- ranger(Surv(time, DEATH_EVENT) ~ age + anaemia + creatinine_phosphokinase + diabetes + ejection_fraction + high_blood_pressure + platelets + serum_creatinine + serum_sodium + sex + smoking, data = train_data, x = TRUE, importance = 'permutation', min.node.size = 5, max.depth = 5)
```

The _riskRegression_ package has a nice `Score` function that calculates
[Brier scores](https://en.wikipedia.org/wiki/Brier_score) and [Index of Prediction
Accuracy](https://cran.r-project.org/web/packages/riskRegression/vignettes/IPA.html),
which is 1 minus the ratio between the Brier score of the model against
the Brier score of a null model. A positive IPA means a better
probability prediction compared to the null model.

```r
ipa_models <- Score(list("Cox - all variables" = cox_m_log, "Cox - few variables" = cox_m_log_reduced, "Forest" = ranger_m), data = test_data, formula = Surv(time, DEATH_EVENT) ~ 1, summary = 'ipa', metrics = 'brier', contrasts = FALSE)

print(ipa_models)
```

```text
## Metric Brier:
##
## Results by model:
##
##                  model times Brier lower upper  IPA
## 1:          Null model   113  20.9  15.8  26.0  0.0
## 2: Cox - all variables   113  16.3  10.4  22.2 21.9
## 3: Cox - few variables   113  15.8  10.0  21.6 24.3
## 4:              Forest   113  16.4  11.7  21.2 21.3

##
## NOTE: Values are multiplied by 100 and given in %.

## NOTE: The lower Brier the better, the higher IPA the better.
```

It seems our Cox regression with only a few variables outperforms the
other models slightly (higher IPA score). Random forests can be really
useful to fit high dimensional data. In this case, however, a Cox
regression carefully fit seems to be an excellent option.
