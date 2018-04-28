'use strict';
const SHA1_REG = /[a-f0-9]{40}/;

class Entry {
	constructor(any, metaRaw = null) {
		this._buffer = Buffer.from(any);

		this.meta = new Meta(this._buffer, metaRaw);
	}
	
	readBuffer() {
		this.meta.visit();
		
		return Promise.resolve(this._buffer);
	}
};

exports.Store = class Store {
	constructor() {
		this._base = {};
	}

	ensureSha1(hash) {
		if (!SHA1_REG.test(hash)) {
			throw new Error('A sh1 hash string excepted.');	
		}
	}

	put(entryRaw) {
		const entry = new Entry(entryRaw);
		const hash = entry.hash;

		const existedEntry = this._base[hash];

		if (!existedEntry) {
			return this._base[hash] = entry;
		}

		return entry;
	}

	get(hash) {
		this.ensureSha1(hash);

		const entry = this._base[hash];

		if (!entry) {
			throw new Error('No entry assigned existed.');
		}

		return entry;
	}

	remove(hash) {
		this.ensureSha1(hash);

		delete this._base[hash];
	}

	destory() {
		this._base = {};
	}
};