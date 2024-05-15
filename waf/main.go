package main

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func main() {
	target, err := url.Parse("http://example.com")
	if err != nil {
		fmt.Println("Error parsing target URL:", err)
		return
	}

	proxy := httputil.NewSingleHostReverseProxy(target)
	d := proxy.Director
	proxy.Director = func(r *http.Request) {
		d(r)
		r.Host = target.Host
	}

	// Redirect any request to the target URL
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Proxying request to:", r.URL)
		proxy.ServeHTTP(w, r)
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
