import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as S3 } from 'aws-cdk-lib';

export class CdkPocStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    new S3.Bucket(this, 'CDKPOCBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
  }
}
