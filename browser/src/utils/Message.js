import lil from 'lil-uuid';
class Message{
  constructor(event, request, id){
    this.id = id ? id : lil.uuid();
    this.event = event;
    this.request = request;
  }

  set id(id){
    if(!lil.isUUID(id)){
      throw new Error("O id da Mensagem é incompativel!");
    }
    this._id = id;
  }

  get id(){
    return this._id;
  }

  set event(event){
    this._event = event;
  }

  get event(){
    return this._event;
  }

  set request(request){
    this._request = request;
  }

  get request(){
    return this._request;
  }

  toServer(){
    return {
      id: this.id,
      event: this.event,
      request: this.request,
    }
  }

}

export default Message;