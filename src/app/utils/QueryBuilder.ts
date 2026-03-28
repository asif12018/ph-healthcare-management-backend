import {
  IQueryConfig,
  IQueryParams,
  PrismaCountArgs,
  PrismaFindManyArgs,
  PrismaModelDelegate,
  PrismaStringFilter,
  PrismaWhereConditons,
} from "../interfaces/query.interface";

// T = model
export class QueryBuilder<
  T,
  TWhereInput = Record<string, unknown>,
  TInclude = Record<string, unknown>,
> {
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
    private config: IQueryConfig,
  ) {
    this.query = {
      where: {},
      include: {},
      select: {},
      orderBy: {},
      skip: 0,
      take: 10,
    };
    this.countQuery = {
      where: {},
    };
  }
  search(): this {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchCondittions: Record<string, unknown>[] = searchableFields.map(
        (field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            if (parts.length === 2) {
              const [relation, nextedField] = parts;
              const stringFilter: PrismaStringFilter = {
                contains: searchTerm,
                mode: "insensitive" as const,
              };
              return {
                [relation]: {
                  [nextedField]: stringFilter,
                },
              };
            } else if (parts.length === 3) {
              const [relation, nextedRelation, nextedField] = parts;
              const stringFilter: PrismaStringFilter = {
                contains: searchTerm,
                mode: "insensitive" as const,
              };
              return {
                [relation]: {
                  [nextedRelation]: {
                    [nextedField]: stringFilter,
                  },
                },
              };
            }
            
          }
          //direct field search
            const stringFilter: PrismaStringFilter = {
              contains: searchTerm,
              mode: "insensitive" as const,
            };

            return { [field]: stringFilter };
        },
      );
      const whereConditions = this.query.where as PrismaWhereConditons;
      whereConditions.OR = searchCondittions;
      const countWhereConditions = this.countQuery.where as PrismaWhereConditons;
      countWhereConditions.OR = searchCondittions;


    }
    return this;
  }
}
