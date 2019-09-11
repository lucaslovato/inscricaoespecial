<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-app id="inspire">
        <v-navigation-drawer
                v-model="drawer"
                fixed
                app
        >
            <v-list dense>
                <v-list-tile @click="">
                    <v-list-tile-action>
                        <v-icon>home</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Home</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile @click="">
                    <v-list-tile-action>
                        <v-icon>contact_mail</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Ver todas as Inscrições</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar color="primary" dark fixed app>
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title>Application</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
                    color="red"
                    @click="logout()"
            >{{text.logoutButton}}
            </v-btn>
        </v-toolbar>
        <v-content>
            <v-container>
                <v-layout
                        align-start
                        justify-center
                        row
                        fill-height
                        justify-space-around
                >
                    <v-flex xs12 sm4 md4>
                        <v-card>
                            <v-toolbar color="primary" light extended>
                                <v-btn
                                        fab
                                        small
                                        color="indigo"
                                        bottom
                                        left
                                        absolute
                                        @click="addDialogSubscription = !addDialogSubscription"
                                >
                                    <v-icon>add</v-icon>
                                </v-btn>
                                <template v-slot:extension>
                                    <v-toolbar-title class="white--text">{{text.subscriptionLabel}}
                                    </v-toolbar-title>
                                </template>
                                <v-spacer></v-spacer>
                            </v-toolbar>
                            <v-list two-line style="padding: 20px">
                                <v-list-tile avatar @click="">
                                    <v-list-tile-content>
                                        <v-list-tile-title>Data de inicio: {{runningSubscriptions.initDate}}
                                        </v-list-tile-title>
                                        <v-list-tile-title>Data de fim: {{runningSubscriptions.endDate}}
                                        </v-list-tile-title>
                                        <v-list-tile-title>Status: {{runningSubscriptions.status}}</v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action></v-list-tile-action>
                                </v-list-tile>
                                <v-divider></v-divider>
                                <v-list-tile avatar>
                                    <v-list-tile-content>
                                        <v-list-tile-title>Disciplinas</v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action></v-list-tile-action>
                                </v-list-tile>
                                <v-list-tile v-for="item in runningSubscriptions.subjects" :key="item.subject.id">
                                    <v-list-tile-content>
                                        <v-list-tile-title>{{item.subject.name}}</v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action></v-list-tile-action>
                                </v-list-tile>
                            </v-list>
                        </v-card>
                    </v-flex>
                    <v-flex xs12 sm4 md4>
                        <v-card>
                            <v-toolbar color="primary" light extended>
                                <v-btn
                                        fab
                                        small
                                        color="indigo"
                                        bottom
                                        left
                                        absolute
                                        @click="addDialog = !addDialog"
                                >
                                    <v-icon>add</v-icon>
                                </v-btn>
                                <template v-slot:extension>
                                    <v-toolbar-title class="white--text">{{text.subjectsLabel}}
                                    </v-toolbar-title>
                                </template>
                                <v-spacer></v-spacer>
                            </v-toolbar>
                            <v-list two-line>
                                <v-list-tile v-for="item in subjects" :key="item.id" avatar @click="editDialog(item)">
                                    <v-list-tile-content>
                                        <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-list-tile-action>
                                        <v-btn icon
                                               @click="editDialog(item)"
                                        >
                                            <v-icon color="grey lighten-1">info</v-icon>
                                        </v-btn>
                                    </v-list-tile-action>
                                </v-list-tile>
                            </v-list>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
        <v-footer color="primary" app>
            <span class="white--text">&copy; 2019</span>
        </v-footer>

        <!--Dialog da seção de EDITAR uma disciplina nova-->
        <v-dialog v-model="infoDialog1" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Alterar discipplina</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md6>
                                <v-text-field v-model="editSubject.name" label="Novo nome da disciplina*"
                                              required></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="updateSubject">Save</v-btn>
                    <v-btn color="primary" @click="deleteSubject">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--Dialog da seção de ADICIONAR uma DISCIPLINA nova-->
        <v-dialog v-model="addDialog" max-width="500px">
            <v-card>
                <v-card-text>
                    <v-text-field v-model="newSubjectName"
                                  :rules="[
                                  () => !!newSubjectName || 'This field is required',
                                  () => !!newSubjectName && newSubjectName.length > 5 || 'O nome da disciplina tem que ter mais do que 5 caracteres'
                                  ]"

                                  label="New Subject Name"
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn flat color="primary" @click="addSubject()">Submit</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <!--dialog da seção de ADICIONAR uma INSCRIÇÃO nova-->

        <v-dialog v-model="addDialogSubscription" max-width="500px" persistent>
            <v-card>
                <v-container fluid grid-list-xl>
                    <v-layout align-center wrap>
                        <v-flex xs12 sm12>
                            <v-menu
                                    ref="menu"
                                    v-model="menu"
                                    :close-on-content-click="false"
                                    :nudge-right="40"
                                    lazy
                                    transition="scale-transition"
                                    offset-y
                                    full-width
                                    min-width="290px"
                            >
                                <template v-slot:activator="{ on }">
                                    <v-text-field
                                            v-model="newSubscriptionInitDate"
                                            label="Data de inicio do Processo Seletivo - Formato AAAA/MM/DD"
                                            prepend-icon="event"
                                            readonly
                                            v-on="on"
                                    ></v-text-field>
                                </template>
                                <v-date-picker v-model="newSubscriptionInitDate" no-title
                                               @input="menu = false"
                                               :min="dateValidatorNewSubInit"
                                ></v-date-picker>
                            </v-menu>
                            <v-menu
                                    ref="menu2"
                                    v-model="menu2"
                                    :close-on-content-click="false"
                                    :nudge-right="40"
                                    lazy
                                    transition="scale-transition"
                                    offset-y
                                    full-width
                                    min-width="290px"
                            >
                                <template v-slot:activator="{ on }">
                                    <v-text-field
                                            v-model="newSubscriptionEndDate"
                                            label="Data de fim do Processo Seletivo - Formato AAAA/MM/DD"
                                            prepend-icon="event"
                                            readonly
                                            v-on="on"
                                    ></v-text-field>
                                </template>
                                <v-date-picker v-model="newSubscriptionEndDate" no-title
                                               @input="menu2 = false"
                                               :min="dateValidatorNewSubEnd"
                                >

                                </v-date-picker>
                            </v-menu>
                            <v-select
                                    v-model="selectSubjectValue"
                                    :items="selectSubjectItems"
                                    chips
                                    label="Selecionar Disciplinas"
                                    multiple
                            ></v-select>
                        </v-flex>
                    </v-layout>
                </v-container>
                <v-card-actions>
                    <v-btn color="primary" flat @click="addSubscription">Save</v-btn>
                    <v-btn color="primary" flat @click="addDialogSubscription = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>
<script src="./Admin.js">
</script>

<style scoped>
</style>


<!--todo: por os participantes da inscricao no card subscription-->
<!--todo: pagina da inscricao e nao esquecer de startar a inscricao que quer-->
<!--todo: pagina da inscricao ver todas -> aberto -> fechada -> em andamento-->