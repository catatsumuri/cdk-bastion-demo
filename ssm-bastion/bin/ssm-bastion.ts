#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { SsmBastionStack } from '../lib/ssm-bastion-stack';

const app = new cdk.App();
new SsmBastionStack(app, 'SsmBastionStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'ap-northeast-1' },
});
