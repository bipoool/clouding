package deployment

import "time"

type Deployment struct {
	ID          string           `db:"id" json:"id"`
	UserID      string           `db:"user_id" json:"userId"`
	HostID      int          `db:"host_id" json:"hostId"`
	HostGroupID int           `db:"host_group_id" json:"hostGroupId"`
	BlueprintID int           `db:"blueprint_id" json:"blueprintId"`
	Type        DeploymentType   `db:"type" json:"type"`     // "plan" or "deploy"
	Status      DeploymentStatus `db:"status" json:"status"` // "pending", "started", etc.
	CreatedAt   time.Time        `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time        `db:"updated_at" json:"updatedAt"`
}


type DeploymentMessage struct {
	JobID       string   `json:"jobId"`
	UserID      string   `json:"userId"`
	HostIDs     []int `json:"hostIds"`
	BlueprintID string   `json:"blueprintId"`
	Type        string   `json:"type"`       // always "deploy"
	CreatedAt   string   `json:"created_at"` // ISO8601 string
}
