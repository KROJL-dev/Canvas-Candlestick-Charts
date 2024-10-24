import type { ILoadDataDTO } from 'types'

import Bar from 'Chart/bar'
import Chart from 'Chart'

import { charts, timeframe } from 'utils/const'

const processDataToBar = (data: ILoadDataDTO): Bar[] => {
  return data.Bars.map(
    (bar, index) =>
      new Bar(data.ChunkStart + bar.Time, bar.Open, bar.High, bar.Low, bar.Close, index)
  ) as Bar[]
}

const loadChartsData = async (
  symbol: string,
  timeframe: number,
  start: number,
  end: number
): Promise<ILoadDataDTO[]> => {
  try {
    const response = await fetch(
      import.meta.env.VITE_APP_HOST.concat(
        `/data/api/Metadata/bars/chunked?Broker=Advanced&Symbol=${symbol}&Timeframe=${timeframe}&Start=${start}&End=${end}&UseMessagePack=false`
      )
    )
    const data = (await response.json()) as ILoadDataDTO[]

    return data
  } catch (error) {
    return []
  }
}

const init = () => {
  charts.forEach(pair => {
    const chart = new Chart(pair)

    loadChartsData(pair, timeframe, 57674, 59113).then(data =>
      data.map(item => chart.loadBars(processDataToBar(item)))
    )
  })
}

init()
