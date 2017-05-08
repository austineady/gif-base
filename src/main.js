import Vue from 'vue';
import smoothscroll from 'smoothscroll-polyfill';
import App from './App';
import router from './router';
import MobileCheck from '../static/mobilecheck';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
});

window.isOnMobile = MobileCheck();
smoothscroll.polyfill();
