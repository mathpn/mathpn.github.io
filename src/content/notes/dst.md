---
title: "Deterministic simulation testing"
tags:
  - Distributed systems
  - Bookmarks
  - TIL
pubDatetime: 2024-12-11
lang: "en-us"
---

Today I learned about deterministic simulation testing, an approach to test distributed systems. The core idea is to re­move all non-deterministic behavior from the critical parts of the application, creating a con­trolled environment where the sequence of events can be manipulated.

This involves setting fixed seeds for random number generators, controlling clock and time dependencies, running tests in a single thread, and using asynchronous I/O operations. While these constraints might seem overly restrictive, they allow us to reproduce bugs found during simulations.

It’s easier said than done, though. Adding this kind of test to an existing system can be challenging. There’s always going to be some non-deterministic edges. Also, the test is only as good as your simulation.

Read more in this [blog post](https://notes.eatonphil.com/2024-08-20-deterministic-simulation-testing.html).
