export class CoreResponseData {
  total: number
  totalPage: number
  data: Record<string, any>

  constructor(count: number, limit: number, response: Record<string, any>) {
    this.total = count
    this.totalPage = Math.ceil(count / limit)
    this.data = response
  }
}