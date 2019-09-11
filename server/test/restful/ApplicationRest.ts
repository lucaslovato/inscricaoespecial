import * as path from 'path';
import {TestManager} from '../TestManager';

const chai: any = require('chai');
const chaiHTTP = require('chai-http');
const config = require(path.resolve('devConfig.json'));

chai.use(chaiHTTP);
let expect = chai.expect;
let testManager = null;
const baseURL = `http://localhost:${config.server.port}`;

const base64files = require(path.resolve('test/images64.json'));

let user = null;
let nova_disciplina = null;
let array_de_novas_disciplinas = null;
let disciplina_removida = null;
let novo_processo_seletivo = null;
let subscribers = null;
let novo_participante = null;
let corno_logado = null;

describe('Test OpenRest', () => {

  before((done) => {
    testManager = new TestManager(done);
  });

  describe("LOCALE", () => {

    describe("Success", () => {

      it("Get", (done) => {
        chai.request(baseURL)
          .get('/api/locale')
          .query({i18n: 'pt-Br'})
          .end(async (error, response) => {
            expect(response.body).to.be.instanceof(Object);
            expect(response.body).to.have.all.keys("success", "data");
            expect(response.body.success).to.be.true;
            expect(response.body.data).to.be.instanceof(Object);
            done();
          });
      });
    });
  });

  describe('Testes do admin', () => {

    it('Login admin', (done) => {
      chai.request(baseURL)
        .post('/api/open/login')
        .send({
          login: "admin@admin.com",
          password: "admin"
        })
        .end(async (error, response) => {
          expect(response.body).to.be.instanceOf(Object);
          expect(response.body.success).to.be.true;
          expect(response.body).to.be.instanceOf(Object);
          expect(response.body.data).to.have.all.keys("email", "id", "name", "surname", "type");
          user = response.body.data;
          done();
        });
    });

    describe('CRUD disciplina', () => {

      it('criar uma disciplina', (done) => {
        chai.request(baseURL)
          .post('/api/createSubject')
          .set('authentication-key', user.id)
          .send([{
            name: "nova disciplina"
          }])
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Array);
            expect(response.body[0]).to.be.instanceOf(Object);
            expect(response.body[0]).to.have.all.keys("id", "name", "removed", "createdAt", "updatedAt");
            expect(response.body[0].removed).to.be.false;
            nova_disciplina = response.body;
            done();
          });
      });

      it('Criar varias disciplinas', (done) => {
        chai.request(baseURL)
          .post('/api/createSubject')
          .set('authentication-key', user.id)
          .send([
            {
              name: "disciplina2"
            },
            {
              name: "disciplina3"
            },
            {
              name: "disciplina4"
            }
          ])
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Array);
            response.body.forEach(subject => {
              expect(subject).to.be.instanceOf(Object);
              expect(subject).to.have.all.keys("id", "name", "removed", "createdAt", "updatedAt")
            });

            array_de_novas_disciplinas = response.body;
            done();
          });
      });

      it('Update no nome da disciplina', (done) => {
        chai.request(baseURL)
          .post('/api/updateSubject')
          .set('authentication-key', user.id)
          .send({
            id: array_de_novas_disciplinas[0].id,
            name: "novo nome da disciplina"
          })
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Object);
            expect(response.body).to.have.all.keys("id", "name", "removed", "createdAt", "updatedAt", "__v");
            expect(response.body.removed).to.be.false;
            nova_disciplina = response.body;
            done();
          });
      });

      it('Remover disciplina', (done) => {
        chai.request(baseURL)
          .post('/api/removeSubject')
          .set('authentication-key', user.id)
          .send({
            id: array_de_novas_disciplinas[0].id,
            removed: true,
          })
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Object);
            expect(response.body).to.have.all.keys("id", "name", "removed", "createdAt", "updatedAt", "__v");
            expect(response.body.removed).to.be.true;
            disciplina_removida = response.body;
            done();
          });
      });

      it('Reativar disciplina', (done) => {
        chai.request(baseURL)
          .post('/api/removeSubject')
          .set('authentication-key', user.id)
          .send({
            id: disciplina_removida.id,
            removed: false,
          })
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Object);
            expect(response.body).to.have.all.keys("id", "name", "removed", "createdAt", "updatedAt", "__v");
            expect(response.body.removed).to.be.false;
            nova_disciplina = response.body;
            done();
          });
      });

      it('ler todas as disciplinas ativas', (done) => {
        chai.request(baseURL)
          .post('/api/readSubject')
          .set('authentication-key', user.id)
          .send({
            removed: false,
          })
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Array);
            response.body.forEach(subject => {
              expect(subject).to.be.instanceOf(Object);
              expect(subject).to.have.all.keys("id", "name", "removed", "createdAt", "updatedAt", "__v");
              expect(subject.removed).to.be.false
            });
            array_de_novas_disciplinas = response.body;
            done();
          });
      });

      it('ler todas as disciplinas removidas', (done) => {
        chai.request(baseURL)
          .post('/api/readSubject')
          .set('authentication-key', user.id)
          .send({
            removed: true,
          })
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Array);
            response.body.forEach(subject => {
              expect(subject).to.be.instanceOf(Object);
              expect(subject).to.have.all.keys("id", "name", "removed", "createdAt", "updatedAt", "__v");
              expect(subject.removed).to.be.true
            })
            ;
            disciplina_removida = response.body;
            done();
          });
      });
    });

    describe('CRUD Subscription', () => {

      it('criar uma subscription', (done) => {
        chai.request(baseURL)
          .post('/api/createSubscription')
          .set('authentication-key', user.id)
          .send({
            initDate: new Date(),
            endDate: new Date(),
            subjects: ["5c181ec5689826eb1c4ac0cb"]
          })
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Array);
            expect(response.body[0]).to.be.instanceOf(Object);
            expect(response.body[0]).to.have.all.keys("initDate", "endDate", "id", "status", "subjects");
            expect(response.body[0].status).to.be.equal(0);
            expect(response.body[0].subjects).to.be.instanceOf(Array);
            novo_processo_seletivo = response.body;
            done();
          });
      });

      it('Update do initDate de uma subscription', (done) => {
        chai.request(baseURL)
          .post('/api/updateSubscription')
          .set('authentication-key', user.id)
          .send({
            opt: '1',
            id: "5c181ec548e88fb2af32d05e",
            update: {initDate: "Tue Jan 07 2020 20:02:13 GMT-0300 (Brasilia Standard Time)"}
          })
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Object);
            expect(response.body).to.have.all.keys("id", "_id", "initDate", "endDate");
            done();
          });
      });

      it('Update do endDate de uma subscription', (done) => {
        chai.request(baseURL)
          .post('/api/updateSubscription')
          .set('authentication-key', user.id)
          .send({
            opt: '1',
            id: "5c181ec548e88fb2af32d05e",
            update: {endDate: "Thu Jan 30 2020 23:59:50 GMT-0300 (Brasilia Standard Time)"}
          })
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Object);
            expect(response.body).to.have.all.keys("id", "_id", "initDate", "endDate");
            done();
          });
      });

      it('Update do subject de uma subscription', (done) => {
        chai.request(baseURL)
          .post('/api/updateSubscription')
          .set('authentication-key', user.id)
          .send({
            opt: '2',
            id: "5c181ec548e88fb2af32d05e",
            subject: [nova_disciplina.id, array_de_novas_disciplinas[0].id, array_de_novas_disciplinas[0].id]
          })
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Object);
            expect(response.body.subjects).to.be.instanceof(Array);
            expect(response.body.subjects[0]).to.have.all.keys("id", "_id", "subject", "subscriber");
            expect(response.body.subjects[0].subject).to.be.instanceof(Object);
            expect(response.body.subjects[0].subject).to.have.all.keys("_id", "_id", "name");
            expect(response.body.subjects[0].subscriber).to.be.instanceof(Array);
            done();
          });
      });

      it('Read de um subscription', (done) => {
        chai.request(baseURL)
          .post('/api/subscriptionRead')
          .set('authentication-key', user.id)
          .send({query: {removed: true}})
          .end(async (error, response) => {
            expect(response.body).to.be.instanceOf(Array);
            response.body.forEach(subject => {
              expect(subject).to.be.instanceOf(Object);
              subject.subjects.forEach(subjects => {
                expect(subjects).to.have.all.keys('id', '_id', 'subject', 'subscriber');
                expect(subjects.subject).to.have.all.keys('id', '_id', 'name');
                subjects.subscriber.forEach(subscriber => {
                  expect(subscriber).to.have.all.keys('id', '_id', 'name', 'type');
                });
              });
            });
            done();
          });
      });

      it('Remover um subscription', (done) => {
        chai.request(baseURL)
          .post('/api/subscriptionRemove')
          .set('authentication-key', user.id)
          .send({id: "5c181ec548e88fb2af32d05e"})
          .end(async (error, response) => {
            expect(response.body).to.be.instanceof(Object);
            expect(response.body).to.have.all.keys('createdAt', 'updatedAt', 'id', '_id', 'status', 'initDate', 'endDate', 'removed', 'subjects', '__v');
            expect(response.body.removed).to.be.true;
            expect(response.body.subjects).to.be.instanceof(Array);
            done();
          });
      });
    });

    describe('read do participante', () => {
      it('ler participantes inscritor em uma disciplina', (done) => {
        chai.request(baseURL)
          .post('/api/subscriberRead')
          .set('authentication-key', user.id)
          .send({
            subject: "5c12a92ae464e3e46aeb8b19"
          })
          .end(async (error, response) => {
            subscribers = response.body;
            done();
          });
      });
    });

    describe('testes da subscrition', () => {
      it('iniciar um processo seletivo', (done) => {
        chai.request(baseURL)
          .post('/api/startSubscription')
          .set('authentication-key', user.id)
          .send({
            id: "5c181ec548e88fb2af32d05e" //id do processo seletivo
            //reparar aqui nesse id, se a data de inicio e fim estiverem no passado vai dar ruim, isso algum dia será tratado (ou não)
          })
          .end(async (error, response) => {
            done();
          });
      });
    });

    it('download de documentos por participante', (done) =>{
      chai.request(baseURL)
        .get(`/api/open/downloadPartDoc/${user.id}/5c12a92ae299d51b4a0c9de7`)
        .end(async (error, response) => {
          done();
        })
    });

    it('download de documentos de todos os participantes na disciplina(selecionando a disciplina)', (done) =>{
      chai.request(baseURL)
        .get(`/api/open/downloadSubjectDocs/${user.id}/5c181ec5689826eb1c4ac0cb`)
        .end(async (error, response) => {
          done();
        })
    });

    it('download do excel dos participantes por disciplina', (done) =>{
      chai.request(baseURL)
        .get(`/api/open/genSubjectExcel/${user.id}/5c181ec5689826eb1c4ac0cb`)
        .end(async (error, response) => {
          done();
        })
    });
  });

  describe('Testes do participante', () => {
    it('teste do participante', (done) => {
      chai.request(baseURL)
        .post('/api/open/createParticipant')
        .send({
          name: "LeoPoldo",
          surname: "Milambi",
          email: "leo.poldo.sougay@gmail.com",
          phoneNumber: "696969696969",
          password: "sougayzaoassumidao",
          birthdate: "28/03/1997",
          cpf: "654456456546",
          rg: "465456546",
          reason: "eu decidi que vou fazer um cadastro nessa disciplina porque pau no cu de quem leu até aqui",
          course: "Alguma coisa com informática",
          ies: "UFSC",
          subject: "5c181ec5689826eb1c4ac0cb", //referenciado na subscription subject
          // nao é o id do subject mas sim do subscription subject que está na inscrição
          subscription: "5c181ec548e88fb2af32d05e"
          //reparar aqui nesse id, se a data de inicio e fim estiverem no passado vai dar ruim, isso algum dia será tratado (ou não) -> eu tratei, cade seu deus?
        })
        .end(async (error, response) => {
          novo_participante = response.body;
          done();
        })
    });
    it('login do participante', (done) => {
      chai.request(baseURL)
        .post('/api/open/login')
        .send({
          login: "leo.poldo.sougay@gmail.com",
          password: "sougayzaoassumidao",
          })
        .end(async (error, response) => {
          corno_logado = response.body;
          done();
        })
    });
    it('mudar de disciplina', (done) => {
      chai.request(baseURL)
        .post('/api/changeSub')
        .set('authentication-key', corno_logado.data.id)
        .send({
          oldSubject: "5c181ec5689826eb1c4ac0cb",
          newSubject: "5c181ec5689826eb1c4ac0bb",
          id: corno_logado.data.id
        })
        .end(async (error, response) => {
          done();
        })
    });
    it('upload de documentos - rgCpf', (done) => {
      chai.request(baseURL)
        .post('/api/documentUpload')
        .set('authentication-key', corno_logado.data.id)
        .send({
          base64: base64files.img1,
          documentType: 'rgCpf',
          subscriptionId: "5c181ec548e88fb2af32d05e",
          //reparar aqui nesse id, se a data de inicio e fim estiverem no passado vai dar ruim, isso algum dia será tratado (ou não)
          userId: corno_logado.data.id
        })
        .end(async (error, response) => {
          done();
        })
    });
    it('upload de documentos - atestado de matricula', (done) => {
      chai.request(baseURL)
        .post('/api/documentUpload')
        .set('authentication-key', corno_logado.data.id)
        .send({
          base64: base64files.img1,
          documentType: 'matrCertificate',
          subscriptionId: "5c181ec548e88fb2af32d05e",
          //reparar aqui nesse id, se a data de inicio e fim estiverem no passado vai dar ruim, isso algum dia será tratado (ou não)
          userId: corno_logado.data.id
        })
        .end(async (error, response) => {
          done();
        })
    });
  });
});
