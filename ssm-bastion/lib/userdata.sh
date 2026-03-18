#!/bin/bash

# SSM AgentとSession Managerプラグインをインストールして起動する
curl -o /tmp/amazon-ssm-agent.deb https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_amd64/amazon-ssm-agent.deb
curl -o /tmp/session-manager-plugin.deb https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb
dpkg -i /tmp/amazon-ssm-agent.deb
dpkg -i /tmp/session-manager-plugin.deb
rm /tmp/amazon-ssm-agent.deb /tmp/session-manager-plugin.deb
systemctl enable --now amazon-ssm-agent

# UID 1000のユーザー（デフォルトユーザー）のホームディレクトリを取得する
TARGET_USER=$(getent passwd 1000 | cut -d: -f1)
TARGET_HOME=$(getent passwd 1000 | cut -d: -f6)

# クロスアカウント用のAWSプロファイルのテンプレートを配置する
# role_arnを接続先アカウントのCrossAccountSSMRoleのARNに書き換えて使用する
mkdir -p "${TARGET_HOME}/.aws"
cat <<'EOF' > "${TARGET_HOME}/.aws/config"
# [profile ssm-cross]
# role_arn = arn:aws:iam::9xxx:role/CrossAccountSSMRole
# credential_source = Ec2InstanceMetadata
# region = ap-northeast-1
# role_session_name = ssm-session
EOF

# SSH ProxyCommandの設定を配置する
# i-* / mi-* 宛のSSH接続をSSM Session Manager経由でトンネルする
mkdir -p "${TARGET_HOME}/.ssh"
cat <<'EOF' > "${TARGET_HOME}/.ssh/config"
Host i-* mi-*
    ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p' --region ap-northeast-1 --profile ssm-cross"
EOF
chmod 600 "${TARGET_HOME}/.ssh/config"
chown -R "${TARGET_USER}:${TARGET_USER}" "${TARGET_HOME}/.aws" "${TARGET_HOME}/.ssh"
