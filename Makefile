ORG=karlkfi
REPO=$(shell git rev-parse --show-toplevel | xargs basename)
REPO_PATH=github.com/$(ORG)/$(REPO)
PORT=8080

.PHONY: all
all: build

.PHONY: build-builder
build-builder:
	cd build && docker build -t $(ORG)/$(REPO)-builder:latest .

.PHONY: build
build: build-builder
	docker run -v "$(CURDIR):/src" $(ORG)/$(REPO)-builder:latest
	docker build -t $(ORG)/$(REPO):latest .

.PHONY: push
push:
	docker push $(ORG)/$(REPO):latest

.PHONY: run
run:
	docker run --rm -it -e NODE_ENV=development -p $(PORT):$(PORT) $(ORG)/$(REPO):latest bin/www --api-type=marathon --api-host=172.17.0.4 --api-port=8080

.PHONY: start
start:
	docker run -d --name $(REPO) -p $(PORT):$(PORT) $(ORG)/$(REPO):latest

.PHONY: stop
stop:
	docker rm -f $(REPO)

.PHONY: test
test:
	curl http://localhost:$(PORT)

.PHONY: clean
clean:
	rm -rf node_modules
