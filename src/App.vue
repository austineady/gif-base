<template>
  <div id="app">
    <router-view></router-view>
    <footer>
      <div class="container">
        Powered by <a href="https://giphy.com">Giphy</a>
      </div>
    </footer>
  </div>
</template>

<script>


export default {
  name: 'app',
};
</script>

<style lang="scss" module>
  @import './global.scss';

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  footer {
    height: 60px;
    line-height: 60px;
    text-align: right;
    background-color: $green;
    color: white;
    font-size: 1.6rem;
    font-family: 'Roboto';
    font-weight: 300;
    padding: 0 50px;

    a {
      color: white;

      &:hover {
        color: darken(white, 10%);
      }
    }

    @media screen and (max-width: 499px) {
      text-align: center;
      height: 40px;
      line-height: 40px;
    }
  }
</style>
