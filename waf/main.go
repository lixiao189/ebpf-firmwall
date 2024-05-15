package main

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func main() {
	backend := "http://127.0.0.1:8081"

	target, err := url.Parse(backend)
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
		// 提取 Get 参数
		getQuery := r.URL.Query()
		fmt.Println("Get 参数:", getQuery)

		// 提取 Post 参数
		if r.Method == "POST" {
			body, err := r.GetBody()
			if err != nil {
				fmt.Println("Error reading body:", err)
				return
			} else {
                // TODO: fix post body error
				fmt.Println("Post 参数:", body)
			}
		}

		proxy.ServeHTTP(w, r)
	})

	if err := http.ListenAndServe("0.0.0.0:8080", nil); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
