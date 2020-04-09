 
import { PaginationResultInterface } from './pagination.results.interface';
import { PaginationOptionsInterface } from './pagination.options.interface'

export class Pagination<PaginationEntity> {
  public results: PaginationEntity[]
  public total: number
  public pagination: { 
    pageTotal: number
    limit: number
    current?: number
    previous?: number
    next?: number
    last?: number
  }

  constructor(paginationResults: PaginationResultInterface<PaginationEntity>, options: PaginationOptionsInterface) {
    const lastPage = Math.ceil(paginationResults.total / options.limit)
    this.results = paginationResults.results;
    this.total = paginationResults.total;
    this.pagination = {
      pageTotal: paginationResults.results.length,
      limit: options.limit,
      current: options.page,
      previous: options.page <= 1 ? 1 : (options.page - 1),
      next: options.page !== lastPage ? options.page + 1 : lastPage,
      last: lastPage
    }

  }
}