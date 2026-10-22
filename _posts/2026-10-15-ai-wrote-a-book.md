---
image: /assets/img/posts/ai-wrote-a-book.jpg
image_width: 1540
image_height: 425
image_alt: "The start of the book workflow in n8n: Start Book, Story Seed, Global Config, World Builder, Character Builder and Outline Builder in a row, leading into Chapter State."
thumb: /assets/img/posts/ai-wrote-a-book-cover.jpg
thumb_position: center 55%
image_caption: "The first half of the workflow in n8n, which runs once. Everything after Chapter State runs once per chapter."
date: 2026-10-15 20:30:00 +0100
title: (A)I Wrote a Book
description: How I wired up n8n and a local model to draft a novel a chapter at a time, and what it took to turn 165,000 words of draft into a 68,000 word book.
tags: [ai, n8n, writing]
---
I've got a novel out. It's called [*Sub-Basement G*](https://www.amazon.co.uk/dp/B0HMJNM958), it's about a man
who catalogues junk in a corporate basement and slowly works out that the junk is coming from other universes,
and the honest answer to "did you write it?" is: sort of.

The first draft was written by a language model running on my own machine, one chapter at a time, inside a
workflow I built in [n8n](https://n8n.io/). The finished book came out of a long second pass with Claude. This
post is about how that worked.
<!--more-->

## It started as five boxes

The first version was barely a workflow at all: a button, a config node with a prompt in it, a call to a model,
and a shell command that saved the result and committed it to git. Press the button, get a chapter.

That gets you a chapter. It doesn't get you a book. The second chapter has no idea what happened in the first,
the characters drift, and nothing stops the model resolving the central mystery on page eight. Almost everything
I added after that was about giving the model a plan and a memory.

The next version ran on [Ollama](https://ollama.com/), with Llama 3.1 8B doing the planning and reviewing and
Gemma 2 27B doing the writing. It had a different problem: chapters came back short, so it grew a word counter
and a "continue writer" that was handed the last 300 words and told to "pick up the scene exactly where it
leaves off. Do NOT repeat or summarize."

The version that actually wrote the draft fixed that differently, by planning each chapter as a list of beats
and writing them one at a time. It runs on [LM Studio](https://lmstudio.ai/) with a single model, Google's Gemma
4 26B, doing every job.

## The setup

The workflow has twenty nodes, and the first six run once, at the start.

**The seed** is a paragraph or two: Arthur, a Level 2 Intake Cataloger in Monolith Global's Sub-Basement G,
signs for a lead-lined crate labelled "Office Supplies" that doesn't cast a shadow. Inside is a shaving mirror,
and the reflection has a beard. The seed also sets the tone: first person, snarky, "heavy on realistic science
and technology", in the style of Andy Weir.

**The config** says where things live and how big the book should be: 32 chapters, 12 characters, 8 beats a
chapter.

Then three agents build on the seed, each handing its output to the next:

- a **world builder** describes the setting, the technology and its limits, and is told to stay away from
  characters and plot
- a **character builder** takes the world and the seed and makes at least twelve characters, a third to a half
  of them main characters
- an **outline builder** takes all of that and plans the whole book, first as acts and then chapter by chapter,
  with at least three key events in each and an inciting incident in the first

Each one only has one job, and each gets the previous answers to build on, rather than one enormous prompt
asking for a world, a cast and a plot all at once.

## The chapter loop

Everything from **Chapter State** onwards runs once per chapter.

<figure>
  <a href="/assets/img/posts/ai-wrote-a-book-full.jpg"><img src="/assets/img/posts/ai-wrote-a-book-loop.jpg" width="1560" height="590" loading="lazy" alt="The writing part of the loop in n8n: Chapter State, Beat Planner, Beat State Init, Beat Writer, Append Beat and Beats Remaining?, which loops back to the Beat Writer, then on to Logic Critic."></a>
  <figcaption>Writing a chapter: plan the beats, then write them one at a time until there are none left.</figcaption>
</figure>

1. **Chapter State** keeps track of which chapter we're on and the story so far.
2. A **beat planner** breaks the chapter into exactly eight beats, as a JSON list. Its prompt also asks for
   sensible pacing: a character who has just been through something dramatic should process it, and not
   immediately go and do something mundane.
3. The **beat writer** writes one beat at a time, given the outline, the full plan for the chapter and all the
   prose so far, and loops until every beat is written.
4. A **logic critic** reads the finished chapter for plot holes, and a **style critic** reads it "for snark and
   scientific accuracy".
5. A **judge** reads the outline, both reviews and the chapter, and answers APPROVED or REJECTED. It's told to
   let a chapter through if it's coherent and the errors are minor. A rejected chapter goes back to be planned and written again.
6. An approved chapter is summarised in fifteen sentences, which are added to the story so far, and the chapter
   is written to a file and committed to git.

Then the chapter number goes up and it goes round again.

<figure>
  <a href="/assets/img/posts/ai-wrote-a-book-full.jpg"><img src="/assets/img/posts/ai-wrote-a-book-review.jpg" width="1560" height="590" loading="lazy" alt="The review part of the loop in n8n: Logic Critic, Style Critic, Judge and Approved?, which loops back when false, then Summary, Encoder, Git Save and Increment."></a>
  <figcaption>Reviewing and saving: two critics, a judge, a summary for next time, and a git commit.</figcaption>
</figure>

The summaries do most of the work of holding it together. A model can't keep a whole novel in its head, but it
can keep a page of "what's happened so far", which is enough to keep the plot pointing roughly the same way. The
summary prompt asks it not to skip character development, or which characters have (and haven't) been
introduced yet.

Committing every chapter to git means a run that wanders off isn't a disaster: you can see which chapter it went
wrong in, go back to the one before and set it going again.

Running it all locally meant every chapter cost nothing but time and electricity, which matters when the loop is
allowed to reject and rewrite as often as it likes.

## What came out

In the end, the pipeline produced a 32 chapter first draft of about 165,000 words.

Which is a lot of words, and that was the problem. Every time something strange happened, Arthur would stop and
reason about it out loud: list three hypotheses, estimate the odds of a stroke, explain how LIDAR works. Once is
charming. Thirty-two chapters of it is a textbook with a plot attached.

Looking back at the prompts, it's not hard to see where that came from. The seed asked for technical narration
heavy on realistic science, the style critic checked every chapter for scientific accuracy, and the beat planner
told characters to stop and process what had happened. The model did exactly what it was asked, eight beats a
chapter, thirty-two times.

There were also tics that no single chapter shows but the whole book does. The writer had a habit of opening
scenes with "If you've ever spent time inside a…", and once you notice it you can't stop seeing it.

The critics in the loop didn't catch any of this, because they only ever saw one chapter at a time. Each chapter
was fine. The book wasn't.

## The second pass

So the second half of the work was with Claude, looking at the whole draft at once, which is exactly what the
pipeline couldn't do.

That started with a set of editorial notes going chapter by chapter, and they're blunt in a useful way. On the
first two chapters: cut the hypotheses, and "let the 60-millisecond lag in the mirror's reflection shatter his
reality instantly". On a later one, where Arthur watches another version of his world burn and responds by
working out the rate of pressure change: this should be horror, not a spreadsheet.

Then the revision went through chapter by chapter against those notes, again committed to git as it went
("Revise Chapter 8: remove spreadsheet simulation…", "Final cleanup: eradicate remaining 'If you've ever'
crutches across all chapters").

The difference is easiest to see in the opening. The draft:

> The tremor in my left hand was currently operating at a frequency that would make a decent metronome
> proud—about six hertz, if I had to guess. It wasn't a subtle twitch; it was a full-on, rhythmic rebellion of
> the alpha motor neurons.

And the book:

> The tremor in my left hand was running at about six hertz, steady enough to keep time to. It wasn't a subtle
> twitch. It was a full rhythmic rebellion.

Same joke, same voice, half the words. Chapter 1 went from 4,345 words to 1,963, and the whole book from about
165,000 to 68,000, in 35 chapters rather than 32. Nothing important was lost. Most of what went was the narrator
explaining things the reader had already understood.

<figure class="narrow">
  <img src="/assets/img/posts/ai-wrote-a-book-cover.jpg" width="600" height="784" loading="lazy" alt="The cover of Sub-Basement G: a large letter G, cream above a thin red line and orange below it, with the line marked +60 ms and the words: The reflection is sixty milliseconds late.">
  <figcaption>The cover, which borrows the mirror from chapter 1.</figcaption>
</figure>

## So who wrote it?

I'm not going to pretend I typed it. The idea, the seed, the pipeline and the decision about what kind of book it
should be were mine. Most of the sentences weren't.

What I'd take away from it, if you fancy trying something similar:

- **Give the model a memory it can actually hold.** A summary of what's happened beats pasting in everything.
- **Be careful what you ask for.** Every instruction gets followed, every chapter. Something that reads as a nice
  touch once can be a tic by chapter thirty.
- **One job per agent.** World, characters, outline and beats are each asked for separately, with the previous
  answers in front of the model.
- **Save every step.** Git turned a run going wrong from a disaster into a rollback.
- **Chapter-level critics can't see book-level problems.** Repetition, pacing and tics only show up across the
  whole thing, so something (or someone) has to read it all at once.

[*Sub-Basement G*](https://www.amazon.co.uk/dp/B0HMJNM958) is on Amazon if you'd like
to see how it turned out.
