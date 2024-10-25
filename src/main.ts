import Fetcher from 'Chart/fetcher'
import Chart from 'Chart'

import { charts } from 'const'

const init = async () => {
  charts.forEach(async pair => {
    const chart = new Chart(pair)

    const fetcher = new Fetcher(pair)
    const data = await fetcher.fetch(57674, 59113)

    chart.loadBars(data)
  })
}

init()
