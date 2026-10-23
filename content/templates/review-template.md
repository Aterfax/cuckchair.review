---
# Review template for cuckchair.review
#
# How to use:
#   1. Copy this file into content/reviews/< yyyy-mm-dd-chair-name >.md
#   2. Replace every placeholder marked <...> — brackets must be removed.
#   3. Category scores MUST use the published metric names (copied below).
#   4. Do NOT set overallScore yourself: it is computed at build time as
#      Σ(score × weight) / Σ(applied weights), rounded to one decimal.
#   5. Use lowercase tags (letters, digits, hyphens) and a valid date —
#      both are validated at build time.
#   6. The optional `location` block is validated at build time too:
#      `setting` is required whenever `location` is present, and `map`
#      must be a Google Maps URL. Delete the whole block when the seating
#      location is unknown or not public.
#
# Review framing: the unit of review is the whole setup — the chair, the
# room it sits in, and its position within that room. Write every section
# from the scene's point of view, not the seat's.
#
# Metric weights (must total 100%):
#   Position and sightlines        22%
#   Room presence                  12%
#   Comfort for the session        12%
#   Workspace and devices          12%
#   Audio in the room               8%
#   Build and stability             8%
#   Power and practicality          8%
#   Room dynamics and layout        8%
#   Customisation and adaptability  5%
#   Value for the setup             5%

title: "<Full product name>"
# Unquoted dates are parsed as Date objects; ISO strings are fine too.
date: <YYYY-MM-DD>
# Optional: only set when a review is materially updated after publication.
# Comment these lines out until then — a placeholder value would be
# rejected at build time as an invalid date.
# updated: <YYYY-MM-DD>
author: "<Reviewer name>"
categories:
  - name: Position and sightlines
    score: <0-10>
  - name: Workspace and devices
    score: <0-10>
  - name: Comfort for the session
    score: <0-10>
  - name: Room presence
    score: <0-10>
  - name: Audio in the room
    score: <0-10>
  - name: Build and stability
    score: <0-10>
  - name: Power and practicality
    score: <0-10>
  - name: Room dynamics and layout
    score: <0-10>
  - name: Customisation and adaptability
    score: <0-10>
  - name: Value for the setup
    score: <0-10>
# Names in `excludes` are excluded from the weighted total and the remaining
# weights are renormalised. The body must explain the material exclusion.
# Use the EXACT metric name.
excludes: []
# Lowercase letters, digits and hyphens, exact matches; used for filtering,
# tag pages and compare. Multiple tags per review are fine.
tags:
  - <tag-one>
  - <tag-two>
# One image is required; add side/detail views as needed.
# Images live in public/assets/<product-slug>/. Reference as /assets/... .
images:
  - src: /assets/<product-slug>/front.svg
    alt: "<Front view of the product>"
  # - src: /assets/<product-slug>/side.svg
  #   alt: "<Side view of the product>"
# REQUIRED. One sentence on commercial relationships. See the disclosures
# page: ratings must reflect the published methodology, sponsorship must be
# disclosed plainly, and commercial product links carry rel="nofollow
# sponsored".
disclaimer: "e.g. Purchased independently at retail price. / Review unit supplied at a manufacturer discount; rating reflects the published methodology."
# Set to true ONLY when the unit was supplied, gifted, discounted or
# sponsored. Product links then get rel="nofollow sponsored". Leave the
# whole field out for independent retail purchases.
# commercial: true
# Optional location metadata — shown on the review page as a "Where" line
# and fed to the CuckGuessr game: `setting` is the game's location answer,
# `venue` its optional brand answer, `place` a short geography line shown
# on the reveal, `map` a Google Maps link opened from there, and `scene`
# a one-line description used as the game image's alt text.
# location:
#   setting: "<kind of place — e.g. Boutique hotel suite, high floor>"
#   venue: "<establishment name>"
#   place: "<city, country>"
#   map: https://www.google.com/maps/search/?api=1&query=<address+or+place>
#   scene: "<one-line scene description>"
# Optional structured facts shown as a table (keep factual and current).
specs:
  - label: "Price"
    value: "<price at time of review>"
  - label: "Dimensions"
    value: "<W × D × H>"
  - label: "Maximum load"
    value: "<kg>"
  - label: "Adjustability"
    value: "<short summary>"
  - label: "Warranty"
    value: "<period>"
links:
  - name: "Product page"
    url: https://<manufacturer-or-retail-url>
---

<!-- Body: delete the bracket placeholders as you write.
     Do NOT start the body with an H1 (`#`): the page already renders the
     review title as its single h1. Begin sections at ##. -->

**<Product name>** is a two-sentence positioning statement that frames what kind of cuck chair this is, the kind of setup it belongs in, what audience it suits, and the promise the review will test.

## Position and sightlines

<Observation-led paragraph on where the seat sits in the room: distance and angle to the action, obstructions, and how long the view stays usable. End the section with the score in bold, e.g. Score: **<7>/10**.>

## Workspace and devices

<Room-equipped space for phones, laptops, peripherals, and accessories within reach of the seat.> Score: **<>/10**.

## Comfort for the session

<Seating comfort, posture, and endurance observations across the whole dwell — the room around the seat as much as the seat itself.> Score: **<>/10**.

## Room presence

<Design, finish, and how the chair and room read together as one ensemble.> Score: **<>/10**.

## Audio in the room

<Listening position behaviour, reflections, and equipment placement relative to the seat.> Score: **<>/10**.

## Build and stability

<Materials, construction, wobble/durability findings for the chair as the fixed anchor of the arrangement.> Score: **<>/10**.

## Power and practicality

<Room realities: power access, cable routing, walkways, and keeps-the-position practicalities.> Score: **<>/10**.

## Room dynamics and layout

<Footprint versus what it delivers; how the arrangement works as a room — door lines, light, sightline flow.> Score: **<>/10**.

## Customisation and adaptability

<Adjustability, parts, modification options, and easy repositioning within the room.> Score: **<>/10**.

## Value for the setup

<How the weighted result reads against price and rivals for the setup it completes.> Score: **<>/10**.

## Strengths

- <Strength one — concrete, not marketing.>
- <Strength two.>
- <Strength three.>

## Weaknesses

- <Weakness one — observed, not speculated.>
- <Weakness two.>

## Exclusions

<Only if `excludes` is used above: name the metric excluded, why it did not
apply, and note that remaining weights were renormalised. Delete this
section otherwise.>

## Verdict

<One paragraph weighing the weighted score against use case: who should
buy it, who should not, and the single deciding factor.>