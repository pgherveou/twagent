TESTS = test/*.js
REPORTER = dot

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 5000 \
		--growl \
		--check-leaks \
		$(TESTS)


.PHONY: test