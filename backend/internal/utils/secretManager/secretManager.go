package secretmanager

type SecretsManager interface {
	GetSecret(secretName string) (string, error)
	SetSecret(secretName string, secretMap map[string]interface{}) error
	UpdateSecret(secretName string, secretMap map[string]interface{}) error
	DeleteSecret(secretName string) error
}

func NewSecretManager() SecretsManager {
	return NewVaultSecretManager()
}
