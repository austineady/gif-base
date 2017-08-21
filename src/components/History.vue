<template>
  <aside id="history" :class="data.length > 0 ? 'active' : ''">
    <gif :key="'hist'+gif.id" v-for="gif in data" :gif="gif"></gif>
  </aside>
</template>

<script>
import Gif from './Gif';

export default {
  name: 'History',
  props: ['data'],
  components: {
    gif: Gif,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
aside {
  background-color: #e0e0e0;
  bottom: 0;
  height: 100%;
  position: absolute;
  right: 0;
  top: 155px;
  transform: translateX(100%);
  transition: transform .4s;
  width: 210px;

  .grid-item {
    display: block;
    margin: 10px auto;
    width: 200px;
  }

  &.active {
    transform: translateX(0);
  }
}
</style>
