/* eslint-disable indent */
import { DateTime } from 'luxon';
import {
	ReceivedProject,
 ReceivedTask, ReceivedUser, CreateTaskToSend,
} from 'src/models/apiModels';
import {
	Gender,
	Project,
	Task, Urgency, User,
} from '../models/mainModels';

export function filterTasksByUrgency(userId: number, projectId: number, tasks: Task[], urgency: Urgency): Task[] {
	return tasks.filter((task) => !task.done
		&& task.urgency === urgency
		&& task.userId === userId
		&& task.projectId === projectId);
}

// DATE

export const getLocaleFormat = (locale: string): string => {
	if (locale === 'en-US') return 'MM-dd-yyyy';
	return 'dd/MM/yyyy';
};

export const getLocaleMask = (locale: string): string => getLocaleFormat(locale).replace(/[a-z]/gi, '#');

export const formatDateToIso = (date: Date): string => DateTime.fromJSDate(date, { zone: 'utc' }).toISODate()
	|| date.toUTCString().slice(0, 10);

export const formatDateToLocale = (
	date: Date | undefined,
	locale: string,
): string => {
	if (!date) return '';

	return DateTime.fromJSDate(date).setZone('utc').setLocale(locale).toLocaleString();
};

export const dateStrToDate = (dateStr: string, localeFormat: string): Date | undefined => {
    if (!dateStr) return undefined;

    if (dateStr.indexOf('/') === 4) return DateTime.fromFormat(dateStr, 'yyyy/MM/dd').setZone('utc').toJSDate();

    const date = DateTime.fromFormat(dateStr, localeFormat).setZone('utc').toJSDate();

    return date;
  };

// TYPE CHECK

export const isTask = (task: Task | undefined): task is Task => !!task;

// TYPE PARSE

export const parseUser = (receivedUser : ReceivedUser): User => {
	let parsedSex: Gender = Gender.NOT_INFORMED;

	switch (receivedUser.sex) {
		case 'male':
			parsedSex = Gender.MALE;
			break;
		case 'female':
			parsedSex = Gender.FEMALE;
			break;
		case 'non_binary':
			parsedSex = Gender.NON_BINARY;
			break;
		default:
	}

	const parsedBirthday = DateTime.fromISO(receivedUser.birthday, { zone: 'utc' }).toJSDate();

	return {
		userId: receivedUser.user_id,
		username: receivedUser.username,
		fullName: receivedUser.full_name,
		email: receivedUser.email,
		sex: parsedSex,
		birthday: parsedBirthday,
	};
};

export const parseTask = (receivedTask : ReceivedTask): Task => {
	const parsedCreationDate = DateTime.fromISO(receivedTask.creation_date, { zone: 'utc' }).toJSDate();
	const parsedDueDate = receivedTask.due_date ? DateTime.fromISO(receivedTask.due_date, { zone: 'utc' }).toJSDate() : undefined;

	let parsedUrgency: Urgency = Urgency.COMMON;

	switch (receivedTask.urgency) {
		case 'urgent':
			parsedUrgency = Urgency.URGENT;
			break;
		case 'important':
			parsedUrgency = Urgency.IMPORTANT;
			break;
		default:
	}

	return {
		taskId: receivedTask.task_id,
		userId: receivedTask.user_id,
		projectId: receivedTask.project_id,
		taskTitle: receivedTask.task_title,
		taskDescription: receivedTask.task_description,
		urgency: parsedUrgency,
		creationDate: parsedCreationDate,
		dueDate: parsedDueDate,
		done: receivedTask.done !== 0,
	};
};

export const parseTaskToSend = (receivedTask: Task): CreateTaskToSend => {
	const parsedCreationDate = formatDateToIso(receivedTask.creationDate);
	const parsedDueDate = receivedTask.dueDate ? formatDateToIso(receivedTask.dueDate) : undefined;

	let parsedUrgency: Urgency = Urgency.COMMON;

	switch (receivedTask.urgency) {
		case 'urgent':
			parsedUrgency = Urgency.URGENT;
			break;
		case 'important':
			parsedUrgency = Urgency.IMPORTANT;
			break;
		default:
	}

	return {
		user_id: receivedTask.userId,
		project_id: receivedTask.projectId,
		task_title: receivedTask.taskTitle,
		task_description: receivedTask.taskDescription,
		urgency: parsedUrgency,
		creation_date: parsedCreationDate,
		due_date: parsedDueDate,
		done: +receivedTask.done,
	};
};

export const parseProject = (receivedProject : ReceivedProject): Project => ({
		userId: receivedProject.user_id,
		projectId: receivedProject.project_id,
		name: receivedProject.name,
		description: receivedProject.description,
	});

// GENDER

export const genderToFullString = (gender: string): string => {
	if (gender === Gender.MALE) return 'Male';
	if (gender === Gender.FEMALE) return 'Female';
	if (gender === Gender.NON_BINARY) return 'Non-Binary';
	return 'Not Informed';
};
