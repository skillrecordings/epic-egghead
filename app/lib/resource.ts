import { z } from 'zod'
import { JSONSchema } from '#app/utils/misc'

export const ResourceVisibilitySchema = z.union([
	z.literal('public'),
	z.literal('private'),
	z.literal('unlisted'),
])

export const ResourceStateSchema = z.union([
	z.literal('draft'),
	z.literal('published'),
	z.literal('archived'),
	z.literal('deleted'),
])

export const ResourceSchema = z.object({
	_id: z.string(),
	_type: z.string(),
	_updatedAt: z.number(),
	_createdAt: z.number(),
	slug: z.string(),
	title: z.string(),
	summary: z.string().optional().nullable(),
	body: z.string().nullable().optional(),
	instructor: z.string().optional().nullable(),
	videoResourceId: z.string().nullable().optional(),
	imageUrl: z.string().nullable().optional(),
	tags: JSONSchema(z.array(z.string()).nullable().default([])),
	transcriptUrl: z.string().nullable().optional(),
	state: ResourceStateSchema.default('draft'),
	visibility: ResourceVisibilitySchema.default('unlisted'),
})

export type Resource = z.infer<typeof ResourceSchema>
