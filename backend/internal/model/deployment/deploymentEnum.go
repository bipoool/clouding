package deployment

type DeploymentType string

const (
	DeploymentTypePlan   DeploymentType = "plan"
	DeploymentTypeDeploy DeploymentType = "deploy"
)

type DeploymentStatus string

const (
	StatusPending   DeploymentStatus = "pending"
	StatusStarted   DeploymentStatus = "started"
	StatusCompleted DeploymentStatus = "completed"
	StatusFailed    DeploymentStatus = "failed"
)
