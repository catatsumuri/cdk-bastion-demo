import * as cdk from 'aws-cdk-lib/core';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

// SSM Session Manager 経由でアクセスできる EC2 インスタンスを作成するスタック
export class SsmHostStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // デフォルト VPC を参照（既存リソースをルックアップ）
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

    // Debian 13 (amd64) の最新 AMI を名前パターンで検索
    // オーナー ID は Debian 公式アカウント
    const ami = ec2.MachineImage.lookup({
      name: 'debian-13-amd64-*',
      owners: ['136693071363'],
    });

    // EC2 インスタンス用 IAM ロール
    // AmazonSSMManagedInstanceCore を付与して SSM エージェント通信を許可
    const role = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // t3.micro インスタンスを作成（SSH キーなし、SSM 経由のみでアクセス）
    const instance = new ec2.Instance(this, 'Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ami,
      role,
    });

    // タグを付与（クロスアカウント SSM アクセス制御のポリシー条件に利用）
    cdk.Tags.of(instance).add('host', 'ssm-host');
    cdk.Tags.of(instance).add('ssm-access', 'on');

    // UserData で SSM エージェントをインストール・起動
    // Debian 13 はデフォルトで SSM エージェントを含まないため手動セットアップが必要
    instance.addUserData(
      'curl -o /tmp/ssm-agent.deb https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_amd64/amazon-ssm-agent.deb',
      'dpkg -i /tmp/ssm-agent.deb',
      'systemctl enable amazon-ssm-agent',
      'systemctl start amazon-ssm-agent',
    );

    // インスタンス ID を出力（SSM セッション開始時に使用）
    new cdk.CfnOutput(this, 'InstanceId', { value: instance.instanceId });
    // new cdk.CfnOutput(this, 'PublicIp', { value: instance.instancePublicIp });
  }
}
