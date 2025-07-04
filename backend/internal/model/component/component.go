package component

import (
	"time"
)

type Component struct {
	ID          *int        `db:"id" json:"id"`
	Name        *string     `db:"name" json:"name"`
	DisplayName *string     `db:"display_name" json:"displayName"`
	Description *string     `db:"description" json:"description"`
	Label       *string     `db:"label" json:"label"`
	AnsibleRole *string     `db:"ansible_role" json:"ansibleRole"`
	Parameters  *Parameters `db:"parameters" json:"parameters"`
	CreatedAt   *time.Time  `db:"created_at" json:"createdAt"`
	UpdatedAt   *time.Time  `db:"updated_at" json:"updatedAt"`
}
