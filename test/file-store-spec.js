'use strict';
const fs = require('fs-extra');
const { FileStoreAdapter, FileEntry } = require('../src/store/file');
const path = require('path');
const assert = require('assert');
const { Buffer } = require('buffer');
const { ImageRepository } = require('../');

const SANDBOX_PATH = path.resolve(process.cwd(), 'sandbox');

describe('FileStoreAdapter', function () {
	fs.removeSync(SANDBOX_PATH);
	fs.copySync(path.resolve(__dirname, 'sandbox'), SANDBOX_PATH);

	it('Create a FileStoreAdapter in absolute root path successfully.', function (done) {
		const store = new FileStoreAdapter({
			root: SANDBOX_PATH
		});
	
		setTimeout(() => {
			assert(Object.keys(store._list).length === 4);

			done();
		}, 1000);
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

				assert(entry instanceof FileEntry);

				entry.read().then(buffer => {
					assert(buffer !== mockBuffer);
					assert(mockBuffer.equals(buffer));
					assert(entry.meta.visit - entry.meta.create !== 0);
				}).then(() => {
					setTimeout(() => {
						const meta = require(path.resolve(SANDBOX_PATH, entry.meta.hash, 'meta.json'));
						const fileMetaString = JSON.stringify(meta);
						const memoryMetaString = JSON.stringify(entry.meta.raw());

						assert(fileMetaString === memoryMetaString);
	
						done();
					}, 500);
				});

			}, 1000);
		});

	});

	describe('ImageRepository', function () {
		const fileStoreAdapter = new FileStoreAdapter({
			root: SANDBOX_PATH
		});

		it('Create Repo', function () {
			return new ImageRepository(fileStoreAdapter);
		});

		describe('ImageRepository method', function () {
			const repository = new ImageRepository(fileStoreAdapter);
			const sourceImgPath = path.resolve(__dirname, 'source.png');
			const sourceImgHash = '0eec03be19b107b8da8d7e79076c19f6d6e782a5';

			it('createProfile', function () {
				repository.createProfile('test', {
					chain: [
						{
							type: 'resize',
							args: [600, 300]
						},
					]
				});
			});

			it('push', function (done) {
				fs.readFile(sourceImgPath, (err, data) => {
					assert(err === null);

					const entry = repository.push(data);

					assert.equal(entry.meta.hash, sourceImgHash);

					done();
				});
			});

			describe('read', function () {
				const banner = {
					type: 'jpeg',
					chain: [
						{
							type: 'resize',
							args: [400, 300]
						},
						{
							type: 'max',
							args: []
						}
					]
				};

				repository.createProfile('banner', banner);

				it.skip('Read source.png in default.', function (done) {
					repository.read(sourceImgHash).then(({ data }) => {
						assert(data.equals(fs.readFileSync(sourceImgPath)));
						
						const outputPath = path.resolve(process.cwd(), 'test2.png');

						fs.writeFile(outputPath, data, (err) => {
							assert(err === null);
	
							done();
						});
					});
				})

				it('Read source.png in banner regular.', function (done) {
					repository.read(sourceImgHash, {
						regularName: 'banner'
					}).then(({ data }) => {
						const outputPath = path.resolve(process.cwd(), 'test.png');

						fs.writeFile(outputPath, data, (err) => {
							assert(err === null);
	
							done();
						});
					});
				})

			});

		});
	});
});
