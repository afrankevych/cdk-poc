import * as events from 'aws-cdk-lib/aws-events';
import * as eventsTarget from "aws-cdk-lib/aws-events-targets";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
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
                detailType: 'MediaExtractionCompleted',
                source: stateMachineId,
            }],
        });
        const animeCreatureTypeChoice = new sfn.Choice(this, 'CreatureTypeChoice')
            .when(sfn.Condition.stringEquals('$.detail.data.type', 'pokemon'), extractPokemonMediaTask.next(publishMediaExtractedEventTask))
            .when(sfn.Condition.stringEquals('$.detail.data.type', 'digimon'), extractDigimonMediaTask.next(publishMediaExtractedEventTask))
            .otherwise(publishMediaExtractedEventTask)

        const animeCreatureMediaExtractionStateMachine = new sfn.StateMachine(this, stateMachineId, {
            definition: animeCreatureTypeChoice,
        });

        const animeCreatureMediaExtractedLogGroup = new logs.LogGroup(this, 'animeCreatureMediaExtractedLogGroup', {
            retention: logs.RetentionDays.ONE_WEEK,
            removalPolicy: RemovalPolicy.DESTROY
        })

        new events.Rule(this, "startAnimeCreatureMediaExtraction", {
            eventBus: eventBus,
            targets: [
                new eventsTarget.SfnStateMachine(animeCreatureMediaExtractionStateMachine),
            ],
            eventPattern: {
                detailType: ['MediaExtractionRequested'],
            },
        });

        new events.Rule(this, 'MediaExtractionCompleted', {
            eventBus: eventBus,
            targets: [
                new eventsTarget.CloudWatchLogGroup(animeCreatureMediaExtractedLogGroup)
            ],
            eventPattern: {
                detailType: ['MediaExtractionCompleted']
            }
        })
    }
}
