---
image: /assets/img/posts/the-month-that-isnt-over-yet.jpg
image_width: 1600
image_height: 690
image_alt: "A Loupe dashboard for a sample shop sales file that ends on 9 December. The headline numbers compare November with October, and the takings sparkline stops at November."
thumb_position: left top
image_caption: "Loupe on a file that stops on 9 December: the headline numbers compare November with October rather than a part-month."
date: 2026-09-10 19:25:00 +0100
title: The Month That Isn't Over Yet
description: Small, honest mistakes make charts lie. A few of the common ones, and what I've tried to do about them in Loupe.
tags: [loupe, data]
---
You've probably seen this chart. Sales by month, looking healthy, rising steadily, until the very last bar,
which has fallen off a cliff.

Someone asks what went wrong. Someone else starts looking for a cause. It can take a surprisingly long time
for anyone to notice the obvious: it's the 9th of the month. The last bar is nine days of sales sitting next to a
row of full months.
<!--more-->

Nothing went wrong with the business. The chart was just being honest about the wrong thing.

I've been building [Loupe](https://droo-bin.github.io/loupe/), a tool that turns a spreadsheet or CSV into a
dashboard without being told what's in it, and a lot of the work has turned out to be about this kind of
problem. Not bugs, exactly. Small, reasonable-looking decisions that quietly make a chart say something that
isn't true.

## Leave out what isn't finished

The fix for the falling month is simple: if the last period in the data isn't complete, don't draw it, and say
underneath that you've left it out. It's a small thing, but it's one of the decisions in Loupe I'm happiest
with, because it heads off a lot of needless worry.

<figure>
  <img src="/assets/img/posts/the-month-that-isnt-over-yet-weekly.jpg" width="1558" height="513" loading="lazy" alt="A Loupe chart of takings by week through 2024, rising steadily, with a note underneath: the latest week is still in progress, so it's left out.">
  <figcaption>Loupe leaves the unfinished week off, and says so under the title.</figcaption>
</figure>

## Don't trust a lopsided average

If most of your customers spend around £20 and one spends £40,000, the average spend is going to be a number
that isn't true for anyone. A lot of real data looks like this: a long tail of small values and a few enormous
ones.

When a column is lopsided like that, Loupe says so, and shows the typical value (the median) next to the
average. Neither is wrong, but only showing the average is how you end up planning for a customer who doesn't
exist.

## Dates mean different things to different people

Is `03/04/2024` the 3rd of April or the 4th of March? It depends where you are, and the file doesn't say.
Guess wrong and every monthly total quietly mixes up two different months.

You usually can't tell from one value, but you can from all of them: somewhere in the column there'll be a
`25/12/2023`, and since there's no 25th month, the column must be day-first. Loupe checks every value before
deciding, and only falls back on your browser's locale if every single one could go either way.

A cousin of this one: running paces like `8:34` look exactly like times of day. Treat them as times and an
average pace becomes "about half past eight in the morning". Columns called things like "Pace", "Moving time"
or "Split" are lengths of time, not times on a clock.

## Tell people what you changed

To get a messy file into shape, Loupe changes things. It turns `£1,234.50` and `(500.00)` into numbers, skips
title lines above the real headings, reads files saved in older Windows text encodings, and works out which
columns are dates.

All of that is helpful right up until it's wrong, and the worst version of wrong is wrong *and silent*. So
Loupe lists what it tidied. If it skipped three lines at the top of your file, it says so, and you can check
they really were titles and not data.

## Let the database do the counting

Loupe can also answer questions in plain English, using a small language model that runs in the browser.
Language models are good with words and unreliable with arithmetic, so it never does any. The model turns your
question into a database query, the database does the counting, and only then does the model describe the real
result. You can always see the query, and change it if it's not what you meant.

I think that division of labour is the right one for anything involving numbers: the language model talks,
the database counts.

## Try it on something messy

[Loupe](https://droo-bin.github.io/loupe/) is free and runs entirely in your browser, so your file never
leaves your machine. There are sample files built in if you'd like to see what it does before trying your own,
and the [code is on GitHub](https://github.com/droo-bin/loupe).

And if your file breaks it, I'd genuinely like to know. The messiest files make the best test cases.
