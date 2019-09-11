import {BasicHandler} from "../BasicHandler";
import {QueryObject} from "../util/QueryObject";

export class BarrierHandler extends BasicHandler {

  async checkLoggedUser(data){
    let ret = await this.sendToServer('db.user.count', new QueryObject({query: data}));
    return this.returnHandler({
      model: 'global',
      data: ret.data
    });
  };

}