import {BasicHandler} from "../BasicHandler";
import {UpdateObject} from '../util/UpdateObject';

export class CommonHandler extends BasicHandler {

  /**
   *
   * @param {{userId: string}} data
   * @returns {Promise<any>}
   *
   * Change the logged attribute and return.
   */
  public async logout(data: {userId:string}) {
    let required = this.attributeValidator(['userId'], data);
    if(!required.success) return await this.getErrorAttributeRequired(required.error);
    let updated = await this.sendToServer('db.user.update', new UpdateObject({
      query: data.userId,
      update: {
        logged: false,
      },
      new: true,
      runValidators: true,
      select: ['logged']
    }));
    return await this.returnHandler({
      model: 'user',
      data: updated.data,
    });
  }

}

export default new CommonHandler();