SHELL := /bin/bash
NODE_BIN_PATH := $(shell npm bin)
PATH := $(NODE_BIN_PATH):$(PATH)

start:
	nf start

logs:
	heroku logs -t --app delay-run
