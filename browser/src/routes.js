import Login from './views/login/Login.vue';
import Home from './views/home/Home.vue';
import Admin from './views/adminHome/Admin.vue';

export default [
  {
    name: 'login',
    path: '/',
    component: Login
  },
  {
    name: 'home',
    path: '/home',
    component: Home
  },
  {
    name: 'adminHome',
    path: '/admin-home',
    component: Admin
  },
];