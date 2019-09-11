const state = {
  userInfo: null
};

const getters = {

};

const actions = {

};

const mutations = {
  initUser(state, userInfo){
    state.userInfo = userInfo;
  },
  updateUser(state, updatedInfo) {
    state.userInfo = updatedInfo;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
}