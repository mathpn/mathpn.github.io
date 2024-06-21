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

------------------

We all know lists. Most if not all programming languages provide an implementation of a list-like data structure. Lists may be implemented in some different ways, for instance as singly-linked lists or arrays. In fact, it is common to refer to many different data structures as lists, as long as they provide some familiar list-like interface.

As we'll see, different implementations produce highly different performance in some operations. The decision on which concrete data structure to use as a list is also coupled with the language design itself. I'll compare lists in two languages: Elixir and Go.

## Elixir

Elixir is a functional language that runs on the BEAM virtual machine, which comes from the Erlang world. As the [documentation](https://hexdocs.pm/elixir/1.12/List.html) says, lists are singly-linked lists. In fact, the documentation explains very well the trade-offs of singly-linked lists and I recommend reading it. A singly-linked list can be represented as head and tail pairs, in which the head contain one value and point to the tail. If we follow the tail, we end up with another head pointing to a new tail.

Let's write some simple functions to benchmark some common list operations. We'll use [Benchee](https://github.com/bencheeorg/benchee) to benchmark our functions.

```elixir
Benchee.run(
  %{
    "random access" => fn input ->
      Enum.to_list(1..100) |> Enum.shuffle() |> Enum.map(&Enum.at(input, &1))
    end,
    "iterate" => fn input ->
      for n <- input, do: n
    end,
    "iterate reverse" => fn input ->
      for n <- Enum.reverse(input), do: n
    end,
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
Name                      ips        average  deviation         median         99th %
prepend             1316.27 K        0.76 μs  ±4792.55%        0.65 μs        1.04 μs
random access         50.60 K       19.76 μs    ±61.95%       19.43 μs       25.04 μs
iterate                7.62 K      131.23 μs     ±5.51%      131.00 μs      149.42 μs
iterate reverse        6.53 K      153.17 μs     ±9.10%      153.32 μs      180.12 μs
append                 0.45 K     2229.11 μs     ±5.03%     2218.95 μs     2385.88 μs

Comparison: 
prepend             1316.27 K
random access         50.60 K - 26.01x slower +19.00 μs
iterate                7.62 K - 172.73x slower +130.47 μs
iterate reverse        6.53 K - 201.61x slower +152.41 μs
append                 0.45 K - 2934.12x slower +2228.35 μs

##### With input medium #####
Name                      ips        average  deviation         median         99th %
prepend             1321.36 K        0.76 μs  ±4824.20%        0.65 μs        1.03 μs
iterate              109.81 K        9.11 μs   ±104.18%        8.84 μs       13.44 μs
iterate reverse       91.57 K       10.92 μs    ±57.64%        9.97 μs       19.54 μs
random access         50.40 K       19.84 μs    ±19.88%       19.52 μs       25.23 μs
append                 7.80 K      128.17 μs    ±17.34%      125.64 μs      157.04 μs

Comparison: 
prepend             1321.36 K
iterate              109.81 K - 12.03x slower +8.35 μs
iterate reverse       91.57 K - 14.43x slower +10.16 μs
random access         50.40 K - 26.22x slower +19.08 μs
append                 7.80 K - 169.36x slower +127.41 μs

##### With input small #####
Name                      ips        average  deviation         median         99th %
prepend             1277.00 K        0.78 μs  ±4718.68%        0.65 μs        1.09 μs
iterate              979.84 K        1.02 μs  ±2432.19%        0.92 μs        1.36 μs
iterate reverse      867.27 K        1.15 μs  ±2445.71%        1.04 μs        1.55 μs
append                56.23 K       17.78 μs    ±11.47%       17.05 μs       26.01 μs
random access         50.28 K       19.89 μs    ±43.72%       19.54 μs       25.26 μs

Comparison: 
prepend             1277.00 K
iterate              979.84 K - 1.30x slower +0.24 μs
iterate reverse      867.27 K - 1.47x slower +0.37 μs
append                56.23 K - 22.71x slower +17.00 μs
random access         50.28 K - 25.40x slower +19.11 μs
```

Prepend and iterate are -- by far -- the fastest functions. This comes down to the trade-offs of singly-linked lists. Iterating is quite simple, you get the head value and follow the tail pointer to the next head, so it's quite fast. To prepend we only need to create a new head, find the current head and point the new head to the current head, which is now a tail. This can be done in constant time O(1) since the head location in memory is always known.

However, random access is also slow since each access requires iterating over the list up to the desired index. There is no way to directly access one position since the list is not represented as a contiguous memory space, therefore we don't know where the nth value is store in memory. Each random access operation happens in linear time -- O(n). Similarly, to append an element to the end of the list we need to find the last element. We must iterate over the list following the tail pointers until we reach its end. Thus, this is also done in linear time -- O(n).

In fact, the [Erlang documentation](https://www.erlang.org/doc/system/listhandling) explicitly advises against appending elements to the end of the list recursively. This behavior is quite different from what happens in other common languages such as JavaScript and Python, and it's (very likely) by design.

Elixir (and Erlang) are functional languages and, as such, are very conducive to the use of recursion and higher-order functions. When calling a recursive function with a list as argument, the function may use the head value and pass the tail as an argument to the next call. This access is sequential, and thus _each one_ happens in O(1) time. Of course, accessing the entire list has an O(n) complexity (n operations of O(1) complexity), but in this case we must iterate over the entire list anyway. Arrays also provide O(n) complexity to iterate over all elements, but they fail in a very important aspect when it comes to functional-style programming.

All data structures in Elixir are immutable by default. Singly-linked lists are very friendly towards immutability. To prepend an element you don't need to move anything in memory. In fact, you only need to create the new head and point it towards the tail (the entire list prior to the prepend operation). Since all values are immutable, you don't need to worry about any of the other values changing. Therefore, prepends can _always_ be executed in O(1) time (while there is memory available).

Immutable arrays would have quite poor performance since _every_ append or prepend operation would require copying the _entire_ array to a new memory location, which happens in O(n) time. If you construct an entire array one element at a time the time complexity becomes O(n^2), since N O(N) operations are done. It doesn't take a huge number of prepends before immutable arrays become impractically slow.

## Go

We'll implement a simple benchmark function:

```go
package list_fun

import (
	"fmt"
	"math/rand/v2"
	"testing"
)

func createList(length int) []int {
	list := make([]int, 0)
	for i := 0; i < length; i++ {
		list = append(list, i)
	}
	return list
}

func BenchmarkSlice(b *testing.B) {
	lengths := []int{10_000, 100_000, 1_000_000}
	for _, length := range lengths {
		list := createList(length)
		idx := rand.Perm(length)[:100]
		b.Run(fmt.Sprintf("random access %d", length), func(b *testing.B) {
			var _ int
			for _, i := range idx {
				_ = list[i]
			}
		})
		list = createList(length)
		b.Run(fmt.Sprintf("iterate %d", length), func(b *testing.B) {
			var _ int
			for i := 0; i < len(list); i++ {
				_ = list[i]
			}
		})
		list = createList(length)
		b.Run(fmt.Sprintf("iterate reverse %d", length), func(b *testing.B) {
			var _ int
			for i := len(list) - 1; i >= 0; i-- {
				_ = list[i]
			}
		})
		list = createList(length)
		b.Run(fmt.Sprintf("append %d", length), func(b *testing.B) {
			for i := 0; i < 100; i++ {
				list = append(list, i)
			}
		})
		list = createList(length)
		b.Run(fmt.Sprintf("prepend %d", length), func(b *testing.B) {
			for i := 0; i < 100; i++ {
				list = append([]int{i}, list...)
			}
		})
	}
}
```

Results:

```
                                 │ benchmark.log  │
                                 │     sec/op     │
Slice/random_access_10000-16       0.01805n ± 39%
Slice/iterate_10000-16              0.2885n ±  2%
Slice/iterate_reverse_10000-16      0.2545n ± 22%
Slice/append_10000-16              0.02655n ± 25%
Slice/prepend_10000-16               84.29n ± 26%
Slice/random_access_100000-16      0.01700n ± 71%
Slice/iterate_100000-16              3.048n ± 25%
Slice/iterate_reverse_100000-16      2.432n ± 29%
Slice/append_100000-16             0.02505n ± 24%
Slice/prepend_100000-16              740.1n ± 22%
Slice/random_access_1000000-16     0.02105n ± 24%
Slice/iterate_1000000-16             26.45n ± 23%
Slice/iterate_reverse_1000000-16     22.20n ±  6%
Slice/append_1000000-16            0.02905n ± 21%
Slice/prepend_1000000-16             9.463µ ± 11%
```

