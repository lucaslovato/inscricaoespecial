import axios from 'axios';

class UserService {
  constructor() {

  }


  async doLogout(){
    return await axios.post('/api/logout');
  }

  async getUser(user){
    // return await  axios.get('')
  }
}

export default new UserService();