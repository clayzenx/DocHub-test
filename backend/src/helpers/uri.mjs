import uriToolConstructor from '../../global/manifest/tools/uri.mjs';

const config = {
    gitlab_server: process.env.VUE_APP_DOCHUB_GITLAB_URL,
    porsonalToken: process.env.VUE_APP_DOCHUB_PERSONAL_TOKEN
};

export default new uriToolConstructor(config);
