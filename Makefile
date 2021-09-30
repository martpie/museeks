SHELL = /bin/sh

.PHONY: default
default: install

.PHONY: build
build: 
	@yarn build

.PHONY: install
install: 
	@yarn install --frozen-lockfile

.PHONY: dev
dev: 
	@yarn dev

.PHONY: debug
debug:
	@yarn run museeks:debug

.PHONY: test
test:	test/unit test/lint test/formatting test/css build

test/unit:
	@yarn run test:unit

test/lint:
	@yarn run test:lint

test/formatting:
	@yarn run test:formatting

test/css:
	@yarn run test:css


save-the-world:
	@rm -rf node_modules