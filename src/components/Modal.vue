<script setup>
import { ref } from 'vue'

const showModal = ref(false)

defineExpose({
    open,
    close,
})

function open() {
    showModal.value = true
}

function close() {
    showModal.value = false
}
</script>

<template>
    <div v-show="showModal" class="modal-backdrop" @click.self="close">
        <div class="modal">
            <header>
                <slot name="header"></slot>
            </header>

            <main>
                <slot name="main"></slot>
            </main>

            <footer>
                <slot name="footer"></slot>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.575);

    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.449);
    min-width: 500px;


    backdrop-filter: blur(5px);
    border-radius: 20px;
}

.modal-button:hover {

    border-radius: 50%;
}

header {
    display: flex;
    justify-content: center;
    height: 100px;
}

main {
  height: 400px;
}

footer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem;
    gap: 1rem;
}


</style>
