import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";

export const handler = async (_event: APIGatewayEvent): Promise<APIGatewayProxyResult> => ({
    statusCode: 200,
    body: 'Hello World!'
});
