'use strict'
const path   = require('path')
  ,   os     = require('os')
  ,   events = require('events')
  ,   spawn  = require('child_process').spawn
  ,   _      = require('lodash')
  ,   kebab  = require('kebab-case')

const defaults = {
	options: {
		png: 1,
	},
	filename: path.join(os.tmpdir(), 'fswebcam-capture.png')
}

const Cam = function(options, filename) {
	this.config = _.defaultsDeep({}, {
		options: options,
		filename: filename
	}, defaults)
	this.emitter = new events.EventEmitter()
}

Cam.prototype.serializeOptions = function() {
	let filename = this.config.filename
	let options = this.config.options
	let args = Object.keys(options)
	.reduce((args, option) => {
		let value = options[option]

		if (value !== false) {
			args.push(`--${kebab(option)}`)

			if (value !== true)
				args.push(`${value}`)
		}


		return args
	}, [])

	args.push(filename)
	return args
}

Cam.prototype.capture = function() {
	let p = spawn('fswebcam', this.serializeOptions(), { })

	p.stdout.setEncoding('utf8')
	p.stderr.setEncoding('utf8')

	p.stderr.on('data', (data => {
		// if (/Writing [A-Z]+ image to '.*'\./.test(data))
		// TODO: Do something with this
	}).bind(this))

	p.stdout.on('data', (data => {
		// TODO: Do something with this
	}).bind(this))

	p.on('exit', (() => {
		this.emitter.emit('image', this.config.filename)
	}).bind(this))
}

Cam.prototype.onImage = function(fn) {
	this.emitter.on('image', fn)
}

module.exports = Cam