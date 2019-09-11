import Vue from "vue";
import Vuex from "vuex";
import user from "./modules/user";
import locale from "./modules/locale";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    user,
    locale
  }
})