
# Doomed Marker Puzzle

## Overview
The Doomed Marker Puzzle consist of makers on a 16 by 16 grid. Initially there is a single marker in the lower left hard corner. If empty space allows it a marker can be split into two makers which placed above and to the right of the maker original marker. The goal is to get all of the markers as far as possible from the corner where they started. Play a live version [here](https://selliott.org/sites/default/files/puzzles/doomed-marker-puzzle/live/index.html).

## Vibe Coding
Doomed Marker Puzzle was written almost entirely by Claude Code based on iterative feedback from me.

## Credit
I've read about a puzzle like this decades ago, possible in a book by James Fixx, but I can't find it. I asked ChatGPT 4o about it and it said it was the "Doomed Maker Puzzle". However, I can't find that anywhere which suggests it's a hallucination, but I like it, so that's what I named this puzzle. Please email me if you know how I can properly credit it.

Doomed Marker Puzzle does have some similarity to [Conway's Soldiers](https://en.wikipedia.org/wiki/Conway%27s_Soldiers), but to see the similarity it helps to invert Doomed Maker Puzzle both physically, and in time. Imagine the lower left corner of the board at the top, and the initial position with markers at the level three diagonal and below. The goal is now to combine markers two at a time to form a single marker that's closer to the top (analogous to the final fifth row final "target square" using Conway's Soldiers terminology). Due to the exponentially changing nature of the maker values, discussed in the next section, even an infinite number of markers is not enough.

## Math
When a marker is split each new marker can be considered to have half the value of the original marker. In this sense the value of a marker is
> value = 1 / 2 ^ hammingDistance

where the hamming distance is the number of up and right moves from from the lower left corner. In this sense the total value of all markers on the board is one regardless of how many times markers are split, or where they are split. It turns out that it's not possible to surpass level two (to get it so all markers have a minimum hamming distance from the lower left corner of two), a surprisingly low level. This can be proven by imagining that all spaces at a certain level (hamming distance) and beyond are occupied, and summing the value of all the markers. If the sum, which converges, is less than one, then the original single marker can not fit in that infinite space.

Summing by diagonals of constant hamming distance by starting in the lower left corner and moving to the upper right looks like:
> sum((level + 1)/2^level, level = startLevel, infinity)

which is hard, but there is an easier way. Each row is a geometrically converging sequence. At level three each marker has value 1/2^3 = 1/8. For each of the four markers in the level three diagonal the sum of the marker and each all markers to the right of it is:
> 1/8 + 1/16 + 1/32 ...

For a total of 1/4 for each of those four markers, which adds to one. However, we also need to take into consideration all of the markers above the level three diagonal. To do that we notice that the entire top row in the level three diagonal forms a geometric sequence with all of the rows above it. In other words, the value of all rows with a hamming distance of four or greater from the original in the same geometric sequence converging to 1/4.

So, the total vale of markers being placed at level three and beyond is 1.25. However,  that position is not possible. For the first row (bottom most) and first column (left most) only a single square may have a marker. If they each have one marker at level three then the empty space corresponding to higher levels would have value 1/8 for the that row and column each, if occupied. So we can subtract 1/4 for a total possible value of one at level three. This is sufficient to prove that level three is impossible since the board is only 16 by 16. But in addition to that the second row and the second column can only gain makers by the first row and first column marker moving. But we decided that the first row and first column will have a marker at level three. This means the second row and second column can have at most three markers. This means the total possible value for level three, even on an infinite board, is less than one, so it is impossible. The initial marker can not fit into that infinite space.
