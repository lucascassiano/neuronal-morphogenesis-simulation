<template>
  <div class="home">
    <Tree3D />
  </div>
</template>

<script>
// @ is an alias to /src
import Tree3D from "@/components/Tree3D.vue";

export default {
  name: "Home",
  components: {
    Tree3D,
  },
};
</script>
