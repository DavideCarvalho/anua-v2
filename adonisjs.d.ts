/// <reference path="./.adonisjs/server/pages.d.ts" />
/// <reference types="@adonisjs/auth/plugins/api_client" />
/// <reference path="./tests/types/japa.d.ts" />

/**
 * HttpContext.serialize is added at runtime by #providers/transform_provider and
 * typed via declare module '@adonisjs/core/http' there. Use as: ({ request, serialize }: HttpContext) => serialize(...)
 */
