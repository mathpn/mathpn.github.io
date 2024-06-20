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

Elixir is a functional language that runs on the BEAM virtual machine, which comes from the Erlang world. As the [documentation](https://hexdocs.pm/elixir/1.12/List.html) says, lists are singly-linked lists. In fact, the documentation explains very well the tradeoffs of singly-linked lists and I recommend reading it. A singly-linked list can be represented as head and tail pairs, in which the head contain one value and point to the tail. If we follow the tail, we end up with another head pointing to a new tail.

Let's write some simple functions to benchmark some common list operations. We'll use [Benchee](https://github.com/bencheeorg/benchee) to benchmark our functions.

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

Prepend and prepend + reverse are -- by far -- the fastest functions. This comes down to the tradeoffs of singly-linked lists. To prepend we only need to create a new head, find the current head and point the new head to the current head, which is now a tail. This can be done in constant time O(1) since the head location in memory is always known.

However, to append an element to the end of the list we need to find the last element. There is no way to directly access the last element, we must traverse the list following the tail pointers until we reach its end. Thus, this is done in linear time -- O(n).

In fact, the [Erlang documentation](https://www.erlang.org/doc/system/listhandling) explicitly advises against appending elements to the end of the list recursively. This behavior is quite different from what happens in other common languages such as JavaScript and Python, and it's (very likely) by design.

Elixir (and Erlang) are functional languages and, as such, are very conducive to the use of recursion and higher-order functions. When calling a recursive function with a list as argument, the function may use the head value and pass the tail as an argument to the next call. This access is sequential, and thus _each one_ happens in O(1) time. Of course, accessing the entire list has an O(n) complexity, but in this case the entire list must be traversed anyway. Arrays also provide O(n) complexity to traverse all elements, but they fail in a very important aspect when it comes to functional-style programming.

All data structures in Elixir are immutable by default. Singly-linked lists are very friendly towards immutability. To prepend an element you don't need to move anything in memory. In fact, you only need to create the new head and point it towards the tail (the entire list prior to the prepend operation). Since all values are immutable, you don't need to worry about any of the other values changing. Therefore, prepends can _always_ be executed in O(1) time (while there is memory available).

Immutable arrays would have quite poor performance since _every_ append or prepend operation would require copying the _entire_ array to a new memory location, which happens in O(n) time. If you construct an entire array one element at a time the time complexity becomes O(n^2), since N O(N) operations are done. It doesn't take a huge number of prepends before immutable arrays become impractically slow.

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
