import {APIGatewayEvent, APIGatewayProxyResult} from "aws-lambda";
import {extractDigimonMedia} from "@mediaExtractor/index";
import * as process from "process";
import * as console from "console";

type InEvent = {
    [key: string]: unknown
} & {
    data: Digimon
};

type OutEvent = unknown;

export const extractDigimonMediaHandler = async (event: InEvent): Promise<OutEvent> => {
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
    try {
        const media = await extractDigimonMedia({type: 'digimon', name: event.data.name}, bucket);

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
        console.error(err)
        return {
            statusCode: 500,
            body: JSON.stringify({
                title: 'Internal Server Error',
                detail: (err as Error).message,
            })
        }
    }
};
