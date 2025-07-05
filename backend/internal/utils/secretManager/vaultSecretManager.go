package secretmanager

import (
	"clouding/backend/internal/config"
	"encoding/json"
	"fmt"
	"log/slog"

	vault "github.com/hashicorp/vault/api"
)

type VaultSecretsManager struct {
	client *vault.Client
	path   string
}

func NewVaultSecretManager() SecretsManager {
	vaultConfig := vault.DefaultConfig()
	client, err := vault.NewClient(vaultConfig)
	if err != nil {
		slog.Error("Failed to create Vault client")
		panic(err)
	}

	return &VaultSecretsManager{
		client: client,
		path:   config.Config.Vault.VaultSecretEnginePath,
	}
}

func (v *VaultSecretsManager) GetSecret(secretName string) (string, error) {
	fullPath := v.path + secretName
	secret, err := v.client.Logical().Read(fullPath)
	if err != nil {
		return "", err
	}
	if secret == nil || secret.Data == nil || secret.Data["data"] == nil {
		return "", fmt.Errorf("secret not found %s", secretName)
	}
	jsonData, err := json.Marshal(getVaultData(secret.Data))
	if err != nil {
		return "", err
	}
	return string(jsonData), nil
}

func (v *VaultSecretsManager) SetSecret(secretName string, secretMap map[string]interface{}) error {
	fullPath := v.path + secretName
	_, err := v.client.Logical().Write(fullPath, createVaultData(secretMap))
	return err
}

func (v *VaultSecretsManager) UpdateSecret(secretName string, secretMap map[string]interface{}) error {
	return v.SetSecret(secretName, secretMap)
}

func (v *VaultSecretsManager) DeleteSecret(secretName string) error {
	fullPath := v.path + secretName
	_, err := v.client.Logical().Delete(fullPath)
	return err
}

func createVaultData(m map[string]interface{}) map[string]interface{} {
	return map[string]interface{}{
		"data": m,
	}
}

func getVaultData(m map[string]interface{}) map[string]interface{} {
	return m["data"].(map[string]interface{})
}
