import {servicesModules} from "../";
import axios from 'axios';

const countryCodes = {
  'BR': 'pt-Br',
  'US': 'en'
};

export default class LocaleAPI {

  /**
   * @author Bernardo Schveitzer
   * Inicia o processo de definição do Locale no armazenamento local,
   * verificando a localização do usuário, caso não tenha definido.
   */
  async initSystemLocale() {
    try {
      const responseAPI = await this.getLocation();
      let localeCode = countryCodes[responseAPI.data.countryCode] ? countryCodes[responseAPI.data.countryCode] : 'en';
      const responseGetLocale = await this.getLocale(localeCode);
      await this.setLocaleToForage(responseGetLocale, localeCode);
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * @author Bernardo Schveitzer
   * Define o locale no armazenamento local.
   * @param response
   * @param localeCode
   */
  async setLocaleToForage(response, localeCode) {
    try {
      console.log('aquii', response.data);
      await servicesModules.LFM.setItem('locale', localeCode);
      await servicesModules.LFM.setItem('localeData', response.data);
    } catch (err) {
      await servicesModules.LFM.removeItem('locale');
      window.alert("Ocorreu um erro desconhecido, recarregue a página.");
    }
  }

  async getLocale(locale) {
    return await axios.get(`/api/locale?locale=${locale}`);
  }

  async getLocation() {
    return await axios.get('http://ip-api.com/json');
  }

  /**
   * @author Bernardo Schveitzer
   * Verifica as autorizações do usuário para entrar em uma rota.
   * @param destinyRoute
   * @returns {Promise<boolean>}
   */
  async checkUserAuthorization(destinyRoute) {
    const user = await servicesModules.LFM.getItem('user');
    if (user === null) return false;
    let userEntities = user.user.entities;
    for (let entityIndex = 0; entityIndex < userEntities.length; entityIndex++) {
      if (userEntities[entityIndex].entity.name === destinyRoute.params.entityName) {
        if (destinyRoute.name === "entity") return true;
        let userModules = userEntities[entityIndex].role.modules;
        for (let moduleIndex = 0; moduleIndex < userModules.length; moduleIndex++) {
          if (userModules[moduleIndex].name === destinyRoute.name) {
            return true;
          }
        }
      }
    }
    return false;
  }

}