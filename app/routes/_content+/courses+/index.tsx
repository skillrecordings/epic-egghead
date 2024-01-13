import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import {courses} from "#app/data/playlists-short"
import {useLoaderData} from "#node_modules/@remix-run/react";
import {cn, useDelayedIsPending} from "#app/utils/misc.tsx";
import {ErrorList} from "#app/components/forms.tsx";
import {GeneralErrorBoundary} from "#app/components/error-boundary.tsx";
import {Link} from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log(courses.length)

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