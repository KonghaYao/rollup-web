<template>
    <div id="vue3">
        Vue3 编辑 {{ JSON.stringify(A) }}
    </div>
</template>

<script lang="ts" setup>
import A from './global'

console.warn("vue3 编译成功")
</script>

<style scoped >
#vue3 {
    color: #ff0000
}
</style>