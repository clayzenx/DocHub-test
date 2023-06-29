// Подключаем переменные среды
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.$paths = {
    public: path.resolve(__dirname, '../../../public/'),
    dist: path.resolve(__dirname, '../../../dist/'),
    file_storage: (
        process.env.VUE_APP_DOCHUB_BACKEND_FILE_STORAGE 
        ? path.resolve(process.env.VUE_APP_DOCHUB_BACKEND_FILE_STORAGE) 
        : path.resolve(__dirname, '../../../public/')
    )
};

global.$listeners = {
    onFoundLoadingError: process.env.VUE_APP_DOCHUB_BACKEND_EVENT_LOADING_ERRORS_FOUND
};

export default dotenv;
