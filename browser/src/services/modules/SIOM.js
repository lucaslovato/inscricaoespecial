import io from 'socket.io-client';
import config from '../config';
import Message from '../../utils/Message';

export default class SIOM {
  constructor() {
    this.socket = io;
  }

  /**
   * Cria a instancia do socket e coloca ele em uma variavel global.
   *
   * @param io
   */
  set socket(io) {
    this._socket = io(`${config.protocol}://${config.baseURL}:${config.port}`);
    this._promiseQueue = {};
    this.socket.on('response', this.receiveFromServer.bind(this));
  }

  get socket() {
    return this._socket;
  }

  /**
   * Insere na fila de promesa, uma promesa para o id da message passada no parametro.
   *
   * @param messageId
   * @returns {*}
   */
  setPromiseQueue(messageId) {
    this._promiseQueue[messageId] = {
      promise: null,
      promiseHandler: null,
    };
    this._promiseQueue[messageId].promise = new Promise(resolve => {
      this._promiseQueue[messageId].promiseHandler = (responseMessage) => {
        resolve(responseMessage);
      };
    });
    //todo: criar timeout
    return this._promiseQueue[messageId].promise;
  }

  /**
   * Recebe a retorno no backend
   * Encontra o promiseHandler com base no id passado pelo server.
   * Executa o promiseHandler encontrado.
   * Remove ele da fila.
   *
   * @param responseMessage
   */
  receiveFromServer(responseMessage) {
    this._promiseQueue[responseMessage.id].promiseHandler(responseMessage);
    delete this._promiseQueue[responseMessage];
  }

  /**
   * Envia ao server um evento com um data.
   * Chama a função para chavear a opromesa, com base na msg cirada.
   * Retorna a promise para a clase que chamou.
   *
   * @param event
   * @param request
   * @returns {*}
   */
  send(event, request) {
    let msg = new Message(event, request);
    let promise = this.setPromiseQueue(msg.id);
    this.socket.emit(event, msg.toServer());
    return promise;
  }

}