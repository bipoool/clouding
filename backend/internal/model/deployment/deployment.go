package deployment

import "time"

type Deployment struct {
	ID          *string          `db:"id" json:"id"`
	UserID      *string          `db:"user_id" json:"userId"`
	HostIDs     []int            `db:"host_id" json:"hostIds"`
	HostGroupID *int             `db:"host_group_id" json:"hostGroupId"`
	BlueprintID *int             `db:"blueprint_id" json:"blueprintId"`
	Type        DeploymentType   `db:"type" json:"type"`     // "plan" or "deploy"
	Status      DeploymentStatus `db:"status" json:"status"` // "pending", "started", etc.
	CreatedAt   time.Time        `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time        `db:"updated_at" json:"updatedAt"`
}

type DeploymentHostMapping struct {
	DeploymentID *string          `db:"deployment_id" json:"deploymentId"`
	HostID       *int             `db:"host_id" json:"hostId"`
	Status       DeploymentStatus `db:"status" json:"status"` // "pending", "started", etc.
}

type DeploymentMessage struct {
	JobID       *string        `json:"jobId"`
	UserID      *string        `json:"userId"`
	HostIDs     []int          `json:"hostIds"`
	BlueprintID *int           `json:"blueprintId"`
	Type        DeploymentType `json:"type"`
	CreatedAt   time.Time      `json:"created_at"`
}

type UpdateDeploymentStatusPayload struct {
	Status    DeploymentStatus `json:"status" binding:"required"`
	UpdatedAt *time.Time       `json:"updatedAt"`
}
