<style lang="scss" scoped>
    .is-danger {
        color: #FF5252;
        font-size: 12px;
    }

    .input_login {
        color: white !important;
    }

    .headerDivider {
        border-left: 1px solid white;
        border-right: 1px solid white;
        height: 200px;
        margin-right: 50px;
    }

    .display-logo-mobile {
        display: none;
    }

    /**
    Layout mobile.
     */
    @media screen and (max-width: 767px) {
        .headerDivider {
            display: none;
        }
        .display-logo {
            display: none;
        }
        .display-logo-mobile {
            display: inline-flex;
            max-height: 200px;
            max-width: 187px;
        }
        .layout-mobile {
            margin-top: 40%;
            text-align: center !important;
            align-items: flex-start;
        }

        .header-mobile {
            text-align: left !important;
        }
    }

    /***/

    .body {
        width: 100%;
        height: 100%;
        color: #fff;
        background: linear-gradient(-45deg, #9b64ff, #4d3582, #2a0845, #1f0735) !important;
        background-size: 400% 400% !important;
        -webkit-animation: Gradient 15s ease infinite;
        -moz-animation: Gradient 15s ease infinite;
        animation: Gradient 15s ease infinite;
    }

    @-webkit-keyframes Gradient {
        0% {
            background-position: 0% 50%
        }
        50% {
            background-position: 100% 50%
        }
        100% {
            background-position: 0% 50%
        }
    }

    @-moz-keyframes Gradient {
        0% {
            background-position: 0% 50%
        }
        50% {
            background-position: 100% 50%
        }
        100% {
            background-position: 0% 50%
        }
    }

    @keyframes Gradient {
        0% {
            background-position: 0% 50%
        }
        50% {
            background-position: 100% 50%
        }
        100% {
            background-position: 0% 50%
        }
    }

    h1,
    h6 {
        font-family: 'Open Sans';
        font-weight: 300;
        text-align: center;
        position: absolute;
        top: 45%;
        right: 0;
        left: 0;
    }
</style>
<template>
    <v-container fluid fill-height class="body" v-if="text">
        <v-layout class="layout-mobile" align-center justify-center xs12 sm8
                  md4>
            <img class="display-logo" src="../../assets/logo-kraken.png"/>
            <div class="headerDivider"></div>
            <v-flex xs12 sm8 md4>
                <img class="display-logo-mobile"
                     src="../../assets/logo-kraken.png"/>
                <h3 class="headline mb-0 header-mobile" style="color: white">
                    {{text.loginTitle}}</h3>
                <v-form>
                    <v-text-field :class="class_login" prepend-icon="person"
                                  name="login"
                                  :label="text.emailField" type="text"
                                  :error="validate_login"
                                  v-on:keyup.enter="login"
                                  v-on:click="validate_login = false"
                                  v-model="user.login" dark>
                    </v-text-field>
                    <v-text-field :class="class_login" prepend-icon="lock"
                                  name="password"
                                  :label="text.passwordField" id="password"
                                  type="password"
                                  :error="validate_login"
                                  v-on:keyup.enter="login"
                                  v-on:click="validate_login = false"
                                  v-model="user.password" dark>
                    </v-text-field>
                    <span class="is-danger" v-if="validate_login">{{error_message}}</span>
                    <v-flex xs12 offset-md9 offset-lg10>
                        <v-btn dark flat v-on:click="login">
                            {{text.loginButton}}
                        </v-btn>
                    </v-flex>
                </v-form>
            </v-flex>
        </v-layout>

        <v-snackbar
                color="error"
                :top="true"
                :multi-line="true"
                :timeout="timeout"
                v-model="routeErrorSnackbar"
        >
            {{snackbarText.routeError}}
            <v-btn dark flat @click.native="routeErrorSnackbar = false">
                <v-icon>close</v-icon>
            </v-btn>
        </v-snackbar>

    </v-container>
</template>
<script src="./Login.js"></script>