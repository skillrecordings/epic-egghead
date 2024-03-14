import { useLoaderData } from '#node_modules/@remix-run/react'
import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '#app/db/config.server'
import { contentResource, contentResourceResource } from '#app/db/schema.server'
import { ResourceSchema } from '#app/lib/resource'
import { JSONSchema } from '#app/utils/misc'

export async function loader({ params }: LoaderFunctionArgs) {
	// The minimum type to distinguish a 404
	// We get the real type from Zod later
	const query = db.get<{ _id?: string }>(sql`
	SELECT
		course.id AS _id,
		course.type AS _type,
		CAST(course.updatedAt AS DATETIME) AS _updatedAt,
		CAST(course.createdAt AS DATETIME) AS _createdAt,
		JSON_EXTRACT(course.fields, '$.slug') AS slug,
		JSON_EXTRACT(course.fields, '$.title') AS title,
		JSON_EXTRACT(course.fields, '$.summary') AS summary,
		JSON_EXTRACT(course.fields, '$.body') AS body,
		JSON_EXTRACT(course.fields, '$.state') AS state,
		JSON_EXTRACT(course.fields, '$.visibility') AS visibility,
		JSON_EXTRACT(course.fields, '$.instructor') AS instructor,
		JSON_EXTRACT(course.fields, '$.imageUrl') AS imageUrl,
		JSON_GROUP_ARRAY(
			JSON_OBJECT(
				'_id', lesson.id,
				'_type', lesson.type,
				'title', JSON_EXTRACT(lesson.fields, '$.title'),
				'slug', JSON_EXTRACT(lesson.fields, '$.slug'),
				'summary', JSON_EXTRACT(lesson.fields, '$.summary'),
				'visibility', JSON_EXTRACT(lesson.fields, '$.visibility'),
				'_updatedAt', CAST(lesson.updatedAt AS DATETIME),
				'_createdAt', CAST(lesson.createdAt AS DATETIME)
			)
		) AS lessons
		FROM
			${contentResource} AS course
		JOIN
			${contentResourceResource} AS crr ON course.id = crr.resourceOfId
		JOIN
			${contentResource} AS lesson ON lesson.id = crr.resourceId
		WHERE
			_type = 'course' AND slug = ${params.course}
	`)

	invariantResponse(query._id, 'Course not found', { status: 404 })

	const course = ResourceSchema.extend({
		lessons: JSONSchema(z.array(ResourceSchema)),
	}).parse(query)

	return json({ course })
}

export default function ProfileRoute() {
	const data = useLoaderData<typeof loader>()
	const course = data.course

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
			<div className="relative">
				<h1 className="text-3xl font-bold">{course.title}</h1>
				<p className="text-xl"> by {course.instructor}</p>
				{course.imageUrl && (
					<img
						src={course.imageUrl}
						alt={course.title}
						className="h-52 w-52 object-cover"
					/>
				)}

				<h2 className="mt-4 text-lg font-bold"> Lessons </h2>
				<ul className="ml-8 mt-2 list-disc">
					{course.lessons.map(lesson => (
						<li key={lesson._id}>
							<Link
								to={`/courses/${course.slug}/${lesson.slug}`}
								prefetch="intent"
								className="text-blue-500 hover:underline"
							>
								{lesson.title}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
