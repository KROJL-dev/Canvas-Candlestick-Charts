export interface ILoadDataDTO {
  ChunkStart: number
  Bars: { Time: number; Open: number; High: number; Low: number; Close: number }[]
}

export interface IBar {
  time: number
  open: number
  high: number
  low: number
  close: number
  index: number
}
