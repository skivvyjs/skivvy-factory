# skivvy-factory
[![npm version](https://img.shields.io/npm/v/skivvy-factory.svg)](https://www.npmjs.com/package/skivvy-factory)
![Stability](https://img.shields.io/badge/stability-stable-brightgreen.svg)
[![Build Status](https://travis-ci.org/skivvyjs/skivvy-factory.svg?branch=master)](https://travis-ci.org/skivvyjs/skivvy-factory)

> Create Skivvy tasks from Factory templates


## Overview

[Skivvy](https://www.npmjs.com/package/skivvy) is a modular task runner for reusable build systems, and [Factory](https://www.npmjs.com/package/factory) provides a quick and easy template scaffolding tool for Node. `skivvy-factory` unites the two, allowing you to turn your Factory templates into reusable Skivvy tasks.


## Installation

```bash
npm install skivvy-factory --save-dev
```


## Example

### As a local Skivvy task:

```javascript
var skivvyFactory = require('skivvy-factory');

module.exports = skivvyFactory({
	description: 'Create a component',
	template: 'templates/component',
	placeholders: [
		{
			name: 'name',
			message: 'Component name'
		},
		{
			name: 'author',
			message: 'Author',
			default: '<%= project.author %>'
		}
	],
	options: {
		destination: '<%= environment.paths.components %>',
		overwrite: true
	},
	context: {
		license: '<%= project.license %>'
	}
});
```

After saving this to your `skivvy_tasks` folder, you can launch your template by running the following commands (where `create-component.js` is the filename of the task):

```bash
# Configure the task
skivvy config --config.paths.components=src/components

# Create a new component
skivvy run create-component

# Create another new component, hard-coding the
# "name" value and preventing accidental overwrite:
skivvy run create-component --config.context.name=foo --config.options.overwrite=false
```

### Within a Skivvy task package:

```javascript
var skivvyFactory = require('skivvy-factory');

var path = require('path');

exports.tasks = {
	'create-component': skivvyFactory({
		description: 'Create a component',
		template: path.join(__dirname, 'templates/component'),
		placeholders: [
			{
				name: 'name',
				message: 'Component name'
			},
			{
				name: 'author',
				message: 'Author',
				default: '<%= package.author %>'
			}
		],
		options: {
			destination: '<%= package.paths.components %>',
			overwrite: true
		},
		context: {,
			license: '<%= package.license %>'
		}
	}),
	'create-service': skivvyFactory({
		description: 'Create a service',
		template: path.join(__dirname, 'templates/service'),
		placeholders: [
			{
				name: 'name',
				message: 'Service name'
			},
			{
				name: 'author',
				message: 'Author',
				default: '<%= package.author %>'
			}
		],
		options: {
			destination: '<%= package.paths.services %>',
			overwrite: true
		},
		context: {
			license: '<%= package.license %>'
		}
	})
};

exports.defaults = {
	paths: {
		component: null,
		service: null
	},
	author: '<%= project.author %>',
	license: '<%= project.license %>'
}
```

After installing this package, you can launch your templates by running the following commands, where `PACKAGE_NAME` is the name of the package:

```bash
# Configure the package
skivvy config --package=PACKAGE_NAME --config.paths.components=src/components --config.paths.services=src/services

# Create a new component
skivvy run create-component

# Create a service
skivvy run create-service

# Create another new component, hard-coding the
# "name" value and preventing accidental overwrite:
skivvy run create-component --config.context.name=foo --config.options.overwrite=false
```


## Usage

### `skivvyFactory(options)`

Create a Skivvy task from a Factory template

#### Options:

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| `template` | `string` | Yes | N/A | Path to the Factory template folder |
| `options` | `object` | Yes | N/A | Factory copy options |
| `options.destination` | `string` | Yes | N/A | Destination directory for output files |
| `options.overwrite` | `boolean` | No | `false` | Whether to overwrite existing files |
| `placeholders` | `Array` | No | `[]` | Array of [inquirer](https://www.npmjs.com/package/inquirer) prompts used to gather data for injecting into templates |
| `context` | `object` | No | `{}` | Preset template placeholder values |
| `getContext` | `function` | No | `null` | Function that transforms placeholder values before they are passed to the template |
| `description` | `string` | No | `null` | Skivvy task description |

##### Notes:

- Values within the `options`, `placeholders` and `context` option values can use Skivvy task config [placeholder values](https://github.com/skivvyjs/skivvy/blob/master/docs/guide/02-configuring-tasks.md#using-placeholders-in-configuration-values).

- `getContext` has the following signature:

	##### `function(context)`

	###### Arguments:

	| Name | Type | Description |
	| ---- | ---- | ----------- |
	| `context` | `object` | Key/value object containing placeholder values, gathered from factory `context` and template `placeholders` |

	###### Returns:

	`object` Key/value object containing transformed context placeholder for use in templates

#### Returns:

`function` Skivvy task
