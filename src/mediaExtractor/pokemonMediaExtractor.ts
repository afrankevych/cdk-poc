import {S3Client} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";
import axios, {AxiosInstance} from "axios";

export const extractPokemonMediaFactory = (httpClient: AxiosInstance, storageClient: S3Client): ExtractPokemonMedia => async (pokemon: Pokemon, bucket: string): Promise<Media> => {
    const apiResponse = await httpClient.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
    const spritePath = apiResponse.data.sprites.other['official-artwork'].front_default;
    const spriteResponse = await httpClient.get(spritePath, {responseType: 'stream'});

    const parallelUploads3 = new Upload({
        client: storageClient,
        params: {
            Bucket: bucket,
            Key: `pokemon/${pokemon.name}.png`,
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

export const extractPokemonMedia: ExtractPokemonMedia = extractPokemonMediaFactory(axios.create(), new S3Client({}));