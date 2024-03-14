import { useLoaderData } from '#node_modules/@remix-run/react'
import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { sql } from 'drizzle-orm'
import { db } from '#app/db/config.server'
import { contentResource, contentResourceResource } from '#app/db/schema.server'
import { ResourceSchema } from '#app/lib/resource'
import { JSONSchema } from '#app/utils/misc'

export async function loader({ params }: LoaderFunctionArgs) {
	const query = db.get<{ _id?: string }>(sql`
		SELECT
			lesson.id AS _id,
			lesson.type AS _type,
			CAST(lesson.updatedAt AS DATETIME) AS _updatedAt,
			CAST(lesson.createdAt AS DATETIME) AS _createdAt,
			JSON_EXTRACT(lesson.fields, '$.slug') AS slug,
			JSON_EXTRACT(lesson.fields, '$.title') AS title,
			JSON_EXTRACT(lesson.fields, '$.summary') AS summary,
			JSON_EXTRACT(lesson.fields, '$.body') AS body,
			JSON_EXTRACT(lesson.fields, '$.state') AS state,
			JSON_EXTRACT(lesson.fields, '$.visibility') AS visibility,
			JSON_EXTRACT(lesson.fields, '$.videoResourceId') AS videoResourceId,
			JSON_EXTRACT(lesson.fields, '$.imageUrl') AS imageUrl,
			JSON_EXTRACT(lesson.fields, '$.tags') AS tags,
			JSON_EXTRACT(lesson.fields, '$.transcriptUrl') AS transcriptUrl,
			JSON_OBJECT(
				'_id', course.id,
				'_type', course.type,
				'title', JSON_EXTRACT(course.fields, '$.title'),
				'slug', JSON_EXTRACT(course.fields, '$.slug'),
				'summary', JSON_EXTRACT(course.fields, '$.summary'),
				'visibility', JSON_EXTRACT(course.fields, '$.visibility'),
				'imageUrl', JSON_EXTRACT(course.fields, '$.imageUrl'),
				'instructor', JSON_EXTRACT(course.fields, '$.instructor'),
				'_updatedAt', CAST(course.updatedAt AS DATETIME),
				'_createdAt', CAST(course.createdAt AS DATETIME)
			) AS course
		FROM
			${contentResource} AS lesson
		JOIN
			${contentResourceResource} AS crr ON lesson.id = crr.resourceId
		JOIN
			${contentResource} AS course ON crr.resourceOfId = course.id
		WHERE
			slug = ${params.lesson}
		`)

	invariantResponse(query && query._id, 'Lesson not found', { status: 404 })

	const lesson = ResourceSchema.extend({
		course: JSONSchema(ResourceSchema),
	}).parse(query)

	// const muxAsset = await fetch(
	// 	`https://api.mux.com/video/v1/assets/${lesson.video?.mux_asset_id}`,
	// 	{
	// 		headers: {
	// 			Authorization: `Basic ${Buffer.from(
	// 				`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`,
	// 			).toString('base64')}`,
	// 			'Content-Type': 'application/json',
	// 		},
	// 	},
	// )
	// 	.then(res => res.json())
	// 	.then((data: any) => data?.data)

	return json({ lesson })
}

export default function LessonRoute() {
	const { lesson } = useLoaderData<typeof loader>()

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
			<div className="relative">
				{lesson.title} by {lesson.course.instructor}
				{lesson.imageUrl && (
					<img
						src={lesson.imageUrl}
						alt={lesson.title}
						className="h-52 w-52 object-cover"
					/>
				)}
				{/* <MuxPlayer playbackId={muxAsset.playback_ids[0].id} /> */}
			</div>
		</div>
	)
}
