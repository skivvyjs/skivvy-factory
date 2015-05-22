'use strict';

var factory = require('factory');

module.exports = function(options) {
	options = options || {};
	var templatePath = options.template || null;
	var placeholders = options.placeholders || null;
	var copyOptions = options.options || null;
	var contextDefaults = options.context || null;
	var contextTransformFn = options.getContext || null;
	var description = options.description || null;
	return createTask(templatePath, placeholders, copyOptions, contextDefaults, contextTransformFn, description);


	function createTask(templatePath, placeholders, copyOptions, contextDefaults, contextTransformFn, description) {
		var task = function(config) {
			var skivvy = this;
			var options = config.options;
			var context = config.context;
			var placeholders = config.placeholders;

			var templateFactory = factory({
				template: templatePath,
				placeholders: placeholders,
				getContext: contextTransformFn
			});

			return templateFactory(options, context)
				.on(factory.events.COPY_FILE_COMPLETE, function(copyOperation) {
					skivvy.utils.log.info('File copied: ' + skivvy.utils.colors.path(copyOperation.dest));
				});
		};
		task.description = description;
		task.defaults = {
			options: copyOptions,
			context: contextDefaults,
			placeholders: placeholders
		};
		return task;
	}
};

