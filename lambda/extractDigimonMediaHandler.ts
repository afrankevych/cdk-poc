import {extractDigimonMedia} from "@mediaExtractor/index";
import * as process from "process";

type InEvent = {
    data: Digimon
} & {
    [key: string]: unknown
};
type OutEvent = {
    data: {
        media: Media[],
    }
} & {
    [key: string]: unknown
};

export const extractDigimonMediaHandler = async (event: InEvent): Promise<OutEvent> => {
    console.log("Event received: ", JSON.stringify(event));

    const bucket = process.env.S3_BUCKET;
    if (!bucket) {
        console.error('Setup Error: missing S3_BUCKET env var')
        return {
            data: {
                media: [],
            }
        };
    }

    if (!event.data.name || !event.data.type) {
        console.error('Validation Error: Invalid payload')
        return {
            data: {
                media: [],
            }
        };
    }

    try {
        const media = await extractDigimonMedia(event.data, bucket);
        console.log('Media extracted: ', JSON.stringify(media));

        return {
            data: {
                media: [
                    {...media},
                ]
            },
        }
    } catch (error) {
        console.error('Media extraction error: ', JSON.stringify(error));

        return {
            data: {
                media: []
            }
        };
    }
};
