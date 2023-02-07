import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";
import {extractPokemonMedia} from "@mediaExtractor/index";
import * as process from "process";

export const extractPokemonMediaHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    // TODO log incoming event
    // console.log("EVENT: ", JSON.stringify(event));

    // TODO log setup error
    const bucket = process.env.S3_BUCKET;
    const bucketDomain = process.env.S3_BUCKET_DOMAIN;
    if (!bucket || !bucketDomain) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                title: 'Internal Server Error',
                detail: 'The server was not properly configured',
            })
        }
    }

    // TODO log validation error
    if (!event.queryStringParameters || !event.queryStringParameters.input) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                title: 'Bad Request',
                detail: 'Input not provided',
            })
        }
    }

    try {
        const media = await extractPokemonMedia({type: 'pokemon', name: event.queryStringParameters.input}, bucket);
        // TODO log out-coming event
        // TODO return proper event
        return {
            statusCode: 200,
            body: JSON.stringify({
                sprite: `https://${bucketDomain}/${media.path}`
            })
        }
    } catch (err) {
        // TODO log execution error
        return {
            statusCode: 500,
            body: JSON.stringify({
                title: 'Internal Server Error',
                detail: (err as Error).message,
            })
        }
    }
};
