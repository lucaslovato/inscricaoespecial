<style lang="scss">
    .footer-class {
        background-color: transparent !important;
    }

    .toggle-custom-button {
        margin-bottom: 15px;
        margin-right: 10px;
        background-color: transparent !important;
    }

    .toggle-custom-button-mobile {
        display: none;
    }

    /**
     Layout mobile.
   */
    @media screen and (max-width: 767px) {
        .footer-class {
            display: none;
        }
        .toggle-custom-button-mobile {
            display: flex;
            background-color: transparent !important;
        }
    }

    /***/
</style>
<template>
    <v-app id="container">
        <Toolbar v-if="user"></Toolbar>
        <v-content>
            <router-view :user="user"></router-view>
        </v-content>
    </v-app>
</template>
<script>

  export default {
    name: 'App',
    components: {
    },
    computed: {
      user() {
        return this.$store.state.user.userInfo
      },
    },
  }
</script>
