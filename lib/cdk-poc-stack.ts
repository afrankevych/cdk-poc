import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import {Construct} from 'constructs';
import {Duration, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';

export class CdkPocStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, 'AnimeCreaturesMediaStorage', {
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const extractPokemonMediaHandler = new lambda.Function(this, 'extractPokemonMediaHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('dist'),
            handler: 'index.extractPokemonMediaHandler',
            environment: {
                S3_BUCKET: bucket.bucketName,
            }
        });

        const extractDigimonMediaHandler = new lambda.Function(this, 'extractDigimonMediaHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('dist'),
            handler: 'index.extractDigimonMediaHandler',
            environment: {
                S3_BUCKET: bucket.bucketName,
            }
        });

        bucket.grantPut(extractPokemonMediaHandler);
        bucket.grantPut(extractDigimonMediaHandler);

        const eventBus = new events.EventBus(this, 'EventBus', {
            eventBusName: 'CDKPOCEventBus',
        });
        eventBus.archive('CDKPOCEventBusArchive', {
            eventPattern: {},
            retention: Duration.days(7),
        });

        const stateMachineId = 'AnimeCreatureMediaExtractionStateMachine';
        const extractPokemonMediaTask = new tasks.LambdaInvoke(this, 'extractPokemonMediaTask', {
            lambdaFunction: extractPokemonMediaHandler,
        });
        const extractDigimonMediaTask = new tasks.LambdaInvoke(this, 'extractDigimonMediaTask', {
            lambdaFunction: extractDigimonMediaHandler,
        });
        const publishMediaExtractedEventTask = new tasks.EventBridgePutEvents(this, 'Send an event to EventBridge', {
            entries: [{
                detail: sfn.TaskInput.fromJsonPathAt('$.Payload'),
                eventBus: eventBus,
                detailType: 'MediaExtractedEvent',
                source: 'AnimeCreatureMediaExtractionStateMachine',
            }],
        });
        const choice = new sfn.Choice(this, 'CreatureTypeChoice')
            .when(sfn.Condition.stringEquals('$.data.type', 'pokemon'), extractPokemonMediaTask.next(publishMediaExtractedEventTask))
            .when(sfn.Condition.stringEquals('$.data.type', 'digimon'), extractDigimonMediaTask.next(publishMediaExtractedEventTask))
            .otherwise(publishMediaExtractedEventTask)

        new sfn.StateMachine(this, stateMachineId, {
            definition: choice,
        });
    }
}
