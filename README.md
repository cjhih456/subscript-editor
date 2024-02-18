# Subtitles editor

### used tech
- [FFmpeg wasm](https://ffmpegwasm.netlify.app/docs/overview)
  - Used to extract audio waveform data.
  - Used to extract audio stream for WAV file (will be used on Whisper).
- Nuxt
  - Look at the [nuxt 3 documentation](https://v3.nuxtjs.org) to learn more.
- Vue
- Vuetify
- Tailwindcss
- videojs
- whisper(optional, sub module - nuxt proxy)
  - If you use Whisper, you can generate subtitles automatically.

### Whisper endpoint
[Whisper Setup document](https://ahmetoner.com/whisper-asr-webservice/run/)
On Mac os, not support gpu yet.
```bash
## CPU only
docker pull onerahmet/openai-whisper-asr-webservice
docker run -d -p 9000:9000 -e ASR_MODEL=base -e ASR_ENGINE=openai_whisper onerahmet/openai-whisper-asr-webservice:latest
```

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
