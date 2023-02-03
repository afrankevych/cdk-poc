import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'

export class CdkPocStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const mockHandler = new lambda.Function(this, 'mockHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('dist'),
            handler: 'index.mockHandler'
        });

        new apigw.LambdaRestApi(this, 'mock-gateway', {
            handler: mockHandler
        })
    }
}
