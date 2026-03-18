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
| `keyPairName` | EC2 に使用するキーペア名 | `YOUR_KEY_PAIR_HERE`を書き換える |

上書きする例：
```bash
npx cdk deploy --context keyPairName=my-keypair
```
