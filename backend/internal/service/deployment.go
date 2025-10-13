package service

import (
	"clouding/backend/internal/model/deployment"
	"clouding/backend/internal/queue"
	"clouding/backend/internal/repository"
	"context"
	"encoding/json"
	"fmt"
)

type DeploymentService interface {
	Create(ctx context.Context, d *deployment.Deployment) error
	UpdateStatus(ctx context.Context, id string, updateDeploymentStatusPayload *deployment.UpdateDeploymentStatusPayload) error
	GetByID(ctx context.Context, id string) (*deployment.Deployment, error)
	GetByUserAndType(ctx context.Context, userId string, dType string) ([]*deployment.Deployment, error)
	GetDeploymentHostMappingByIds(ctx context.Context, ids []string) ([]*deployment.DeploymentHostMapping, error)
}

type deploymentService struct {
	repo      repository.DeploymentRepository
	publisher *queue.Publisher
}

func NewDeploymentService(r repository.DeploymentRepository, publisher *queue.Publisher) DeploymentService {
	return &deploymentService{repo: r, publisher: publisher}
}

func (s *deploymentService) Create(ctx context.Context, d *deployment.Deployment) error {

	// Validation Could be done with query only
	existingDeployments, _ := s.repo.GetByBlueprintID(ctx, *d.BlueprintID, 5)
	for _, d := range existingDeployments {
		if d.Status == deployment.StatusPending || d.Status == deployment.StatusStarted {
			return fmt.Errorf("blueprint already in deployment, skipping creation")
		}
	}

	existing, err := s.repo.GetByID(ctx, *d.ID)
	if err == nil && existing != nil {
		return fmt.Errorf("deployment already exists, skipping creation")
	}

	if err := s.repo.Create(ctx, d); err != nil {
		return err
	}

	unique := map[int]struct{}{}
	for _, id := range d.HostIDs {
		unique[id] = struct{}{}
	}

	dedupedHostIDs := make([]int, 0, len(unique))
	for id := range unique {
		dedupedHostIDs = append(dedupedHostIDs, id)
	}

	msgPayload := deployment.DeploymentMessage{
		JobID:       d.ID,
		UserID:      d.UserID,
		HostIDs:     dedupedHostIDs,
		BlueprintID: d.BlueprintID,
		Type:        d.Type,
		CreatedAt:   d.CreatedAt,
	}

	msg, err := json.Marshal(msgPayload)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %v", err)
	}

	if err := s.publisher.Publish(msg); err != nil {
		return fmt.Errorf("failed to publish job: %v", err)
	}

	return nil
}

func (s *deploymentService) UpdateStatus(ctx context.Context, id string, updateDeploymentStatusPayload *deployment.UpdateDeploymentStatusPayload) error {
	return s.repo.UpdateStatus(ctx, id, updateDeploymentStatusPayload)
}

func (s *deploymentService) GetByID(ctx context.Context, id string) (*deployment.Deployment, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *deploymentService) GetByUserAndType(ctx context.Context, userId string, dType string) ([]*deployment.Deployment, error) {
	return s.repo.GetByUserAndType(ctx, userId, dType)
}

func (s *deploymentService) GetDeploymentHostMappingByIds(ctx context.Context, ids []string) ([]*deployment.DeploymentHostMapping, error) {
	return s.repo.GetDeploymentHostMappingByIds(ctx, ids)
}
