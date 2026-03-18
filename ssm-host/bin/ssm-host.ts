#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { SsmHostStack } from '../lib/ssm-host-stack';
import { IamStack } from '../lib/iam-stack';

const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'ap-northeast-1' };

new IamStack(app, 'IamStack', { env });
// new SsmHostStack(app, 'SsmHostStack', { env });
