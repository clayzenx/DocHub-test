import request from './request.mjs';
import jsonataDriver from '../../global/jsonata/driver.mjs';
import datasetDriver from '../../global/datasets/driver.mjs';
import pathTool from '../../global/manifest/tools/path.mjs';
import md5 from 'md5';

export default function(app) {
	const result = Object.assign({}, datasetDriver,
		{
			// Возвращаем метаданных об объекте
			pathResolver(path) {
				return {
					context: app.storage.manifest,
					subject: pathTool.get(app.storage.manifest, path),
					baseURI: app.storage.md5Map[md5(path)]
				};
			},
			// Драйвер запросов к ресурсам
			request,
			// Драйвер запросов JSONata
			jsonataDriver
		});
	
	return result;
}
