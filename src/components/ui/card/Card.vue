<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    :class="
      cn(
        'rounded-2xl border bg-card text-card-foreground shadow-xl glass-effect transition-all duration-300 hover:shadow-2xl',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
