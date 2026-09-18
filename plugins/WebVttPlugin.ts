import { WebVTT } from 'videojs-vtt.js'

export type CueLinePosition = 'top' | 'bottom'

export interface VTTCueSlim {
  startTime: number
  endTime: number
  text: string
  linePosition?: CueLinePosition
}

export interface TranslateResult {
  cues: (VTTCue | VTTCueSlim)[]
  regions?: VTTRegion[]
}

const WTT_MIME = 'text/vtt'
const WEBVTT_HEADER = /^[\uFEFF]?\s*WEBVTT/i

export default defineNuxtPlugin(() => {
  const nuxt = useNuxtApp()
  const timeFormat = 'HH:mm:ss.SSS'

  function timeFormatCheckForEdit (time: string) {
    return !!/\d{1,}:\d{2}:\d{2}\.\d{3}/.test(time)
  }
  function timeFormatCheck (time: string) {
    return /\d{1,}:\d{1,2}:\d{1,2}\.\d{1,3}/.test(time) ? time : '0:0:0.000'
  }
  function convertTimeToSecond (time: string) {
    const [hours, minutes, seconds, milliseconds] = timeFormatCheck(time).split(/[:.]/g).map((v, idx) => {
      if (idx !== 3) { return Number(v) }
      return Number(v.padEnd(3, '0'))
    })
    return nuxt.$dayjs.duration({ hours, minutes, seconds, milliseconds }).asMilliseconds() / 1000
  }
  function convertSecondToTime (sec: number) {
    return nuxt.$dayjs.utc(sec * 1000).format(timeFormat)
  }

  function stripBom (txt: string) {
    return txt.replace(/^\uFEFF/, '')
  }

  function ensureWebVttDocument (txt: string) {
    const body = stripBom(txt)
    if (WEBVTT_HEADER.test(body)) { return body }
    return `WEBVTT\n\n${body}`
  }

  function resolveCuePosition (cue: VTTCue | VTTCueSlim): CueLinePosition {
    if ('linePosition' in cue && (cue.linePosition === 'top' || cue.linePosition === 'bottom')) {
      return cue.linePosition
    }
    const vtt = cue as VTTCue
    const line = vtt.line
    const snap = vtt.snapToLines !== false
    if (line === 'auto' || line === undefined || line === null) {
      return 'bottom'
    }
    if (typeof line === 'number') {
      if (!snap) {
        return line < 50 ? 'top' : 'bottom'
      }
      return line >= 0 && line <= 2 ? 'top' : 'bottom'
    }
    return 'bottom'
  }

  function applyCuePosition (cue: VTTCue, position: CueLinePosition) {
    if (position === 'top') {
      cue.line = 0
      cue.snapToLines = true
    } else {
      cue.line = 90
      cue.snapToLines = false
    }
    cue.align = 'center'
    return cue
  }

  function cueSettings (position: CueLinePosition) {
    return position === 'top' ? 'line:0 align:center' : 'line:90% align:center'
  }

  async function parseSbv (txt: string) {
    const data = { cues: [] as VTTCue[] } as TranslateResult
    txt
      .toString()
      .replace(/(\r\n)|\r/g, '\n')
      .replace(
        /^(\d:.*)\n((?:(?!\d+:\d+:\d+).*\n*)+)$/gm,
        (_, time, text) => {
          const [s, e] = time.split(',')
          const cue = new VTTCue(
            convertTimeToSecond(s),
            convertTimeToSecond(e),
            text.replace(/\n/g, ' ').trim()
          )
          applyCuePosition(cue, 'bottom')
          data.cues.push(cue)
          return ''
        }
      )
    return data
  }

  function parseVtt (txt: string) {
    return new Promise<TranslateResult>((resolve) => {
      const parser = new WebVTT.Parser(window, WebVTT.StringDecoder())
      const cues = [] as VTTCue[]
      const regions = [] as VTTRegion[]
      parser.oncue = (v: VTTCue) => {
        applyCuePosition(v, resolveCuePosition(v))
        cues.push(v)
      }
      parser.onregion = (v: VTTRegion) => {
        regions.push(v)
      }
      parser.onflush = () => {
        resolve({
          cues,
          regions
        })
      }
      parser.parse(ensureWebVttDocument(txt))
      parser.flush()
    })
  }

  function parseSrt (txt: string) {
    const bufferText = txt
      .replace(/\{(\/?(b|i|u))\}/g, '<$1>')
      // eslint-disable-next-line no-useless-escape
      .replace(/\{(\\a|\a)[0-9]+\}/g, '')
      .replace(/([\d]{2}):([\d]{2}),([\d]{3})/g, '$1:$2.$3')
    return parseVtt('WEBVTT\n\n' + bufferText)
  }

  async function parseSubtitle (textData: string) {
    let result = await parseVtt(textData)
    if (result.cues.length) { return result }
    result = await parseSrt(textData)
    if (result.cues.length) { return result }
    result = await parseSbv(textData)
    return result.cues.length ? result : false
  }

  function slimCue (cue: VTTCue | VTTCueSlim): VTTCueSlim {
    return {
      startTime: cue.startTime,
      endTime: cue.endTime,
      text: cue.text,
      linePosition: resolveCuePosition(cue)
    }
  }

  function jsonToString (jsonData: TranslateResult) {
    return jsonData.cues.reduce((acc, cur) => {
      const startTime = cur.startTime
      const endMinTime = startTime + 1
      const endTimeBuffer = cur.endTime
      const endTime = Math.max(endMinTime, endTimeBuffer)
      const text = cur.text
      const st = convertSecondToTime(startTime)
      const et = convertSecondToTime(endTime)
      const position = resolveCuePosition(cur)
      return acc + `${st} --> ${et} ${cueSettings(position)}\n${text}\n\n`
    }, 'WEBVTT\n\n')
  }

  async function makeVttFromJson (jsonData: VTTCueSlim[]) {
    if (jsonData) {
      return await parseVtt(jsonToString({ cues: jsonData }))
    }
    return { cues: [] } as TranslateResult
  }

  function convertJsonToFile (jsonData: VTTCueSlim[]) {
    const stringBlob = jsonToString({ cues: jsonData })
    try {
      return new File([stringBlob], 'webvtt.vtt', { type: WTT_MIME })
    } catch {
      throw new Error('Failed to convert JSON to file')
    }
  }

  function toTextTrackCues (jsonData: VTTCueSlim[]) {
    return jsonData.map((item) => {
      const cue = new VTTCue(item.startTime, item.endTime, item.text)
      applyCuePosition(cue, item.linePosition ?? 'bottom')
      return cue
    })
  }

  return {
    provide: {
      webVtt: {
        timeFormat,
        timeFormatCheckForEdit,
        timeFormatCheck,
        convertTimeToSecond,
        convertSecondToTime,
        parseSubtitle,
        makeVttFromJson,
        convertJsonToFile,
        resolveCuePosition,
        applyCuePosition,
        slimCue,
        toTextTrackCues
      }
    }
  }
})
