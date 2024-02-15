import { useLoaderData } from '#node_modules/@remix-run/react'
import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'
import MuxPlayer from '@mux/mux-player-react'

export async function loader({ params }: LoaderFunctionArgs) {
	console.log({ params })

	// const lesson = course?.lessons.find(lesson => lesson.slug === params.lesson)
	// invariantResponse(lesson, 'Lesson not found', { status: 404 })
	const lesson = await prisma.lesson.findFirst({
		where: {
			slug: params.lesson,
		},
		include: {
			video: true,
			course: {
				include: {
					instructor: true,
				},
			},
		},
	})

	invariantResponse(lesson, 'Lesson not found', { status: 404 })

	console.log({ lesson: lesson.video })

	const muxAsset = await fetch(
		`https://api.mux.com/video/v1/assets/${lesson.video?.mux_asset_id}`,
		{
			headers: {
				Authorization: `Basic ${Buffer.from(
					`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`,
				).toString('base64')}`,
				'Content-Type': 'application/json',
			},
		},
	)
		.then(res => res.json())
		.then((data: any) => data?.data)

	return json({ course: lesson.course, lesson, muxAsset })
}

export default function LessonRoute() {
	const { course, lesson, muxAsset } = useLoaderData<typeof loader>()

	console.log(muxAsset)

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
			<div className="relative">
				{lesson.title} by {course?.instructor?.full_name}
				{course?.image_url && (
					<img
						src={course?.image_url}
						alt={lesson.title}
						className="h-52 w-52 object-cover"
					/>
				)}
				<MuxPlayer playbackId={muxAsset.playback_ids[0].id} />
			</div>
		</div>
	)
}
