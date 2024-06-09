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
	User string
	Pass string
}

var ServerConfig Server

type Redis struct {
	Host string
	Port int
}

var RedisConfig Redis

type RabbitMQ struct {
	Server string
	Queue1 string
	Queue2 string
}

var Rabbit RabbitMQ

type Website struct {
	Name string `json:"name"`
	API  string `json:"api,omitempty"`
	URL  string `json:"url,omitempty"`
}

var Websites []Website
var ProxyMap = make(map[string]*httputil.ReverseProxy)

type Rule struct {
	Name  string `json:"name"`
	Regex string `json:"regex,omitempty"`
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

	// load redis config
	err = viper.UnmarshalKey("redis", &RedisConfig)
	logOnError(err, "Failed to unmarshal the redis")

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

		ProxyMap[website.API] = proxy
	}
}
