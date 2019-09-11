import * as BBPromise from "bluebird";
import * as fs from 'fs';
import * as path from 'path';
import {Source} from "../events/Source";
import {Util} from "../util/Util";

export class BasicHandler extends Source {

  constructor() {
    super();
  }

  protected sendToServer(event, dado): BBPromise<any> {
    return this.hub.send(this, event, {success: dado, error: null,}).promise;
  }

  /**
   * Verifica os erros de validacao e retorna o correspondente.
   *
   * @param model
   * @param errors
   * @returns {Promise<[any , any , any , any , any , any , any , any , any , any]>}
   */
  private async getErrorsValidation(model, errors) {
    let errorsArray = [];
    for (let attr in errors) {
      if (errors.hasOwnProperty(attr) && !errors[attr].errors) {
        errorsArray.push(Util.getErrorByLocale('pt-Br', model, errors[attr].message));
      }
    }
    return await Promise.all(errorsArray);
  }

  private async getErrorsDuplicationKey(model, msgError) {
    let key = `duplicated.${msgError.slice(msgError.indexOf('index:') + 7, msgError.indexOf('_1 dup'))}`;
    return await Util.getErrorByLocale('pt-Br', model, key);
  }

  private async getErrorsByLocale(model, msgError) {
    return await Util.getErrorByLocale("pt-Br", model, msgError);
  }

  /**
   * Verifica o tipo de erro e pega o padrao de erro correspondente.
   *
   * @param {string} model
   * @param error
   * @returns {Promise<any>}
   */
  private async getError(model: string, error: any) {
    if (typeof error === 'string') {
      return await this.getErrorsByLocale(model, error);
    } else if (typeof error === 'object') {
      if (error.hasOwnProperty('name')) {
        if (error.name === "ValidationError") {
          return await this.getErrorsValidation(model, error.errors);
        } else if (error.name === 'MongoError') {
          if (error.code && error.code === 11000) {
            return await this.getErrorsDuplicationKey(model, error.errmsg);
          }
        } else if (error.name === 'CastError') {
          return await this.getErrorsByLocale(model, `${error.reason.name}.${error.reason.path}.${error.reason.kind}`);
        }
      } else if (error.hasOwnProperty('index') && error.hasOwnProperty('msg')) {
        let errorReturn = await this.getErrorsByLocale(model, error.msg);
        errorReturn.description = errorReturn.description + error.index;
        return errorReturn;
      } else if (error.type === "attributeRequired") {
        let errorReturn = await this.getErrorsByLocale(model, error.type);
        errorReturn.description = `${error.errorMessage} is required`;
        return errorReturn;
      }
    }
  }

  /**
   * Funcao responsave por fazer tratamento de retornos, antes de serem
   * enviados para o cliente.
   * Se conter erro, busca o erro correspondente.
   *
   * @returns {Promise<{success, data}>}
   * @param ret
   */
  async returnHandler(ret: { model: string, data: any }) {
    if (ret.data.error) {
      return {
        success: false,
        data: await this.getError(ret.model, ret.data.error),
      };
    }
    return {
      success: true,
      data: ret.data.success
    };
  }

  async updateValidator(data) {
    if (!data.id) return await this.returnHandler({
      model: 'global',
      data: {
        error: 'update.idRequired'
      }
    });
    if (!data.update || !Object.keys(data.update).length) return await this.returnHandler({
      model: 'global',
      data: {
        error: 'update.updateRequire'
      }
    });
    return {
      success: true,
    };
  }

  /**
   *
   * @param attributes
   * @returns {Promise<{success: boolean; data: errorMessage | any[]} | {success: boolean; data: any}>}
   *
   * Chama a funcao para retornar o erro correto.
   */
  protected async getErrorAttributeRequired(attributes) {
    return this.returnHandler({
      model: 'global',
      data: {
        error: {
          type: "attributeRequired",
          errorMessage: attributes,
        }
      }
    })
  }

  protected async getI18N(data: { path: string }) {
    let required = this.attributeValidator(['path'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    try {
      let files = fs.readdirSync(data.path);
      let success = {};
      for (let i = 0; i < files.length; i++) {
        success[files[i].split('.')[0]] = require(path.join(data.path, files[i]));
      }
      return {success};
    } catch (error) {
      return {error};
    }
  }

}