---
title: Different lists
tags:
  - Go
  - Elixir
description: Exploring the differences between lists in Go and Elixir
pubDatetime: 2024-06-24
---

We all know lists. Most if not all programming languages provide an implementation of a list-like data structure. Lists may be implemented in some different ways, for instance as singly-linked lists or arrays. Different concrete data structures may be used under the name list, as long as the implementation represents a finite number of ordered values and provide some common list operations.

As we'll see, different implementations yield highly different performance in some operations. The decision on which concrete data structure to use as a list is also coupled with the language design itself. I'll compare lists in two languages: Elixir and Go.

## Lists in Go (slices)

Let's implement a simple benchmark function:

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

The benchmark did not run in an isolated environment (e.g., a server with the least possible amount of running processes), so numbers should be taken with a grain of salt. These are the results:

```text
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

### A refresher on time complexity

The time complexity of an algorithm or data structure operation refers to how the time it takes to execute such task scales as the input size grows. Typically, the worse-case time complexity is considered.

This relationship is commonly expressed using [big O notation](https://en.wikipedia.org/wiki/Big_O_notation). All constant factors are dropped. For instance, if the time a task takes doesn't depend on input size at all, it has a O(1) or constant time complexity. If the time scales linearly with the input size, it has linear time complexity or O(N), where N is the input size.

Even though we drop all constant factors, they should not be forgotten. An O(1) algorithm can be slower than an O(N) one due to these constant factors. However, as input size grows, the O(N) algorithm will eventually become slower.

Time complexity is important to understand how well an algorithm scales. Some time complexities can result in prohibitively slow performance (such as O(N!), that's N factorial). Here, we'll use big O notation to grasp the strengths and weakness of each list implementation.

### Back to Go slices

Iterating over the list scales roughly linearly with input size. Random access doesn't scale with input size. This is because Go lists, called slices, are implemented as pointers to arrays. Since arrays are stored in contiguous memory block, we can infer the exact memory location of all elements. Moreover, arrays may store pointers to values, allowing the program to follow these pointers and read the values. As a result, random access doesn't depend on the size of the array, making it O(1) and quite fast.

However, prepending an element to the list is different. Since arrays have fixed sizes, it's not possible to prepend or append values without copying the entire array. This means that each prepend operation runs in O(N) time, where N is the size of the array.

But why is appending at least one order of magnitude faster than prepending? Then answer lies in Go's slice implementation using [dynamic arrays](https://en.wikipedia.org/wiki/Dynamic_array). As the [documentation](https://go.dev/blog/slices-intro) explains, the slice consists of a pointer to an array, the length of the array and the capacity. The drawing below illustrates how Go slices work under the hood:

![Illustration of Go slices](@assets/images/list_comparison/go_slices.svg)

When there's no capacity left, the `append` function creates a new array with _spare capacity_, that is, with some empty values at the right end. This allows it to simply set the appended value in memory and increase the slice length. Therefore, most append operations happen in O(1) time, occasionally requiring a new array creation in O(N) time.

This choice of list implementation is common across languages like Python, C, Rust, C++, Java, and others. Dynamic arrays overcome the limitation of fixed size arrays, but usually still use an array to store the values. This design is often influenced by historical factors and the need for efficient random access operations.

Go's choice of implementing lists as dynamic arrays reflects its imperative programming nature. Constant-time random access allows programs to read from or set a value at specific positions efficiently, making Go conducive to writing code that relies heavily on these operations.

But it doesn't have to be like this. Other programming languages take a different approach to lists, which we'll explore next.

## Lists in Elixir

Elixir is a functional language that runs on the BEAM virtual machine, which comes from the Erlang world. The _List_ module provides a singly-linked list implementation, which is explained in the [documentation](https://hexdocs.pm/elixir/1.12/List.html). The drawing below represents Elixir Lists:

![Illustration of Elixir Lists](@assets/images/list_comparison/elixir_lists.svg)

Each entry in the list has a value (the yellow square) and a pointer to the next entry. The list can be represented as head and tail pairs. In the drawing, the outermost rectangle represents the first pair of head and tail. The head consists of the first value, while the tail contains the rest of the list. After following the pointer to the next value, we can once again represent the remaining of the list as a head and tail pair (the gray rectangle). This can be done recursively until the end of the list.

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

Results:

```text
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

Prepend and iterating are the fastest operations. Iterating is quite simple, you start with the head value and follow the tail pointer to the next head recursively.

Random access, however, is slow. Since the list is not stored in contiguous memory block, accessing an element at a specific index requires iterating over the list up to that index. This results in linear time complexity (O(N)). Similarly, appending elements to the end of a list requires finding the last element by iterating over the list. This operation also has a time complexity of O(N).

In fact, the [Erlang documentation](https://www.erlang.org/doc/system/listhandling) explicitly advises against appending elements to the end of a list recursively. Appending creates an entirely new copy of the list. It would be possible to append without copying, but this would break immutability, which we'll explore below. This behavior is completely different from what we saw earlier in Go, and it is so by design.

Elixir and Erlang are functional languages and, as such, are very conducive to the use of recursion and higher-order functions, which makes the use of linked lists more suitable than arrays. When calling a recursive function with a list as argument, the function may use the head value and pass the tail as an argument to the next call. Arrays also provide efficient iteration over all elements, but they fail in a very important aspect when it comes to functional-style programming.

All data structures in Elixir are immutable by default. Singly-linked lists are friendlier towards immutability than arrays. Prepending an element does not require moving any values in memory; it only requires creating the new head and point it to the tail (the entire list prior to the prepend operation). Since all values are immutable, you don't need to worry about any of the other values changing. Therefore, prepends can _always_ be executed in O(1) time.

Immutable arrays would have quite poor performance since _every_ append or prepend operation would require copying the _entire_ array to a new memory location. If you construct an entire array one element at a time the time complexity becomes O(N²), since N O(N) operations are done. It doesn't take a huge number of appends before immutable arrays become impractically slow.

Slow random access is also not a major concern since Elixir code is usually much more declarative than a similar Go code, for instance. Instead of writing loops and mutating list elements directly, you use higher-order functions such as `map`, `filter` and `reduce` to achieve the same result. Also, due to immutability there is no point in using random access to mutate values. Thus, by design Elixir code requires random access much less often.

## Conclusion

I guess the conclusion is that different things are different. Seriously though, the motivation of this post was the 2023 edition of [Advent of Code](https://adventofcode.com/). I solved some puzzles with Elixir and others with Go (or Python). The list is simply a very fundamental abstract data structure that we take for granted in almost all programming languages. It still has major implementation differences that reflect the design of each language. The influence of programming language design on code goes beyond hard limitations. You cannot mutate a value in Elixir, but you could still make modified copies and somehow implement an imperative-_ish_ solution. Should you do it, though? Of course not, the code would be cumbersome and unhinged.

Perhaps unsurprisingly, solving the puzzles in Elixir requires a thinking process that is distinct of that of using Go. That's why I used the word _conducive_ a few times in this post: even without hard limitations, the programming language design influences the code you'll write, and we should be aware of the major design choice differences.
