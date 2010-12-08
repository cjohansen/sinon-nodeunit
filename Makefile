default: test lint
test: lib/sinon-nodeunit.js
	./run_tests
examples: lib/sinon-nodeunit.js
	./run_examples
lint:
	juicer verify {lib,test,examples}/*.js
	jsl --conf jsl.conf lib/*.js test/*.js examples/*.js
