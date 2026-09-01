package main

import (
	"log"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	log.Println("Serving on http://localhost:5173")
	log.Fatal(http.ListenAndServe(":5173", nil))
}
