export default class ViewPort {
  private _zoom = 1
  private _offset = 0

  get zoom() {
    return this._zoom
  }

  set zoom(value: number) {
    this._zoom = Math.max(1, value)
  }

  get offset() {
    return this._offset
  }

  set offset(value: number) {
    this._offset = Math.max(0, value)
  }
}
