package utils

import (
	"context"
	"log/slog"

	"github.com/aws/aws-sdk-go-v2/config"
	awsSecretManagerCore "github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

type SecretsManager interface {
	GetSecret(secretName string) (string, error)
	SetSecret(secretName string, secret string) error
}

type AwsSecretsManager struct {
	secretsmanagerClient *awsSecretManagerCore.Client
}

func NewSecretManager() (SecretsManager, error) {
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		slog.Error("Error creating secrets manager")
		panic(err)
	}
	smClient := awsSecretManagerCore.NewFromConfig(cfg)
	return &AwsSecretsManager{
		secretsmanagerClient: smClient,
	}, nil
}

func (aws *AwsSecretsManager) GetSecret(secretName string) (string, error) {
	secretOutput, err := aws.secretsmanagerClient.GetSecretValue(context.Background(), &awsSecretManagerCore.GetSecretValueInput{
		SecretId: &secretName,
	})
	if err != nil {
		return "", err
	}
	return *secretOutput.SecretString, nil
}

func (aws *AwsSecretsManager) SetSecret(secretName string, secret string) error {
	_, err := aws.secretsmanagerClient.CreateSecret(context.Background(), &awsSecretManagerCore.CreateSecretInput{
		Name:         &secretName,
		SecretString: &secret,
	})

	if err != nil {
		return err
	}
	return nil
}
