'use strict';
const _ = require('lodash');
const { Buffer } = require('buffer');
const { createHash } = require('crypto');

function isBuffer(any) {
	return any instanceof Buffer;
}

module.exports = class Meta {
	constructor({ visit, create, hash, length }) {
		this._hash = hash;
		this._length = length;
		this._visit = new Date(visit);
		this._create = new Date(create);
	}

	get hash() {
		return this._hash;
	}

	get length() {
		return this._length;
	}

	get visit() {
		return this._visit;
	}

	get create() {
		return this._create;
	}

	updateVisit() {
		this._visit = new Date();
	}

	raw() {
		return _.pick(this, [
			'hash', 'length', 'visit', 'create'
		]);
	}

	static isMeta(any) {
		return any instanceof this;
	}

	static from(buffer) {
		const hash = createHash('sha1');
		
		if (!isBuffer(buffer)) {
			throw new Error('Argument 0 must be a Buffer');
		}
		
		hash.update(buffer);

		const raw = {
			hash: hash.digest('hex'),
			length: buffer.length,
			visit: new Date(),
			create: new Date()
		}

		return new this(raw);
	}
};