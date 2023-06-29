export default {
    // Возвращает из context значение по path имеющего вид "/foo/../../foo"
    get(context, path) {
        let cursor = context;
        const struct = path.slice(1).split('/');
        while(struct.length && cursor) {
            cursor = cursor[struct.shift()];
        }
        return cursor;
    }
};
