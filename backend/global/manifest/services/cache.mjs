// Сервис кэширования.
// Должен реализовываться для каждого случая развертывания.
// По умолчанию является MOC
export default {
    // Резолвит URL
    // eslint-disable-next-line no-unused-vars
    makeURIByBaseURI(URL, BaseURL) {
        // eslint-disable-next-line no-console
        console.warn('makeURIByBaseURI method of cache service is not realized.');
        return URL;
    },
    // Вызывается при перед запуском процесса парсинга манифестов
    start() {
        // eslint-disable-next-line no-console
        console.warn('Start method of cache service is not realized.');
    },
    // Обработка запроса на файл манифеста
    // url - ссылка на файл манифеста
    // path - путь к свойству от корня манифеста
    // Результат - axios response, если null, то требует игнорирования
    async request(url, path) {
        // eslint-disable-next-line no-console
        throw `Request method of cache service is not realized. url=[${url}] path=[${path}]`;
    },
    // Вызывается после завершения процесса парсинга манифестов
    finish() {
        // eslint-disable-next-line no-console
        console.warn('Finish method of cache service is not realized.');
    }
};
