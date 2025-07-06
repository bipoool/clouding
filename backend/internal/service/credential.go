package service

import (
	"clouding/backend/internal/model/credential"
	"clouding/backend/internal/repository"
	secretmanager "clouding/backend/internal/utils/secretManager"
	"context"
	"encoding/json"
	"log/slog"
)

type CredentialService interface {
	GetAllByUserId(ctx context.Context, userId string) ([]*credential.Credential, error)
	GetById(ctx context.Context, id int) (*credential.Credential, error)
	Create(ctx context.Context, cred *credential.Credential) error
	Update(ctx context.Context, cred *credential.Credential) error
	Delete(ctx context.Context, id int) error
}

type credentialService struct {
	repo           repository.CredentialRepository
	secretsManager secretmanager.SecretsManager
}

func NewCredentialService(repo repository.CredentialRepository, secretsManager secretmanager.SecretsManager) CredentialService {
	return &credentialService{repo: repo, secretsManager: secretsManager}
}

func (s *credentialService) GetAllByUserId(ctx context.Context, userId string) ([]*credential.Credential, error) {
	creds, err := s.repo.GetAllCredentials(ctx, userId)

	if err != nil {
		return nil, err
	}

	for _, cred := range creds {
		secret, err := s.secretsManager.GetSecret(getSecretNameFromCred(cred))
		if err != nil {
			return nil, err
		}
		err = json.Unmarshal([]byte(secret), &cred.Secret)
		if err != nil {
			return nil, err
		}
	}

	return creds, nil

}

func (s *credentialService) GetById(ctx context.Context, id int) (*credential.Credential, error) {
	cred, err := s.repo.GetCredential(ctx, id)
	if err != nil || cred == nil {
		return nil, err
	}
	secret, err := s.secretsManager.GetSecret(getSecretNameFromCred(cred))
	if err != nil {
		return cred, err
	}
	err = json.Unmarshal([]byte(secret), &cred.Secret)

	if err != nil {
		return cred, err
	}
	return cred, nil
}

func (s *credentialService) Create(ctx context.Context, cred *credential.Credential) error {
	if err := s.secretsManager.SetSecret(getSecretNameFromCred(cred), cred.Secret); err != nil {
		return err
	}

	 if err := s.repo.CreateCredential(ctx, cred); err != nil {
        
        _ = s.secretsManager.DeleteSecret(getSecretNameFromCred(cred))
        slog.Error("DB insert failed, secret rolled back from Vault",
            "secretName", *cred.Name,
            "error", err.Error(),
        )
        return err
    }
	return nil
}

func (s *credentialService) Update(ctx context.Context, cred *credential.Credential) error {
	if err := s.secretsManager.UpdateSecret(getSecretNameFromCred(cred), cred.Secret); err != nil {
		return err
	}
	return s.repo.UpdateCredential(ctx, cred)
}

func (s *credentialService) Delete(ctx context.Context, id int) error {
	cred, err := s.repo.GetCredential(ctx, id)
	if err != nil {
		return err
	}

	secretJson, err := s.secretsManager.GetSecret(getSecretNameFromCred(cred))
	if err != nil {
		return err
	}

	if err := s.secretsManager.DeleteSecret(getSecretNameFromCred(cred)); err != nil {
		return err
	}

	if err := s.repo.DeleteCredential(ctx, id); err != nil {
		var secretData map[string]interface{}
		_ = json.Unmarshal([]byte(secretJson), &secretData)
		_ = s.secretsManager.SetSecret(*cred.Name, secretData)

		slog.Error("DB delete failed, secret rollback attempted",
			"secretName", *cred.Name,
			"error", err.Error(),
		)
		return err
	}

	return nil
}

func getSecretNameFromCred(cred *credential.Credential) string {
	return *cred.Name + "-" + *cred.UserID
}
