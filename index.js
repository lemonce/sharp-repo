'use strict';
const sharp = require('sharp');

class Resource {
	constructor(name = '', history = [/* hash */]) {
		this.name = name;
		this.history = history;
	}

	get HEAD() {
		return this.history[0] || null;
	}

	get(reversionOffset = 0) {
		return this.history[reversionOffset];
	}

	push(entry) {
		this.history.unshift(entry);
	}
}

class IndexBaseAdapter {
	constructor({ pathname }) {
		this._path = pathname;

		this._resourceList = {};
	}

	init() {

	}

	commit(uri) {

	}

	get(name) {
		return this._resourceList[name];
	}
}

const IMAGE_TYPE_ENABLED = [
	'jpeg', 'png', 'webp', 'tiff'
];

const IMAGE_RESIZING = [
	'resize', 'crop', 'embed'
];

class Regular {
	constructor({ chain = [], type = null } = {}) {
		this.chain = chain;
		this.type = type;
	}

	exec(buffer) {
		const sharpInstance = sharp(buffer);

		const chain = this.chain;

		if (chain.length) {
			chain.forEach(step => {
				sharpInstance[step.type](...step.args);
			});
		}

		if (this.type) {
			sharpInstance[this.type]();
		}

		return sharpInstance.toBuffer({
			resolveWithObject: true
		});
	}

	exportOptions() {

	}
}

const HASH_REG = /^[a-f0-9]{40}$/;
const NO_REGULAR = {
	exec(data) {
		return Promise.resolve({ data });
	}
};

exports.ImageRepository = class ImageRepository {
	constructor(store, indexBase = null) {
		this.store = store;
		this.indexBase = indexBase;
		this.regularList = {
			default: NO_REGULAR
		};
	}

	init() {
		//TODO build or read index
	}

	isExisted(hash) {
		return this.store.has(hash);
	}

	push(buffer) {
		return this.store.put(buffer);
	}

	fetch(hash) {
		if (!this.isExisted(hash)) {
			throw new Error('The resource specified is not existed.');
		}

		return this.store.get(hash);
	}

	read(hash, { regularName = 'default' } = {}) {
		const regular = this.regularList[regularName];

		return this.fetch(hash).read().then(buffer => {
			return regular.exec(buffer);
		});
	}

	// getHashByUri(uri) {
	// 	const resource = this.indexBase.get(uri);

	// 	if (resource) {
	// 		return resource.HEAD;
	// 	}

	// 	const hash = uri;

	// 	if (HASH_REG.test(hash)) {
	// 		return hash;
	// 	}
	// }

	createProfile(name, options) {
		this.regularList[name] = new Regular(options);
	}
};
