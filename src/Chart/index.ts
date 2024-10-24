import type Bar from './bar'
import ViewPort from 'ViewPort/index'

import dayjs from 'dayjs'

import { XTick, YTick, gridColor } from 'utils/const'

import styles from './styles.module.scss'

export default class Chart {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private bars: Bar[] = []
  private currentBars: Bar[] = []
  private viewport: ViewPort = new ViewPort()
  private counterOfRenderedBars = 0

  constructor(canvasId: string) {
    const canv = document.createElement('canvas')
    canv.id = canvasId

    this.renderCanvasWrapper(canv, canvasId)
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.resizeCanvas()
    window.addEventListener('resize', () => this.resizeCanvas())
    this.addEventListeners()
  }

  private renderCanvasWrapper(child: HTMLCanvasElement, id: string) {
    const label = document.createElement('label')
    label.textContent = id

    const wrapper = document.createElement('div')
    wrapper.className = styles.wrapper
    wrapper.appendChild(label)
    wrapper.appendChild(child)

    document.body.appendChild(wrapper)
  }

  private resizeCanvas() {
    this.canvas.width = window.innerWidth - 100
    this.canvas.height = window.innerHeight / 2
    this.render()
  }

  public loadBars(bars: Bar[]) {
    this.bars = bars
    this.render()
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawBars()
    this.drawAxisLeft()
  }

  private drawBars() {
    const barWidth = 10 / this.viewport.zoom
    const startBar = Math.floor(this.viewport.offset / barWidth)
    const visibleBars = Math.ceil(this.canvas.width / barWidth)

    if (!this.counterOfRenderedBars || this.counterOfRenderedBars >= visibleBars + XTick)
      this.counterOfRenderedBars = visibleBars

    this.currentBars = this.bars.slice(startBar, startBar + visibleBars)

    this.currentBars.forEach((bar, index) => {
      const x = index * barWidth
      this.drawBar(x + 100, barWidth, bar, index)
    })
  }
  private drawYGrid(bar: Bar, targetX: number) {
    const { height } = this.canvas

    this.ctx.strokeStyle = gridColor
    this.ctx.lineWidth = 0.5

    this.ctx.beginPath()
    this.ctx.moveTo(targetX, 0)
    this.ctx.lineTo(targetX, height)
    this.ctx.stroke()

    this.ctx.fillStyle = gridColor

    this.ctx.fillText(dayjs(bar?.time * 1000).format('DD/MM/YYYY HH:mm'), targetX - 30, height - 5)
  }

  private drawBar(x: number, barWidth: number, bar: Bar, index: number) {
    const { open, high, low, close } = bar

    const color = close >= open ? 'green' : 'red'

    this.ctx.fillStyle = color
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 1

    const highY = this.priceToY(high)
    const lowY = this.priceToY(low)

    const targetX = x + barWidth / 2

    this.ctx.beginPath()
    this.ctx.moveTo(targetX, highY)
    this.ctx.lineTo(targetX, lowY)
    this.ctx.stroke()

    const bodyY = this.priceToY(Math.max(open, close))
    const bodyHeight = Math.abs(this.priceToY(open) - this.priceToY(close))

    this.ctx.fillRect(x, bodyY, barWidth, bodyHeight)

    if (!(bar.index % (XTick * this.viewport.zoom)) || index === this.currentBars.length - 1) {
      this.drawYGrid(bar, targetX)
    }
  }

  private priceToY(price: number): number {
    const maxPrice = Math.max(...this.currentBars.map(b => b.high))
    const minPrice = Math.min(...this.currentBars.map(b => b.low))

    const scale = (this.canvas.height - this.canvas.height / YTick) / (maxPrice - minPrice)

    return this.canvas.height - (price - minPrice) * scale - this.canvas.height / (YTick * 2)
  }

  private drawAxisLeft() {
    try {
      const { width } = this.canvas

      const min = Math.min(...this.currentBars.map(b => b.low))
      const max = Math.max(...this.currentBars.map(b => b.high))

      const steps = Array.from({ length: YTick + 1 }, (_, i) => min + ((max - min) / YTick) * i)

      steps.forEach((step, index) => {
        if (!index) return

        const y = this.priceToY(step)

        this.ctx.beginPath()
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(width, y)

        this.ctx.strokeStyle = gridColor
        this.ctx.fillStyle = gridColor
        this.ctx.lineWidth = 0.5

        this.ctx.stroke()
        this.ctx.fillText(step.toFixed(5), 5, y - 5)
      })
    } catch (e) {
      console.log('e', e)
    }
  }

  private addEventListeners() {
    this.canvas.addEventListener('wheel', e => this.onScroll(e))
    this.canvas.addEventListener('mousedown', e => this.onMouseDown(e))
    this.canvas.addEventListener('click', e => this.onZoomClick(e))
  }

  private onScroll(event: WheelEvent) {
    if (this.currentBars?.length + XTick < this.counterOfRenderedBars && event.deltaY > 0) return

    this.viewport.offset += event.deltaY
    this.render()
  }

  private onMouseDown(event: MouseEvent) {
    const startX = event.clientX
    const onMouseMove = (e: MouseEvent) => {
      const delta = (e.clientX - startX) / this.viewport.zoom
      this.viewport.offset -= delta
      this.render()
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  private onZoomClick({ clientX }: MouseEvent) {
    const clickPositionRatio = clientX / this.canvas.width

    if (clickPositionRatio < 0.5) {
      if (this.viewport.zoom > 10) return
      this.viewport.zoom += 1
    } else {
      this.viewport.zoom -= 1
    }

    this.render()
  }
}
