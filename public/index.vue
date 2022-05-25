<template>
    <div class="map">
        Vue3 编辑 {{ A }}
    </div>
</template>

<script lang="ts" setup>
import A from './global'

console.warn("vue3 编译成功")
</script>

<style scoped>
.map {
    color: "#ff0000"
}
</style>