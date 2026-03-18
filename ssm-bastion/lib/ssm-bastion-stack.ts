import * as cdk from 'aws-cdk-lib/core';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';
import { join } from 'path';

export class SsmBastionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

    const ami = ec2.MachineImage.lookup({
      name: 'debian-13-*',
      owners: ['136693071363'],
    });

    const sg = new ec2.SecurityGroup(this, 'Sg', { vpc });
    // 警告: SSHポート22番がインターネット全体 (0.0.0.0/0) に公開されています。
    // これはデモ用途のみを想定しています。本番環境では特定のIPに制限するか、
    // SSM Session Managerを利用してこのルール自体を削除してください。
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.SSH);

    const userData = ec2.UserData.forLinux();
    userData.addCommands(readFileSync(join(__dirname, 'userdata.sh'), 'utf-8'));

    const role = new iam.Role(this, 'Role', {
      roleName: 'SSMBastionRole',
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')],
    });

    const instance = new ec2.Instance(this, 'Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ami,
      securityGroup: sg,
      // cdk.json の context.keyPairName に使用するキーペア名を設定してください。
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'KeyPair', this.node.tryGetContext('keyPairName')),
      userData,
      role,
    });

    // クロスアカウントのSSM踏み台として使用する場合、接続先アカウントに
    // CrossAccountSSMRole という名前のIAMロールを作成し、このインスタンスの
    // ロールARNからのAssumeRoleを許可してください。
    instance.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: ['arn:aws:iam::*:role/CrossAccountSSMRole'],
    }));

    new cdk.CfnOutput(this, 'InstanceId', { value: instance.instanceId });
    new cdk.CfnOutput(this, 'PublicIp', { value: instance.instancePublicIp });
  }
}
