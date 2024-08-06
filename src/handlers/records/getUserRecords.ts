import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { getUserRecords } from '../../services/recordService';
import { SortableField } from '../../models/Record';

interface QueryParams {
  userId: string;
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  operationId?: string;
  sortBy: SortableField;
  sortOrder: 'asc' | 'desc';
  searchString?: string;
}

/**
 * Handles fetching user records with pagination, sorting, and filtering.
 * 
 * @param event - The API Gateway event object.
 * @returns A promise resolving to an API Gateway proxy result.
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const params = parseQueryParams(event.queryStringParameters || {});
    
    if (!params.userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'userId is required' })
      };
    }

    const { records, totalCount } = await getUserRecords(
      params.userId, 
      params.pageSize,
      (params.page - 1) * params.pageSize,
      params.startDate, 
      params.endDate, 
      params.operationId,
      params.sortBy,
      params.sortOrder,
      params.searchString
    );

    const totalPages = Math.ceil(totalCount / params.pageSize);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: records.map(formatRecord),
        page: params.page,
        pageSize: params.pageSize,
        totalPages,
        hasNextPage: params.page < totalPages,
        totalCount,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      })
    };

  } catch (error) {
    console.error('Error fetching user records:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

function parseQueryParams(queryParams: Record<string, string | undefined>): QueryParams {
  return {
    userId: queryParams.userId || '',
    page: parseInt(queryParams.page || '1'),
    pageSize: parseInt(queryParams.rowsPerPage || '10'),
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    operationId: queryParams.operationId,
    sortBy: (queryParams.sortBy as SortableField) || 'created_at',
    sortOrder: queryParams.sortOrder === 'asc' ? 'asc' : 'desc',
    searchString: queryParams.searchString
  };
}

function formatRecord(item: any) {
  return {
    ...item,
    date: new Date(item.created_at.toString()),
    deleted: Boolean(item.deleted)
  };
}
