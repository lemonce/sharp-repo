'use strict';
const { Buffer } = require('buffer');
const BaseEntry = require('../entry');

const SHA1_REG = /[a-f0-9]{40}/;

function toBuffer(any) {
	return Buffer.from(JSON.stringify(any));
}

exports.BaseStoreAdapter = class BaseStoreAdapter {
	constructor() {
		
	}

	ensureSha1(hash) {
		if (!SHA1_REG.test(hash)) {
			throw new Error('A sh1 hash string excepted.');	
		}
	}

	throwEntryNotFound(hash) {
		throw new Error(`The entry(${hash}) is not found.`);
	}

	$put() {
		throw new Error('Method \'put\' is not defined');
	}

	$get() {
		throw new Error('Method \'get\' is not defined');
	}

	put(any) {
		const entry = this.$put(toBuffer(any));

		if (!BaseEntry.isEntry(entry)) {
			throw new Error('Store.$put() should return a Entry.');
		}

		return entry;
	}

	get(hash) {
		this.ensureSha1(hash);

		const entry = this.$get(hash);
		
		if (!BaseEntry.isEntry(entry)) {
			throw new Error('Store.$get() should return a Entry.');
		}

		return entry;
	}
};