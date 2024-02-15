import { useLoaderData } from '#node_modules/@remix-run/react'
import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ params }: LoaderFunctionArgs) {
	const course = await prisma.course.findFirst({
		where: {
			slug: params.course,
		},
		include: {
			lessons: true,
			instructor: true,
		},
	})

	invariantResponse(course, 'Course not found', { status: 404 })

	return json({ course })
}

export default function ProfileRoute() {
	const data = useLoaderData<typeof loader>()
	const course = data.course

	console.log(course)

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
			<div className="relative">
				{course.title} by {course.instructor?.full_name}
				{course.image_url && (
					<img
						src={course.image_url}
						alt={course.title}
						className="h-52 w-52 object-cover"
					/>
				)}
				<ul>
					{course.lessons.map(lesson => (
						<li key={lesson.id}>
							<Link to={`/courses/${course.slug}/${lesson.slug}`}>
								{lesson.title}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
