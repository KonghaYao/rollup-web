<template>
    <div id="vue3">
        Vue3 编辑 {{ JSON.stringify(A) }}
    </div>
</template>

<script lang="ts" setup>
import A from './global'

console.warn("vue3 编译成功")
</script>

<style scoped lang="scss">
@import './css/index.css';
@import './css/index.less';
@import "./css/index.scss";

#vue3 {
    color: #ff0000
}
</style>