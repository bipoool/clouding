package service

import (
	"clouding/backend/internal/model/blueprint"
	"clouding/backend/internal/model/component"
	"clouding/backend/internal/model/deployment"
	"clouding/backend/internal/repository"
	"context"
	"fmt"
)

type BlueprintService interface {
	GetByID(ctx context.Context, id int) (*blueprint.Blueprint, error)
	GetAllByUserID(ctx context.Context, userId string) ([]*blueprint.Blueprint, error)
	GetComponentsByBlueprintID(ctx context.Context, blueprintId int) ([]*blueprint.BlueprintComponent, error)
	GetDeployments(ctx context.Context, blueprintId int, limit int) ([]*deployment.Deployment, error)
	Create(ctx context.Context, bp *blueprint.Blueprint) error
	Update(ctx context.Context, bp *blueprint.Blueprint) error
	UpdateBlueprintComponents(ctx context.Context, blueprintId int, components []*blueprint.BlueprintComponent) error
	Delete(ctx context.Context, id int) error
}

type blueprintService struct {
	blueprintRepo  repository.BlueprintRepository
	componentRepo  repository.ComponentRepository
	deploymentRepo repository.DeploymentRepository
}

func NewBlueprintService(
	blueprintRepo repository.BlueprintRepository,
	componentRepo repository.ComponentRepository,
	deploymentRepo repository.DeploymentRepository,
) BlueprintService {
	return &blueprintService{
		blueprintRepo:  blueprintRepo,
		componentRepo:  componentRepo,
		deploymentRepo: deploymentRepo,
	}
}

func (s *blueprintService) GetByID(ctx context.Context, id int) (*blueprint.Blueprint, error) {
	return s.blueprintRepo.GetBlueprint(ctx, id)
}

func (s *blueprintService) GetAllByUserID(ctx context.Context, userId string) ([]*blueprint.Blueprint, error) {
	return s.blueprintRepo.GetAllBlueprints(ctx, userId)
}

func (s *blueprintService) GetComponentsByBlueprintID(ctx context.Context, blueprintId int) ([]*blueprint.BlueprintComponent, error) {
	return s.blueprintRepo.GetComponentsByBlueprintID(ctx, blueprintId)
}

func (s *blueprintService) GetDeployments(ctx context.Context, blueprintId int, limit int) ([]*deployment.Deployment, error) {
	return s.deploymentRepo.GetByBlueprintID(ctx, blueprintId, limit)
}

func (s *blueprintService) Create(ctx context.Context, bp *blueprint.Blueprint) error {
	return s.blueprintRepo.CreateBlueprint(ctx, bp)
}

func (s *blueprintService) Update(ctx context.Context, bp *blueprint.Blueprint) error {
	return s.blueprintRepo.UpdateBlueprint(ctx, bp)
}

func (s *blueprintService) UpdateBlueprintComponents(ctx context.Context, blueprintId int, components []*blueprint.BlueprintComponent) error {
	var existingCompIds []int
	for _, comp := range components {
		if comp.ComponentID == nil {
			return fmt.Errorf("componentId is required for each blueprint component")
		}
		existingCompIds = append(existingCompIds, *comp.ComponentID)
	}

	existingComps, err := s.componentRepo.GetComponentByIds(ctx, existingCompIds)

	if err != nil {
		return err
	}
	if len(existingComps) != len(existingCompIds) {
		return fmt.Errorf("one or more components not found: expected %d, got %d", len(existingCompIds), len(existingComps))
	}

	// Create a map for efficient lookup
	existingCompsMap := make(map[int]*component.Component)
	for _, existingComp := range existingComps {
		if existingComp.ID != nil {
			existingCompsMap[*existingComp.ID] = existingComp
		}
	}

	// Validate parameters for each component
	for _, comp := range components {
		existingComp := existingCompsMap[*comp.ComponentID]
		if existingComp == nil {
			return fmt.Errorf("componentId %d not found", *comp.ComponentID)
		}
		err = blueprint.ValidateBlueprintParametersUsingComponentParameters(comp.Parameters, existingComp.Parameters)
		if err != nil {
			return fmt.Errorf("parameter validation failed for componentId %d: %w", *comp.ComponentID, err)
		}
	}

	// Update blueprint
	return s.blueprintRepo.UpdateBlueprintComponents(ctx, blueprintId, components)
}

func (s *blueprintService) Delete(ctx context.Context, id int) error {
	return s.blueprintRepo.DeleteBlueprint(ctx, id)
}
