import {Source} from "../events/Source";
import {UpdateObject} from "../handlers/util/UpdateObject";
import {SubscriptionStatus} from "../db/model/Subscription";
import {QueryObject} from "../handlers/util/QueryObject";
import {FindObject} from "../handlers/util/FindObject";

const CronJob = require('cron').CronJob;

export class Cron extends Source {
  private listeners: object;
  private init_test: object;

  constructor() {
    super();
    this.init_test = {};
    this.listeners = {
      'test.routine.start': this.start_test.bind(this),
    };
    this.verification().then(res => {
      console.log("Verificação das inscrições realizada!");
      res.forEach( element =>{
        element.data.success.status === 2 ? console.log(`Inscrição id: ${element.data.success.id} -> fechada com sucesso`)
          : console.log(`Inscrição id:${element.data.success.id} -> não foi fechada com sucesso!`);
      })
    });
    this.wiring();
  }

  async start_test(msg) {
    if (msg.source_id === this.id) return;
    let date_test = new Date();
    if (msg.data.success.error) {
      return this.answer(msg.id, 'start', false, msg.data.success.error.message);
    }
    if (msg.data.success.success.initDate < date_test) {
      return this.answer(msg.id, 'start', false, "data de inicio no passado")
    }
    if (msg.data.success.success.status === SubscriptionStatus.RUNNING) {
      return this.close_test(msg);
    }
    if (msg.data.success.success.status === SubscriptionStatus.FINISHED) {
      return this.answer(msg.id, 'start', false, "teste já finalizado");
    }
    new CronJob(msg.data.success.success.initDate, async () => {
      console.log("entrou no cronjob", msg);
      await this.hub.send(this, 'db.subscription.update', {
        success: new UpdateObject({
          query: msg.data.success.success.id,
          update: {
            status: SubscriptionStatus.RUNNING,
          },
          new: true,
          runValidators: true,
        }),
        error: null,
      }).promise;
    }, () => {
      this.close_test(msg);
    }, true, 'America/Sao_Paulo');
    return this.answer(msg.id, 'start', true, null);
  }

  async close_test(msg) {
    let date_test = new Date();
    if (msg.data.success.success.endDate < date_test) { //se a data de fim ta no passado garante q ta fechado
      return await this.hub.send(this, 'db.subscription.update', {
        success: new UpdateObject({
          query: msg.data.success.success.id,
          update: {
            status: SubscriptionStatus.FINISHED,
          },
          new: true,
          runValidators: true,
        }),
        error: null,
      }).promise;
    }
    if (msg.data.success.success.status === SubscriptionStatus.CREATED || SubscriptionStatus.FINISHED) {
      return this.answer(msg.id, 'start', false, "Processo seletivo nunca foi aberto ou já terminou")
    }
    new CronJob(msg.data.success.success.endDate, async () => {
      console.log("entrou no segundo cronjob", msg);
      await this.hub.send(this, 'db.subscription.update', {
        success: new UpdateObject({
          query: msg.data.success.success.id,
          update: {
            status: SubscriptionStatus.FINISHED,
          },
          new: true,
          runValidators: true,
        }),
        error: null,
      }).promise;
    }, null, true, 'America/Sao_Paulo');
  }

  async answer(id_msg, evento, success, error) {
    let data = {
      success: success,
      error: error
    };
    await this.hub.send(this, "test.routine." + evento, data, id_msg).promise;
  }

  async verification() {
    let ret = await this.hub.send(this, 'db.subscription.read', {
      success: new FindObject({
        query: {
          status: SubscriptionStatus.RUNNING
        }
      }),
      error: null,
    }).promise;
    let readSubs = [];
    let date_test = new Date();
    for (let i = 0; i < ret.data.success.length; i++) {
      if (ret.data.success[i].endDate < date_test) { //se a data de fim ta no passado garante q ta fechado
        readSubs.push(await this.hub.send(this, 'db.subscription.update', {
          success: new UpdateObject({
            query: ret.data.success[i].id,
            update: {
              status: SubscriptionStatus.FINISHED,
            },
            new: true,
            runValidators: true,
          }),
          error: null,
        }).promise);
      } else {
        new CronJob(ret.data.success[i].endDate, async () => {
          console.log("entrou no segundo cronjob", ret);
          readSubs.push(await this.hub.send(this, 'db.subscription.update', {
            success: new UpdateObject({
              query: ret.data.success[i].id,
              update: {
                status: SubscriptionStatus.FINISHED,
              },
              new: true,
              runValidators: true,
            }),
            error: null,
          }).promise);
        }, null, true, 'America/Sao_Paulo');
      }
    }
    return readSubs;
  }

  wiring() {
    for (let name in this.listeners) {
      if (this.listeners.hasOwnProperty(name)) {
        this.hub.on(name, this.listeners[name]);
      }
    }
  }
}
