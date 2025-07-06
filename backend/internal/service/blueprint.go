package service

import (
	"clouding/backend/internal/model/blueprint"
	"clouding/backend/internal/repository"
	"context"
	"fmt"
)

type BlueprintService interface {
	GetByID(ctx context.Context, id int) (*blueprint.Blueprint, error)
	GetAllByUserID(ctx context.Context, userId string) ([]*blueprint.Blueprint, error)
	Create(ctx context.Context, bp *blueprint.Blueprint, components []*blueprint.BlueprintComponent) error
	GetComponentsByBlueprintID(ctx context.Context, blueprintId int) ([]*blueprint.BlueprintComponent, error)
}

type blueprintService struct {
	blueprintRepo repository.BlueprintRepository
	componentRepo repository.ComponentRepository
}

func NewBlueprintService(blueprintRepo repository.BlueprintRepository, componentRepo repository.ComponentRepository) BlueprintService {
	return &blueprintService{blueprintRepo: blueprintRepo, componentRepo: componentRepo}
}

func (s *blueprintService) GetByID(ctx context.Context, id int) (*blueprint.Blueprint, error) {
	return s.blueprintRepo.GetBlueprint(ctx, id)
}

func (s *blueprintService) GetAllByUserID(ctx context.Context, userId string) ([]*blueprint.Blueprint, error) {
	return s.blueprintRepo.GetAllBlueprints(ctx, userId)
}

func (s *blueprintService) Create(ctx context.Context, bp *blueprint.Blueprint, components []*blueprint.BlueprintComponent) error {
	// Validate parameters for each component
	for _, comp := range components {
		if comp.ComponentID == nil {
			return fmt.Errorf("componentId is required for each blueprint component")
		}
		componentModel, err := s.componentRepo.GetComponent(ctx, *comp.ComponentID)
		if err != nil {
			return fmt.Errorf("failed to fetch component: %w", err)
		}
		err = blueprint.ValidateBlueprintParametersUsingComponentParameters(comp.Parameters, componentModel.Parameters)
		if err != nil {
			return fmt.Errorf("parameter validation failed for componentId %d: %w", *comp.ComponentID, err)
		}
	}
	// Create blueprint
	return s.blueprintRepo.CreateBlueprint(ctx, bp, components)
}

func (s *blueprintService) GetComponentsByBlueprintID(ctx context.Context, blueprintId int) ([]*blueprint.BlueprintComponent, error) {
	return s.blueprintRepo.GetComponentsByBlueprintID(ctx, blueprintId)
}
