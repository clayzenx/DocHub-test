import logger from '../utils/logger.mjs';
import request from '../helpers/request.mjs';

const LOG_TAG = 'controller-storage';

export default (app) => {
    // Проксирует запрос к хранилищу
    app.get('/core/storage/:hash/*', async function(req, res) {
        const hash = req.params.hash || '$unknown$';
        const url = req.originalUrl.slice(`/core/storage/${hash}/`.length).replace(/\%E2\%86\%90/g, '..');
        //const url = decodeURIComponent(req.params.url);
        const uri = url.split('?')[0];
        const baseURL = app.storage?.md5Map[hash];
        logger.log(`Request to storage ${req.originalUrl}`, LOG_TAG);
        if (!baseURL || !uri) {
            res.status(403).json({
                error: 'Access denied'
            });
        } else {
            request(uri, baseURL, res)
                .catch((e) => res.status(500).json({
                    message: e.message,
                    error: e
                }));
        }
    });
};

