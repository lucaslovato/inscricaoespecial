import {BasicManager} from "../BasicManager";
import {Model} from "../model/User";

export class User extends BasicManager {
  wireCustomListeners() {
    this.hub.on("db." + this.eventName + ".login", this.login.bind(this));
  }

  /**
   * Verifica se o usuario existe no banco de dados.
   * Se não existe, enviar um erro informando isso.
   * Se existe, verifica se a senha enviada bate com a registrada no banco de dados.
   * Se a senha não bate, retorna um erro informando isso.
   * Se a senha bate, seta o atributo logged para true e retorna os dados do usuario logado.
   * @param msg
   * @returns {Promise<void>}
   */
  async login(msg) {
    if (msg.source_id === this.id) return;
    let userPassword = msg.data.success.password;
    let ret: any = await this.model.find(
      msg.data.success.queryObject.query
    ).select(msg.data.success.queryObject.select).exec();
    if (ret.length === 1) {
      let userRet: any = ret[0].toJSON();
      if (userRet.password != userPassword) {
        return this.answer(msg.id, "login", null, "wrongPassword");
      }
      let select = {
        _id: 0,
      };
      for(let i = 0; i < msg.data.success.select.length; i++){
        select[msg.data.success.select[i]] = 1;
      }
      let loggedUser: any = await this.model.findByIdAndUpdate(
        userRet.id,
        {
          logged: true,
        },
        {
          new: true,
          runValidators: true,
          select: select,
        }
      ).lean().exec();
      if (loggedUser) {
        return this.answer(msg.id, 'login', loggedUser, null);
      } else {
        this.answer(msg.id, "login", null, "cantLogin");
      }
    } else {
      this.answer(msg.id, "login", null, "userNotFound");
    }
  }

  afterCreate(data: any[]) {
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i].toJSON();
      delete data[i].createdAt;
      delete data[i].password;
      delete data[i].removed;
      delete data[i].updatedAt;
    }
    return data;
  }

  /**
   * Faz as modificações/operações necessárias no retorno do read
   *
   * @param data
   */
  afterRead(data) {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; ++i) {
        delete data[i].password;
        delete data[i]._id;
      }
    } else {
      delete data.password;
      delete data._id;
    }
    return data;
  }

  afterUpdate(data) {
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i].toJSON();
      delete data[i].password;
    }

    return data;
  }

  get model() {
    return Model;
  }

  get eventName() {
    return 'user';
  }
}