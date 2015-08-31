'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var skivvyFactory = rewire('../../lib/skivvyFactory');

chai.use(sinonChai);

describe('skivvyFactory()', function() {
	var mockFactory = createMockFactory();
	var mockSkivvy = createMockSkivvy();
	var unmockFactory;

	before(function() {
		unmockFactory = skivvyFactory.__set__('factory', mockFactory);
	});

	afterEach(function() {
		mockFactory.reset();
		mockSkivvy.reset();
	});

	after(function() {
		if (unmockFactory) {
			unmockFactory();
			unmockFactory = null;
		}
	});

	function createMockFactory() {
		var templateInstance = {
			on: sinon.spy(function(event) {
				return templateInstance;
			})
		};
		var templateFactory = sinon.spy(function(options) {
			return templateInstance;
		});
		var factory = sinon.spy(function(options, context, callback) {
			return templateFactory;
		});
		templateInstance.addListener = templateInstance.on;
		factory._templateFactory = templateFactory;
		templateFactory._instance = templateInstance;

		factory.events = {
			'COPY_FILE_COMPLETE': 'copyFileComplete',
			'CREATE_SYMLINK_COMPLETE': 'createSymlinkComplete'
		};

		(function(factoryReset) {
			factory.reset = function() {
				factoryReset.call(factory);
				templateFactory.reset();
				templateInstance.on.reset();
			};
		})(factory.reset);

		return factory;
	}

	function createMockSkivvy() {
		return {
			utils: {
				log: {
					info: sinon.spy()
				},
				colors: {
					path: function(string) {
						return '<path>' + string + '</path>';
					}
				}
			},
			reset: function() {
				this.utils.log.info.reset();
			}
		};
	}

	it('Should return a task function', function() {
		var task = skivvyFactory({
			template: 'my-template'
		});

		var actual, expected;
		actual = task;
		expected = 'function';
		expect(actual).to.be.a(expected);

		actual = task.length;
		expected = 1;
		expect(actual).to.equal(expected);

		actual = task.description;
		expected = null;
		expect(actual).to.equal(expected);

		actual = task.defaults;
		expected = null;
		expect(actual).to.eql({
			options: null,
			context: null,
			placeholders: null
		});
	});

	it('Should set task description and defaults', function() {
		var task = skivvyFactory({
			template: 'my-template',
			description: 'Hello, world!',
			options: {
				destination: 'src',
				overwrite: true
			},
			context: {
				foo: 'foo',
				bar: 'bar'
			},
			placeholders: [
				{ name: 'greeting', message: 'Enter a greeting' },
				{ name: 'user', message: 'Enter a user' }
			]
		});

		var actual, expected;

		actual = task.description;
		expected = 'Hello, world!';
		expect(actual).to.equal(expected);

		actual = task.defaults;
		expected = null;
		expect(actual).to.eql({
			options: {
				destination: 'src',
				overwrite: true
			},
			context: {
				foo: 'foo',
				bar: 'bar'
			},
			placeholders: [
				{ name: 'greeting', message: 'Enter a greeting' },
				{ name: 'user', message: 'Enter a user' }
			]
		});
	});

	it('should invoke the template factory when the task is launched, and return the instance', function() {
		var contextTransformFn = function(context) { return context; };
		var task = skivvyFactory({
			template: 'my-template',
			getContext: contextTransformFn
		});

		var config = {
			options: {
				destination: 'src',
				overwrite: true
			},
			context: {
				foo: 'foo',
				bar: 'bar'
			},
			placeholders: [
				{ name: 'greeting', message: 'Enter a greeting' },
				{ name: 'user', message: 'Enter a user' }
			]
		};

		var templater = task.call(mockSkivvy, config);

		var actual, expected;
		actual = templater;
		expected = mockFactory._templateFactory._instance;
		expect(actual).to.equal(expected);

		expect(mockFactory).to.have.been.calledOnce;
		expect(mockFactory).to.have.been.calledWith({
			template: 'my-template',
			placeholders: [
				{ name: 'greeting', message: 'Enter a greeting' },
				{ name: 'user', message: 'Enter a user' }
			],
			getContext: contextTransformFn
		});
		expect(mockFactory._templateFactory).to.have.been.calledOnce;
		expect(mockFactory._templateFactory).to.have.been.calledWith(
			{
				destination: 'src',
				overwrite: true
			},
			{
				foo: 'foo',
				bar: 'bar'
			}
		);
	});

	it('should log file copy events', function() {
		var task = skivvyFactory({
			template: 'my-template'
		});
		var config = {
			options: null,
			context: null
		};

		task.call(mockSkivvy, config);

		var listenerSpy = mockFactory._templateFactory._instance.on;
		expect(listenerSpy).to.have.been.calledTwice;

		var args = listenerSpy.firstCall.args;
		expect(args.length).to.equal(2);
		expect(args[0]).to.equal('copyFileComplete');
		expect(args[1]).to.be.a('function');
		var handler = args[1];
		handler({
			src: 'src/my-component',
			dest: 'dest/my-component'
		});
		expect(mockSkivvy.utils.log.info).to.have.been.calledWith('File copied: <path>dest/my-component</path>');

		args = listenerSpy.secondCall.args;
		expect(args.length).to.equal(2);
		expect(args[0]).to.equal('createSymlinkComplete');
		expect(args[1]).to.be.a('function');
		handler = args[1];
		handler({
			src: 'src/my-component',
			dest: 'dest/my-component'
		});
		expect(mockSkivvy.utils.log.info).to.have.been.calledWith('File copied: <path>dest/my-component</path>');
	});
});
