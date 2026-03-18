# ssm-bastion

SSM Session Manager 経由でクロスアカウントの EC2 インスタンスに接続するための踏み台サーバーを構築する CDK スタックです。

## デプロイ

```bash
npx cdk deploy
```

## コンテキストパラメータ

デフォルト値は `cdk.json` の `context` に定義されています。デプロイ時に `--context` で上書きできます。

| キー | 説明 | デフォルト |
|------|------|-----------|
| `keyPairName` | EC2 に使用するキーペア名 | `fukuyama` |

例：
```bash
npx cdk deploy --context keyPairName=my-keypair
```

## 主なコマンド

* `npm run build`   TypeScript をコンパイル
* `npm run watch`   変更を監視してコンパイル
* `npx cdk deploy`  スタックをデプロイ
* `npx cdk diff`    デプロイ済みスタックとの差分を確認
* `npx cdk synth`   CloudFormation テンプレートを出力
