package config

import (
	"log/slog"

	"github.com/spf13/viper"
)

type CloudingConfig struct {
	Sql struct {
		// SQL Configuration
		Host     string `mapstructure:"host" default:"0.0.0.0" description:"the sql host address"`
		Port     string `mapstructure:"port" default:"7653" description:"the sql read port"`
		User     string `mapstructure:"user" default:"" description:"the sql user"`
		Password string `mapstructure:"password" default:"" description:"the sql password"`
		Db       string `mapstructure:"db" default:"central-sql-v2" description:"the sql db"`
	} `mapstructure:"sql" description:"the sql configuration"`

	Server struct {
		// Server Configuration
		LogLevel string `mapstructure:"logLevel" default:"info" description:"Log Level"`
		Port     string `mapstructure:"port" default:"8080" description:"Port to run the server"`
	} `mapstructure:"server" description:"the sql configuration"`
}

var Config *CloudingConfig

func LoadCloudingConfig(path string) {
	viper.SetConfigName("config")
	viper.SetConfigType("json")
	viper.AddConfigPath(path)

	if err := viper.ReadInConfig(); err != nil {
		slog.Error("Failed to read config")
		panic(err)
	}

	if err := viper.Unmarshal(&Config); err != nil {
		slog.Error("Failed to parse config")
		panic(err)
	}
}
