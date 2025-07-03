package service

import (
	hostgroup "clouding/backend/internal/model/hostGroup"
	"clouding/backend/internal/repository"
	"context"
)

type HostGroupService interface {
	GetHostGroupByID(ctx context.Context, id int) (*hostgroup.HostGroup, error)
	GetAllHostGroups(ctx context.Context, userId int) ([]*hostgroup.HostGroup, error)
	CreateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error
	UpdateHostGroup(ctx context.Context, h *hostgroup.HostGroup, groupID int) error
	AddHostsToGroup(ctx context.Context, groupID int, newHosts []int) error
	RemoveHostFromGroup(ctx context.Context, groupID int, hostID int) error
	DeleteHostGroup(ctx context.Context, id int) error
}
type hostGroupService struct {
	repo repository.HostGroupRepository
}

func NewHostGroupService(repo repository.HostGroupRepository) HostGroupService {
	return &hostGroupService{
		repo: repo,
	}
}

func (s *hostGroupService) GetHostGroupByID(ctx context.Context, id int) (*hostgroup.HostGroup, error) {
	return s.repo.GetHostGroupByID(ctx, id)
}

func (s *hostGroupService) GetAllHostGroups(ctx context.Context, userId int) ([]*hostgroup.HostGroup, error) {
	return s.repo.GetAllHostGroups(ctx, userId)
}

func (s *hostGroupService) CreateHostGroup(ctx context.Context, h *hostgroup.HostGroup) error {
	return s.repo.CreateHostGroup(ctx, h)
}

func (s *hostGroupService) UpdateHostGroup(ctx context.Context, h *hostgroup.HostGroup, groupID int) error {
	return s.repo.UpdateHostGroup(ctx, h, groupID)
}

func (s *hostGroupService) AddHostsToGroup(ctx context.Context, groupID int, newHosts []int) error {
	return s.repo.AddHostsToGroup(ctx, groupID, newHosts)
}

func (s *hostGroupService) RemoveHostFromGroup(ctx context.Context, groupID int, hostID int) error {
	return s.repo.RemoveHostFromGroup(ctx, groupID, hostID)
}

func (s *hostGroupService) DeleteHostGroup(ctx context.Context, id int) error {
	return s.repo.DeleteHostGroup(ctx, id)
}