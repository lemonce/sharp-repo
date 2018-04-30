'use strict';
const { Buffer } = require('buffer');
const EventEmitter = require('events');
const Meta = require('./meta');

function isPromise(any) {
	return any instanceof Promise;
}

function isBuffer(any) {
	return any instanceof Buffer;
}

module.exports = class BaseEntry extends EventEmitter {
	constructor() {
		super();

		this._meta = null;
	}

	get meta() {
		return this._meta;
	}

	set meta(meta) {
		if (!Meta.isMeta(meta)) {
			throw new Error('Invalid meta.');
		}

		return this._meta = meta;
	}

	$getBuffer() {
		throw new Error('Entry.$getBuffer is not defined.');
	}

	read() {
		const getBufferPromise = this.$getBuffer();

		if (!isPromise(getBufferPromise)) {
			throw new Error('Entry.$getBuffer() => Promise.');
		}

		return getBufferPromise.then(buffer => {
			if (!isBuffer(buffer)) {
				throw new Error('Entry.$getBuffer() => Promise.then(callback(<Buffer Excepted>)).');
			}

			this._meta.updateVisit();

			this.emit('read-success', buffer, this._meta);

			return buffer;
		}, error => {
			this.emit('read-error', error);

			throw error;
		});
	}

	static isEntry(any) {
		return any instanceof this;
	}
};