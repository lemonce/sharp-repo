'use strict';
const { FileStoreAdapter, FileEntry } = require('../src/store/file');
const path = require('path');
const assert = require('assert');

const SANDBOX_PATH = path.resolve(process.cwd(), 'sandbox');

describe('FileStoreAdapter', function () {
	it('Create a FileStoreAdapter in absolute root path successfully.', function () {
		return new FileStoreAdapter({
			root: SANDBOX_PATH
		});
	});

	it('Create a FileStoreAdapter by invalid root path with failure.', function () {
		assert.throws(() => {
			return new FileStoreAdapter({
				root: '../'
			});
		});
	});

	describe('FileEntry', function () {
		const fileStoreAdapter = new FileStoreAdapter({
			root: SANDBOX_PATH
		});

		it('Create FileEntry', function () {
			fileStoreAdapter.put('aaa');
		});

	});

});