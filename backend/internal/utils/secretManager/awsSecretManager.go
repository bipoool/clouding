package secretmanager

import (
	"context"
	"encoding/json"
	"log/slog"

	"github.com/aws/aws-sdk-go-v2/config"
	awsSecretManagerCore "github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

type AwsSecretsManager struct {
	secretsmanagerClient *awsSecretManagerCore.Client
}

func NewAwsSecretManager() SecretsManager {
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		slog.Error("Error creating secrets manager")
		panic(err)
	}
	// proactively resolve credentials
	_, err = cfg.Credentials.Retrieve(context.TODO())
	if err != nil {
		slog.Error("Unable to retrieve AWS credentials")
		panic(err)
	}
	smClient := awsSecretManagerCore.NewFromConfig(cfg)
	return &AwsSecretsManager{
		secretsmanagerClient: smClient,
	}
}

func (aws *AwsSecretsManager) GetSecret(secretName string) (string, error) {
	getSecretInput := &awsSecretManagerCore.GetSecretValueInput{
		SecretId: &secretName,
	}
	secretOutput, err := aws.secretsmanagerClient.GetSecretValue(context.Background(), getSecretInput)
	if err != nil {
		return "", err
	}
	return *secretOutput.SecretString, nil
}

func (aws *AwsSecretsManager) SetSecret(secretName string, secretMap map[string]interface{}) error {

	secret, err := json.Marshal(secretMap)
	if err != nil {
		return err
	}

	secretStr := string(secret)
	setSecretInput := &awsSecretManagerCore.CreateSecretInput{
		Name:         &secretName,
		SecretString: &secretStr,
	}
	_, err = aws.secretsmanagerClient.CreateSecret(context.Background(), setSecretInput)

	if err != nil {
		return err
	}
	return nil
}

func (aws *AwsSecretsManager) DeleteSecret(secretName string) error {
	// Force deleting the cred
	forceDelete := true
	deleteSecretInput := &awsSecretManagerCore.DeleteSecretInput{
		SecretId:                   &secretName,
		ForceDeleteWithoutRecovery: &forceDelete,
	}
	_, err := aws.secretsmanagerClient.DeleteSecret(context.Background(), deleteSecretInput)
	return err
}

func (aws *AwsSecretsManager) UpdateSecret(secretName string, secretMap map[string]interface{}) error {
	secret, err := json.Marshal(secretMap)
	if err != nil {
		return err
	}
	secretStr := string(secret)
	updateSecretInput := &awsSecretManagerCore.UpdateSecretInput{
		SecretId:     &secretName,
		SecretString: &secretStr,
	}
	_, err = aws.secretsmanagerClient.UpdateSecret(context.Background(), updateSecretInput)
	return err
}
