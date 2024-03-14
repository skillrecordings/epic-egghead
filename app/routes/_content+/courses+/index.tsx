// http://localhost:3000/courses

import { useLoaderData } from '#node_modules/@remix-run/react'
import { json } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { db } from '#app/db/config.server'
import { contentResource } from '#app/db/schema.server'
import { ResourceSchema } from '#app/lib/resource'

export async function loader() {
	const query = db.all(sql`
    SELECT
      resource.id as _id,
      resource.type as _type,
      CAST (resource.updatedAt AS DATETIME) as _updatedAt,
      CAST (resource.createdAt AS DATETIME) as _createdAt,
      JSON_EXTRACT(resource.fields, '$.slug') as slug,
      JSON_EXTRACT(resource.fields, '$.title') as title,
      JSON_EXTRACT(resource.fields, '$.instructor') as instructor
    FROM
      ${contentResource} as resource
    WHERE
      _type = 'course'
    ORDER BY
      _updatedAt DESC
	`)

	const courses = z.array(ResourceSchema).parse(query)

	return json({ courses })
}

export default function Index() {
	const { courses } = useLoaderData<typeof loader>()

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
			<main>
				<h1 className="text-3xl font-bold">Courses</h1>
				{courses.length > 0 ? (
					<ul className="ml-8 mt-2 list-disc">
						{courses.map(course => (
							<li key={course._id}>
								<Link
									to={`/courses/${course.slug}`}
									prefetch="intent"
									className="text-blue-500 hover:underline"
								>
									{course.title}
								</Link>
							</li>
						))}
					</ul>
				) : (
					<p>
						No courses found.
						<br />
						Did you `npm run seed-db`?
					</p>
				)}
			</main>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
