# Subtitles editor

## Playground
https://cjhih456.github.io/subscript-editor/

### used tech
- [FFmpeg wasm](https://ffmpegwasm.netlify.app/docs/overview)
  - Used to extract audio waveform data.
  - Used to extract audio stream for WAV file (will be used on Whisper).
- Nuxt
  - Look at the [nuxt 3 documentation](https://v3.nuxtjs.org) to learn more.
- Vue
- shadcn/vue
- Tailwindcss
- videojs
- whisper

### Featured
- [x] change UI/UX, Vuetify -> shadcn/vue, @nuxtjs/color-mode 
- [x] clean-up directory, file system.
- [x] editor history system
- [x] when rendering timeline & wave, use OffscreenCanvas & Worker
- [x] use Provide & Inject - done
- [x] display long duration convert status
- [x] change layout as responsive
- [x] update ui/ux
- [x] open vtt, sbv, srt files
- [ ] add call whisper api action. 
  - https://huggingface.co/docs/transformers.js/pipelines
  - https://www.webai-js.com/models/whisper-tiny/

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install
```

## Development Server

Start the development server on http://localhost:3000

```bash
yarn dev
```

## Production

Build the application for production:

```bash
yarn build
```

Locally preview production build:

```bash
yarn preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.
