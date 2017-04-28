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

  .container {
    width: 80%;
    max-width: 2000px;
    margin: 0 auto;
  }

  footer {
    height: 60px;
    line-height: 60px;
    text-align: right;
    background-color: $green;
    color: white;
    font-size: 16px;
    font-family: 'Roboto';
    font-weight: 300;
    padding: 0 50px;

    a {
      color: white;

      &:hover {
        color: darken(white, 10%);
      }
    }
  }
</style>
