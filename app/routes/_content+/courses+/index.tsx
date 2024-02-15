import { useLoaderData } from '#node_modules/@remix-run/react'
import { json } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { cn, useDelayedIsPending } from '#app/utils/misc.tsx'
import { prisma } from '#app/utils/db.server.ts'

export async function loader() {
	const courses = await prisma.course.findMany()
	return json({ status: 'idle', courses } as const)
}

export default function Index() {
	const data = useLoaderData<typeof loader>()
	const isPending = useDelayedIsPending({
		formMethod: 'GET',
		formAction: '/courses',
	})

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center gap-6">
			<main>
				{data.status === 'idle' ? (
					data.courses.length ? (
						<ul
							className={cn(
								'flex w-full flex-wrap items-center justify-center gap-4 delay-200',
								{ 'opacity-50': isPending },
							)}
						>
							{data.courses.map(course => (
								<li key={course.id}>
									<Link to={`/courses/${course.slug}`}>{course.title}</Link>
								</li>
							))}
						</ul>
					) : (
						<p>No users found</p>
					)
				) : data.status === 'error' ? (
					<ErrorList errors={['There was an error parsing the results']} />
				) : null}
			</main>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
