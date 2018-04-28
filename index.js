'use strict';
const sharp = require('sharp'); 

exports.ImageRepository = class ImageRepository {
	constructor(store, { root }) {
		this.store = store;
		this.index = {};
	}

	query(uri) {

	}

	push(entry, options) {
		this.store.put(entry);

	}

	fetch({ idType, value }, options) {
		this.store.get(hash);
	}
};
