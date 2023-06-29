import compression from 'compression';

export default (app) => {
    function shouldCompress(req, res) {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }

    app.use(compression({ filter: shouldCompress }));
};
