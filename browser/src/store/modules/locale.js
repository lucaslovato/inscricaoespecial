const state = {
    localeOption: 'pt-Br',
    localeData: null
};

const getters = {};

const actions = {};

const mutations = {
    initLocale(state, objLocale) {
        state.localeOption = objLocale.locale;
        state.localeData = objLocale.localeData;
    },
    updateLocaleOption(state, value) {
        state.localeOption = value;
    },
    updateLocaleData(state, value){
        state.localeData = value;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
}