---
image: /assets/img/posts/a-modem-in-a-web-page.jpg
image_width: 1600
image_height: 950
image_alt: "Smoke Signal in a browser: a message being written on the left, and three messages received from other stations on the right, one addressed to this station."
image_caption: "Smoke Signal, with a few messages heard from other stations."
date: 2026-07-16 20:15:00 +0100
title: A Modem in a Web Page
description: How Smoke Signal turns a message into audio a radio can carry, and what it took to make that work reliably from a browser.
tags: [radio, smoke signal]
---
**TLDR:** [Smoke Signal](https://droo-bin.github.io/smoke-signal/) is a single web page that sends messages,
photos and files as sound. Plug a phone into a radio (or just hold two phones close together) and it works
like an old-school packet radio modem, with no installs, no servers and no internet connection needed.

This is a walk through how it works, for anyone curious about what's actually in those beeps.
<!--more-->

## The basic idea

Data over sound is old technology. Dial-up modems did it down phone lines, and amateur radio operators have
been sending packets over the air since the 1980s. The standard most of them use is called **Bell 202**,
and it's about as simple as a modem gets: two tones, 1200 Hz and 2200 Hz, switched 1,200 times a second.

A web browser can make those tones (the Web Audio API is perfectly happy to generate a sine wave) and it
can listen for them through the microphone. So the question wasn't whether a web page *could* be a modem.
It was whether it could be a good one.

## From text to tones

Sending a message goes through a few layers.

**The packet.** The message is wrapped in an AX.25 frame, the format packet radio has used for decades. It
holds the sender's callsign, the destination, the data and a 16-bit checksum (CRC) at the end. Using the
standard format means other packet radio software can read Smoke Signal's packets too:
[Direwolf](https://github.com/wb2osz/direwolf), the usual software modem for this, decodes them.

**The bits.** Each byte goes out lowest bit first, and the bits are NRZI encoded. Rather than one tone meaning
1 and the other meaning 0, a 0 means *change tone* and a 1 means *stay put*. That way the receiver doesn't
care which tone is which, only when it changes. The letter A (`01000001`) goes out as:

```
bit:   1  0  0  0  0  0  1  0
tone:  M  S  M  S  M  S  S  M      (M = 1200 Hz, S = 2200 Hz)
```

**Keeping time.** The receiver uses those tone changes to keep its clock in step with the sender's (no two
sound cards agree exactly on how long a second is). A long run of 1s means no changes, so after five 1s in
a row the sender always slips in an extra 0, and the receiver removes it again. This is called bit stuffing.

**Finding the start.** Every packet is surrounded by flag bytes, `01111110`. Because of the bit stuffing,
six 1s in a row can never turn up inside real data, so a flag can only ever mean "a packet starts or ends
here". The sender plays about 300 milliseconds of flags before each packet, which gives the receiver
something to lock onto.

## From tones back to text

Receiving is where most of the work went.

The page listens to the microphone, works out which of the two tones it's hearing at each moment, and runs a
small software phase-locked loop that nudges its timing every time the tone changes. Once it's seen three or
more flags in a row, it treats what follows as a real transmission rather than hiss, unpicks the bit
stuffing and checks the CRC. If the CRC doesn't match, the packet is thrown away: you either get exactly what
was sent or nothing at all.

It actually runs several of these decoders side by side on the same audio, each looking at the signal over a
slightly different window, so if one misses a packet another often catches it. On Direwolf's own noisy test
recording, Smoke Signal now gets the same number of packets through as Direwolf does (72 out of 100).

## What made it harder

**Echo.** Sending from one phone's speaker to another phone's microphone across a room sounds perfectly clear
to a person, but a few milliseconds of echo smears each 1200 baud tone into the next one. So there's a slower
300 baud mode where each tone lasts four times as long. The receiver listens for both speeds at once, so only
the sender has to choose.

**Asking for missing pieces is expensive.** Radio is one-way at a time. If a listener misses one packet of a
file and has to ask for it again, that's a whole round trip for one small piece. So longer messages and files
are sent as a stream of mixed packets using a fountain code: each packet is a combination of several blocks,
and a listener can rebuild the whole file from roughly two more packets than there are blocks, in any order,
without asking for anything.

**It's slow.** 1200 baud works out at about 150 bytes a second before any overhead. A phone photo, shrunk and
re-encoded, comes out at a few kilobytes and takes somewhere between 30 seconds and a minute to send. Text
messages are near instant.

## Trying it

Open [Smoke Signal](https://droo-bin.github.io/smoke-signal/) on two phones, start listening on one and send
from the other with them close together. With radios, connect the phone's headphone output to the radio's mic
input and set the radio to voice-activated transmit.

If you do try it on a radio in the UK: sending data on the amateur bands needs a licence, your callsign goes
in every packet, and messages can't be encrypted. Licence-free radios have their own rules, so check before
you transmit.

The [source is on GitHub](https://github.com/droo-bin/smoke-signal), including the tests that check its
packets against Direwolf. If you get it working somewhere interesting, I'd love to hear about it.
