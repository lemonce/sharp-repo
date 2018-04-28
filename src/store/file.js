'use strict';
const fs = require('fs-extra');
const path = require('path');

const { BaseStoreAdapter } = require('../class/adapter/store');
const BaseEntry = require('../class/entry');
const Meta = require('../class/meta');

const FILE_NAME = 'source';
const META_NAME = 'meta.json';

class FileEntry extends BaseEntry {
	constructor(meta, store) {
		super();

		this._sourcePath = store.getSourcePathname(meta.hash);

		this.meta = meta;
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
		fs.readdir(this._root, (err, list) => {
			list.forEach(hash => {
				const meta = new Meta(require(this.getMetaPathname(hash)))
				this._registerEntry(new FileEntry(meta, this));
			});
		});
	}

	_registerEntry(entry) {
		this._list[entry.meta.hash] = entry;
	}

	_writeEntry(buffer, meta) {
		const hash = meta.hash;

		// EnsureDir
		const dirPath = this.getDirPathname(hash);
		fs.ensureDirSync(dirPath);
	
		// Write files
		const sourcePath = this.getSourcePathname(hash);
		const metaPath = this.getMetaPathname(hash);

		fs.writeFile(metaPath, JSON.stringify(meta.raw()), {
			encoding: 'utf-8'
		}, err => {
			if (err) {
				throw err;
			}
		});

		fs.writeFile(sourcePath, buffer, err => {
			if (err) {
				throw err;
			}
		});
	}

	getDirPathname(hash) {
		return path.resolve(this._root, hash);
	}

	getSourcePathname(hash) {
		return path.resolve(this._root, hash, FILE_NAME);
	}

	getMetaPathname(hash) {
		return path.resolve(this._root, hash, META_NAME);
	}

	$put(buffer) {
		const meta = Meta.from(buffer);
		const existedEntry = this._list[meta.hash];

		if (existedEntry) {
			return existedEntry;
		}

		// Create new Entry & async writing files.
		const newEntry = new FileEntry(meta, this);
		this._registerEntry(newEntry);
		this._writeEntry(buffer, meta);

		return newEntry;
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