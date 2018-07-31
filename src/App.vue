<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>


export default {
  name: 'app'
};
</script>

<style lang="scss">
@import "./global.scss";

html {
  overflow-y: hidden;
}

#app {
  background-color: whitesmoke;
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: relative;
  min-width: 320px;
  overflow: hidden;
}
</style>
