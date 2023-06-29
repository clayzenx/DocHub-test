export default {
    // Проверяет доступность сервиса
    isServiceReady: function(app, res) {
        if (!app.storage) {
            res.status(503);
            res.json({});
            return false;
        }
        return true;
    }
};
