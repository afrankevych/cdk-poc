import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";
import {mock} from '../src/mock';

export const mockHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.queryStringParameters || !event.queryStringParameters.input) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                title: 'Bad Request',
                detail: 'Input not provided',
            })
        }
    }

    return {
        statusCode: 200,
        body: mock(event.queryStringParameters.input),
    }
};
