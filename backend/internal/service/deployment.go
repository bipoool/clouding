package service

import (
	"clouding/backend/internal/model/deployment"
	"clouding/backend/internal/queue"
	"clouding/backend/internal/repository"
	"context"
	"encoding/json"
	"errors"
)

type DeploymentService interface {
	CreateDeployment(ctx context.Context, d *deployment.Deployment) error
	UpdateStatus(ctx context.Context, id string, status deployment.DeploymentStatus) error
	GetByID(ctx context.Context, id string) (*deployment.Deployment, error)
	GetByUserAndType(ctx context.Context, userId string, dType string) ([]*deployment.Deployment, error)
}

type deploymentService struct {
	repo repository.DeploymentRepository
	publisher *queue.Publisher 
}

func NewDeploymentService(r repository.DeploymentRepository, publisher *queue.Publisher) DeploymentService {
	return &deploymentService{repo: r, publisher: publisher,}
}

func (s *deploymentService) CreateDeployment(ctx context.Context, d *deployment.Deployment) error {
	existing, err := s.repo.GetByID(ctx, d.ID)
	if err == nil && existing != nil {
		return nil 
	}

	if err := s.repo.Create(ctx, d); err != nil {
		if errors.Is(err,errors.New("duplicate entry")) {
			return nil
		}
		return err
	}

	msg, err := json.Marshal(d)
	if err != nil {
		return err
	}
	if err := s.publisher.Publish(msg); err != nil {
		return err 
	}


	return nil
}

func (s *deploymentService) UpdateStatus(ctx context.Context, id string, status deployment.DeploymentStatus) error {
	return s.repo.UpdateStatus(ctx, id, status)
}

func (s *deploymentService) GetByID(ctx context.Context, id string) (*deployment.Deployment, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *deploymentService) GetByUserAndType(ctx context.Context, userId string, dType string) ([]*deployment.Deployment, error) {
	return s.repo.GetByUserAndType(ctx, userId, dType)
}
