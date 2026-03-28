

export interface PrismaFindManyArgs {
    where?: Record<string, unknown>;
    include?: Record<string, unknown>;
    select?: Record<string, boolean | Record<string, null>>;
    orderBy?: Record<string, unknown> | Record<string, unknown>[];
    skip?: number;
    take?: number;
    cursor?: Record<string, unknown>;
    distinct?: string[] | string;
    [key: string]: unknown;
}


export interface PrismaCountArgs {
    where?: Record<string, unknown>;
    include?: Record<string, unknown>;
    select?: Record<string, boolean | Record<string, null>>;
    orderBy?: Record<string, unknown> | Record<string, unknown>[];
    skip?: number;
    take?: number;
    cursor?: Record<string, unknown>;
    distinct?: string[] | string;
    [key: string]: unknown;
}

export interface PrismaModelDelegate {
    findMany(args?: any): Promise<any>[];
    count(args?: any): Promise<number>;
}

export interface IQueryParams {
    searchTerm?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    fields?: string;
    includes?: string;
    [key: string]: string | undefined;
}

export interface IQueryConfig {
    searchableFields: string[];
    filterableFields: string[];
}

