import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'

export class CdkPocStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const mockHandler = new lambda.Function(this, 'mock-handler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('dist/lambda'),
            handler: 'mock-handler.handler'
        });

        new apigw.LambdaRestApi(this, 'mock-gateway', {
            handler: mockHandler
        })
    }
}
