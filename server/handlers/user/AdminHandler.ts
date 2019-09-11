import {CommonHandler} from "./CommonHandler";
import {QueryObject} from "../util/QueryObject";
import {FindObject} from "../util/FindObject";
import {UpdateObject} from "../util/UpdateObject";
import * as path from "path";
import {mkdir} from "fs";

export class AdminHandler extends CommonHandler {

  /**
   * criar disciplina -> enviar um array de objeto contendo o "name" de cada disciplina dentro do obj
   * @param [{name: string}] data
   */
  async create_subject(data: [{ name: string }]): Promise<{ success: boolean, data: any }> {
    for (let i = 0; i < data.length; i++) {
      let required = this.attributeValidator(['name'], data[i]);
      if (!required.success) return await this.getErrorAttributeRequired(required.error);
    }
    let ret = await this.sendToServer('db.subject.create', data);
    return await this.returnHandler({
      model: 'subject',
      data: ret.data
    });
  }

  /**
   * Funcionalidade que da o update em uma disciplina cadastrada no sistema, como a disciplina só possui nome então
   * o nome dela é alterado
   * @param data: {name: string, id: string}
   * name é o novo nome da disciplina
   */
  async update_subject(data: { name: string, id: string }): Promise<{ success: boolean, data: any }> {
    let required = this.attributeValidator(['name', 'id'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let ret = await this.sendToServer('db.subject.update', new UpdateObject({
      query: data.id,
      update: {name: data.name},
      new: true,
      runValidators: true,
    }));
    return await this.returnHandler({
      model: 'subject',
      data: ret.data
    });
  }

  /**
   * remove OU reativa uma disciplina mudando o status do removed true -> false, false -> true
   * @param {id: string, removed: boolean} data
   */
  async remove_subject(data: { id: string, removed: boolean }): Promise<{ success: boolean, data: any }> {
    let required = this.attributeValidator(['id', 'removed'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let ret = await this.sendToServer('db.subject.update', new UpdateObject({
      query: data.id,
      update: {removed: data.removed},
      new: true,
      runValidators: true,
    }));
    return await this.returnHandler({
      model: 'subject',
      data: ret.data
    });
  }

  /**
   * Lê todas as disciplinas do banco ativas ou removidas
   * @param {id: string} data
   */
  async read_subject(data: { removed: boolean }): Promise<{ success: boolean, data: any }> {
    let required = this.attributeValidator(['removed'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let ret = await this.sendToServer('db.subject.read', new QueryObject({
      query: {
        removed: data.removed,
      }
    }));
    return await this.returnHandler({
      model: 'subject',
      data: ret.data
    });
  }

  /**
   * Funcionalidade que cria um processo seletivo novo passando as datas e horas de inicio e fim do processo
   * tal como as disciplinas que serão ofertadas nesse semestre.
   * @param {initDate: string, endDate: string, initHour: string, endHour: string, subjects: [string]}data
   */
  async create_subscription(data: {
    initDate: string, endDate: string, subjects: [string]
  }): Promise<{ success: boolean, data: any }> {
    let required = this.attributeValidator(['initDate', 'endDate', 'subjects'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let ret = await this.sendToServer('db.subscription.create', data);
    return await this.returnHandler({
      model: 'subscription',
      data: ret.data,
    });
  }

  async update_subscription(data) {
    switch (data.opt) {
      case '1':
        return await this.update_date_subscription(data);
      case '2':
        return await this.update_subject_subscription(data);
      case '3':
        return await this.remove_subscription(data);
      default:
        return await this.returnHandler({
          model: 'subscription',
          data: "houston we have a problem",
        })
    }
  }

  /**
   * método que altera a data de início OU a data de fim de um processo seletivo
   * @param data: {id: string, update{initDate?: string, endDate?: string}}
   */
  async update_date_subscription(data: { id: string, update: { initDate?: string, endDate?: string } }): Promise<{ success: boolean, data: any }> {
    let required = await this.attributeValidator(['id', 'update', '$or', ['initDate', 'endDate']], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let upd_obj;
    if (data.update.initDate) {
      upd_obj = {
        initDate: data.update.initDate,
      }
    }
    if (data.update.endDate) {
      upd_obj = {
        endDate: data.update.endDate
      }
    }
    let ret = await this.sendToServer('db.subscription.update', new UpdateObject({
      query: data.id,
      update: upd_obj,
      new: true,
      runValidators: true,
      select: ['id', 'initDate', 'endDate']
    }));
    return await this.returnHandler({
      model: 'subscription',
      data: ret.data
    })
  }

  /**
   * Funcionalidade que altera a ou as disciplinas de uma inscricao ja criada
   * @param data: {id: string, subject: [string]}
   */
  async update_subject_subscription(data: { id: string, subject: [string] }): Promise<{ success: boolean, data: any }> {
    let required = await this.attributeValidator(['subject', 'id'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let ret = await this.sendToServer('db.subscription.update', new UpdateObject({
      query: data.id,
      update: {
        $addToSet: {
          subjects: {
            $each: data.subject
          }
        }
      },
      new: true,
      runValidators: true,
      select: ['subjects'],
      populate: [{
        path: 'subjects',
        select: 'subject subscriber',
        populate: [
          {
            path: 'subject',
            select: 'name'
          },
          {
            path: 'subscriber',
            select: 'name'
          }]
      }]
    }));
    return await this.returnHandler({
      model: 'subscription',
      data: ret.data
    })
  }

  /**
   * Funcionalidade que le as inscricoes e aceita qualquer query desejada, ou seja, pode procurar por data de inicio
   * data de fim, se ela foi ou não removida do sistema, ou pelo status da mesma.
   * @param data: {query: initDate?: string, endDate?: string, removed?: boolean, status?: number}
   */
  async subscription_read(data: { query: { initDate?: string, endDate?: string, removed?: boolean, status?: number } }): Promise<{ success: boolean, data: any }> {
    let required = await this.attributeValidator(['query', '$or', ['initDate', 'endDate', 'removed', 'status']], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let queryObj = {};
    if (data.query.hasOwnProperty('initDate')) queryObj['initDate'] = data.query.initDate;
    if (data.query.hasOwnProperty('endDate')) queryObj['endDate'] = data.query.endDate;
    if (data.query.hasOwnProperty('removed')) queryObj['removed'] = data.query.removed;
    if (data.query.hasOwnProperty('status')) queryObj['status'] = data.query.status;
    let ret = await this.sendToServer('db.subscription.read', new FindObject({
      query: queryObj,
      select: 'status subjects initDate endDate',
      populate: [{
        path: 'subjects',
        select: 'subject subscriber',
        populate: [
          {
            path: 'subject',
            select: 'name'
          },
          {
            path: 'subscriber',
            select: 'name'
          }]
      }]
    }));
    if (ret.data.error === null) {
      ret.data.success.forEach(element => {
        element.endDate = element.endDate.toLocaleDateString();
        element.initDate = element.initDate.toLocaleDateString();
      });
    }
    return await this.returnHandler({
      model: 'subscription',
      data: ret.data
    })
  }

  /**
   * Funcionalidade que remove uma processo seletivo -> passa a flag removed para true para não perder os dados desta
   * @param data:{id: string}
   */
  async remove_subscription(data: { id: string }): Promise<{ success: boolean, data: any }> {
    let required = await this.attributeValidator(['id'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let ret = await this.sendToServer('db.subscription.update', new UpdateObject({
      query: data.id,
      update: {
        removed: true,
      },
      new: true,
      runValidators: true,
    }));
    return await this.returnHandler({
      model: 'subscription',
      data: ret.data
    });
  }

  /**
   * lê os participantes inscritos na disciplina
   * @param data:{subject: string}
   */
  async subcriber_read(data: { subject: string }): Promise<{ success: boolean, data: any }> {
    let required = await this.attributeValidator(['subject'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let ret = await this.sendToServer('db.participant.read', new FindObject({
      query: {subject: data.subject},
      select: 'birthdate cpf rg reason phoneNumber course ies subject document isForeign passport'
    }));
    return await this.returnHandler({
      model: 'participant',
      data: ret.data
    })
  }

  /**
   * Funcionalidade que faz com que o processo seletivo seja iniciado, depois de criado pode-se iniciar ele, isto é,
   * fazer com que ele entre pra running na data certa e seja finalizado na data certa status === closed
   * @param data: {id: string}
   */
  async init_subscription(data: { id: string }): Promise<{ success: boolean, data: any }> {
    let required = await this.attributeValidator(['id'], data);
    if (!required.success) return await this.getErrorAttributeRequired(required.error);
    let ret = await this.sendToServer('db.subscription.read', new FindObject({
      query: data.id,
    }));
    if (ret.data.error) {
      return await this.returnHandler({
        model: 'subscription',
        data: {
          error: "notFound"
        }
      })
    }
    let a = await this.sendToServer('test.routine.start', ret.data);
    return await this.returnHandler({
      model: 'subscription',
      data: a.data
    });
  }

  /**
   * Funcionalidade que faz o download dos documentos do participante
   * @param data
   * recebe como parametro o path do /open/downloadSubjectDocs/${adminLogado.id}/idDoParticipante
   */
  async donwload_part_docs(data) {
    let admin_verification = await this.admin_verification(data.id);
    if (!admin_verification) {
      return await this.returnHandler({
        model: 'user',
        data: {
          error: "adminNotFound"
        }
      })
    }
    let ret = await this.sendToServer('db.participant.read', new FindObject({
      query: data.participantId,
      select: 'document name surname id'
    }));
    if (!ret.data.success) {
      return await this.returnHandler({
        model: 'participant',
        data: {
          error: "participantNotFound"
        }
      })
    }
    let zipArray: any = [{
      content: `Nesse zip estão todos os documentos enviados pelo candidato ${ret.data.success.name} ${ret.data.success.surname}`,
      name: 'README.txt',
      mode: 0o775,
      comment: 'Arquivos zipados do candidato',
      date: new Date(),
      type: 'file'
    }];
    delete ret.data.success.name;
    delete ret.data.success.surname;
    delete ret.data.success.id;
    let name;
    let path;
    if (ret.data.success.document.hasOwnProperty('matrCertificate')) {
      name = 'matrCertificate';
      path = await this.getAbsolutePath(`resources/documents/users/${data.participantId}/${name}`);
      zipArray.push({path: path, name: name})
    }
    if (ret.data.success.document.hasOwnProperty('rgCpf')) {
      name = 'rgCpf';
      path = await this.getAbsolutePath(`resources/documents/users/${data.participantId}/${name}`);
      zipArray.push({path: path, name: name})
    }
    if (ret.data.success.document.hasOwnProperty('passport')) {
      name = 'passport';
      path = await this.getAbsolutePath(`resources/documents/users/${data.participantId}/${name}`);
      zipArray.push({path: path, name: name})
    }
    if (ret.data.success.document.hasOwnProperty('visa')) {
      name = 'visa';
      path = await this.getAbsolutePath(`resources/documents/users/${data.participantId}/${name}`);
      zipArray.push({path: path, name: name})
    }
    if (ret.data.success.document.hasOwnProperty('lattes')) {
      name = 'lattes';
      path = await this.getAbsolutePath(`resources/documents/users/${data.participantId}/${name}`);
      zipArray.push({path: path, name: name})
    }
    if (ret.data.success.document.hasOwnProperty('registrationCertificate')) {
      name = 'registrationCertificate';
      path = await this.getAbsolutePath(`resources/documents/users/${data.participantId}/${name}`);
      zipArray.push({path: path, name: name})
    }
    return zipArray
  }

  async getAbsolutePath(relativePath) {
    return path.resolve(relativePath);
  }

  async admin_verification(adminId) {
    let ret = await this.sendToServer('db.user.read', new QueryObject({query: adminId}));
    return ret.data.success;
  }

  /**
   * Funcionalidade que faz o donwload dos documentos de todos os participantes cadastrados naquela disciplina
   * @param data
   * recebe como parametro o path do /open/downloadSubjectDocs/${adminLogado.id}/subjectId
   */
  async download_subject_docs(data) {
    let admin_verification = await this.admin_verification(data.id);
    if (!admin_verification) {
      return await this.returnHandler({
        model: 'user',
        data: {
          error: "adminNotFound"
        }
      })
    }
    let ret = await this.participants_array(data.subscriptionSubject);
    if (ret.data.error) {
      return await this.returnHandler({
        model: 'subscription',
        data: {
          error: "notFound"
        }
      })
    }
    let zipArray: any = [{
      content: `Nesse zip estão todos os documentos da disciplina ${ret.data.subject.name}`,
      name: 'README.txt',
      mode: 0o775,
      comment: 'Arquivos zipados da disciplina',
      date: new Date(),
      type: 'file'
    }];
    let name;
    let path;
    for (let value of ret.data.subscriber) {
      zipArray.push({
        path: await this.getAbsolutePath(`resources/documents/users/${value.id}`),
        name: `${value.name} ${value.surname}`
      })
    }
    return zipArray
  }

  /**
   * Funcionalidade que gera o arquivo excel dos inscritos da disciplina
   * @param data
   * recebe como parametro o path do /open/downloadSubjectDocs/${adminLogado.id}/subjectId
   */
  async gen_subject_excel(data) {
    let ret = await this.participants_array(data.subscriptionSubject);
    if (ret.data.error) {
      return await this.returnHandler({
        model: 'subscription',
        data: {
          error: "notFound"
        }
      })
    }
    let xls = [];
    for (let value of ret.data.subscriber) {
      let data = {};
      data[`${ret.data.subject.name}`] = ``;
      data[`Nome e Sobrenome`] = value.name + ` ` + value.surname;
      data[`RG`] = value.rg;
      data[`CPF`] = value.cpf;
      if (value.isForeign) {
        data[`Passaporte`] = value.passport;
      }
      data[`Data de nascimento`] = value.birthdate;
      data[`Telefone`] = value.phoneNumber;
      data[`Curso`] = value.course;
      data[`Instituição de ensino Superior`] = value.ies;
      data[`Motivação`] = value.reason;
      xls.push(data);
    }
    return await this.returnHandler({
      model: 'admin',
      data: {
        success: {
          xls: xls,
          subjectName: ret.data.subject.name
        }
      }
    })
  }

  private async participants_array(subscriptionSubject) {
    let ret = await this.sendToServer('db.subscription_subject.read', new FindObject({
      query: subscriptionSubject,
      select: 'subscriber subject',
      populate: [
        {
          path: 'subscriber',
          select: 'name surname id document'
        },
        {
          path: 'subject',
          select: 'name'
        }
      ]
    }));
    return await this.returnHandler({
      model: 'subscription',
      data: ret.data
    });
  }
}

export default new AdminHandler();


