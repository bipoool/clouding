package service

import (
	"clouding/backend/internal/model/deployment"
	"clouding/backend/internal/queue"
	"clouding/backend/internal/repository"
	"context"
	"encoding/json"
	"errors"
	"log"
)

type DeploymentService interface {
	CreateDeployment(ctx context.Context, d *deployment.Deployment) error
	UpdateStatus(ctx context.Context, id string, status deployment.DeploymentStatus) error
	GetByID(ctx context.Context, id string) (*deployment.Deployment, error)
	GetByUserAndType(ctx context.Context, userId string, dType string) ([]*deployment.Deployment, error)
}

type deploymentService struct {
	repo      repository.DeploymentRepository
	publisher *queue.Publisher
}

func NewDeploymentService(r repository.DeploymentRepository, publisher *queue.Publisher) DeploymentService {
	return &deploymentService{repo: r, publisher: publisher}
}

func (s *deploymentService) CreateDeployment(ctx context.Context, d *deployment.Deployment) error {
	existing, err := s.repo.GetByID(ctx, d.ID)
	if err == nil && existing != nil {
		log.Println(" Deployment already exists. Skipping creation.")
		return nil
	}

	if err := s.repo.Create(ctx, d); err != nil {
		return err
	}

	groupHostIDs, err := s.repo.GetHostIDsByGroupID(ctx, d.HostGroupID)
	if err != nil {
		log.Printf(" Failed to fetch host group IDs: %v", err)
		return err
	}

	mergedHostIDs := append([]int{d.HostID}, groupHostIDs...)
	unique := map[int]struct{}{}
	for _, id := range mergedHostIDs {
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
		log.Printf("Failed to marshal message: %v", err)
		return err
	}

	if s.publisher == nil {
		return errors.New("publisher not initialized")
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
