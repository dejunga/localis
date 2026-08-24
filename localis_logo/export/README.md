# LOCALIS — logo files

## Colours (sampled from localis.hr)
| role | hex |
|---|---|
| Navy, primary | #062B47 |
| Navy, lighter (mark on light backgrounds) | #1A395B |
| Gold, accent | #D49838 |
| Cool grey, secondary text | #BFD5DC |

## What to use where
- **svg/localis-mark.svg** — the default. Two colours, transparent. Use for web, print, anything that scales.
- **svg/localis-mark-reverse.svg** — on navy or on photography.
- **svg/localis-mark-onecolour.svg** — stamps, embroidery, fax-grade print, engraving. The risers are real cut-outs, so it works on any background.
- **svg/localis-icon-navy.svg / -gold.svg** — square app icon, avatar, social profile. The gold tile keeps continuity with the site as it stands today.
- **png/localis-icon-navy-32.png / -16.png** — favicon. **-180.png** — Apple touch icon.

SVG is the master. Only use PNG where SVG is not accepted.

## Rules
- Clear space on all sides = the width of the stem (32 units, 20% of the mark's height).
- Minimum size: 24px on screen, 8mm in print. Below that use the one-colour version.
- The three gold risers are always gold or knocked out — never the same value as the stem, or the mark loses its detail.
- Do not recolour, outline, rotate, add effects, or stretch. Scale proportionally only.

## Wordmark
LOCALIS is set in **Playfair Display** (weight 500, tracking 0.12em); the tagline EDUKACIJA I SAVJETOVANJE in **Archivo** (weight 500, tracking 0.22em). Lockup PNGs: `png/localis-lockup-horizontal.png` (transparent, 1011×204) and `png/localis-lockup-stacked.png` (on cool grey, 920×644). For a vector lockup, set the text in those fonts and convert to outlines — text kept live in an SVG will fall back to a system serif on machines without the font.
