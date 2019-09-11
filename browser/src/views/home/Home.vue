<style>
</style>
<template>
    <v-container fluid fill-height>
        <v-layout align-center justify-center>
            <v-flex xs12 sm8 md4>
                <v-card>
                    <v-card-title primary-title>
                        <h3 class="headline mb-0">Bem vindo Comum</h3>
                    </v-card-title>
                    <v-card-text>

                    </v-card-text>
                    <v-card-actions>

                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>

        <v-snackbar
                color="error"
                :top="true"
                :multi-line="true"
                :timeout="timeout"
                v-model="routeErrorSnackbar"
        >
            Sem autorização para essa rota.
            <v-btn dark flat @click.native="routeErrorSnackbar = false">
                <v-icon>close</v-icon>
            </v-btn>
        </v-snackbar>

    </v-container>
</template>
<script src="./Home.js"></script>