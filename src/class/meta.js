'use strict';
const _ = require('lodash');
const { Buffer } = require('buffer');
const { createHash } = require('crypto');
const hash = createHash('sha1');

function isBuffer(any) {
	return any instanceof Buffer;
}

module.exports = class Meta {
	constructor(buffer, raw) {
		if (!isBuffer(buffer)) {
			throw new Error('Argument 0 must be a Buffer');
		}
		
		hash.update(buffer);
		this._hash = hash.digest('hex');

		if (raw) {
			const { visit, create, hash } = raw;

			if (this._hash !== hash) {
				throw new Error('Data source inconsistency');
			}

			this._visit = new Date(visit);
			this._create = new Date(create);
		} else {
			this._visit = this._create = new Date();
		}

		this._length = buffer.length;
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
};