ORG=karlkfi
REPO=$(shell git rev-parse --show-toplevel | xargs basename)
REPO_PATH=github.com/$(ORG)/$(REPO)
PORT=8080

#ARGS=--api-type=marathon --api-host=192.168.65.90 --api-path-prefix=/marathon

# Lookup the IP of the Docker For Mac Kubernetes API Server
KUBE_API_HOST=$(shell kubectl get pod -n kube-system kube-apiserver-docker-for-desktop -o jsonpath="{.status.podIP}")
#ARGS=--api-type=kubernetes --api-host=$(KUBE_API_HOST) --api-port=6443

# Lookup the name of the default namespace secret
SECRET_NAME=$(shell kubectl get secrets -n default -o jsonpath="{.items[?(@.metadata.annotations['kubernetes\.io/service-account\.name']=='default')].metadata.name}")
# Lookup the default namespace secret token
API_TOKEN=$(shell kubectl get secrets -n default "$(SECRET_NAME)" -o jsonpath="{.data.token}" | base64 --decode)

ARGS=--api-type=kubernetes --api-host=$(KUBE_API_HOST) --api-token="$(API_TOKEN)"

.PHONY: all
all: build

.PHONY: build
build:
	docker build -t $(ORG)/$(REPO):latest .

.PHONY: push
push:
	docker push $(ORG)/$(REPO):latest

.PHONY: run
run:
	docker run --rm -it -e NODE_ENV=development -p $(PORT):$(PORT) $(ORG)/$(REPO):latest bin/www $(ARGS)

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
