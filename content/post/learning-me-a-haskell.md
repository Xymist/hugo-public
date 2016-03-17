+++
title = "Learning Me A Haskell"
date = "2015-08-11T22:53:53Z"
tags = ["Coding", "Haskell"]
+++

**Without much** reason, I decided to try out a functional language. I have two scripting [Python, Ruby] and one imperative [D] at 'moderate' competence. Won't be winning any prizes for code quality, but it's a learning process, and I'm finding that as I try out more languages and frameworks, the underlying similarities are more and more obvious.

There aren't that many straightforward, well supported functional languages out there, so with a recommendation from [Sandy](http://sandymaguire.me) I went for Haskell.

That was yesterday.

Today I passed my own FizzBuzz test: without using StackOverflow (or similar), from the documentation and recommended starting information[^1] alone, write the 3&5 FizzBuzz program in that language. It's not that hard, but it's a little more involved than 'hello world', and helps with the structure and idioms of a new language.

Commented for your convenience:

<pre data-line-numbers class="line-numbers language-haskell">
<code class="language-haskell">
fizz n = [ n | n <- [0..n], n `mod` 3 == 0] -- Find all the numbers between 0 and n divisible by three
buzz n = [ n | n <- [0..n], n `mod` 5 == 0] -- Find all the numbers between 0 and n divisible by five

genFizzBuzz n
	| n == 0 = show n -- If it's zero, show zero. This is to fix a peculiarity I found where apparently zero is divisible by everything and thus gets a FizzBuzz.
	| n `elem` fizz n && n `elem` buzz n = "FizzBuzz"
	| n `elem` fizz n = "Fizz"
	| n `elem` buzz n = "Buzz"
	| otherwise = show n

fizzy n = [genFizzBuzz x | x <- [0..n]] -- This just lets me set the range to have it work in.
</code>
</pre>

Crappy code, I know. I'm sure there are smaller, neater ways of achieving the same thing, but it works and I'm pleased. Eight working hours from 'I should learn this language' to this stage via getting the compiler to work on Windows is a new record.

[^1]: In this case [Learn You A Haskell](http://learnyouahaskell.com/). I've skimmed the whole thing, and am now reading in full. It's not as bizarre as the title implies, unlike [Why's Poignant Guide To Ruby](http://mislav.uniqpath.com/poignant-guide/book/chapter-1.html) which is EXACTLY as weird as it sounds.
