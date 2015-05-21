'use strict';

var factory = require('factory');

module.exports = function(options) {
	options = options || {};
	var templatePath = options.template || null;
	var placeholders = options.placeholders || [];
	var copyOptions = options.options || null;
	var contextDefaults = options.context || null;
	var description = options.description || null;
	return createTask(templatePath, placeholders, copyOptions, contextDefaults, description);


	function createTask(templatePath, placeholders, copyOptions, contextDefaults, description) {
		var templateFactory = factory({
			template: templatePath,
			placeholders: placeholders
		});
		var task = function(config) {
			var skivvy = this;
			var options = config.options;
			var context = config.context;
			return templateFactory(options, context)
				.on(factory.events.COPY_FILE_COMPLETE, function(copyOperation) {
					skivvy.utils.log.info('File copied: ' + skivvy.utils.colors.path(copyOperation.dest));
				});
		};
		task.description = description;
		task.defaults = {
			options: copyOptions,
			context: contextDefaults
		};
		return task;
	}
};

