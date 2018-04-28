'use strict';
const fs = require('fs-extra');
const path = require('path');

const { BaseStoreAdapter } = require('../class/adapter/store');
const BaseEntry = require('../class/entry');
const Meta = require('../class/meta');

const FILE_NAME = 'source';
const META_NAME = 'meta.json';

class FileEntry extends BaseEntry {
	constructor(metaRaw, store) {
		super();

		const dirPath = store.getDirPathname(metaRaw.hash);
		this._sourcePath = path.resolve(dirPath, FILE_NAME);

		fs.readFile(this._sourcePath, (err, data) => {
			if (err) {
				throw err;
			}

			this.meta = new Meta(data, metaRaw);
		});
	}

	$getBuffer() {
		return new Promise((resolve, reject) => {
			fs.readFile(this._sourcePath, (err, data) => {
				if (err) {
					return reject(err);
				}

				resolve(data);
			});
		});
	}

	destory() {
		
	}

	static from(buffer, store) {
		const meta = new Meta(buffer);
		const dirPath = store.getDirPathname(meta.hash);

		try {
			fs.accessSync(dirPath);
		} catch (err) {
			fs.ensureDirSync(dirPath);
	
			const sourcePath = path.resolve(dirPath, FILE_NAME);
			const metaPath = path.resolve(dirPath, META_NAME);
	
			fs.writeFileSync(metaPath, JSON.stringify(meta.raw()), {
				encoding: 'utf-8'
			});
	
			fs.writeFile(sourcePath, buffer, err => {
				if (err) {
					throw err;
				} 
			});
		}

		return new this(dirPath);
	}
}

exports.FileStoreAdapter = class FileStoreAdapter extends BaseStoreAdapter {
	constructor({ root }) {
		super();

		if (!path.isAbsolute(root)) {
			throw new Error('The rootPath must be an absolute path.');
		}

		this._root = root;
		this._list = {};

		this.log = [];

		this._registerStoredEntry();
	}

	_registerStoredEntry() {

	}

	_registerEntry(entry) {
		this[entry.meta.hash] = entry;
	}

	getDirPathname(hash) {
		return path.resolve(this._root, hash);
	}

	$put(buffer) {
		const entry = FileEntry.from(buffer, this);

		this._registerEntry(entry);

		return entry;
	}

	$get(hash) {
		const entry = this._list[hash];

		if (!entry) {
			this.throwEntryNotFound(hash);
		}

		return entry;
	}
};

exports.FileEntry = FileEntry;