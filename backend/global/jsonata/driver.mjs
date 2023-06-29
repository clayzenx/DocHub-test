import jsonata from 'jsonata';
import ajv from 'ajv';
import source from '../datasets/source.mjs';
// import ajv_localize from 'ajv-i18n/localize/ru';
// const ajv_localize = require('ajv-i18n/localize/ru');

// Расширенные функции JSONata
function wcard(id, template) {
	if (!id || !template) return false;
	const tmlStruct = template.split('.');
	let items = [];
	for (let i = 0; i < tmlStruct.length; i++) {
		const pice = tmlStruct[i];
		if (pice === '**') {
			items.push('.*$');
			break;
		} else if (pice === '*') {
			items.push('[^\\.]*');
		} else items.push(pice);
	}

	const isOk = new RegExp(`^${items.join('\\.')}$`);

	return isOk.test(id);
}

function mergeDeep(sources) {
	function mergeDeep(target, sources) {
		function isObject(item) {
			return (item && typeof item === 'object' && !Array.isArray(item));
		}

		if (!sources.length) return target;
		const source = sources.shift();

		if (isObject(target) && isObject(source)) {
			for (const key in source) {
				if (isObject(source[key])) {
					if (!target[key]) Object.assign(target, { [key]: {} });
					mergeDeep(target[key], [source[key]]);
				} else {
					Object.assign(target, { [key]: source[key] });
				}
			}
		}
		return mergeDeep(target, sources);
	}
	return mergeDeep({}, sources);
}

function jsonSchema(schema) {
	const rules = new ajv({ allErrors: true });
	const validator = rules.compile(schema);
	return (data) => {
		const isOk = validator(data);
		if (isOk) return true;
		// ajv_localize(validator.errors);
		return validator.errors;
	};
}

function sourceType(content) {
	return source.type(content);
}

function log(content, tag) {
	// eslint-disable-next-line no-console
	console.info(`${tag}: ${JSON.stringify(content, null, 2)}`);
}

export default {
	// Создает объект запроса JSONata
	//  expression - JSONata выражение
	//  self    - объект, который вызывает запрос (доступен по $self в запросе)
	//  params  - параметры передающиеся в запрос
    //  isTrace - признак необходимости проанализировать выполнение запроса.
    //          Если true, то в объекте запроса, после его выполнения, появится поле "trace"
    //  funcs - кастомные функции, регистрируемые в JSONata 
	expression(expression, self_, params, isTrace, funcs) {
		const obj = {
			expression,
			core: null,
			onError: null,  // Событие ошибки выполнения запроса
			store: {},      // Хранилище вспомогательных переменных для запросов
			// Исполняет запрос
			//  context - контекст исполнения запроса
			//  def - если возникла ошибка, будет возращено это дефолтное значение
			async evaluate(context, def) {
				try {
					if (!this.core) {
						this.core = jsonata(this.expression);
						this.core.assign('self', self_);
						this.core.assign('params', params);
						this.core.registerFunction('wcard', wcard);
						this.core.registerFunction('mergedeep', mergeDeep);
						this.core.registerFunction('jsonschema', jsonSchema);
						this.core.registerFunction('sourcetype', sourceType);
						if (!funcs?.log) {
							this.core.registerFunction('log', log);
						}
						this.core.registerFunction('set', (key, data) => {
							return obj.store[key] = data;
						});
						this.core.registerFunction('get', (key) => {
							return obj.store[key];
						});
                        for(const name in funcs || {}) {
                            this.core.registerFunction(name, funcs[name]);
                        }
					}

                    if (isTrace) {
                        obj.trace = {
                            start: (new Date()).getTime(),
                            end: null
                        };
                        const result = Object.freeze(this.core.evaluate(context));
                        obj.trace.end = (new Date()).getTime();
                        obj.trace.exposition = this.trace.end - this.trace.start;
                        // eslint-disable-next-line no-console
                        console.groupCollapsed(`JSONata tracer expression (${obj.trace.exposition/1000} seconds):`);
                        // eslint-disable-next-line no-console
                        console.info('Statistics:', obj.trace);
                        // eslint-disable-next-line no-console
                        console.info('Query:', obj.expression);
                        // eslint-disable-next-line no-console
                        console.info('Result:', result);
                        // eslint-disable-next-line no-console
                        console.groupEnd();
                        return result;
                    } else return Object.freeze(this.core.evaluate(context));

				} catch (e) {
					// eslint-disable-next-line no-console
					console.error('JSONata error:');
					// eslint-disable-next-line no-console
					console.log(this.expression.slice(0, e.position) + '%c' + this.expression.slice(e.position), 'color:red');
					// eslint-disable-next-line no-console
					console.error(e);
					throw e;
				}
			}
		};
		return obj;
	}
};
