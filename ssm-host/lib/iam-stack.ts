import * as cdk from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class IamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bastionAccountId = this.node.tryGetContext('bastionAccountId');
    if (!bastionAccountId) throw new Error('Context value "bastionAccountId" is required');

    const crossAccountRole = new iam.Role(this, 'CrossAccountSSMRole', {
      roleName: 'CrossAccountSSMRole',
      assumedBy: new iam.ArnPrincipal(`arn:aws:iam::${bastionAccountId}:role/SSMBastionRole`),
      // managedPolicies: [
      //   iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMFullAccess'), // 過剰権限のため最小権限ポリシーに変更
      // ],
    });

    crossAccountRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ssm:StartSession',
        'ssm:TerminateSession',
        'ssm:DescribeSessions',
        'ssm:GetConnectionStatus',
        'ssm:DescribeInstanceProperties',
        'ec2:DescribeInstances',
        'cloudformation:DescribeStackResources',
      ],
      resources: ['*'],
    }));
  }
}
