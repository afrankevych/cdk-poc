import {S3Client} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";
import axios, {AxiosInstance} from "axios";

export const extractDigimonMediaFactory = (httpClient: AxiosInstance, storageClient: S3Client): ExtractDigimonMedia => async (digimon: Digimon, bucket: string): Promise<Media> => {
    const apiResponse = await httpClient.get(`https://digimon-api.vercel.app/api/digimon/name/${digimon.name}`);
    const spritePath = apiResponse.data[0].img;
    const spriteResponse = await httpClient.get(spritePath, {responseType: 'stream'});

    const parallelUploads3 = new Upload({
        client: storageClient,
        params: {
            Bucket: bucket,
            Key: `digimon/${digimon.name}.jpg`,
            Body: spriteResponse.data,
        },
    });

    const res = await parallelUploads3.done();
    if (!("Key" in res) || res.Key === undefined) {
        throw new Error('Upload failed')
    }

    return {
        path: res.Key,
    }
}

export const extractDigimonMedia: ExtractDigimonMedia = extractDigimonMediaFactory(axios.create(), new S3Client({}));