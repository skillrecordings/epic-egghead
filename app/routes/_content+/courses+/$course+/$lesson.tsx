import {useLoaderData} from "#node_modules/@remix-run/react";
import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import {courses} from "#app/data/playlists-short"


export async function loader({ params }: LoaderFunctionArgs) {
  console.log({params})
  const course = courses.find(course => course.slug === params.course)
  const lesson = course?.lessons.find(lesson => lesson.slug === params.lesson)


  invariantResponse(lesson, 'Lesson not found', { status: 404 })

  return json({ course, lesson })
}

export default function LessonRoute() {
  const data = useLoaderData<typeof loader>()
  const lesson = data.lesson

  return (
    <div className="container mb-48 mt-36 flex flex-col items-center justify-center">
      <div className="relative">
        {lesson.title} by {lesson.instructor}
        {lesson.image && (
          <img
            src={lesson.image}
            alt={lesson.title}
            className="h-52 w-52 object-cover"
          />
        )}
      </div>
    </div>
  )
}