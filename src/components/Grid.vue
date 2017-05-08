<template>
  <div id="grid" class="container" v-if="gifs" :class="history.length > 0 ? 'short' : ''">
    <gif :key="gif.id" v-for="gif in gifs" :gif="gif" :offset="offset" :history="history" :store="store"></gif>
  </div>
</template>

<script>
import * as Masonry from 'masonry-layout/masonry';
import Gif from './Gif';

export default {
  name: 'grid',
  props: ['gifs', 'short', 'history', 'store'],
  data() {
    return {
      el: null,
      offset: 0,
    };
  },
  mounted() {
    window.setTimeout(this.layout, 500);
    window.addEventListener('scroll', () => {
      this.offset = window.pageYOffset;
    });
    window.addEventListener('resize', () => {
      this.offset = window.pageYOffset;
    });
  },
  updated() {
    window.setTimeout(this.layout, 500);
  },
  methods: {
    layout() {
      this.el = new Masonry(document.querySelector('#grid'), {
        itemSelector: '.grid-item',
        columnWidth: 310,
      });
      this.el.layout();
      this.el.reloadItems();
    },
    gifClick(gif) {
      this.$emit('gifClicked', gif);
    },
  },
  components: {
    gif: Gif,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '../global.scss';

#grid {
  width: 80%;
  max-width: 2000px;
  margin: 10px auto 30px;
}
</style>
