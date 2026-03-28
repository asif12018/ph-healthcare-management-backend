import { IQueryConfig, IQueryParams, PrismaCountArgs, PrismaFindManyArgs, PrismaModelDelegate } from "../interfaces/query.interface"

// T = model
export class QueryBuilder<T,
TWhereInput = Record<string, unknown>,
TInclude = Record<string, unknown>
>{
  private query: PrismaFindManyArgs;
  private countQuery: PrismaCountArgs;
  private page: number = 1;
  private limit: number = 10;
  private skip: number = 0;
  private sortBy: string = "createdAt";
  private sortOrder: "asc" | "desc" = "desc";
  private selectFields: Record<string, boolean | undefined>;

  constructor(
    private model: PrismaModelDelegate,
    private queryParams: IQueryParams,
    private config : IQueryConfig
  ){
    this.query = {
        where: {},
        include: {},
        select: {},
        orderBy: {},
        skip: 0,
        take: 10
    }
    this.countQuery = {
        where: {}
    }
  }
}