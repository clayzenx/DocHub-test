// Выполняет валидаторы и накладывает исключения
export default function(datasets, manifest, success, reject) {
	const rules = (manifest['rules'] || {});
	const validators = rules['validators'] || {};
	const exceptions = rules['exceptions'] || {};

	for (const id in validators) {
		datasets.getData(manifest, Object.assign({_id: id}, validators[id]))
			.then((items) => {
				success({
					id,
					title: validators[id].title || id,
					items: (items || []).map((item) => {
						return Object.assign({
							exception: exceptions[item.uid]
						}, item);
					})
				});
			}).catch((error) => {
				reject(
					{
						id,
						title: validators[id].title || id,
						error,
						items: [
							{
								uid: id,
								title: 'Критическая ошибка валидатора!',
								correction: 'Исправьте ошибку в запросе валидатора',
								description: error.message
							}
						]
					}
				);
			});
	}
}
