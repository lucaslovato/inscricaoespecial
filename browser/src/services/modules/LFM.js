import localForage from 'localforage';

export default class LFM {

  constructor() {
    this._localForage = localForage;
    this._localForage.config({
      name: 'BaseToAll'
    });

    //todo: fazer essa informação vir de um config.
    this._keys = {
      locale: "locale",
      user: "user",
      localeData: "localeData"
    }
  }

  getKey(key) {
    return this._keys[key];
  }

  setItem(key, item){
    return this._localForage.setItem(this.getKey(key), item);
  }

  removeItem(key){
    return this._localForage.removeItem(key);
  }

  getItem(key){
    return this._localForage.getItem(key);
  }

}