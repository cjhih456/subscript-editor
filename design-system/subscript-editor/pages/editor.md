# Page Override: Editor

> Overrides `MASTER.md` for the subtitle editor workspace (`pages/index.tsx`).
> Landing-page / hero-CTA rules in Master do **not** apply here.

**Project:** Subscript Editor  
**Page:** Editor workspace  
**Direction:** Lumen Stage (OLED + Glass + Spatial Three.js)

---

## Purpose

One job: **align captions to time**. The video stage is the dominant region. Cues, inspector, and timeline are supporting.

Primary action: play / scrub / edit the active cue.  
Secondary: import video, import VTT, export VTT, Whisper.

---

## Layout (desktop)

```
Top bar (56)     brand · file · timecode · whisper · open · export
Left rail (280)  cue list with TOP/BOTTOM chip
Center           3D video stage — captions snap to player top or bottom
Right (280)      inspector including position segmented control
Bottom (248)     waveform + TOP lane + BOTTOM lane
```

Mobile (`<768`): stage → timeline → cue list. No competing dual-column.

Do not hide Open Video / Export behind a hamburger on desktop.

---

## Visual overrides vs Master

| Token | Master | Editor page |
| --- | --- | --- |
| Background | `#0F172A` | `#07090F` (true OLED around the stage) |
| Heading face | Inter | **Syne** for brand / selected cue title only |
| Timecode face | Inter | **JetBrains Mono** |
| Body | Inter | Inter |
| Radius | 8–12 cards | Stage `20px`, rails `16px`, chips pill |
| Buttons | Blue primary | **Pink primary** `#EC4899` for Export; ghost for Open |

Icons: Phosphor for Lumen Stage. As-is screens keep Lucide to match current code.

---

## Stage rendering (this page only)

The stage is a **stacked compositor**. Three.js never draws the source video.

1. **Idle effects (TresJS / vue-three-fiber)** — a canvas (`TresCanvas`) fills the stage and draws atmosphere (shader wash, grain, lights) **until a video is selected**. This canvas stays at a low z-index.
2. **video.js source** — the actual picture is a video.js player, not `VideoTexture`. When a file is selected the player’s z-index rises above the effect canvas so the video is what the user sees.
3. **WTT captions** — cues are WebVTT (`WEBVTT` / `.vtt` / `.wtt`). video.js owns a text track for timing; visible chips are HTML overlays snapped **top** or **bottom** only (`line:0` vs `line:90%`). Never center captions. Timeline uses two lanes (TOP = `#2563EB`, BOTTOM = `#EC4899`).
4. **Timeline canvas** — waveform / time ticks stay on 2D canvas workers. Glass cue slabs overlay the wave host.
5. **Playhead** — if `prefers-reduced-motion: reduce`, render a static 2px line.

State: existing `CueStore` / `currentTime` / `pixPerSec` remain the single source of truth. Do not duplicate cue state in the Three scene graph.

Nuxt: put public Three theme tokens in `app.config`, never in `runtimeConfig`.

---

## UX rules (page-specific)

- Click-to-play; never autoplay the source video.
- Visible focus ring (`--color-ring` `#EC4899`) on every control, including modal/sheet.
- Sticky header must not cover focused fields: `scroll-padding-top: 56px`.
- Color is not the only playhead indicator (line + timecode + caption highlight).
- Timeline zoom slider needs a visible `pps` label (current control is unlabeled).
- Caption position is a first-class field (`top` | `bottom`), not inferred from style. Color + label + lane together indicate position (color is never the only cue).
- Top captions sit in the player’s upper safe band; bottom captions sit **above** the control dock, never behind it.

---

## Anti-patterns for this page

- Pure white workspace
- Accordion as the primary cue browser on desktop
- 90px-thin 2D canvas timeline as the main time surface
- Hiding import/export in a sheet on desktop
- `MeshStandardMaterial` on flat HUD
- Lights in a MeshBasicMaterial-only overlay scene
- Captions vertically centered on the video (only **top** or **bottom**)
- Mixing top and bottom cues in a single timeline lane
