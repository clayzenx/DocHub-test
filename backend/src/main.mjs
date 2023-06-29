import './helpers/env.mjs';
import logger from './utils/logger.mjs';
import storeManager from './storage/manager.mjs';
import express from 'express';
import middlewareCompression from './middlewares/compression.mjs';
import controllerStatic from './controllers/static.mjs';
import controllerCore from './controllers/core.mjs';
import controllerStorage from './controllers/storage.mjs';
import controllerEntity from './controllers/entity.mjs';
import middlewareAccess from './middlewares/access.mjs';
import validators from './helpers/validators.mjs';

const LOG_TAG = 'server';

//const express = require('express');
const app = express();
const serverPort = process.env.VUE_APP_DOCHUB_BACKEND_PORT || 3030;

// Актуальный манифест
app.storage = null;

// Подключаем контроль доступа
middlewareAccess(app);

// Подключаем сжатие контента
middlewareCompression(app);

// API ядра
controllerCore(app);

// API сущностей 
controllerEntity(app);

// Контроллер доступа к файлам в хранилище
controllerStorage(app);

// Статические ресурсы
controllerStatic(app);

// Основной цикл приложения
const mainLoop = async function() {
    // Загружаем манифест
    app.listen(serverPort, function(){
        logger.log(`DocHub server running on ${serverPort}`, LOG_TAG);
    });

    storeManager.reloadManifest()
        .then((storage) =>{
            app.storage = storage;  // Инициализируем данные хранилища
            validators(app);        // Выполняет валидаторы
            Object.freeze(app.storage);
        });

};

mainLoop();
