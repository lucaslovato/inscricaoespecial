import {CommonHandler} from "./CommonHandler";
import {QueryObject} from "../util/QueryObject";
import {FindObject} from "../util/FindObject";
import {UpdateObject} from "../util/UpdateObject";
import {SubscriptionSubject} from "../../db/managers/SubscriptionSubject";
import {SubscriptionStatus} from "../../db/model/Subscription";
import * as path from "path";
import * as fs from "fs";

export class ParticipantHandler extends CommonHandler {

  async participant_create(data: {
    name: string, surname: string, email: string, password: string, birthdate: string
    cpf: string, rg: string, reason: string, phoneNumber: string, course: string, ies: string, subject: string, subscription: string
  }): Promise<{ success: boolean, data: any }> {
    let required = this.attributeValidator(['name', 'surname', 'email', 'password', 'birthdate', 'cpf', 'rg',
      'reason', 'phoneNumber', 'course', 'ies', 'subject', 'subscription'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let isValid = await this.sendToServer('db.subscription.read', new FindObject({
      query: data.subscription
    }));
    if (isValid.data.success.status != SubscriptionStatus.RUNNING) {
      return this.returnHandler({
        model: 'participant',
        data: {
          error: 'subscriptionClosed'
        }
      })
    }
    let ret = await this.sendToServer('db.participant.create', data);
    let retorno = await this.subscriberUpdate(data.subject, ret.data.success[0].id);
    return await this.returnHandler({
      model: 'subscription_subject',
      data: retorno.data
    });
  }

  private async subscriberUpdate(subscriptionSubject, subscriber) {
    let ret = await this.sendToServer('db.subscription_subject.update', new UpdateObject({
      query: subscriptionSubject,
      update: {
        $addToSet: {subscriber}
      },
      new: true,
      runValidators: true,
    }));
    return await this.returnHandler({
      model: 'subscription_subject',
      data: ret.data
    })
  }

  async change_subject(data: { id: string, oldSubject: string, newSubject: string }): Promise<{ success: boolean, data: any }> {
    let required = this.attributeValidator(['id', 'newSubject', 'oldSubject'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let ret = await this.sendToServer('db.subscription_subject.update', new UpdateObject({
      query: data.oldSubject,
      update: {
        $pull: {
          subscriber: data.id
        }
      },
      new: true,
      runValidators: true
    }));
    if (!ret.data.success) {
      return await this.returnHandler({
        model: 'subscription_subject',
        data: ret.data
      })
    }
    let ret1 = await this.subscriberUpdate(data.newSubject, data.id);
    if (!ret1.success) {
      return await this.returnHandler({
        model: 'participant',
        data: ret.data
      })
    }
    let retorno = await this.participantSubjectUpdate(data);
    return await this.returnHandler({
      model: 'subscription_subject',
      data: retorno.data
    });
  }

  private async participantSubjectUpdate(data) {
    let ret = await this.sendToServer('db.participant.update', new UpdateObject({
      query: data.id,
      update: {
        subject: data.newSubject
      },
      new: true,
      runValidators: true,
    }));
    return await this.returnHandler({
      model: 'participant',
      data: ret.data
    })
  }

  async document_update(data) {
    if (data.base64.length >= 3 * 5000000 / 4)
      return await this.returnHandler({
        model: 'participant',
        data: {
          error: 'base64SizeError'
        }
      });
    if (await this.subscriptionVerification(data.subscriptionId)) {
      data.filePath = await this.createDirectory(data.userId);
      await fs.writeFile(`${data.filePath}/${data.documentType}.pdf`, data.base64, {encoding: 'base64'});
      let successfull_update = await this.particpant_document_update(data);
      if(!successfull_update.data.success){return await this.returnHandler({
        model: 'participant',
        data: {
          error: "documentUpdateError"
        }
      })}
      return await this.returnHandler({
        model: 'participant',
        data: {
          filePath: `documents/${data.userId}/${data.documentType}`,
        },
      })
    }
    return {data: 'deu ruim'};
  }

  private async subscriptionVerification(id: string) {
    let ret = await this.sendToServer('db.subscription.read', new FindObject({
      query: id,
      select: 'status',
    }));
    return ret.data.success.status === SubscriptionStatus.RUNNING;
  }

  private async createDirectory(user) {
    let filePath = path.resolve(`resources/documents/users/${user}`);
    if (!fs.existsSync(filePath))
      fs.mkdirSync(filePath);
    return filePath;
  }
  private async particpant_document_update(data){
    let ret = await this.sendToServer('db.participant.update', new UpdateObject({
      query: data.userId,
      update: {
        [`document.${data.documentType}`]: data.base64
      },
      new: true,
      runValidators: true
    }));
    return await this.returnHandler({
      model: 'participant',
      data: ret.data
    })
  }


}

export default new ParticipantHandler();