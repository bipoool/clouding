package config

import (
	"log/slog"
	"os"

	"github.com/joho/godotenv"
)

type CloudingConfig struct {
	Sql struct {
		// SQL Configuration
		Host     string `mapstructure:"host" default:"0.0.0.0" description:"the sql host address"`
		Port     string `mapstructure:"port" default:"7653" description:"the sql read port"`
		User     string `mapstructure:"user" description:"the sql user"`
		Password string `mapstructure:"password" description:"the sql password"`
		Db       string `mapstructure:"db" description:"the sql db"`
	} `mapstructure:"sql" description:"the sql configuration"`

	Server struct {
		// Server Configuration
		LogLevel string `mapstructure:"logLevel" default:"info" description:"Log Level"`
		Port     string `mapstructure:"port" default:"8080" description:"Port to run the server"`
	} `mapstructure:"server" description:"the server configuration"`

	SupabaseAuth struct {
		JwtSecret []byte `mapstructure:"jwtSecret" description:"Supabase JWT Secret"`
	} `mapstructure:"supabaseAuth" description:"the supabase auth configuration"`

	Vault struct {
		VaultSecretEnginePath     string `mapstructure:"vaultSecretEnginePath" description:"Vault Secret Engine Path"`
		VaultSecretEngineMetaPath string `mapstructure:"vaultSecretEngineMetaPath" description:"Vault Secret Engine Meta Path"`
	}

	RabbitMQ struct {
		URL       string `mapstructure:"url" description:"RabbitMQ connection URL"`
		PORT      string `mapstructure:"port" description:"RabbitMQ connection PORT"`
		Username  string `mapstructure:"username" description:"RabbitMQ connection username"`
		Password  string `mapstructure:"password" description:"RabbitMQ connection password"`
		QueueName string `mapstructure:"queueName" description:"RabbitMQ Queue name"`
	} `mapstructure:"rabbitmq"`
}

var Config *CloudingConfig

func LoadCloudingConfig(path string) {
	err := godotenv.Load()

	if err != nil {
		slog.Error("Error loading .env file")
		panic(err)
	}

	Config = &CloudingConfig{}
	Config.Sql.Host = os.Getenv("SQL.HOST")
	Config.Sql.Port = os.Getenv("SQL.PORT")
	Config.Sql.User = os.Getenv("SQL.USERNAME")
	Config.Sql.Password = os.Getenv("SQL.PASSWORD")
	Config.Sql.Db = os.Getenv("SQL.DB")

	Config.Server.LogLevel = os.Getenv("SERVER.LOG.LEVEL")
	Config.Server.Port = os.Getenv("SERVER.PORT")

	Config.SupabaseAuth.JwtSecret = []byte(os.Getenv("SUPABASE.JWT.SECRET"))

	Config.Vault.VaultSecretEnginePath = os.Getenv("VAULT_SECRET_ENGINE")
	Config.Vault.VaultSecretEngineMetaPath = os.Getenv("VAULT_SECRET_ENGINE_METADATA")

	Config.RabbitMQ.URL = os.Getenv("RABBITMQ.URL")
	Config.RabbitMQ.PORT = os.Getenv("RABBITMQ.PORT")
	Config.RabbitMQ.Username = os.Getenv("RABBITMQ.USERNAME")
	Config.RabbitMQ.Password = os.Getenv("RABBITMQ.PASSWORD")
	Config.RabbitMQ.QueueName = os.Getenv("RABBITMQ.QUEUE.NAME")

}
