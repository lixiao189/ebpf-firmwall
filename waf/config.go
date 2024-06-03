package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/spf13/viper"
)

var BACKEND = "http://127.0.0.1:8081"

type Server struct {
	Host string
	Port int
}

var ServerConfig Server

type RabbitMQ struct {
	Server string
	Queue1 string
	Queue2 string
}

var Rabbit RabbitMQ

type Website struct {
	Name string
	API  string
	URL  string
}

var Websites []Website
var ProxyMap = make(map[string]*httputil.ReverseProxy)

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

	// load the server config
	err = viper.UnmarshalKey("server", &ServerConfig)
	logOnError(err, "Failed to unmarshal the server")

	// load rabbitmq config
	err = viper.UnmarshalKey("rabbitmq", &Rabbit)
	logOnError(err, "Failed to unmarshal the rabbitmq")

	// load websites
	err = viper.UnmarshalKey("websites", &Websites)
	logOnError(err, "Failed to unmarshal the websites")

	// load rules
	err = viper.UnmarshalKey("rules", &Rules)
	logOnError(err, "Failed to unmarshal the rules")

	// create websites cache
	for _, website := range Websites {
		target, err := url.Parse(website.URL)
		logOnError(err, "Failed to parse the website URL")

		proxy := httputil.NewSingleHostReverseProxy(target)
		d := proxy.Director
		proxy.Director = func(r *http.Request) {
			d(r)
			r.Host = target.Host
		}

		ProxyMap[website.Name] = proxy
	}
}
