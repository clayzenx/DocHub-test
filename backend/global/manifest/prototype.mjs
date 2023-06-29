// Модуль реализует наследование
export default {
	// Выполняет наследование
	// section - секция объектов
	// id - идентификатор объекта потомка
	inheritance(section, id) {
		const parentId = section[id]['$prototype'];
		if (parentId) {
			const parent = (section[parentId] || {})['$prototype']
				? this.inheritance(section, parentId)
				: section[parentId] || {};
			section[id] = Object.assign({}, parent, section[id]);
		}
	},

	// section - секция объектов требующих обработки
	expandSection(section) {
		for (const key in section) {
			this.inheritance(section, key);
		}
	},

	// manifest - манифест
	expandAll(mainfest) {
		mainfest
			&& [
				'docs', 'components', 'datasets',
				'contexts', 'aspects'
			].forEach((section) => this.expandSection(mainfest[section]));
	}
};
