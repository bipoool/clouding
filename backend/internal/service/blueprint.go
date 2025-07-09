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
	GetComponentsByBlueprintID(ctx context.Context, blueprintId int) ([]*blueprint.BlueprintComponent, error)
	Create(ctx context.Context, bp *blueprint.Blueprint) error
	Update(ctx context.Context, bp *blueprint.Blueprint) error
	UpdateBlueprintComponents(ctx context.Context, blueprintId int, components []*blueprint.BlueprintComponent) error
	Delete(ctx context.Context, id int) error
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

func (s *blueprintService) GetComponentsByBlueprintID(ctx context.Context, blueprintId int) ([]*blueprint.BlueprintComponent, error) {
	return s.blueprintRepo.GetComponentsByBlueprintID(ctx, blueprintId)
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

	// Validate parameters for each component
	for i := range components {
		existingComp := existingComps[i]
		comp := components[i]
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
