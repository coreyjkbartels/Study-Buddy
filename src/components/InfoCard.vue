<template>
  <div class="card">
    <div class="card-description">
      <slot name="card-icon"></slot>
      <slot class="card-label" name="card-label"></slot>
    </div>
    <slot name="card-info"></slot>
  </div>
</template>

<style scoped>
.card {
  flex: 1;

  height: fit-content;

  padding: var(--space-200);

  display: flex;
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

.card-description {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-150);
}
</style>
