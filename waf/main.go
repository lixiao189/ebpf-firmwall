package main

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
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
		if r.Method != "GET" {
			// 读取 POST 请求 body
			body, err := ioutil.ReadAll(r.Body)
			if err != nil {
				http.Error(w, "Failed to read request body", http.StatusInternalServerError)
				return
			}
            fmt.Println(string(body))
			// 将 body 写回请求体，以便转发给目标服务器
			r.Body = ioutil.NopCloser(io.NopCloser(bytes.NewBuffer(body)))
		}

		proxy.ServeHTTP(w, r)
	})

	if err := http.ListenAndServe("0.0.0.0:8080", nil); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
