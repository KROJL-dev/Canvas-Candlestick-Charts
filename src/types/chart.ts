export interface ILoadDataDTO {
  ChunkStart: number
  Bars: { Time: number; Open: number; High: number; Low: number; Close: number }[]
}
