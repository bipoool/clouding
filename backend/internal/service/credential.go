package service

import (
	"clouding/backend/internal/model/credential"
	"clouding/backend/internal/repository"
	"context"
)

type CredentialService interface {
	GetAllByUserId(ctx context.Context, userId string) ([]*credential.Credential, error)
	GetById(ctx context.Context, id int) (*credential.Credential, error)
	Create(ctx context.Context, cred *credential.Credential) error
	Update(ctx context.Context, cred *credential.Credential) error
	Delete(ctx context.Context, id int) error
}

type credentialService struct {
	repo repository.CredentialRepository
}

func NewCredentialService(repo repository.CredentialRepository) CredentialService {
	return &credentialService{repo: repo}
}

func (s *credentialService) GetAllByUserId(ctx context.Context, userId string) ([]*credential.Credential, error) {
	return s.repo.GetAllCredentials(ctx, userId)

}

func (s *credentialService) GetById(ctx context.Context, id int) (*credential.Credential, error) {
	return s.repo.GetCredential(ctx, id)
}

func (s *credentialService) Create(ctx context.Context, cred *credential.Credential) error {
	return s.repo.CreateCredential(ctx, cred)

}

func (s *credentialService) Update(ctx context.Context, cred *credential.Credential) error {
	return s.repo.UpdateCredential(ctx, cred)
}

func (s *credentialService) Delete(ctx context.Context, id int) error {
	return s.repo.DeleteCredential(ctx, id)
}
