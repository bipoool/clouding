package vaultSecretManager

import (
	"encoding/json"
	"fmt"
	"log"

	vault "github.com/hashicorp/vault/api"
)

type SecretsManager interface {
	GetSecret(secretName string) (string, error)
	SetSecret(secretName string, secretMap map[string]interface{}) error
	UpdateSecret(secretName string, secretMap map[string]interface{}) error
	DeleteSecret(secretName string) error
}

type VaultSecretsManager struct {
	client *vault.Client
	path   string
}

func NewSecretManager() SecretsManager {
	config := vault.DefaultConfig() 
	client, err := vault.NewClient(config)
	if err != nil {
		log.Fatalf("Failed to create Vault client: %v", err)
	}

	
	return &VaultSecretsManager{
		client: client,
		path:   "secret/data/", 
	}
}

func (v *VaultSecretsManager) GetSecret(secretName string) (string, error) {
	fullPath := v.path + secretName
	secret, err := v.client.Logical().Read(fullPath)
	if err != nil {
		return "", err
	}
	if secret == nil || secret.Data["data"] == nil {
		return "", fmt.Errorf("no secret found at path: %s", fullPath)
	}
	data, ok := secret.Data["data"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid secret data format at path: %s", fullPath)
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	return string(jsonData), nil
}

func (v *VaultSecretsManager) SetSecret(secretName string, secretMap map[string]interface{}) error {
	fullPath := v.path + secretName
	_, err := v.client.Logical().Write(fullPath, map[string]interface{}{
		"data": secretMap,
	})
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
