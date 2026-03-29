import { QueryBuilder } from "./src/app/utils/QueryBuilder";
import { Prisma } from "./src/generated/prisma/client";
import { doctorFilterableFields, doctorSearchableFields, doctorIncludeConfig } from "./src/app/module/doctor/doctor.constant";

async function testQuery() {
    const queryParams = { 
        "appointementFee": { gt: '2500', lte: '2000' },
        "experience": { gt: '5' }
    };
    
    const mockModel : any = {
        count: async () => 0,
        findMany: async () => []
    };

    const queryBuilder = new QueryBuilder<any, any, any>(
        mockModel,
        queryParams,
        {
            searchableFields: doctorSearchableFields,
            filterableFields: doctorFilterableFields,
        }
    );

    queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .include({
            user: true,
            specialties: {
                include:{
                    specialty: true
                }
            },
        })
        .dynamicInclude(doctorIncludeConfig)
        .paginate()
        .sort()
        .fields();

    const resultQuery = queryBuilder.getQuery();
    const fs = require('fs');
    fs.writeFileSync('./query_output.json', JSON.stringify(resultQuery, null, 2));
}

testQuery().catch(console.error);
