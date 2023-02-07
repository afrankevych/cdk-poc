import {RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

export class CdkPocStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, 'AnimeCreaturesMediaStorage', {
            removalPolicy: RemovalPolicy.DESTROY,
            publicReadAccess: true,
        });

        const extractPokemonMediaHandler = new lambda.Function(this, 'extractPokemonMediaHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('dist'),
            handler: 'index.extractPokemonMediaHandler',
            environment: {
                S3_BUCKET: bucket.bucketName,
                S3_BUCKET_DOMAIN: bucket.bucketDomainName,
            }
        });

        const extractDigimonMediaHandler = new lambda.Function(this, 'extractDigimonMediaHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('dist'),
            handler: 'index.extractDigimonMediaHandler',
            environment: {
                S3_BUCKET: bucket.bucketName,
                S3_BUCKET_DOMAIN: bucket.bucketDomainName,
            }
        });

        bucket.grantPut(extractPokemonMediaHandler);
        bucket.grantPut(extractDigimonMediaHandler);

        const extractPokemonMediaTask = new tasks.LambdaInvoke(this, 'extractPokemonMediaTask', {
            lambdaFunction: extractPokemonMediaHandler,
        });
        const extractDigimonMediaTask = new tasks.LambdaInvoke(this, 'extractDigimonMediaTask', {
            lambdaFunction: extractDigimonMediaHandler,
        });
        const publishMediaExtractedEventTask = new sfn.Pass(this, 'publishMediaExtractedEventTask');

        const choice = new sfn.Choice(this, 'CreatureTypeChoice')
            .when(sfn.Condition.stringEquals('$.creatureType', 'pokemon'), extractPokemonMediaTask.next(publishMediaExtractedEventTask))
            .when(sfn.Condition.stringEquals('$.creatureType', 'digimon'), extractDigimonMediaTask.next(publishMediaExtractedEventTask))
            .otherwise(publishMediaExtractedEventTask)

        new sfn.StateMachine(this, 'AnimeCreatureMediaExtractionStateMachine', {
            definition: choice,
        });
    }
}
