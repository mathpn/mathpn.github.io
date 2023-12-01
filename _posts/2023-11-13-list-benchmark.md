---
title: "Something about lists"
header:
  overlay_image: /assets/images/default_overlay.jpg
  show_overlay_excerpt: false
categories:
  - Blog
tags:
  - Go
  - Elixir
excerpt: "XX"
---

# TODO

The goal is to compare prepend/append operations in Go and Elixir. Different results reflect different data structures and implementations used.

## Elixir

We'll use [Benchee](https://github.com/bencheeorg/benchee) to benchmark our functions:

```elixir
Benchee.run(
  %{
    "prepend" => fn input ->
      Enum.reduce(Enum.to_list(1..100), input, fn x, acc -> [x | acc] end)
    end,
    "append" => fn input ->
      Enum.reduce(Enum.to_list(1..100), input, fn x, acc -> acc ++ [x] end)
    end
  },
  inputs: %{
    "small" => Enum.to_list(1..100),
    "medium" => Enum.to_list(1..1_000),
    "large" => Enum.to_list(1..10_000)
  }
)
```

The benchmark did not run in an isolated environment (e.g. a server with the least possible amount of running processes), so numbers should be taken with a grain of salt. These are the results:

```
##### With input large #####
Name              ips        average  deviation         median         99th %
prepend        1.32 M     0.00076 ms  ±4728.16%     0.00065 ms     0.00096 ms
append      0.00046 M        2.17 ms     ±7.95%        2.15 ms        2.32 ms

Comparison: 
prepend        1.32 M
append      0.00046 M - 2870.68x slower +2.17 ms

##### With input medium #####
Name              ips        average  deviation         median         99th %
prepend        1.33 M        0.75 μs  ±4801.85%        0.65 μs        0.93 μs
append      0.00810 M      123.49 μs    ±15.93%      121.46 μs      144.53 μs

Comparison: 
prepend        1.33 M
append      0.00810 M - 163.80x slower +122.73 μs

##### With input small #####
Name              ips        average  deviation         median         99th %
prepend        1.33 M        0.75 μs  ±4661.69%        0.65 μs        0.94 μs
append       0.0598 M       16.73 μs    ±13.23%       16.24 μs       20.61 μs

Comparison: 
prepend        1.33 M
append       0.0598 M - 22.25x slower +15.98 μs
```

Prepend and prepend + reverse are -- by far -- the fastest functions.

## Go

We'll implement a simple benchmark function:

```go
package list_fun

import (
	"fmt"
	"slices"
	"testing"
)

func BenchmarkSlice(b *testing.B) {
	lengths := []int{1_000, 10_000, 100_000}
	for _, length := range lengths {
		b.Run(fmt.Sprintf("append %d", length), func(b *testing.B) {
			list := make([]int, 0)
			for i := 0; i < length; i++ {
				list = append(list, i)
			}
		})
		b.Run(fmt.Sprintf("append reverse %d", length), func(b *testing.B) {
			list := make([]int, 0)
			for i := 0; i < length; i++ {
				list = append(list, i)
			}
			slices.Reverse(list)
		})
		b.Run(fmt.Sprintf("prepend %d", length), func(b *testing.B) {
			list := make([]int, 0)
			for i := 0; i < length; i++ {
				list = append([]int{i}, list...)
			}
		})
		b.Run(fmt.Sprintf("prepend reverse %d", length), func(b *testing.B) {
			list := make([]int, 0)
			for i := 0; i < length; i++ {
				list = append([]int{i}, list...)
			}
			slices.Reverse(list)
		})
	}
}
```

Results:

```
                         │ benchmark.log │
                         │    sec/op     │
Slice/append_10000-16      0.2310n ±  9%
Slice/prepend_10000-16      912.1n ± 13%
Slice/append_100000-16     0.2355n ± 10%
Slice/prepend_100000-16     9.293µ ±  9%
Slice/append_1000000-16    0.2555n ±  6%
Slice/prepend_1000000-16    91.63µ ±  4%
```
