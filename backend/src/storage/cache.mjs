import prototype from '../../global/manifest/services/cache.mjs';
import request from '../helpers/request.mjs';
import logger from '../utils/logger.mjs';
import uriTool from '../helpers/uri.mjs';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import path from 'path';
import fs from 'fs';
import md5 from 'md5';

const LOG_TAG = 'manifest-cache';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Подключает базовую метамодель
function loadBaseMatamodel() {
    const source = path.resolve(__dirname, '../../assets/base.yaml');

    logger.log(`Import base metamodel from  [${source}].`, LOG_TAG);
    const content = fs.readFileSync(source, { encoding: 'utf8', flag: 'r' });
    return yaml.parse(content);
}

// Кэш в памяти
const memoryCache = {};

const errorType = {
    system: 'Внутрисистемная ошибка',
    syntax: 'Синтаксическая ошибка',
    net: 'Сетевая ошибка'
};

export default Object.assign(prototype, {
    // Выполняет resolve URL 
    makeURIByBaseURI: uriTool.makeURIByBaseURI,
    // Содержит ошибки, которые возникли за сессию
    errors: {},
    // Очищает регистр ошибок
    errorClear() {
        this.errors = {};
    },
    // Регистрирует ошибку
    // type         - Секция ошибки (system/syntax/net)
    // uid          - Уникальный идентификатор ошибки. 
    // title        - Определяет представление ошибки в дереве.
    // location     - URL с расположением объекта, где выявлена ошибка.
    // correction   - Краткое пояснение, как исправить ошибку.
    // description  - Описание причины ошибки.
    registerError(type, uid, title, location, correction, description) {
        !this.errors[type] && (this.errors[type] = {
            id: `$error.${type}`,
            title: errorType[type] || 'Неизвестная ошибка',
            items: []
        });
        logger.error(`${title}: ${description} [${location}]`, LOG_TAG);
        this.errors[type].items.push({
            uid, title, location, correction, description
        });
    },
    // Получает данные из кэша 
    //  key - ключ
    //  resolve - если в кэше данные не будут найдены, будет вызвана функция для генерации данных
    //  res - response объект express. Если указано, то ответ сразу отправляется клиенту
    async pullFromCache(key, resolve, res) {
        let fileName = null;
        try {
            let result = null;
            const cacheMode = process.env.VUE_APP_DOCHUB_DATALAKE_CACHE || 'none';
            switch (cacheMode.toLocaleLowerCase()) {
                case 'none': result = resolve && await resolve() || undefined; break;
                case 'memory': result = memoryCache[md5(key)] || (resolve && (memoryCache[md5(key)] = await resolve())); break;
                default: {
                    const hash = md5(key);
                    fileName = path.resolve(__dirname, '../../../', cacheMode, `${hash}.cache`);
                    if (!fs.existsSync(fileName)) {
                        result = JSON.stringify(await resolve() || null);
                        fs.writeFileSync(fileName, result, { encoding: 'utf8' });
                    }
                }
            }

            if (res) {
                if (fileName) {
                    res.setHeader('Content-Type', 'application/json').sendFile(fileName);
                } else res.status(200).json(result);
            } else if (fileName) {
                result = JSON.parse(fs.readFileSync(fileName, { encoding: 'utf8' }));
            }

            return res ? true : result;
        } catch (e) {
            this.registerError('system', md5(key), 'Cache error', fileName || 'memory', 'See error log at backed server', e.message);
            if (res) {
                res.status(500);
                res.json({
                    message: e.message,
                    error: e
                });
            }
            return undefined;
        }
    },
    // Выполняет запрос к данным
    async request(url, propPath) {
        let result = null;
        // Если это рутовый манифест, формируем его по конфигурации
        if ((url === 'file:///$root$') && (propPath === '/')) {
            // Подключаем базовую метамодель
            const content = loadBaseMatamodel();
            if (!content.imports) content.imports = [];
            
            // Подключаем метамодель DocHub или собственную
            content.imports.push(process.env.VUE_APP_DOCHUB_METAMODEL || '/metamodel/root.yaml');

            // Подключаем документацию, если нужно
            if ((process.env.VUE_APP_DOCHUB_APPEND_DOCHUB_DOCS || 'y').toLowerCase() === 'y') {
                content.imports.push('/documentation/root.yaml');
            }

            // Подключаем корневой манифест, если есть
            if (process.env.VUE_APP_DOCHUB_ROOT_MANIFEST) {
                content.imports.push(process.env.VUE_APP_DOCHUB_ROOT_MANIFEST);
            }
            
            logger.log(`Root manifest is [${content.imports.join('], [')}].`, LOG_TAG);
            result = {
                data: content
            };
        } else {
            try {
                result = await request(url);
            } catch(e) {
                this.registerError('net', md5(url), 'Request error', url, 'See details in error log of backed server', e.message);
                throw e;
            }
            logger.log(`Source [${url}] is imported.`, LOG_TAG);
        }
        return result;
    }
});

