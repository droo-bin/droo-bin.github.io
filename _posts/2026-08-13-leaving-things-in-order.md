---
image: /assets/img/posts/leaving-things-in-order.jpg
image_width: 1600
image_height: 588
image_alt: 'The Tallystick home page: "Leave things in order for the people you trust", with three steps: write it down, choose your card holders, seal it.'
thumb_position: left top
image_caption: "Tallystick: write it down, choose who holds the cards, seal it."
date: 2026-08-13 21:05:00 +0100
title: Leaving Things in Order
description: Why I built Tallystick, how it splits a key between the people you trust, and the trade-offs that come with doing it properly.
tags: [tallystick, security]
---
Most of us carry around a surprising amount of information that only exists in our own heads. Which bank
the savings are with. Where the pension paperwork is. Who to call about the mortgage, the car insurance, the
energy bills. What you'd want to happen at a funeral, if you have any feelings about it at all.

If something happened to you tomorrow, the people closest to you would have to work all of that out from
scratch, at the worst possible time. I didn't like that answer for myself, so I built
[Tallystick](https://tallystick.org.uk/).
<!--more-->

## The awkward part isn't writing it down

Writing everything down is the easy bit. The hard part is deciding who gets to read it, and when.

Put it in a drawer and anyone who opens the drawer can read it. Give it to one person and you've handed them a
lot of responsibility, and made them a single point of failure (if they lose it, or something happens to them
too, you're back to square one). Split it up between a few people and nobody has the full picture, which is
the problem you were trying to solve.

What I wanted was something closer to: *none of you can open this alone, but any two of you together can.*

## An old idea

Medieval England had a neat answer to a similar problem. Debts were recorded on **tally sticks**: a stick
with notches cut in it for the amount, split down its length so each side kept half. Neither half proved
much on its own, but put the two together and the notches lined up in a way nobody could fake.

That's where the name comes from, and it's more or less what Tallystick does, except with a key instead of a
stick.

## How the key gets split

Everything you write, along with any documents, photos or voice notes you add, is encrypted with a random
key, using AES-256. The result is a single file, the "envelope", which is safe to copy anywhere: without the
key, it's unreadable.

The key itself is then split using **Shamir's secret sharing**, published by Adi Shamir in 1979. The idea
behind it is lovely and surprisingly simple: two points are enough to pin down a straight line, but one point
on its own tells you nothing about which line you meant.

So to let any 2 of 3 people recover a secret number, you hide it where a random straight line crosses the
y-axis, and give each person a different point on that line. If the secret is 7 and the random slope is 3,
the line is `y = 7 + 3x`, and the three people get:

```
x = 1, y = 10
x = 2, y = 13
x = 3, y = 16
```

Any two of them can work out the line and read off the 7. Any one of them alone has a point that sits on a
line through every possible secret. For "any 3 of 5" you use a curve that needs three points to pin down,
and so on.

Tallystick does exactly this for each of the 32 bytes of the key, using arithmetic that wraps around (a
finite field) so that a single share gives nothing away at all, not even a hint about the size of the number.
Each person gets a card with their share on it, as a QR code and as a typed code.

<div class="figure-pair">
  <figure>
    <img src="/assets/img/posts/tallystick-card.webp" width="520" height="410" loading="lazy" alt="An example Tallystick card for Jo Smith, with a QR code and a typed code for each of Sam Taylor's envelopes, saying any 2 of 3 cards are needed and naming the other two card holders.">
    <figcaption>An example card. On its own it opens nothing.</figcaption>
  </figure>
  <figure>
    <img src="/assets/img/posts/tallystick-envelope.webp" width="520" height="618" loading="lazy" alt="An example sealed envelope opened in a browser, asking for any 2 of the 3 card codes.">
    <figcaption>The envelope is one file that opens in any browser, once enough cards come together.</figcaption>
  </figure>
</div>

## The trade-offs

Doing this properly means accepting a few things that feel uncomfortable at first.

**Nobody can open an envelope without the cards. Including me.** There's no account, no server and no reset
link. That's the whole point, but it does mean that if too many cards are lost, the envelope is gone for good.

**Choosing the numbers is a balancing act.** Ask for too few cards and a couple of people could open it
without the others. Ask for too many and a lost card or two locks everyone out. Something like 2 of 3, or 3
of 5, leaves a spare in case a card goes missing while still meaning nobody can open it alone.

**Typos are inevitable.** A card code is long, and one wrong character gives you a wrong share, which gives
you a wrong key. So every code carries a small checksum, and Tallystick will tell you there's a typo in a code
before it tries to use it, rather than just failing to open.

**Life changes.** People move house, change banks and fall out with relatives. Because the cards are tied to
the key, the way to change anything is to make a new envelope with new cards, which replace the old ones.

**It isn't a will.** It sits alongside one. A will is a legal document; this is everything a will doesn't
cover, including where the will is.

## Making one

[Tallystick](https://tallystick.org.uk/) is free and runs entirely in your browser. Nothing you type is sent
anywhere (you can turn on airplane mode before you start and it works just the same), and there's a
single-file version you can keep offline. The [code is on GitHub](https://github.com/droo-bin/tallystick) for
anyone who wants to check how it works.

It isn't a cheerful job, but it only takes an evening, and it means that if the worst does happen, the people
you care about have something to go on.
