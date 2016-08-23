---
layout: post
title: ES6起步の学习笔记
date: 2016-08-23 11:35:00 +0800
tags: 
    - ES6
---

This is a beginner's note on ES6. I picked up these pieces when reading staffs on the Web.

### Generators

```
function* quips(name) {
    yield "hello " + name + "!";
    yield "I hope you are enjoying the blog posts";
    if (name.startsWith("X")) {
        yield "it's cool how your name starts with X, " + name;
    }
    yield "see you later!";
}
```

What's the differences between *functions* and *generators*?

- Regular functions start with `function`, while generators start with `function*`.
- Inside a generator, `yield` is a keyword, with syntax rather like `return`. The `yield` expression suspends execution of the generator so it can be resumed again later.
- Generators are iterators.

What can generators do?

- Making any object iterable.
- Simplifying array-building functions.
- Results of unusual size.
- Refactoring complex loops.
- Tools for working with iterables.
- New way for writing asynchronous code.

### Rest Parameters

- *The rest parameter will never be undefined.* If there are no extra arguments, the rest parameter will simply be an **empty array**.

### Default Parameters

- Unlike Python, default value expressions are **evaluated at function call time** from left to right.
- Passing `undefined` is considered to be equivalent to not passing anything at all.
- A parameter without a default implicitly defaults to `undefined`.

