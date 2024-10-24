import Bar from './bar'

import type Chart from './index'

import type { ILoadDataDTO } from 'types'

export default class Fetcher {
  constructor(public pair: string) {
    this.start = 0
    this.end = 0
  }

  private start: number
  private end: number

  private processDataToBar(data: ILoadDataDTO): Bar[] {
    return data.Bars.map(
      (bar, index) =>
        new Bar(data.ChunkStart + bar.Time, bar.Open, bar.High, bar.Low, bar.Close, index)
    ) as Bar[]
  }

  private async loadChartsData(): Promise<ILoadDataDTO[]> {
    try {
      const response = await fetch(
        import.meta.env.VITE_APP_HOST.concat(
          `/data/api/Metadata/bars/chunked?Broker=Advanced&Symbol=${this.pair}&Timeframe=1&Start=${this.start}&End=${this.end}&UseMessagePack=false`
        )
      )

      return (await response.json()) as ILoadDataDTO[]
    } catch (error) {
      return []
    }
  }

  public async fetch(start: number, end: number) {
    this.start = start
    this.end = end

    let newData: Bar[] = []
    const fetchedData = await this.loadChartsData()

    fetchedData.forEach(item => {
      newData = [...newData, ...this.processDataToBar(item)]
    })

    return newData
  }
}
