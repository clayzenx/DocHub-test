import request from './request.mjs';
import logger from '../utils/logger.mjs';

const LOG_TAG = 'storage-manager';
const listeners = global.$listeners;

export default {
    // Событие наличия ошибок при загрузке манифестов
    onFoundLoadingError() {
        if (listeners.onFoundLoadingError) {
            request(listeners.onFoundLoadingError)
                .catch((e) => {
                    logger.error(`Error of delivery event onFoundLoadingError to [${listeners.onFoundLoadingError}] with error [${e.message}]`, LOG_TAG);
                });
            logger.log(`Sent event onFoundLoadingError to [${listeners.onFoundLoadingError}]`, LOG_TAG);
        }
    }
};
