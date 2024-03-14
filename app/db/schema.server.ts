/**
 * After updating this file
 * npm run db:migrations
 */
import { relations, sql } from 'drizzle-orm'
import {
	real,
	index,
	integer,
	sqliteTableCreator,
	primaryKey,
	text,
} from 'drizzle-orm/sqlite-core'

export const sqliteTable = sqliteTableCreator(name => `inngest-gpt_${name}`)

// Contributions are adapted from the prisma schema, currently unused
export const contentContributions = sqliteTable(
	'contentContribution',
	{
		id: text('id').notNull().primaryKey(),
		userId: text('userId').notNull(),
		contentId: text('contentId').notNull(),
		contributionTypeId: text('contributionTypeId').notNull(),
		active: integer('active', { mode: 'boolean' }).notNull().default(true),
		// should this be timestamp or timestamp_ms??
		createdAt: integer('createdAt', { mode: 'timestamp' }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		deletedAt: integer('deletedAt', { mode: 'timestamp' }),
	},
	cc => ({
		userIdIdx: index('userId').on(cc.userId),
		contentIdIdx: index('contentId').on(cc.contentId),
		contributionTypeIdIdx: index('contributionTypeId').on(
			cc.contributionTypeId,
		),
	}),
)

export const contentContributionRelations = relations(
	contentContributions,
	({ one }) => ({
		// user: one(users, {
		// 	fields: [contentContributions.userId],
		// 	references: [users.id],
		// }),
		content: one(contentResource, {
			fields: [contentContributions.contentId],
			references: [contentResource.id],
		}),
		contributionType: one(contributionTypes, {
			fields: [contentContributions.contributionTypeId],
			references: [contributionTypes.id],
		}),
	}),
)

export const contributionTypes = sqliteTable(
	'contributionType',
	{
		id: text('id').notNull().primaryKey(),
		slug: text('slug').notNull().unique(),
		name: text('name').notNull(),
		description: text('description'),
		active: integer('active', { mode: 'boolean' }).notNull().default(true),
		createdAt: integer('createdAt', { mode: 'timestamp' }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		deletedAt: integer('deletedAt', { mode: 'timestamp' }),
	},
	ct => ({
		nameIdx: index('name').on(ct.name),
		slugIdx: index('slug').on(ct.slug),
	}),
)

export const contributionTypesRelations = relations(
	contributionTypes,
	({ many }) => ({
		contributions: many(contentContributions),
	}),
)

export const contentResource = sqliteTable(
	'contentResource',
	{
		id: text('id').notNull().primaryKey(),
		type: text('type').notNull(),
		createdById: text('createdById').notNull(),
		fields: text('fields', { mode: 'json' }).default({}), // Assuming JSON support through JSON1 SQLite extension
		createdAt: integer('createdAt', { mode: 'timestamp' }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		deletedAt: integer('deletedAt', { mode: 'timestamp' }),
	},
	cr => ({
		typeIdx: index('typeId').on(cr.type),
		createdByIdx: index('createdBy').on(cr.createdById),
		createdAtIdx: index('createdAt').on(cr.createdAt),
	}),
)

export const contentResourceRelations = relations(
	contentResource,
	({ one, many }) => ({
		// createdBy: one(users, {
		// 	fields: [contentResource.createdById],
		// 	references: [users.id],
		// }),
		contributions: many(contentContributions),
		resources: many(contentResourceResource, { relationName: 'resource' }),
		resourceOf: many(contentResourceResource, { relationName: 'resourceOf' }),
	}),
)

export const contentResourceResource = sqliteTable(
	'contentResourceResource',
	{
		resourceOfId: text('resourceOfId').notNull(),
		resourceId: text('resourceId').notNull(),
		position: real('position').notNull().default(0),
		metadata: text('metadata', { mode: 'json' }).default({}), // Assuming JSON support through JSON1 SQLite extension
		createdAt: integer('createdAt', { mode: 'timestamp' }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		deletedAt: integer('deletedAt', { mode: 'timestamp' }),
	},
	crr => ({
		pk: primaryKey({ columns: [crr.resourceOfId, crr.resourceId] }),
		contentResourceIdIdx: index('contentResourceId').on(crr.resourceOfId),
		resourceIdIdx: index('resourceId').on(crr.resourceId),
	}),
)

export const contentResourceResourceRelations = relations(
	contentResourceResource,
	({ one }) => ({
		resourceOf: one(contentResource, {
			fields: [contentResourceResource.resourceOfId],
			references: [contentResource.id],
			relationName: 'resourceOf',
		}),
		resource: one(contentResource, {
			fields: [contentResourceResource.resourceId],
			references: [contentResource.id],
			relationName: 'resource',
		}),
	}),
)
