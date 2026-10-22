---
image: /assets/img/posts/what-predicts-crime.jpg
image_width: 1205
image_height: 819
image_alt: "A density map of a month of West Midlands street crime in Loupe, brightest around Birmingham city centre, with the five busiest spots numbered."
image_caption: "A month of West Midlands street crime as a density map in Loupe."
date: 2026-10-01 19:40:00 +0100
title: What predicts crime? Not the thing you'd guess
description: I joined a month of West Midlands crime to England's deprivation statistics, area by area. Poverty matters, but pensioner poverty matters far more than child poverty, and shoplifting doesn't care how deprived an area is.
tags: [data, maps, loupe]
---
Every month, police forces in England and Wales publish every street-level crime they recorded, with a
point on a map and the neighbourhood it happened in. I took a month of it for the West Midlands (28,744
crimes) and wanted to know *why* some areas get so much more than others. And I wanted something more
interesting than "poorer areas have more crime". Everybody knows that one. I was after the things you
wouldn't guess.
<!--more-->

## Joining the data

Every crime on police.uk comes with an LSOA code. An LSOA is a small area the ONS uses for statistics,
with roughly 1,500 people living in each, and there are about 1,700 of them across the West Midlands
police area. The useful thing about LSOAs is that loads of other data is published for them too,
including the government's [Indices of Deprivation](https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019),
which score every area in England on income, jobs, health, housing, the local environment and more.

So I counted the crimes in each area and joined them to the deprivation scores on that code, which
matched 1,624 areas. The result is one row per area, which is [here](/data/west-midlands-areas-crime-and-deprivation.csv) if you
want to have a go yourself.

## The obvious bit

First, the thing everybody expects. Here's the average number of crimes per area in August, by how
deprived the area is (1 is the most deprived tenth of England, 10 the least):

<iframe class="loupe" src="/loupe/?data=%2Fdata%2Fwest-midlands-areas-crime-and-deprivation.csv&amp;chart=TZBBTsQwDEWvYnkFUjazjcSiEpwCzcKkntTCSaok7VCq3h1lWgo7y_5-_9srzmgvBsvIDu2KdRkZLbqkU4ho8Ks1b8Lao8VXHrPMVCVF6NmJMjxd4AVCKhX6x5B7kAhv0SvF_hk3g8t_QqcKLktgNEjeo0WafVO5pCmjjZOqwSLf_FvfRCvngvb9arBK1RavmzmT5x1VYOQMlJmadTf5qVQDHwsM6f6Xqg58aErzO7ErSuVw8sNp7FIYKTe3MfMsaXrsOVJ3iANTlOgbYwdyG6wo7dBA0t5XBua6E7erwVLJfR7rKnEvtx8" title="Average crimes per area in August, by how deprived the area is" width="100%" height="420" loading="lazy" style="border:0"></iframe>

The most deprived areas average about four times as much crime as the least deprived. No surprises.
But if you split it by type, one line refuses to play along:

<iframe class="loupe" src="/loupe/?embed#lZXNjpswFIVfBd1VKyErgPmz1EU73VWaTavZVF14iEusgkG2SYMi3r2CxElszKizA5_je75ry_YZjkCiEJSgvTp0GsgZNNcNAwKfj0zSmgWV5C1TQc9kQCWjwesY7Fkv-ZFq3olgzyresHAe1mPPIATRaQZEDE0TwjJEoOFiVmT3VwH5eYbTkloBgRfeNUxUszoCKREup_BR_zLIuqFyvOg7VOa2_sIOvGqulBdThHKnyPdD1zf8t-aiNpbE1Il9HAXKYkf35kS2yYV1i3g48uJqSfwlcmzrXg6c26ZVToJip4zVbn7HwD49vW8LfgMjdkyedm-keKNdw5n6OaLS1t35aW7rHoTMsfhbMRyZjyNBWWLrKw5b9mCk2EnwYURmW_KNOjtUpLbFJo3v7eZ-0sSJ8HDsUGlCiu0DFdsWNwdntu5fdsfj9HJbs3IDI0aRY1ltTGHrbsTtSJdvLEdheol2m_tyO_vGYydFKMOOYbUziVvBx5Lh6VcIXa_VfHmfvnGxBwIV1bPhqWvmUUHbxxvdXOUQwp-LXQztK5MQQsuomJsg85ca5BxD6_mfHmuYQjjZJb-uXoLgQxR8CtpO6eszwfYf3xWkhnYJen5nwvi82aW6SJcnSS0dXL-Z5ExtTxx_OI_hg3Yy2n8TVmbG07KB0zT9Aw" title="Average crimes per area by deprivation decile, by type" width="100%" height="420" loading="lazy" style="border:0"></iframe>

Violence falls almost steadily as areas get less deprived. Shoplifting doesn't care at all: there's no
slope to it, and some of the least deprived areas get as much as the most deprived. That's almost
certainly because shoplifting goes where the big shops are, not where the poverty is. Just 1% of areas
account for a quarter of all the shoplifting in the month, and a single busy area can make a whole
decile look bad.

## Looking for the non-obvious

Everything in the deprivation data is tangled up with everything else. Poorer areas tend to have worse
health, worse housing and worse air, so most measures will "predict" crime just by riding along with
poverty. To get past that, I sorted the areas into five bands by income deprivation (the share of
residents on low incomes), and then, *within each band*, compared the half of areas with more of
something against the half with less of it. That way I'm comparing areas in the same income band, and
anything left over goes with more (or less) crime over and above income.

<iframe class="loupe" src="/loupe/?embed#pVLBihQxEP2VosBbBMcdEHOTARGEZQ96Eg-ZdG2nsFPVJOnZbob-d-lONzqoh3VvSd6r917ycsUL2oPBLK7PQQvaKxYuHaHFU-JIwAIukcvwxCVA1ESgj0DOByiBpTXgNfYuUVMZlcwCJRBktyp4jQRnJw0aFC2EVoauM1imfjE6u4QGkz5ltN-uOKLFB5LMKpSg1wulMqHBCe3xbjaV8EmHzNJCnyjnIVHF797t-INqAscJnDSQ1DXgvOeGpORKffv-hhrIdSX8HdqsvErDhVUq63DcWafAXXMb9PBmB78Kxb7TKZKUTX6HPg6pBErwmDRCDtrnNW2mdGFPW87Xh-P83aD2JS_ljJ9ZGrTo3ap20m45FRd_Nfa8PgbhghZfocEfVVqGeKalkUhOWFq0y2p7ZNcue3dpcTY4rva1y_G-Zvjw52cpgdfL3P9_ylxnq1X-zTZTYsovUJ6-3Hz35w2P-_C_b-03yhJ3nuef" title="Crime in areas with more of each thing, compared with areas in the same income band" width="100%" height="420" loading="lazy" style="border:0"></iframe>

A few of these surprised me.

**Pensioner poverty beats child poverty, by a mile.** Areas where more of the over-60s are on low
incomes had 43% more crime than areas in the same income band where fewer are. It held in every one of
the five income bands, and in a separate check borough by borough, in six of the seven. Child poverty, measured the same way, does nothing
consistent: up in some bands, down in others. I genuinely don't know why. My best guess is that
pensioner poverty is picking up something about *where* an area is and how settled it is, rather than
older people having anything to do with the crime, but the data can't tell you which.

**Housing pressure is close behind.** This is a mix of overcrowding, homelessness and how hard it is
to afford to rent or buy locally. Areas with more of it had 37% more crime than areas in the same income
band, and it pointed the same way in all seven boroughs (if only just in Dudley).

**Bad air and road accidents come joint third**, level with poor health. The "outdoors" part of the deprivation data combines air quality
with road accidents that injure pedestrians and cyclists. It's up 29%, again in all seven boroughs. I'd
bet it isn't the fumes doing it: busy roads mean busy places, and busy places mean more of everything,
crime included.

**Being close to things comes with more crime.** The one that goes the other way is distance to
services: the average road distance to a GP, a post office, a primary school and a shop. Areas further
from all that had 14% *less* crime than areas in the same income band, and it pointed that way in every
borough.

**Unemployment shows no clear, consistent link** once you know an area's income. Neither does child
poverty, really.

## The small print

This is a month of crime (August 2026) against deprivation scores from 2019, which were themselves built
from data a few years older than that. The deprivation scores were drawn on 2011 area boundaries and the
crime on 2021 ones, so about 60 areas (mostly ones whose boundaries changed) have been left out. The
percentages compare averages, which a few very busy areas pull up; comparing typical areas instead
roughly halves them, but the big ones stay well above zero. And the income bands are wide, so areas in
the same band aren't on identical incomes. Areas aren't exactly
the same size, so a count of crimes is a rough rate, not a precise one. And a busy city-centre area with
hardly any residents is always going to look terrible on a "crime per area" measure.

Most importantly, none of this shows cause and effect, and it can't answer the *why* I started with. These are *predictors*: things that tend to come with
more crime, found by comparing areas. They're a good place to start asking questions, not answers.

## How I made this

The charts are made with [Loupe](/loupe/). The first one reads the area file straight from this site,
so you can click "Explore this data in Loupe" under it and try your own predictors: put a measure on
the bottom, "All crime" up the side and see what happens. The other two carry their numbers in the
page. Or [open the crime file and the area file together](/loupe/?data=/data/west-midlands-crime-2026-08.csv&data=/data/west-midlands-areas-crime-and-deprivation.csv)
and Loupe links them on the LSOA code by itself, so every one of the 28,744 crimes gets its area's
deprivation scores alongside it (92% of them match; almost all the rest are in areas whose boundaries
changed).

*Data: crime from [data.police.uk](https://data.police.uk/) (West Midlands Police, August 2026);
[English Indices of Deprivation 2019](https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019)
from the Ministry of Housing, Communities and Local Government, via
[mySociety](https://github.com/mysociety/composite_uk_imd). Contains public sector information licensed
under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).*
