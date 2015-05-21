# skivvy-factory
[![npm version](https://img.shields.io/npm/v/skivvy-factory.svg)](https://www.npmjs.com/package/skivvy-factory)
![Stability](https://img.shields.io/badge/stability-stable-brightgreen.svg)
[![Build Status](https://travis-ci.org/timkendrick/skivvy-factory.svg?branch=master)](https://travis-ci.org/timkendrick/skivvy-factory)

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
		}
	],
	options: {
		destination: '<%= environment.paths.components %>',
		overwrite: true
	},
	context: {
		author: '<%= project.author %>',
		copyright: '<%= project.copyright %>'
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
			}
		],
		options: {
			destination: '<%= package.paths.components %>',
			overwrite: true
		},
		context: {
			author: '<%= package.author %>',
			copyright: '<%= package.copyright %>'
		}
	}),
	'create-service': skivvyFactory({
		description: 'Create a service',
		template: path.join(__dirname, 'templates/service'),
		placeholders: [
			{
				name: 'name',
				message: 'Service name'
			}
		],
		options: {
			destination: '<%= package.paths.services %>',
			overwrite: true
		},
		context: {
			author: '<%= package.author %>',
			copyright: '<%= package.copyright %>'
		}
	})
};

exports.defaults = {
	paths: {
		component: null,
		service: null
	},
	author: '<%= project.author %>',
	copyright: '<%= project.copyright %>'
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
| `options.destination` | `string` | Yes | N/A | Destination directory for output files |
| `placeholders` | `Array` | No | `[]` | Array of [inquirer](https://www.npmjs.com/package/inquirer) prompts used to gather data for injecting into templates |
| `context` | `object` | No | `{}` | Preset template placeholder values |
| `options.overwrite` | `boolean` | No | `false` | Whether to overwrite existing files |
| `description` | `string` | No | `null` | Skivvy task description |

> Values within the `context` and `options` option values can use Skivvy task config [placeholder values](https://github.com/timkendrick/skivvy/blob/master/docs/guide/02-configuring-tasks.md#using-placeholders-in-configuration-values).

#### Returns:

`function` Skivvy task
