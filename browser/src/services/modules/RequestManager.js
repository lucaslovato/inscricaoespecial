import axios from 'axios';
import config from '../config'

export default class RequestManager {

  constructor(){
    this.createInstance(`${config.protocol}://${config.baseURL}:${config.port}`);
  }

  createInstance(baseURL){
    this._instace = axios.create({
      baseURL: baseURL,
    })
  }

  get instance(){
    return this._instace;
  }

  async get({path, headers}){
    return this.instance.get(path, {headers});
  }

  async post({path, body, headers}){
    console.log({path, body, headers});
    return this.instance.post(path, body, {headers});
  }

  async put({path, body, headers}){
    return this.instance.put(path, body, {headers});
  }

  async delete({path, body, headers}){
    return this.instance.delete(path, body, {headers});
  }

  setParam({path, params}){
    for(let i = 0; i < params.length; i ++){
      path = `${path}/${params[i]}`;
    }
  }

  setQuery({path, query}){
    path = `${path}/`;
    for(let key in query){
      if(query.hasOwnProperty(key)) path = `${path}${key}=${query[key]}&`;
    }
  }

  async callMethod({method, api, path, params, query, headers, body}){
    console.log({method, api, path, params, query, headers, body});
    if(!api) api = config.baseAPI;
    path = `${api}${path}`;
    if(params) this.setParam({path, params});
    if(query) this.setQuery({path, query});
    return await this[method]({path, body, headers});
  }

}