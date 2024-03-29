<template>
	<q-dialog
		v-model="isDialogOpen"
		persistent
		transition-show="slide-up"
		transition-hide="slide-down"
	>
		<q-card class="bg-whity text-dark q-pa-sm full-width">
			<q-bar class="bg-transparent q-px-none q-pt-lg q-pb-xs">
				<q-btn
					dense
					flat
					icon="close"
					size="20px"
					color="negative"
					@click="isDialogOpen = false"
				/>

				<q-space />

				<q-btn
					:id="props.doneButtonId"
					:loading="isLoading"
					:icon="doneIcon"
					dense
					flat
					size="20px"
					color="positive"
					@click="done"
				/>
			</q-bar>

			<q-card-section class="bg-transparent q-mx-sm q-px-xs q-py-sm column">
				<slot />
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
  import {
    defineComponent,
    computed,
  } from 'vue';
  import { useState } from '../../utils/composables';

  export default defineComponent({
    name: 'MidDialog',
  });
</script>
<script setup lang="ts">
  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
    doneFunction: {
      type: Function,
      required: true,
    },
    doneIcon: {
      type: String,
      default: 'done',
    },
    doneButtonId: {
      type: String,
      default: 'btn-done',
    },
  });

  const emit = defineEmits([ 'update:modelValue' ]);

  const isDialogOpen = computed({
    get():boolean {
      return props.modelValue;
    },
    set(newState: boolean) {
      emit('update:modelValue', newState);
    },
  });

  const [ isLoading, setIsLoading ] = useState(false);

  const done = async() => {
    try {
      setIsLoading(true);

      await props.doneFunction();

      setIsLoading(false);

      isDialogOpen.value = false;
    } catch (e) {
      setIsLoading(false);
    }
  };
</script>
