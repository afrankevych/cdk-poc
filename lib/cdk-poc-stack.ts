import * as cdk from 'aws-cdk-lib';
import {RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class CdkPocStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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

        new apigw.LambdaRestApi(this, 'extractPokemonMediaGateway', {
            handler: extractPokemonMediaHandler
        });

        bucket.grantPut(extractPokemonMediaHandler);
    }
}
