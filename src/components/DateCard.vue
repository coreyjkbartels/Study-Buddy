<template>
  <div class="card">
    <slot name="date"></slot>
    <slot name="sessions"></slot>
  </div>
</template>

<style scoped>
.card {
  flex: 1;
  aspect-ratio: 2/3;

  padding: var(--space-200);

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  background: var(--color-background-soft);
  border-radius: 12px;
  box-shadow:
    inset 0 0 0.5px 1px hsla(0, 0%, 100%, 0.1),
    0 0 0 1px hsla(230, 13%, 9%, 0.075),
    0 0.3px 0.4px hsla(230, 13%, 9%, 0.02),
    0 0.9px 1.5px hsla(230, 13%, 9%, 0.045),
    0 3.5px 6px hsla(230, 13%, 9%, 0.09);
}
</style>
