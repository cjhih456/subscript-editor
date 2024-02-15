import { VTTCue, WebVTT } from 'videojs-vtt.js'

export interface TranslateResult {
  cues: VTTCue[]
  regions?: VTTRegion[]
}

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
    const [hours, minutes, seconds, milliseconds] = timeFormatCheck(time).split(/[:.]/g).map(v => +v)
    return nuxt.$dayjs.duration({ hours, minutes, seconds, milliseconds }).asMilliseconds() / 1000
  }
  function convertSecondToTime (sec: number) {
    return nuxt.$dayjs.utc(sec * 1000).format(timeFormat)
  }
  function parseSbv (txt: string) {
    const data = { cues: [] as VTTCue[] } as TranslateResult
    txt
      .toString()
      .replace(/(\r\n)|\r/g, '\n')
      .replace(
        /^(\d:.*)\n((?:(?!\d+:\d+:\d+).*\n*)+)$/gm,
        (_, time, text) => {
          const [s, e] = time.split(',')
          data.cues.push(
            new VTTCue(
              convertTimeToSecond(s),
              convertTimeToSecond(e),
              text.replace(/\n/g, ' ').trim()
            )
          )
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
      parser.oncue = (v) => {
        cues.push(v)
      }
      parser.onregion = (v) => {
        regions.push(v)
      }
      parser.onflush = () => {
        resolve({
          cues,
          regions
        })
      }
      parser.parse(txt)
      parser.flush()
    })
  }
  function parseSrt (txt:string) {
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
    result = parseSbv(textData)
    return result.cues.length ? result : false
  }
  function jsonToString (jsonData: TranslateResult) {
    return jsonData.cues.reduce((acc, cur) => {
      const startTime = cur.startTime * 1000
      const endMinTime = startTime + 1000
      const endTimeBuffer = cur.endTime * 1000
      const endTime = Math.max(endMinTime, endTimeBuffer)
      const text = cur.text
      const st = convertSecondToTime(startTime)
      const et = convertSecondToTime(endTime)
      return acc + `${st} --> ${et}\n${text}\n\n`
    }, 'WEBVTT\n\n')
  }
  function makeVttFromJson (jsonData: any[]) {
    if (jsonData) {
      return parseVtt(jsonToString({ cues: jsonData }))
    }
    return { cues: [] } as TranslateResult
  }
  function convertJsonToFile (jsonData: any[]) {
    const stringBlob = jsonToString({ cues: jsonData })
    try {
      return new File([stringBlob], 'webvtt.vtt', { type: 'text/vtt' })
    } catch (err) {
      return Object.assign(stringBlob, { name: 'webvtt.vtt' })
    }
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
        convertJsonToFile
      }
    }
  }
})
