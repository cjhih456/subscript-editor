interface UserInfo {
  idx: number
  channelId?: number
  channelData?: ChannelInfo
  nick: String
  lang: String
}

interface TokenInfo {
  email: string
  exp: number
  iat: number
  idx: number
  token_type: string
}
