<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      id="el-tasks-layout-header"
      reveal
      class="bg-primary-main q-px-sm q-py-none header-shadow"
    >
      <q-toolbar class="row no-padding fit">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer(true)"
        />

        <q-select
          v-model="projectSelected"
          :options="projectOptions"
          borderless
          behavior="menu"
          label="Project"
          label-color="whity"
          color="primary-main"
          class="q-ml-lg q-px-sm w-200"
          transition-show="jump-down"
          transition-hide="jump-up"
        >
          <template v-slot:selected>
            <div v-html="projectSelected" class="text-whity fw-medium"/>
          </template>
        </q-select>

        <q-btn
          flat
          dense
          round
          icon="add"
          aria-label="Add"
          class="q-ml-xs"
          @click="openCreateProjectDialog"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="column"
    >
      <q-list>
        <q-item
          class="justify-center items-center full-width no-padding"
        >
          <q-card
            flat
            class="full-width bg-secondary-filter"
          >
            <q-card-section
              horizontal
              class="justify-end q-pa-md q-pb-sm"
            >
              <q-icon
                name="close"
                size="26px"
                color="secondary"
                @click="toggleLeftDrawer(false)"
              />
            </q-card-section>
            <q-card-section
              horizontal
              class="justify-start items-center q-px-sm q-pb-lg q-pt-none"
            >
              <q-icon
                name="circle"
                size="54px"
                color="secondary"
                class="q-pr-lg"
              />
              <div class="column q-pl-xs">
                <span
                  class="fs-22 q-mb-none q-pb-none lh-20 text-secondary"
                  v-html="'Ricardo Sales'"
                />
                <span
                  class="fs-11 q-mt-none q-pt-none lh-11 text-secondary"
                  v-html="'ricardosales@gmail.com'"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-item>
        <q-item
          v-for="({ title, icon, path}, index) in drawerOptions"
          :key="index"
          class="no-padding no-margin"
        >
          <q-btn
            flat
            no-caps
            :class="`full-width justify-center items-start q-pl-md ${
              isSelectedDrawerOption(index)
                ? 'text-primary-main bg-primary-filter'
                : 'text-secondary bg-white'
            }`"
            @click="changeSelectedDrawerOption(index, path)"
          >
            <div>
              <q-icon
                :name="icon"
                :color="isSelectedDrawerOption(index) ? 'primary-main' : 'secondary'"
                class="q-pr-md q-pl-xs"
              />
              <span
                v-html="title"
                class="q-pl-xs fw-medium fs-16 lh-18"
              />
            </div>
          </q-btn>
        </q-item>
      </q-list>
      <q-space />
      <span
        class="no-margin full-width text-right q-pr-md q-pb-sm text-dark fs-11 lh-12"
        v-html="'Simple Tasks v0.1.0'"
      />
    </q-drawer>

    <q-page-container>
      <router-view v-model="tasks" @open-edit-task="(task: Task) => openEditTaskDialog(task)"/>
    </q-page-container>

    <q-footer class="bg-secondary-filter">
      <q-toolbar class="row no-padding fit">
        <q-btn
          flat
          no-caps
          no-wrap
          aria-label="Sort"
          class="col-4 q-pt-sm"
          @click="openSortDialog"
        >
          <div class="column items-center justify-center">
            <q-icon name="sort" size="24px" color="dark-common"/>
            <div v-html="'Sort'" class="fs-12 lh-20 fw-regular text-secondary"/>
          </div>
        </q-btn>
        <q-btn
          flat
          no-caps
          no-wrap
          aria-label="AddCircle"
          class="col-4 q-py-xs"
          @click="openCreateTaskDialog"
        >
          <div class="column items-center justify-center">
            <q-icon name="add_circle_outline" size="30px" color="primary-main"/>
            <div v-html="'Create Task'" class="fs-14 lh-20 fw-medium text-primary-lighter"/>
          </div>
        </q-btn>
        <q-btn
          flat
          no-caps
          aria-label="Search"
          class="col-4 q-pt-sm"
          @click="openSearchDialog"
        >
          <div class="column items-center justify-center">
            <q-icon name="search" size="24px" color="dark-common"/>
            <div v-html="'search'" class="fs-12 lh-20 fw-regular text-secondary" />
          </div>
        </q-btn>
      </q-toolbar>
    </q-footer>

    <create-project-dialog
      v-model="isCreateProjectOpen"
    />

    <task-dialog
      :current-task="taskToEdit"
      v-model="isCreateTaskOpen"
    />

    <task-dialog is-edit :current-task="taskToEdit" v-model="isEditTaskOpen"/>

    <search-dialog
      v-model="isSearchDialogOpen"
    />

    <sort-dialog
      v-model="isSortDialogOpen"
    />
  </q-layout>
</template>

<script lang="ts">
  import {
    defineComponent, ref, reactive,
  } from 'vue';
  import {
    Task, Urgency,
  } from 'components/models';
  import {
    useRouter, useRoute,
  } from 'vue-router';
  import CreateProjectDialog from '../components/project/CreateProjectDialog.vue';
  import TaskDialog from '../components/tasks/TaskDialog.vue';
  import SearchDialog from '../components/searchAndSort/SearchDialog.vue';
  import SortDialog from '../components/searchAndSort/SortDialog.vue';

  const drawerOptions = [
    {
      title: 'Your Tasks',
      icon: 'checklist',
      path: '/',
    },
    {
      title: 'Logout',
      icon: 'logout',
    },
  ];

  const tasks: Task[] = [
    {
      taskId: 1,
      userId: 1,
      title: 'ct1',
      description: 'ok',
      creationDate: new Date(),
      urgency: Urgency.URGENT,
      done: false,
    },
    {
      taskId: 2,
      userId: 1,
      title: 'ct1',
      description: 'ok',
      creationDate: new Date(),
      dueDate: new Date('2022-11-30'),
      urgency: Urgency.URGENT,
      done: false,
    },
    {
      taskId: 3,
      userId: 1,
      title: 'ct1',
      description: 'ok',
      creationDate: new Date(),
      urgency: Urgency.IMPORTANT,
      done: false,
    },
    {
      taskId: 4,
      userId: 1,
      title: 'ct1',
      description: 'ok',
      creationDate: new Date(),
      urgency: Urgency.IMPORTANT,
      done: false,
    },
    {
      taskId: 5,
      userId: 1,
      title: 'ct1',
      description: 'ok',
      creationDate: new Date(),
      urgency: Urgency.COMMON,
      done: false,
    },
  ];

  const projectOptions = [
    'MyProject',
    'Second',
    'Party',
  ];

  export default defineComponent({
    name: 'MainLayout',
    components: {
      CreateProjectDialog,
      TaskDialog,
      SearchDialog,
      SortDialog,
    },
    setup () {
      const router = useRouter();
      const route = useRoute();

      const leftDrawerOpen = ref(false);
      const selectedDrawerOption = ref(0);
      const isSearchDialogOpen = ref(false);
      const isSortDialogOpen = ref(false);
      const projectSelected = ref('MyProject');
      const reactiveTasks = reactive(tasks);
      const isCreateProjectOpen = ref(false);
      const isCreateTaskOpen = ref(false);
      const isEditTaskOpen = ref(false);
      let taskToEdit = reactive(tasks[0]);

      function toggleLeftDrawer(shouldOpen: boolean) {
        leftDrawerOpen.value = shouldOpen;
      }

      function openSearchDialog() {
        isSearchDialogOpen.value = true;
      }

      function openSortDialog() {
        isSortDialogOpen.value = true;
      }

      function changeSelectedDrawerOption(optionIndex: number, pathToGo: string | undefined) {
        selectedDrawerOption.value = optionIndex;
        if (pathToGo && route.path !== pathToGo) {
          router.push(pathToGo);
        }
        toggleLeftDrawer(false);
      }

      function isSelectedDrawerOption(optionIndex: number): boolean {
        return selectedDrawerOption.value === optionIndex;
      }

      function openCreateProjectDialog(): void {
        isCreateProjectOpen.value = true;
      }

      function openCreateTaskDialog(): void {
        isCreateTaskOpen.value = true;
      }

      function openEditTaskDialog(task: Task): void {
        isEditTaskOpen.value = true;
        taskToEdit = task;
      }

      return {
        toggleLeftDrawer,
        openSearchDialog,
        isSelectedDrawerOption,
        changeSelectedDrawerOption,
        drawerOptions,
        selectedDrawerOption,
        leftDrawerOpen,
        isSearchDialogOpen,
        isSortDialogOpen,
        tasks: reactiveTasks,
        projectSelected,
        projectOptions,
        openSortDialog,
        openCreateProjectDialog,
        openCreateTaskDialog,
        openEditTaskDialog,
        isCreateProjectOpen,
        isCreateTaskOpen,
        isEditTaskOpen,
        taskToEdit,
      };
    },
  });
</script>

<style>
  #el-tasks-layout-header .q-select__dropdown-icon {
    color: rgb(250,250,250) !important;
  }

  .width-110 {
    width: 110px;
  }

  .header-shadow {
    box-shadow: 0 4px 4px rgba(0,0,0,0.1);
  }
</style>