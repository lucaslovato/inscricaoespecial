import {servicesModules} from '../../services/'


export default {
  methods: {
    /**
     * Método para entrar no sistema.
     * @returns {Promise<void>}
     */
    login: async function () {
      this.validate_login = false;
      try {
        const responseMessage = await servicesModules.REQUESTMANAGER.callMethod({
          method: 'post',
          path: '/open/login',
          body: this.user
        });
        console.log('response', responseMessage);
        let user = responseMessage.data.data;
        console.log('user: ', user);
        if (user.type === 'admin') {
          this.$store.commit('updateUser', user);
          servicesModules.LFM.setItem('user', user);
          this.$router.replace('admin-home');
        }
      } catch (error) {
        console.log(error);
        this.validate_login = true;
        this.error_message = error.response ? error.response.data.description : "Ocorreu um erro desconhecido.";
      }
    }
  },
  data() {
    return {
      user: {
        login: 'admin@admin.com',
        password: 'admin'
      },
      validate_login: false,
      error_message: "",
      rules: {},
      class_login: "input_login",
      osvaldCounter: 0,
      routeErrorSnackbar: false,
      timeout: 4000,
      routeErrorSnackbarText: '',
      text: {
        loginTitle: 'Login',
        emailField: 'Email',
        password: 'Senha',
        loginButton: 'Entrar',
      },
      snackbarText: {
        routeError: 'Rota não acessivel'
      }
    }
  },
  watch: {
    validate_login: function () {
      if (this.validate_login) {
        this.class_login = null;
      } else {
        this.class_login = "input_login";
      }
    }
  },
  /**
   * Antes de entrar na tela de login:
   *
   * Se o usuário estiver logado, redireciona para
   * a página Home.
   *
   * Se o usuário vem por onError, retira o usuário do
   * constrole de estado e mostra mensagem de erro.
   *
   * Se o usuário vier por logout, apenas entra na página.
   * @param to
   * @param from
   * @param next
   */
  async beforeRouteEnter(to, from, next) {
    const user = await servicesModules.LFM.getItem('user');
    if(user != null){
      if (user.type === 'admin') return next('/admin-home');
      else if (user.type === 'user') return next('/home');
    }
    next(vm => {
      vm.$store.commit('updateUser', null);
    });
  }
}
