<template>
	<big-dialog
		v-model="isCreateProjectOpen"
		save-button-id="btn-project-submit"
		:handle-save="saveProject"
		:extra-style="props.extraStyle"
	>
		<h1 class="text-secondary fs-20 lh-22 ls-1 text-center text-uppercase fw-medium q-pa-none q-mb-sm q-mt-md">
			<template v-if="!baseProject?.projectId">
				{{ $t('PROJECT.CREATE') }}
			</template>
			<template v-else>
				{{ $t('PROJECT.EDIT') }}
			</template>
		</h1>

		<q-input
			ref="projectName"
			for="npt-project-name"
			v-model="newProject.name"
			bottom-slots
			counter
			clearable
			maxlength="20"
			:rules="[val => !!val || $t('PROJECT.ERROR.EMPTY_NAME')]"
			:label="$t('PROJECT.FORM.NAME')"
			color="primary-main"
			class="q-mb-md"
		>
			<template v-slot:hint>
				Max of 20 characters
			</template>
		</q-input>
		<q-input
			for="npt-project-description"
			v-model="newProject.description"
			bottom-slots
			counter
			clearable
			maxlength="50"
			:label="$t('PROJECT.FORM.DESCRIPTION')"
			color="primary-main"
			class="q-mb-md"
		>
			<template v-slot:hint>
				Max of 50 characters
			</template>
		</q-input>
	</big-dialog>
</template>

<script lang="ts">
  import {
    defineComponent, computed, reactive, inject, onBeforeMount, PropType, watch, ref,
  } from 'vue';
  import {
    QInput,
    QVueGlobals,
  } from 'quasar';
  import { useProjectStore } from 'src/stores/projectStore';
  import { useUserStore } from 'src/stores/userStore';
  import { CreateProjectToSend } from 'src/models/apiModels';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { Project } from 'src/models/mainModels';
  import BigDialog from '../dialogs/BigDialog.vue';

  export default defineComponent({
    name: 'CreateProjectDialog',
    components: {
      BigDialog,
    },
  });
</script>

<script setup lang="ts">
  // PROPS AND EMIT

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    baseProject: {
      type: Object as PropType<Project>,
    },
    extraStyle: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits([ 'update:modelValue' ]);

  // BASICS

  const $t = useI18n().t;

  const $q = inject<QVueGlobals>('quasar');

  const router = useRouter();

  const projectStore = useProjectStore();
  const userStore = useUserStore();

  const userId = userStore.user?.userId;

  onBeforeMount(async() => {
    if (!userId) {
      await userStore.logout();

      router.push('/login');
    }
  });

  // MODELS

  const projectName = ref<QInput | null>(null);

  let newProject = reactive<CreateProjectToSend>({
    user_id: userId as number,
    name: props.baseProject?.name || '',
    description: props.baseProject?.description || '',
  });

  watch(() => props.baseProject, (newVal) => {
    newProject = reactive<CreateProjectToSend>({
      user_id: userId as number,
      name: newVal?.name || '',
      description: newVal?.description || '',
    });
  }, {
    immediate: true, deep: true,
  });

  const isCreateProjectOpen = computed({
    get():boolean {
      return props.modelValue;
    },
    set(newState: boolean) {
      emit('update:modelValue', newState);
    },
  });

  // ACTIONS

  async function saveProject() {
    projectName.value?.validate();
    if (projectName.value?.hasError) {
      $q?.notify({
        type: 'negative',
        message: $t('AUTH.FORM.INVALID_FIELDS'),
      });

      throw new Error('Validation Error');
    }

    if (!props.baseProject?.projectId
      && projectStore.$state.projects?.some((project: Project) => project.name === newProject.name)
    ) {
      $q?.notify({
        type: 'negative',
        message: $t('PROJECT.ERROR.NAME_ALREADY_EXISTS', { name: newProject.name }),
      });

      return;
    }

    try {
      let [ success, result ] = [ false, '' ];

      if (!props.baseProject?.projectId) {
        [ success, result ] = await projectStore.createProject($t, userId as number, newProject);
      } else {
        if (newProject.name === props.baseProject.name && newProject.description === props.baseProject.description) {
          $q?.notify({
            type: 'negative',
            message: $t('PROJECT.ERROR.NO_CHANGES'),
          });

          return;
        }

        [ success, result ] = await projectStore.updateProject(
          $t,
          userId as number,
          props.baseProject.projectId,
          newProject,
        );
      }

      if (!success) {
        $q?.notify({
          type: 'negative',
          message: result,
        });

        return;
      }

      isCreateProjectOpen.value = false;

      newProject = reactive<CreateProjectToSend>({
        user_id: userId as number,
        name: '',
        description: '',
      });

      $q?.notify({
        type: 'positive',
        message: result,
      });
    } catch (e) {
      $q?.notify({
        type: 'negative',
        message: $t('PROJECT.ERROR.CREATE'),
      });
    }
  }
</script>
