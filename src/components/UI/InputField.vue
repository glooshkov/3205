<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'InputField',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    mask: {
      type: String,
      default: '',
    },
  },
  methods: {
    applyMask(value: string) {
      if (this.mask && value) {
        const cleanedValue = value.replace(/\D+/g, '');
        let maskedValue = '';
        let index = 0;
        for (const char of this.mask) {
          if (char === '#' && index < cleanedValue.length) {
            maskedValue += cleanedValue[index++];
          } else {
            maskedValue += char;
          }
        }
        return maskedValue;
      }
      return value;
    },
    updateValue(event: Event) {
      const input = event.target as HTMLInputElement;
      const value = this.applyMask(input.value);
      this.$emit('update:modelValue', value);
    },
  },
  setup(props, { emit }) {
    const inputValue = ref(props.modelValue);
    const inputElement = ref<HTMLInputElement | null>(null);

    watch(inputValue, (newValue) => {
      emit('update:modelValue', newValue);
    });

    return {
      inputValue,
      inputElement,
    };
  },
});
</script>

<template>
  <div>
    <label class="label-inp">{{ label }}:</label>
    <input
      :value="modelValue"
      @input="updateValue"
      class="search-inp"
      ref="inputElement"
    />
  </div>
</template>

<style>

</style>