import path from 'path';
import express from 'express';

export default (app) => {
    // eslint-disable-next-line no-undef
    app.use('/', express.static($paths.dist));
    app.use('/', function(req, res) {
        // eslint-disable-next-line no-undef
        res.sendFile(path.join($paths.dist, 'index.html'));
    });
};

