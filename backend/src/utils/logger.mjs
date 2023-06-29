export default {
	log(text, tag) {
		// eslint-disable-next-line no-console
		console.log(`${Date.now()}:${tag}:${text}`);
	},
	error(text, tag) {
		// eslint-disable-next-line no-console
		console.error(`${Date.now()}:${tag}:${text}`);
	}
};
