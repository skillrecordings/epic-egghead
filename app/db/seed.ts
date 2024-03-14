/**
 * To run this file
 * npm run seed-db
 */
import { parse, parseISO } from 'date-fns'
import { sql } from 'drizzle-orm'
import {
	ResourceSchema,
	ResourceStateSchema,
	ResourceVisibilitySchema,
} from '#app/lib/resource'
import { courses } from '../data/playlists-short.js'
import { db } from './config.server.ts'
import { contentResource, contentResourceResource } from './schema.server.ts'

for (const course of courses) {
	if (!course.id || !course.slug) continue

	db.run(sql`
		INSERT INTO
			${contentResource}
			(id, type, createdById, fields, createdAt, updatedAt)

		VALUES (
			${course.id.toString()},
			'course',
			${course.instructor},
			${JSON.stringify(
				ResourceSchema.omit({
					_id: true,
					_type: true,
					_updatedAt: true,
					_createdAt: true,
				}).parse({
					accessState: course.access_state || 'free',
					imageUrl: course.image,
					instructor: course.instructor,
					primaryTag: course.primary_tag,
					slug: course.slug,
					state: migrateState(course.state),
					tags: course.tags,
					title: course.title,
					visibility: migrateVisibility(course.visibility_state),
				}),
			)},
			${migrateDate(course.created_at)},
			${
				course.published_at
					? migrateDate(course.published_at)
					: migrateDate(course.created_at)
			}
		)
		ON CONFLICT(id) DO NOTHING
	`)

	for (const lesson of course.lessons) {
		if (!lesson.id || !lesson.slug) continue
		console.info('- Lesson', lesson.slug)

		db.run(sql`
			INSERT INTO
				${contentResource}
				(id, type, createdById, fields, createdAt, updatedAt)
			VALUES (
				${lesson.id.toString()},
				'lesson',
				${lesson.instructor || 'unknown'},
				${JSON.stringify(
					ResourceSchema.omit({
						_id: true,
						_type: true,
						_updatedAt: true,
						_createdAt: true,
					}).parse({
						imageUrl: lesson.image,
						isPro: lesson.is_pro,
						primaryTag: lesson.primary_tag,
						slug: lesson.slug,
						state: migrateState(lesson.state),
						tags: lesson.tags,
						title: lesson.title,
						transcriptUrl: lesson.transcript_url,
						visibility: migrateVisibility(lesson.visibility_state),
					}),
				)},
				${lesson.published_at ? migrateDate(lesson.published_at) : null},
				${lesson.published_at ? migrateDate(lesson.published_at) : null}
			)
			ON CONFLICT(id) DO NOTHING
		`)

		db.run(sql`
			INSERT INTO
				${contentResourceResource}
				(resourceId, resourceOfId, position, metadata)

			VALUES (
				${lesson.id.toString()},
				${course.id.toString()},
				0,
				'{}'
			)

			ON CONFLICT(resourceId, resourceOfId) DO NOTHING
		`)
	}
}

function migrateVisibility(visibility: string | null) {
	if (!visibility) return 'unlisted'

	if (visibility === 'indexed') visibility = 'public'

	if (visibility === 'hidden') visibility = 'private'

	return ResourceVisibilitySchema.parse(visibility)
}

function migrateState(state: string | null) {
	if (!state) return 'draft'

	if (state === 'revised') state = 'draft'

	if (state === 'flagged') state = 'archived'
	if (state === 'retired') state = 'archived'

	return ResourceStateSchema.parse(state)
}

function migrateDate(date: string) {
	const dateParsers = [
		(date: string) => parseISO(date).toISOString(),
		// October 23rd 2020
		(date: string) => parse(date, 'MMMM do y', new Date()).toISOString(),
		// Oct 23rd 2020
		(date: string) => parse(date, 'MMM do y', new Date()).toISOString(),
		// October 23rd, 2020
		(date: string) => parse(date, 'MMMM do, y', new Date()).toISOString(),
	]

	for (const parser of dateParsers) {
		try {
			return parser(date)
		} catch (error) {
			continue
		}
	}

	throw new Error(
		`Unparseable date: ${date}. Extend the dateParsers array to handle this format.`,
	)
}
