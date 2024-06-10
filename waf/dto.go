package main

const (
	StatusOK          = 200
	StatusLoginFaied  = 500
	StatusNotLogin    = 501
	StatusSystemError = 502
    StatusParamsError = 503
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Response struct {
	Code    int  `json:"code"`
	Success bool `json:"success"`
	Data    any  `json:"data"`
}

type UserInfo struct {
	Name     string `json:"name"`
	HasAdmin bool   `json:"hasAdmin"`
}

type UpdateUserRequest struct {
    Username string `json:"username"`
    Password string `json:"password"`
}

func ResponseOK[T any](data T) Response {
	return Response{
		Code:    StatusOK,
		Success: true,
		Data:    data,
	}
}

func ResponseFailed[T any](code int, data T) Response {
	return Response{
		Code:    code,
		Success: false,
		Data:    data,
	}
}

func ResponseLoginFailed(msg string) Response {
	return Response{
		Code:    StatusLoginFaied,
		Success: false,
	}
}

func ResponseSystemError() Response {
	return Response{
		Code:    StatusSystemError,
		Success: false,
	}
}
