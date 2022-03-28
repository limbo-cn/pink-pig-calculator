import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import pattern from './pattern'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

const patternState = createPersistedState({
  paths: ['pattern']
})

const Store = createStore({
  modules: {
    pattern
  },

  plugins: [patternState],
  // enable strict mode (adds overhead!)
  // for dev mode and --debug builds only
  strict: process.env.DEBUGGING
})

export default Store
