'use strict';
const fs = require('fs-extra');
const { FileStoreAdapter, FileEntry } = require('../src/store/file');
const path = require('path');
const assert = require('assert');
const { Buffer } = require('buffer');

const SANDBOX_PATH = path.resolve(process.cwd(), 'sandbox');

describe('FileStoreAdapter', function () {
	fs.removeSync(SANDBOX_PATH);
	fs.copySync(path.resolve(__dirname, 'sandbox'), SANDBOX_PATH);

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
		const mockBuffer = Buffer.from('aaa');
		const exceptedHash = '7e240de74fb1ed08fa08d38063f6a6a91462a815';
		const fileStoreAdapter = new FileStoreAdapter({
			root: SANDBOX_PATH
		});

		it('Create FileEntry', function () {
			fileStoreAdapter.put(mockBuffer);
		});

		it('Get FileEntry', function (done) {
			setTimeout(() => {
				const entry = fileStoreAdapter.get(exceptedHash);

				entry.read().then(buffer => {
					assert(buffer !== mockBuffer);
					assert(mockBuffer.equals(buffer));

					done();
				});

			}, 1000);
		});

	});

});