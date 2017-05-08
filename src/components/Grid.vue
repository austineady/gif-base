<template>
  <div id="grid" class="container" v-if="gifs" :class="history.length > 0 ? 'short' : ''">
    <gif :key="gif.id" v-for="gif in gifs" :gif="gif" :offset="offset" :history="history" :store="store" :theme="theme"></gif>
  </div>
</template>

<script>
import Clipboard from 'clipboard';
import Masonry from 'masonry-layout';
import Gif from './Gif';

export default {
  name: 'grid',
  components: {
    gif: Gif,
  },
  props: ['gifs', 'short', 'history', 'store', 'theme', 'clear'],
  data() {
    return {
      offset: 0,
      backToTop: false,
    };
  },
  watch: {
    clear() {
      if (this.clear) {
        this.gifs = this.gifs.slice(0);
      }
    },
  },
  methods: {
    layout() {
      if (this.masonry) {
        this.masonry.reloadItems();
        this.masonry.layout();
      }
    },
    gifClick(gif) {
      this.$emit('gifClicked', gif);
    },
    bindEvents() {
      console.log(this.$el.children);
      window.addEventListener('scroll', () => {
        this.offset = window.pageYOffset;
      });
      window.addEventListener('resize', () => {
        this.offset = window.pageYOffset;
      });
    },
  },
  mounted() {
    this.masonry = new Masonry(this.$el, {
      itemSelector: '.gif',
      columnWidth: this.theme === 'list' ? 310 : 155,
      fitWidth: true,
    });
    window.setTimeout(this.layout, 300);

    const clipboard = new Clipboard('.gif');

    this.bindEvents();
  },
  updated() {
    window.setTimeout(this.layout, 300);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import '../global.scss';

#grid {
  max-width: 2000px;
  margin: 10px auto 30px;
}
</style>
