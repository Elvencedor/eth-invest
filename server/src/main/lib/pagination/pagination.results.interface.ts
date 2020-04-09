export interface PaginationResultInterface<PaginationEntity> {
  results: PaginationEntity[];
  total: number;
  perPage: number;
  current: number;
  next?: number;
  previous?: number;
  last?: number;
}