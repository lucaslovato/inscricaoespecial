import {servicesModules} from "../../services";

export default {
  methods: {
    logout: async function () {
      try {
        const user = await servicesModules.LFM.getItem('user');
        const responseMessage = await servicesModules.REQUESTMANAGER.callMethod({
          method: 'post',
          path: '/open/logout',
          body: {
            userId: user.id
          }
        }).then(async () => {
          servicesModules.LFM.removeItem('user');
          await this.$router.replace('/');
        });
      } catch (error) {
        this.error_message = error.response ? error.response.data.description : "Ocorreu um erro desconhecido";
      }
    },
    readSubjects: async function () {
      try {
        const user = await servicesModules.LFM.getItem('user');
        const responseMessage = await servicesModules.REQUESTMANAGER.callMethod({
          method: 'post',
          path: '/readSubject',
          headers: {
            'authentication-key': user.id
          },
          body: {
            removed: false,
          }
        });
        this.subjects = responseMessage.data;
      } catch (error) {
        this.error_message = error.response ? error.response.data.description : "Ocorreu um erro desconhecido.";
      }
    },
    addSubject: async function () {
      try {
        this.addDialog = false;
        const user = await servicesModules.LFM.getItem('user');
        const responseMessage = await servicesModules.REQUESTMANAGER.callMethod({
          method: 'post',
          path: '/createSubject',
          headers: {
            'authentication-key': user.id
          },
          body: {
            name: this.newSubjectName,
          }
        }).then(async (subject) => {
          if (subject.data[0].removed === false) this.subjects.push(subject.data[0]);
          await this.clearEditSubject();
        });
      } catch (error) {
        this.error_message = error.response ? error.response.data.description : "Ocorreu um erro desconhecido.";
      }
    },
    updateSubject: async function () {
      try {
        this.infoDialog1 = false;
        const usuario = await servicesModules.LFM.getItem('user');
        const responseMessage = await servicesModules.REQUESTMANAGER.callMethod({
          method: 'post',
          path: '/updateSubject',
          headers: {
            'authentication-key': usuario.id
          },
          body: {
            id: this.editSubject.id,
            name: this.editSubject.name,
          }
        }).then(subject => {
        });
      } catch (error) {
        this.error_message = error.response ? error.response.data.description : "Ocorreu um erro desconhecido.";
      }
    },
    deleteSubject: async function () {
      try {
        this.infoDialog1 = false;
        const user = await servicesModules.LFM.getItem('user');
        const responseMessage = await servicesModules.REQUESTMANAGER.callMethod({
          method: 'post',
          path: '/removeSubject',
          headers: {
            'authentication-key': user.id
          },
          body: {
            id: this.editSubject.id,
            removed: true,
          }
        }).then(async (subject) => {
          await this.clearEditSubject();
          //todo: funcao para remover o item certo
        });
        await this.clearEditSubject();
      } catch (error) {
        this.error_message = error.response ? error.response.data.description : "Ocorreu um erro desconhecido.";
      }
    },
    editDialog: function (item) {
      this.editSubject = Object.assign({}, item);
      this.infoDialog1 = true;
    },
    clearEditSubject: async function () {
      this.editSubject.id = '';
      this.editSubject.name = '';
    },
    readRunningSubscriptions: async function () {
      try {
        const user = await servicesModules.LFM.getItem('user');
        const responseMessage = await servicesModules.REQUESTMANAGER.callMethod({
          method: 'post',
          path: '/subscriptionRead',
          headers: {
            'authentication-key': user.id
          },
          body: {
            query: {
              status: 1,
            }
          }
        });
        responseMessage.data.forEach(element => {
          element.status = "Em andamento";
        });
        this.runningSubscriptions = responseMessage.data[0];
        this.runningSubjects = this.runningSubscriptions.subjects;
      } catch (error) {
        this.error_message = error.response ? error.response.data.description : "Ocorreu um erro desconhecido.";
      }
    },
    addSubscription: async function () {
      try {
        let myDates = await this.dateCreate();
        let mySubjectIds = await this.getSubjectsId();
        const user = await servicesModules.LFM.getItem('user');
        const responseMessage = await servicesModules.REQUESTMANAGER.callMethod({
          method: 'post',
          path: '/createSubscription',
          headers: {
            'authentication-key': user.id
          },
          body: {
            initDate: myDates.myInitDate,
            endDate: myDates.myEndDate,
            subjects: mySubjectIds
          }
        }).then(async (subscription) => {
          this.addDialogSubscription = false;
        });
      } catch (error) {
        console.log("oi", error);
        this.error_message = error.response ? error.response.data.description : "Ocorreu um erro desconhecido.";
      }
    },
    selectSubjectsFunc: async function () {
      this.subjects.forEach(element => {
        this.selectSubjectItems.push(element.name);
        this.selectSubjectValue.push(element.name);
      })
    },
    dateCreate: async function () {
      let myInitData = this.newSubscriptionInitDate.split('-');
      let myInitNumbers = [];
      await myInitData.forEach(element => {
        myInitNumbers.push(parseInt(element));
      });
      let myInitDate = await new Date(myInitNumbers[0], myInitNumbers[1], myInitNumbers[2], 0, 0, 59);
      let myEndData = this.newSubscriptionEndDate.split('-');
      let myEndNumbers = [];
      await myEndData.forEach(element => {
        myEndNumbers.push(parseInt(element));
      });
      let myEndDate = await new Date(myEndNumbers[0], myEndNumbers[1], myEndNumbers[2], 23, 59, 59);
      let validator = await this.dateValidator(myInitDate, myEndDate);
      if (!validator) {
        return this.error_message = "data errada";
      }
      return {
        myInitDate,
        myEndDate
      }
    },
    dateValidator: async function (myInitDate, myEndDate) {
      return myInitDate < myEndDate;
    },
    getSubjectsId: async function () {
      let subjectReturn = [];
      await this.subjects.forEach(element => {
        this.selectSubjectValue.forEach(selectedElement => {
          if (selectedElement === element.name) {
            subjectReturn.push(element.id);
          }
        })
      });
      return subjectReturn;
    }
  },
  data() {
    return {
      drawer: null,
      error_message: "",
      text: {
        logoutButton: "Logout",
        subjectsLabel: "Disciplinas Cadastradas",
        subscriptionLabel: "Inscrição em andamento"
      },
      newSubjectName: '',
      newSubscriptionInitDate: new Date().toISOString().substr(0, 10),
      newSubscriptionEndDate: new Date().toISOString().substr(0, 10),
      newSubscriptionSubjects: [],
      subjects: [],
      subscriptions: [],
      runningSubscriptions: [],
      runningSubjects: [],
      subscribers: [],
      addDialog: false,
      addDialogSubscription: false,
      infoDialog1: false,
      menu: false,
      menu2: false,
      dateValidatorNewSubInit: new Date().toISOString(),
      dateValidatorNewSubEnd: new Date().toISOString(),
      selectSubjectItems: [],
      selectSubjectValue: [],
      user: {},
      editSubject: {
        id: '',
        name: '',
      },
    }
  },
  props: {
    source: String
  },
  created() {},
  async mounted() {
    setTimeout(async () => {
      await this.readSubjects();
      await this.readRunningSubscriptions();
      await this.selectSubjectsFunc();
    }, 200)
  },
}
