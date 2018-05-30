<template>
  <div id="wrap">
    <router-view></router-view>
  </div>
</template>

<script>


export default {
  name: 'app',
};
</script>

<style lang="scss">
#wrap {
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
