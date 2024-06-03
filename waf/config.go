package main

import "github.com/spf13/viper"

var BACKEND = "http://127.0.0.1:8081"

type RabbitMQ struct {
	Server string
	Queue  string
}

var Rabbit RabbitMQ

type Website struct {
	Name string
	API  string
	URL  string
}

var Websites []Website
var WebsiteCache = make(map[string]Website)

type Rule struct {
	Name  string
	Regex string
}

var Rules []Rule

func init() {
	// load the config file
	viper.SetConfigFile("./config/config.toml")
	err := viper.ReadInConfig()
	logOnError(err, "Failed to read the config file")

	// load rabbitmq config
	err = viper.UnmarshalKey("rabbitmq", &Rabbit)
	logOnError(err, "Failed to unmarshal the rabbitmq")

	// load websites
	err = viper.UnmarshalKey("websites", &Websites)
	logOnError(err, "Failed to unmarshal the websites")

	// create a map for websites
	for _, website := range Websites {
		WebsiteCache[website.Name] = website
	}

	// load rules
	err = viper.UnmarshalKey("rules", &Rules)
	logOnError(err, "Failed to unmarshal the rules")
}
