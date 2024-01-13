import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { invariantResponse } from '@epic-web/invariant'
import {courses} from "#app/data/playlists-short"
import {useLoaderData} from "#node_modules/@remix-run/react";
import {Link} from "@remix-run/react";


export async function loader({ params }: LoaderFunctionArgs) {
  const course = courses.find(course => course.slug === params.course)

  invariantResponse(course, 'Course not found', { status: 404 })

  return json({ course })
}

export default function ProfileRoute() {
  const data = useLoaderData<typeof loader>()
  const course = data.course

  return (
    <div className="container mb-48 mt-36 flex flex-col items-center justify-center">
      <div className="relative">
        {course.title} by {course.instructor}
        <img
          src={course.image}
          alt={course.title}
          className="h-52 w-52 object-cover"
        />
        <ul>
          {course.lessons.map(lesson => (
            <li key={lesson.id}>
              <Link to={`/courses/${course.slug}/${lesson.slug}`}>{lesson.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}