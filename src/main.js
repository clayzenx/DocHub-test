import { init } from '../../DocHub/dist/dochub.js'
import 'dochubcore/dist/dochubcore.css'

const app = await init(process.env)

document.addEventListener('DOMContentLoaded', async () => {
  const {
    Vue,
    Root,
    router,
    vuetify,
    store
  } = await app

  new Vue({
    router,
    render(createElement) {
      return createElement(Root)
    },
    vuetify,
    store,
  }).$mount('#app')
})
