import SIOM from './modules/SIOM';
import LocaleAPI from './modules/LocaleAPI';
import LFM from './modules/LFM';
import RequestManager from './modules/RequestManager';
let modules = {
  SIOM: {
    module: SIOM,
  },
  LOCALEAPI: {
    module: LocaleAPI,
    dependencies: ['LFM','REQUESTMANAGER'],
  },
  LFM: {
    module: LFM,
  },
  REQUESTMANAGER: {
    module: RequestManager,
  }
};
let toExport = {};
export default {

  use(selectedModules, callback){
    for(let i = 0; i < selectedModules.length; i++){
      let name = selectedModules[i].toUpperCase();
      if(modules[name].dependencies){
        for(let i = 0; i < modules[name].dependencies.length; i++){
          let dependencyName = modules[name].dependencies[i];
          this.setToExport(dependencyName);
        }
      }
      this.setToExport(name);
    }
    console.log('toExport', toExport);
    callback();
  },

  setToExport(name){
    if(!toExport[name]){
      toExport[name] = new modules[name].module();
    }
  }

};

export {toExport as servicesModules};