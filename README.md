# Hudson's Drive & Discover

A calm landscape phone game for Hudson. One motorcycle, a straight road, and five animals: cow, dog, cat, duck, and horse. There is no steering, no timer, and no fail state.

Open it at [https://dfrost1313.github.io/hudsons-drive/](https://dfrost1313.github.io/hudsons-drive/) after the Pages workflow on `main` has run. It is a static site: no build step and no server.

## Play locally

Service workers and audio need a real page, not a `file://` URL.

```bash
python3 -m http.server 8765
```

Then open `http://localhost:8765/` and turn the phone sideways (or use a short, wide window). The first tap unlocks sound and loads every clip.

Hold the big green button to drive, or tap it for a short burst. The motorcycle eases to a stop at each animal. Tap the picture that matches. A wrong tap wiggles and says "try again," then the right picture pulses, then it stays highlighted until it is tapped. After all five, the trip waits on the end screen until Play again is tapped.

## Grown-ups

The small key in the top corner is press-and-hold for 3 seconds, then `4 + 3`. Inside: sound on or off, a short how-to, and a credit for every clip.

## Swap the voice

Spoken lines are ordinary files. `audio/voice/manifest.json` maps a line to a filename in that same folder. An empty string means the game stays quiet for that line.

| Key | Plays when | Shipped recording |
| --- | --- | --- |
| `what_animal` | an animal appears | empty |
| `you_got_it` | a correct tap, if present | empty (falls through to `sounds_good`) |
| `sounds_good` | a correct tap, until `you_got_it` is filled | "Sounds good." |
| `try_again` | a wrong picture | "Try again." |
| `lets_go` | a trip starts | "Let's go!" |
| `all_done` | the end screen | "All done." |
| `cow` `dog` `cat` `duck` `horse` | after that animal's sound | the animal name |

To use a family recording, save an mp3 or m4a next to the others and put its filename in the manifest. Do not add a synthesized or text-to-speech fallback. Animal sounds, the engine, the tap, and the chime are separate files listed in `audio/credits.json`.

## Pages

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on every push to `main`, using `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. Paths are relative so the game works under `/hudsons-drive/`.
