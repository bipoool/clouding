package service

import (
	"clouding/backend/internal/model/credential"
	"clouding/backend/internal/repository"
	utils "clouding/backend/internal/utils/vaultSecretManager"
	"context"
	"encoding/json"
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
	secretsManager utils.SecretsManager
}

func NewCredentialService(repo repository.CredentialRepository, secretsManager utils.SecretsManager) CredentialService {
	return &credentialService{repo: repo, secretsManager: secretsManager}
}

func (s *credentialService) GetAllByUserId(ctx context.Context, userId string) ([]*credential.Credential, error) {
	creds, err := s.repo.GetAllCredentials(ctx, userId)

	if err != nil {
		return nil, err
	}

	for _, cred := range creds {
		secret, err := s.secretsManager.GetSecret(*cred.Name)
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
	secret, err := s.secretsManager.GetSecret(*cred.Name)
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
	converted := make(map[string]interface{})
	for k, v := range cred.Secret {
		converted[k] = v
	}

	if err := s.secretsManager.SetSecret(*cred.Name, converted); err != nil {
		return err
	}
	return s.repo.CreateCredential(ctx, cred)
}

func (s *credentialService) Update(ctx context.Context, cred *credential.Credential) error {
	converted := make(map[string]interface{})
	for k, v := range cred.Secret {
		converted[k] = v
	}
	if err := s.secretsManager.UpdateSecret(*cred.Name, converted); err != nil {
		return err
	}
	return s.repo.UpdateCredential(ctx, cred)
}

func (s *credentialService) Delete(ctx context.Context, id int) error {
	cred, err := s.repo.GetCredential(ctx, id)
	if err != nil {
		return err
	}
	err = s.secretsManager.DeleteSecret(*cred.Name)
	if err != nil {
		return err
	}
	return s.repo.DeleteCredential(ctx, id)
}
