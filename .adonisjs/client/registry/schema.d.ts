/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { '*': ParamValue[] }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.api': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/server-stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.debug.config': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/debug/config'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.debug.diagnostics': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/debug/diagnostics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.debug.queries': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/debug/queries'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.debug.events': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/debug/events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.debug.routes': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/debug/routes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.debug.logs': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/debug/logs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.debug.emails': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/debug/emails'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.debug.emailPreview': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/debug/emails/:id/preview'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.debug.traces': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/debug/traces'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.debug.traceDetail': {
    methods: ["GET","HEAD"]
    pattern: '/admin/api/debug/traces/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/__stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.overview': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.overview.chart': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/overview/chart'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.requests': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/requests'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.requests.show': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/requests/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.queries': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/queries'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.events': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.routes': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/routes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.logs': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/logs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.emails': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/emails'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.emails.preview': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/emails/:id/preview'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.traces': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/traces'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.traces.show': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/traces/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.queries.grouped': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/queries/grouped'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.queries.explain': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/queries/:id/explain'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.cache': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/cache'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.cache.show': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/cache/:key'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { key: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.cache.delete': {
    methods: ["DELETE"]
    pattern: '/__stats/api/cache/:key'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { key: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.jobs': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/jobs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.jobs.show': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/jobs/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.jobs.retry': {
    methods: ["POST"]
    pattern: '/__stats/api/jobs/:id/retry'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.config': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/config'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.filters': {
    methods: ["GET","HEAD"]
    pattern: '/__stats/api/filters'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.filters.create': {
    methods: ["POST"]
    pattern: '/__stats/api/filters'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'server-stats.filters.delete': {
    methods: ["DELETE"]
    pattern: '/__stats/api/filters/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'web.home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'web.matriculaOnline': {
    methods: ["GET","HEAD"]
    pattern: '/:schoolSlug/matricula-online/:academicPeriodSlug/:courseSlug'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { schoolSlug: ParamValue; academicPeriodSlug: ParamValue; courseSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/show_matricula_online_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/show_matricula_online_page_controller').default['handle']>>>
    }
  }
  'web.agendar': {
    methods: ["GET","HEAD"]
    pattern: '/agendar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'web.auth.signIn': {
    methods: ["GET","HEAD"]
    pattern: '/sign-in'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/auth/show_sign_in_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/auth/show_sign_in_page_controller').default['handle']>>>
    }
  }
  'web.auth.login': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/auth/show_sign_in_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/auth/show_sign_in_page_controller').default['handle']>>>
    }
  }
  'web.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/show_dashboard_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/show_dashboard_page_controller').default['handle']>>>
    }
  }
  'web.escola.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/escola'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_escola_dashboard_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_escola_dashboard_page_controller').default['handle']>>>
    }
  }
  'web.escola.periodosLetivos': {
    methods: ["GET","HEAD"]
    pattern: '/escola/periodos-letivos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_periodos_letivos_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_periodos_letivos_page_controller').default['handle']>>>
    }
  }
  'web.escola.periodosLetivos.show': {
    methods: ["GET","HEAD"]
    pattern: '/escola/periodos-letivos/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_periodo_letivo_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_periodo_letivo_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.novoPeriodoLetivo': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/periodos-letivos/novo-periodo-letivo'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_novo_periodo_letivo_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_novo_periodo_letivo_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.periodosLetivos.editar': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/periodos-letivos/:id/editar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_editar_periodo_letivo_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_editar_periodo_letivo_page_controller').default['handle']>>>
    }
  }
  'web.escola.periodosLetivos.cursos.visaoGeral': {
    methods: ["GET","HEAD"]
    pattern: '/escola/periodos-letivos/:slug/cursos/:cursoSlug/visao-geral'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_curso_visao_geral_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_curso_visao_geral_page_controller').default['handle']>>>
    }
  }
  'web.escola.periodosLetivos.cursos.turmas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/periodos-letivos/:slug/cursos/:cursoSlug/turmas'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_curso_turmas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_curso_turmas_page_controller').default['handle']>>>
    }
  }
  'web.escola.periodosLetivos.cursos.turmas.atividades': {
    methods: ["GET","HEAD"]
    pattern: '/escola/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/atividades'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turma_atividades_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turma_atividades_page_controller').default['handle']>>>
    }
  }
  'web.escola.periodosLetivos.cursos.turmas.provas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/provas'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turma_provas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turma_provas_page_controller').default['handle']>>>
    }
  }
  'web.escola.periodosLetivos.cursos.turmas.presencas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/presencas'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turma_presencas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turma_presencas_page_controller').default['handle']>>>
    }
  }
  'web.escola.periodosLetivos.cursos.turmas.notas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/notas'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turma_notas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turma_notas_page_controller').default['handle']>>>
    }
  }
  'web.escola.periodosLetivos.cursos.turmas.situacao': {
    methods: ["GET","HEAD"]
    pattern: '/escola/periodos-letivos/:slug/cursos/:cursoSlug/turmas/:turmaSlug/situacao'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turma_situacao_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turma_situacao_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.alunos': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/alunos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_alunos_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_alunos_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.alunos.editar': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/alunos/:id/editar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_editar_aluno_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_editar_aluno_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.alunos.historicoFinanceiro': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/alunos/historico-financeiro'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_historico_financeiro_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_historico_financeiro_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.funcionarios': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/funcionarios'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_funcionarios_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_funcionarios_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.professores': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/professores'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_professores_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_professores_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.matriculas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/matriculas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_matriculas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_matriculas_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.matriculas.nova': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/matriculas/nova'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_nova_matricula_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_nova_matricula_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.contratos': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/contratos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_contratos_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_contratos_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.contratos.novo': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/contratos/novo'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_novo_contrato_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_novo_contrato_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.contratos.editar': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/contratos/:id/editar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_editar_contrato_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_editar_contrato_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.contratos.assinaturas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/contratos/:id/assinaturas'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_contrato_assinaturas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_contrato_assinaturas_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.contratos.docuseal': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/contratos/:id/docuseal'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_contrato_docuseal_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_contrato_docuseal_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.contratos.financeiro': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/contratos/:contractId/financeiro'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_contrato_financeiro_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_contrato_financeiro_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.bolsas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/bolsas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_bolsas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_bolsas_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.parceiros': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/parceiros'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_parceiros_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_parceiros_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.materias': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/materias'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_materias_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_materias_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.folhaDePonto': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/folha-de-ponto'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_folha_de_ponto_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_folha_de_ponto_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.impressao': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/impressao'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_impressao_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_impressao_page_controller').default['handle']>>>
    }
  }
  'web.escola.administrativo.solicitacoesDeCompra': {
    methods: ["GET","HEAD"]
    pattern: '/escola/administrativo/solicitacoes-de-compra'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_solicitacoes_de_compra_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_solicitacoes_de_compra_page_controller').default['handle']>>>
    }
  }
  'web.escola.notificacoes': {
    methods: ["GET","HEAD"]
    pattern: '/escola/notificacoes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_notificacoes_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_notificacoes_page_controller').default['handle']>>>
    }
  }
  'web.escola.notificacoes.preferencias': {
    methods: ["GET","HEAD"]
    pattern: '/escola/notificacoes/preferencias'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_notificacoes_preferencias_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_notificacoes_preferencias_page_controller').default['handle']>>>
    }
  }
  'web.escola.comunicados': {
    methods: ["GET","HEAD"]
    pattern: '/escola/comunicados'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_comunicados_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_comunicados_page_controller').default['handle']>>>
    }
  }
  'web.escola.comunicados.novo': {
    methods: ["GET","HEAD"]
    pattern: '/escola/comunicados/novo'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_novo_comunicado_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_novo_comunicado_page_controller').default['handle']>>>
    }
  }
  'web.escola.comunicados.editar': {
    methods: ["GET","HEAD"]
    pattern: '/escola/comunicados/:id/editar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_editar_comunicado_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_editar_comunicado_page_controller').default['handle']>>>
    }
  }
  'web.escola.perguntas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/duvidas-responsaveis'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_perguntas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_perguntas_page_controller').default['handle']>>>
    }
  }
  'web.escola.perguntas.show': {
    methods: ["GET","HEAD"]
    pattern: '/escola/duvidas-responsaveis/:inquiryId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { inquiryId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_pergunta_detail_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_pergunta_detail_page_controller').default['handle']>>>
    }
  }
  'web.escola.eventos.novo': {
    methods: ["GET","HEAD"]
    pattern: '/escola/calendario/novo'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_novo_evento_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_novo_evento_page_controller').default['handle']>>>
    }
  }
  'web.escola.eventos.editar': {
    methods: ["GET","HEAD"]
    pattern: '/escola/calendario/:eventId/editar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_editar_evento_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_editar_evento_page_controller').default['handle']>>>
    }
  }
  'web.escola.eventos.autorizacoes': {
    methods: ["GET","HEAD"]
    pattern: '/escola/calendario/:eventId/autorizacoes'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_evento_autorizacoes_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_evento_autorizacoes_page_controller').default['handle']>>>
    }
  }
  'web.escola.mural': {
    methods: ["GET","HEAD"]
    pattern: '/escola/mural'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_mural_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_mural_page_controller').default['handle']>>>
    }
  }
  'web.escola.desempenho': {
    methods: ["GET","HEAD"]
    pattern: '/escola/desempenho'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_desempenho_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_desempenho_page_controller').default['handle']>>>
    }
  }
  'web.escola.matriculas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/matriculas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_matriculas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_matriculas_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.turmas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/turmas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turmas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_turmas_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.grade': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/grade'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_grade_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_grade_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.horarios': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/horarios'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_horarios_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_horarios_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.quadro': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/quadro'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_quadro_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_quadro_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.ocorrencias': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/registro-diario'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_ocorrencias_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_ocorrencias_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.atividades': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/atividades'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_atividades_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_atividades_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.atividades.show': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/atividades/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_atividade_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_atividade_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.atividades.edit': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/atividades/:id/editar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_edit_atividade_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_edit_atividade_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.provas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/provas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_provas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_provas_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.provas.show': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/provas/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_prova_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_prova_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.provas.edit': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/provas/:id/editar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_edit_prova_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_edit_prova_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.presenca': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/presenca'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_presenca_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_presenca_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.aulasAvulsas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/aulas-avulsas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_aulas_avulsas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_aulas_avulsas_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.calendario': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/calendario'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_pedagogico_calendario_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_pedagogico_calendario_page_controller').default['handle']>>>
    }
  }
  'web.escola.pedagogico.cursosNiveis': {
    methods: ["GET","HEAD"]
    pattern: '/escola/pedagogico/cursos-niveis'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cursos_niveis_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cursos_niveis_page_controller').default['handle']>>>
    }
  }
  'web.escola.cantina.itens': {
    methods: ["GET","HEAD"]
    pattern: '/escola/cantina/itens'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_itens_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_itens_page_controller').default['handle']>>>
    }
  }
  'web.escola.cantina.cardapio': {
    methods: ["GET","HEAD"]
    pattern: '/escola/cantina/cardapio'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_cardapio_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_cardapio_page_controller').default['handle']>>>
    }
  }
  'web.escola.cantina.pdv': {
    methods: ["GET","HEAD"]
    pattern: '/escola/cantina/pdv'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_pdv_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_pdv_page_controller').default['handle']>>>
    }
  }
  'web.escola.cantina.pedidos': {
    methods: ["GET","HEAD"]
    pattern: '/escola/cantina/pedidos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_pedidos_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_pedidos_page_controller').default['handle']>>>
    }
  }
  'web.escola.cantina.vendas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/cantina/vendas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_vendas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_vendas_page_controller').default['handle']>>>
    }
  }
  'web.escola.cantina.reservas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/cantina/reservas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_reservas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_reservas_page_controller').default['handle']>>>
    }
  }
  'web.escola.cantina.recorrencias': {
    methods: ["GET","HEAD"]
    pattern: '/escola/cantina/recorrencias'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_recorrencias_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_recorrencias_page_controller').default['handle']>>>
    }
  }
  'web.escola.cantina.transferencias': {
    methods: ["GET","HEAD"]
    pattern: '/escola/cantina/transferencias'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_transferencias_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_cantina_transferencias_page_controller').default['handle']>>>
    }
  }
  'web.escola.financeiro.inadimplencia': {
    methods: ["GET","HEAD"]
    pattern: '/escola/financeiro/inadimplencia'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_inadimplencia_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_inadimplencia_page_controller').default['handle']>>>
    }
  }
  'web.escola.financeiro.seguros': {
    methods: ["GET","HEAD"]
    pattern: '/escola/financeiro/seguros'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_seguros_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_seguros_page_controller').default['handle']>>>
    }
  }
  'web.escola.financeiro.faturas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/financeiro/faturas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_faturas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_faturas_page_controller').default['handle']>>>
    }
  }
  'web.escola.financeiro.configuracaoPagamentos': {
    methods: ["GET","HEAD"]
    pattern: '/escola/financeiro/configuracao-pagamentos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_configuracao_pagamentos_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_configuracao_pagamentos_page_controller').default['handle']>>>
    }
  }
  'web.escola.lojas.index': {
    methods: ["GET","HEAD"]
    pattern: '/escola/lojas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_lojas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_lojas_page_controller').default['handle']>>>
    }
  }
  'web.escola.lojas.show': {
    methods: ["GET","HEAD"]
    pattern: '/escola/lojas/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_loja_detail_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_loja_detail_page_controller').default['handle']>>>
    }
  }
  'web.escola.gamificacao.index': {
    methods: ["GET","HEAD"]
    pattern: '/escola/gamificacao'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_gamificacao_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_gamificacao_page_controller').default['handle']>>>
    }
  }
  'web.escola.gamificacao.rankings': {
    methods: ["GET","HEAD"]
    pattern: '/escola/gamificacao/rankings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_gamificacao_rankings_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_gamificacao_rankings_page_controller').default['handle']>>>
    }
  }
  'web.escola.gamificacao.conquistas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/gamificacao/conquistas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_gamificacao_conquistas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_gamificacao_conquistas_page_controller').default['handle']>>>
    }
  }
  'web.escola.gamificacao.recompensas': {
    methods: ["GET","HEAD"]
    pattern: '/escola/gamificacao/recompensas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_gamificacao_recompensas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_gamificacao_recompensas_page_controller').default['handle']>>>
    }
  }
  'web.escola.gamificacao.desafios': {
    methods: ["GET","HEAD"]
    pattern: '/escola/gamificacao/desafios'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_gamificacao_desafios_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_gamificacao_desafios_page_controller').default['handle']>>>
    }
  }
  'web.escola.configuracoes': {
    methods: ["GET","HEAD"]
    pattern: '/escola/configuracoes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_configuracoes_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/escola/show_configuracoes_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_dashboard_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_dashboard_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.notas': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/notas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_notas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_notas_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.frequencia': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/frequencia'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_frequencia_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_frequencia_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.mensalidades': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/mensalidades'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_mensalidades_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_mensalidades_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.cantina': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/cantina'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_cantina_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_cantina_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.gamificacao': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/gamificacao'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_gamificacao_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_gamificacao_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.gamificacao.details': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/gamificacao/:studentId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_gamificacao_details_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_gamificacao_details_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.comunicados': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/comunicados'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_comunicados_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_comunicados_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.autorizacoes': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/autorizacoes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_autorizacoes_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_autorizacoes_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.atividades': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/atividades'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_atividades_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_atividades_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.horario': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/horario'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_horario_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_horario_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.calendario': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/calendario'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_calendario_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_calendario_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.documentos': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/documentos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_documentos_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_documentos_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.ocorrencias': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/registro-diario'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_ocorrencias_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_ocorrencias_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.perfil': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/perfil'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_perfil_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_perfil_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.notificacoes': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/notificacoes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/show_responsavel_notificacoes_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/show_responsavel_notificacoes_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.credito': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/credito'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/show_responsavel_credito_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/show_responsavel_credito_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.loja': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/loja'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_loja_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_loja_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.loja.store': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/loja/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_loja_store_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_loja_store_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.perguntas': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/perguntas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_perguntas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_perguntas_page_controller').default['handle']>>>
    }
  }
  'web.responsavel.perguntas.show': {
    methods: ["GET","HEAD"]
    pattern: '/responsavel/perguntas/:inquiryId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { inquiryId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_pergunta_detail_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/responsavel/show_responsavel_pergunta_detail_page_controller').default['handle']>>>
    }
  }
  'web.admin.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_dashboard_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_dashboard_page_controller').default['handle']>>>
    }
  }
  'web.admin.escolas': {
    methods: ["GET","HEAD"]
    pattern: '/admin/escolas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_escolas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_escolas_page_controller').default['handle']>>>
    }
  }
  'web.admin.escolas.edit': {
    methods: ["GET","HEAD"]
    pattern: '/admin/escolas/:id/editar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_edit_school_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_edit_school_page_controller').default['handle']>>>
    }
  }
  'web.admin.escolas.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/escolas/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_school_details_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_school_details_page_controller').default['handle']>>>
    }
  }
  'web.admin.onboarding': {
    methods: ["GET","HEAD"]
    pattern: '/admin/onboarding'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_school_onboarding_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_school_onboarding_page_controller').default['handle']>>>
    }
  }
  'web.admin.billing.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/admin/billing/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_billing_dashboard_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_billing_dashboard_page_controller').default['handle']>>>
    }
  }
  'web.admin.billing.faturas': {
    methods: ["GET","HEAD"]
    pattern: '/admin/billing/faturas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_billing_faturas_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_billing_faturas_page_controller').default['handle']>>>
    }
  }
  'web.admin.billing.subscriptions': {
    methods: ["GET","HEAD"]
    pattern: '/admin/billing/subscriptions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_subscriptions_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_subscriptions_page_controller').default['handle']>>>
    }
  }
  'web.admin.redes': {
    methods: ["GET","HEAD"]
    pattern: '/admin/redes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_redes_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_redes_page_controller').default['handle']>>>
    }
  }
  'web.admin.configuracoes': {
    methods: ["GET","HEAD"]
    pattern: '/admin/configuracoes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_configuracoes_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_configuracoes_page_controller').default['handle']>>>
    }
  }
  'web.admin.seguros.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/seguros'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_seguros_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_seguros_page_controller').default['handle']>>>
    }
  }
  'web.admin.seguros.sinistros': {
    methods: ["GET","HEAD"]
    pattern: '/admin/seguros/sinistros'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_seguros_page_controller').default['sinistros']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_seguros_page_controller').default['sinistros']>>>
    }
  }
  'web.admin.seguros.faturamento': {
    methods: ["GET","HEAD"]
    pattern: '/admin/seguros/faturamento'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_seguros_page_controller').default['faturamento']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_seguros_page_controller').default['faturamento']>>>
    }
  }
  'web.admin.seguros.analytics': {
    methods: ["GET","HEAD"]
    pattern: '/admin/seguros/analytics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_seguros_page_controller').default['analytics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_seguros_page_controller').default['analytics']>>>
    }
  }
  'web.admin.seguros.configuracao': {
    methods: ["GET","HEAD"]
    pattern: '/admin/seguros/configuracao'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_seguros_page_controller').default['configuracao']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_seguros_page_controller').default['configuracao']>>>
    }
  }
  'web.admin.analytics.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/analytics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['index']>>>
    }
  }
  'web.admin.analytics.academico': {
    methods: ["GET","HEAD"]
    pattern: '/admin/analytics/academico'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['academico']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['academico']>>>
    }
  }
  'web.admin.analytics.presenca': {
    methods: ["GET","HEAD"]
    pattern: '/admin/analytics/presenca'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['presenca']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['presenca']>>>
    }
  }
  'web.admin.analytics.cantina': {
    methods: ["GET","HEAD"]
    pattern: '/admin/analytics/cantina'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['cantina']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['cantina']>>>
    }
  }
  'web.admin.analytics.pagamentos': {
    methods: ["GET","HEAD"]
    pattern: '/admin/analytics/pagamentos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['pagamentos']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['pagamentos']>>>
    }
  }
  'web.admin.analytics.matriculas': {
    methods: ["GET","HEAD"]
    pattern: '/admin/analytics/matriculas'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['matriculas']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['matriculas']>>>
    }
  }
  'web.admin.analytics.ocorrencias': {
    methods: ["GET","HEAD"]
    pattern: '/admin/analytics/ocorrencias'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['ocorrencias']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['ocorrencias']>>>
    }
  }
  'web.admin.analytics.gamificacao': {
    methods: ["GET","HEAD"]
    pattern: '/admin/analytics/gamificacao'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['gamificacao']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['gamificacao']>>>
    }
  }
  'web.admin.analytics.rh': {
    methods: ["GET","HEAD"]
    pattern: '/admin/analytics/rh'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['rh']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/admin/show_admin_analytics_page_controller').default['rh']>>>
    }
  }
  'web.loja.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/loja'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/loja/show_loja_dashboard_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/loja/show_loja_dashboard_page_controller').default['handle']>>>
    }
  }
  'web.loja.produtos': {
    methods: ["GET","HEAD"]
    pattern: '/loja/produtos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/loja/show_loja_produtos_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/loja/show_loja_produtos_page_controller').default['handle']>>>
    }
  }
  'web.loja.pedidos': {
    methods: ["GET","HEAD"]
    pattern: '/loja/pedidos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/loja/show_loja_pedidos_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/loja/show_loja_pedidos_page_controller').default['handle']>>>
    }
  }
  'web.loja.financeiro': {
    methods: ["GET","HEAD"]
    pattern: '/loja/financeiro'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/loja/show_loja_financeiro_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/loja/show_loja_financeiro_page_controller').default['handle']>>>
    }
  }
  'web.aluno.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/aluno'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_dashboard_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_dashboard_page_controller').default['handle']>>>
    }
  }
  'web.aluno.loja.index': {
    methods: ["GET","HEAD"]
    pattern: '/aluno/loja'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_loja_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_loja_page_controller').default['handle']>>>
    }
  }
  'web.aluno.loja.carrinho': {
    methods: ["GET","HEAD"]
    pattern: '/aluno/loja/carrinho'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_carrinho_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_carrinho_page_controller').default['handle']>>>
    }
  }
  'web.aluno.loja.pedidos': {
    methods: ["GET","HEAD"]
    pattern: '/aluno/loja/pedidos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_pedidos_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_pedidos_page_controller').default['handle']>>>
    }
  }
  'web.aluno.loja.pontos': {
    methods: ["GET","HEAD"]
    pattern: '/aluno/loja/pontos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_loja_pontos_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_loja_pontos_page_controller').default['handle']>>>
    }
  }
  'web.aluno.idle': {
    methods: ["GET","HEAD"]
    pattern: '/aluno/idle'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_idle_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_idle_page_controller').default['handle']>>>
    }
  }
  'web.aluno.jogo': {
    methods: ["GET","HEAD"]
    pattern: '/aluno/jogo'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_jogo_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_jogo_page_controller').default['handle']>>>
    }
  }
  'web.aluno.loja.store': {
    methods: ["GET","HEAD"]
    pattern: '/aluno/loja/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_loja_store_page_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages/aluno/show_aluno_loja_store_page_controller').default['handle']>>>
    }
  }
  'api.v1.auth.login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/login').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/login').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.auth.send_code': {
    methods: ["POST"]
    pattern: '/api/v1/auth/send-code'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').sendCodeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').sendCodeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/send_code').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/send_code').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.auth.verify_code': {
    methods: ["POST"]
    pattern: '/api/v1/auth/verify-code'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').verifyCodeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').verifyCodeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/verify_code').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/verify_code').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.auth.logout': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/logout').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/logout').default['handle']>>>
    }
  }
  'api.v1.auth.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/me').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/me').default['handle']>>>
    }
  }
  'api.v1.dashboard.escola_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/escola/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard/get_escola_stats_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard/get_escola_stats_controller').default['handle']>>>
    }
  }
  'api.v1.dashboard.escola_insights': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/escola/insights'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard/get_escola_insights_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard/get_escola_insights_controller').default['handle']>>>
    }
  }
  'api.v1.dashboard.escola_teacher_dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/escola/teacher-dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard/get_escola_teacher_dashboard_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard/get_escola_teacher_dashboard_controller').default['handle']>>>
    }
  }
  'api.v1.dashboard.escola_pedagogical_alerts': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/escola/pedagogical-alerts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard/get_pedagogical_alerts_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard/get_pedagogical_alerts_controller').default['handle']>>>
    }
  }
  'api.v1.dashboard.responsavel_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard/get_responsavel_stats_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard/get_responsavel_stats_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_grades': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/grades'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_grades_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_grades_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_attendance': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/attendance'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_attendance_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_payments': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/payments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_payments_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_payments_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_invoices': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/invoices'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_invoices_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_invoices_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_balance': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/balance'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_balance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_balance_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_canteen_purchases': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/canteen-purchases'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_canteen_purchases_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_canteen_purchases_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_meal_recurrence': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/meal-recurrence'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/list_student_meal_recurrence_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/list_student_meal_recurrence_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.update_student_meal_recurrence': {
    methods: ["PUT"]
    pattern: '/api/v1/responsavel/students/:studentId/meal-recurrence'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student_meal_recurrence').updateStudentMealRecurrenceValidator)>>
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/student_meal_recurrence').updateStudentMealRecurrenceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/update_student_meal_recurrence_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/update_student_meal_recurrence_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.responsavel.api.student_assignments': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/assignments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_assignments_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_assignments_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_schedule': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/schedule'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_schedule_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_schedule_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_documents': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/documents'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_documents_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_documents_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_occurrences': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/occurrences'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_occurrences_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_occurrences_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.acknowledge_occurrence': {
    methods: ["POST"]
    pattern: '/api/v1/responsavel/students/:studentId/occurrences/:occurrenceId/acknowledge'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { studentId: ParamValue; occurrenceId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/acknowledge_occurrence_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/acknowledge_occurrence_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/overview'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_overview_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_overview_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_gamification': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/gamification'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_gamification_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_gamification_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.student_calendar': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/calendar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/responsavel_calendar').getStudentCalendarValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_calendar_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_student_calendar_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.responsavel.api.notifications': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/get_notifications_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/get_notifications_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.comunicados.list': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/comunicados'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/list_comunicados_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/list_comunicados_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.comunicados.pending_ack': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/comunicados/pending-ack'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/list_pending_acknowledgements_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/list_pending_acknowledgements_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.comunicados.details': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/comunicados/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/show_comunicado_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/show_comunicado_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.comunicados.acknowledge': {
    methods: ["POST"]
    pattern: '/api/v1/responsavel/comunicados/:id/acknowledge'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/acknowledge_comunicado_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/acknowledge_comunicado_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.update_profile': {
    methods: ["PUT"]
    pattern: '/api/v1/responsavel/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/responsavel').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/responsavel').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/update_profile_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/update_profile_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.responsavel.api.invoice_checkout': {
    methods: ["POST"]
    pattern: '/api/v1/responsavel/invoices/:id/checkout'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices/create_invoice_asaas_charge_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices/create_invoice_asaas_charge_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.create_wallet_top_up': {
    methods: ["POST"]
    pattern: '/api/v1/responsavel/students/:studentId/wallet-top-ups'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/wallet_top_up').createWalletTopUpValidator)>>
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/wallet_top_up').createWalletTopUpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_top_ups/create_wallet_top_up_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_top_ups/create_wallet_top_up_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.responsavel.api.list_wallet_top_ups': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/wallet-top-ups'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/wallet_top_up').listWalletTopUpsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_top_ups/list_wallet_top_ups_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_top_ups/list_wallet_top_ups_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.responsavel.api.show_wallet_top_up': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/wallet-top-ups/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_top_ups/show_wallet_top_up_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_top_ups/show_wallet_top_up_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.inquiries.list': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/students/:studentId/inquiries'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/parent_inquiry').listInquiriesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/list_student_inquiries_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/list_student_inquiries_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.responsavel.api.inquiries.create': {
    methods: ["POST"]
    pattern: '/api/v1/responsavel/students/:studentId/inquiries'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/parent_inquiry').createInquiryValidator)>>
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/parent_inquiry').createInquiryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/create_student_inquiry_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/create_student_inquiry_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.responsavel.api.inquiries.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsavel/inquiries/:inquiryId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { inquiryId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/show_inquiry_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/show_inquiry_controller').default['handle']>>>
    }
  }
  'api.v1.responsavel.api.inquiries.messages.create': {
    methods: ["POST"]
    pattern: '/api/v1/responsavel/inquiries/:inquiryId/messages'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/parent_inquiry').createMessageValidator)>>
      paramsTuple: [ParamValue]
      params: { inquiryId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/parent_inquiry').createMessageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/create_inquiry_message_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/create_inquiry_message_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.responsavel.api.inquiries.resolve': {
    methods: ["POST"]
    pattern: '/api/v1/responsavel/inquiries/:inquiryId/resolve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { inquiryId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsavel/resolve_inquiry_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsavel/resolve_inquiry_controller').default['handle']>>>
    }
  }
  'api.v1.dashboard.admin_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard/get_admin_stats_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard/get_admin_stats_controller').default['handle']>>>
    }
  }
  'api.v1.dashboard.server_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/server-stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/get_server_stats_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/get_server_stats_controller').default['handle']>>>
    }
  }
  'api.v1.asaas.webhook': {
    methods: ["POST"]
    pattern: '/api/v1/asaas/webhook'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/asaas/asaas_webhook_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/asaas/asaas_webhook_controller').default['handle']>>>
    }
  }
  'api.v1.asaas.subaccounts.create': {
    methods: ["POST"]
    pattern: '/api/v1/asaas/subaccounts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/asaas_subaccount').createAsaasSubaccountValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/asaas_subaccount').createAsaasSubaccountValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/asaas/create_asaas_subaccount_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/asaas/create_asaas_subaccount_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.asaas.subaccounts.status': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/asaas/subaccounts/status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/asaas/get_asaas_payment_config_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/asaas/get_asaas_payment_config_controller').default['handle']>>>
    }
  }
  'api.v1.schools.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/schools'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/school').listSchoolsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schools/index').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schools/index').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.schools.store': {
    methods: ["POST"]
    pattern: '/api/v1/schools'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school').createSchoolValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/school').createSchoolValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schools/store').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schools/store').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.schools.show_by_slug': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/schools/slug/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schools/show_by_slug').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schools/show_by_slug').default['handle']>>>
    }
  }
  'api.v1.schools.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/schools/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schools/show').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schools/show').default['handle']>>>
    }
  }
  'api.v1.schools.update': {
    methods: ["PUT"]
    pattern: '/api/v1/schools/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school').updateSchoolValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/school').updateSchoolValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schools/update').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schools/update').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.schools.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/schools/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schools/destroy').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schools/destroy').default['handle']>>>
    }
  }
  'api.v1.schools.upload_logo': {
    methods: ["POST"]
    pattern: '/api/v1/schools/:id/logo'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schools/upload_school_logo_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schools/upload_school_logo_controller').default['handle']>>>
    }
  }
  'api.v1.schools.users': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/schools/:id/users'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schools/list_school_users_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schools/list_school_users_controller').default['handle']>>>
    }
  }
  'api.v1.schools.update_director': {
    methods: ["PUT"]
    pattern: '/api/v1/schools/:id/director'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school').updateDirectorValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/school').updateDirectorValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schools/update_school_director_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schools/update_school_director_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users/index').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users/index').default['handle']>>>
    }
  }
  'api.v1.users.school_employees': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/users/school-employees'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users/school_employees').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users/school_employees').default['handle']>>>
    }
  }
  'api.v1.users.store': {
    methods: ["POST"]
    pattern: '/api/v1/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users/store').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users/store').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.users.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users/show').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users/show').default['handle']>>>
    }
  }
  'api.v1.users.update': {
    methods: ["PUT"]
    pattern: '/api/v1/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').updateUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/user').updateUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users/update').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users/update').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.users.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users/destroy').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users/destroy').default['handle']>>>
    }
  }
  'api.v1.user_schools.list_user_schools': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/user-schools'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/user_school').listUserSchoolsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_schools/list_user_schools_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_schools/list_user_schools_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.user_schools.create_user_school': {
    methods: ["POST"]
    pattern: '/api/v1/user-schools'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_school').createUserSchoolValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_school').createUserSchoolValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_schools/create_user_school_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_schools/create_user_school_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.user_schools.update_user_school': {
    methods: ["PUT"]
    pattern: '/api/v1/user-schools/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_school').updateUserSchoolValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/user_school').updateUserSchoolValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_schools/update_user_school_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_schools/update_user_school_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.user_schools.delete_user_school': {
    methods: ["DELETE"]
    pattern: '/api/v1/user-schools/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_schools/delete_user_school_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_schools/delete_user_school_controller').default['handle']>>>
    }
  }
  'api.v1.user_school_groups.list_user_school_groups': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/user-school-groups'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/user_school_group').listUserSchoolGroupsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_school_groups/list_user_school_groups_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_school_groups/list_user_school_groups_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.user_school_groups.create_user_school_group': {
    methods: ["POST"]
    pattern: '/api/v1/user-school-groups'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_school_group').createUserSchoolGroupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_school_group').createUserSchoolGroupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_school_groups/create_user_school_group_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_school_groups/create_user_school_group_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.user_school_groups.delete_user_school_group': {
    methods: ["DELETE"]
    pattern: '/api/v1/user-school-groups/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_school_groups/delete_user_school_group_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_school_groups/delete_user_school_group_controller').default['handle']>>>
    }
  }
  'api.v1.school_switcher.get_data': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-switcher'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_switcher/get_school_switcher_data_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_switcher/get_school_switcher_data_controller').default['handle']>>>
    }
  }
  'api.v1.school_switcher.toggle_school': {
    methods: ["POST"]
    pattern: '/api/v1/school-switcher/toggle-school'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school_switcher').toggleSchoolSelectionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/school_switcher').toggleSchoolSelectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_switcher/toggle_school_selection_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_switcher/toggle_school_selection_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_switcher.toggle_group': {
    methods: ["POST"]
    pattern: '/api/v1/school-switcher/toggle-group'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school_switcher').toggleSchoolGroupSelectionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/school_switcher').toggleSchoolGroupSelectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_switcher/toggle_school_group_selection_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_switcher/toggle_school_group_selection_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/student').listStudentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/index').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/index').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.store': {
    methods: ["POST"]
    pattern: '/api/v1/students'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student').createStudentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/student').createStudentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/store').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/store').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.enroll': {
    methods: ["POST"]
    pattern: '/api/v1/students/enroll'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student').enrollStudentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/student').enrollStudentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/enroll_student_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/enroll_student_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.check_document': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/check-document'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/student').checkDocumentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/check_document_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/check_document_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.check_email': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/check-email'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/student').checkEmailValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/check_email_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/check_email_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.lookup_responsible': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/lookup-responsible'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/student').lookupResponsibleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/lookup_responsible_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/lookup_responsible_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.me.avatar.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/me/avatar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_avatars/show_student_avatar_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_avatars/show_student_avatar_controller').default['handle']>>>
    }
  }
  'api.v1.students.me.avatar.update': {
    methods: ["PUT"]
    pattern: '/api/v1/students/me/avatar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_avatars/update_student_avatar_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_avatars/update_student_avatar_controller').default['handle']>>>
    }
  }
  'api.v1.students.me.avatar.purchase': {
    methods: ["POST"]
    pattern: '/api/v1/students/me/avatar/purchase'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_avatars/purchase_avatar_item_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_avatars/purchase_avatar_item_controller').default['handle']>>>
    }
  }
  'api.v1.students.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/show').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/show').default['handle']>>>
    }
  }
  'api.v1.students.update': {
    methods: ["PUT"]
    pattern: '/api/v1/students/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student').updateStudentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/student').updateStudentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/update').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/update').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.full_update': {
    methods: ["PUT"]
    pattern: '/api/v1/students/:id/full'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student').fullUpdateStudentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/student').fullUpdateStudentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/full_update_student_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/full_update_student_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/students/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/destroy').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/destroy').default['handle']>>>
    }
  }
  'api.v1.students.enrollments.list': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/:id/enrollments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/list_enrollments_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/list_enrollments_controller').default['handle']>>>
    }
  }
  'api.v1.students.enrollments.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/students/:id/enrollments/:enrollmentId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student_enrollment').updateEnrollmentValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; enrollmentId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/student_enrollment').updateEnrollmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/update_enrollment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/update_enrollment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.enrollments.cancel': {
    methods: ["DELETE"]
    pattern: '/api/v1/students/:id/enrollments/:enrollmentId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; enrollmentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/cancel_enrollment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/cancel_enrollment_controller').default['handle']>>>
    }
  }
  'api.v1.students.attendance': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/:studentId/attendance'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendance/get_student_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendance/get_student_attendance_controller').default['handle']>>>
    }
  }
  'api.v1.students.payments': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/:studentId/payments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_payments/list_student_payments_by_student_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_payments/list_student_payments_by_student_controller').default['handle']>>>
    }
  }
  'api.v1.students.balance': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/:studentId/balance'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/get_student_balance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/get_student_balance_controller').default['handle']>>>
    }
  }
  'api.v1.students.balance_transactions': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/:studentId/balance-transactions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/list_student_balance_by_student_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/list_student_balance_by_student_controller').default['handle']>>>
    }
  }
  'api.v1.responsibles.list_by_student': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsibles/students/:studentId/responsibles'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsibles/list_student_responsibles_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsibles/list_student_responsibles_controller').default['handle']>>>
    }
  }
  'api.v1.responsibles.assign': {
    methods: ["POST"]
    pattern: '/api/v1/responsibles'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/responsible').assignResponsibleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/responsible').assignResponsibleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsibles/assign_responsible_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsibles/assign_responsible_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.responsibles.update_assignment': {
    methods: ["PATCH"]
    pattern: '/api/v1/responsibles/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/responsible').updateResponsibleAssignmentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/responsible').updateResponsibleAssignmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsibles/update_responsible_assignment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsibles/update_responsible_assignment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.responsibles.remove': {
    methods: ["DELETE"]
    pattern: '/api/v1/responsibles/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsibles/remove_responsible_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsibles/remove_responsible_controller').default['handle']>>>
    }
  }
  'api.v1.responsible_addresses.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/responsible-addresses/:responsibleId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { responsibleId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsible-addresses/show_responsible_address_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsible-addresses/show_responsible_address_controller').default['handle']>>>
    }
  }
  'api.v1.responsible_addresses.create': {
    methods: ["POST"]
    pattern: '/api/v1/responsible-addresses'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/responsible').createResponsibleAddressValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/responsible').createResponsibleAddressValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/responsible-addresses/create_responsible_address_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/responsible-addresses/create_responsible_address_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.contracts.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/contracts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/contract').listContractsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/list_contracts_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/list_contracts_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.contracts.store': {
    methods: ["POST"]
    pattern: '/api/v1/contracts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contract').createContractValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/contract').createContractValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/create_contract_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/create_contract_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.contracts.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/contracts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/show_contract_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/show_contract_controller').default['handle']>>>
    }
  }
  'api.v1.contracts.update': {
    methods: ["PUT"]
    pattern: '/api/v1/contracts/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contract').updateContractValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/contract').updateContractValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/update_contract_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/update_contract_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.contracts.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/contracts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/delete_contract_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/delete_contract_controller').default['handle']>>>
    }
  }
  'api.v1.contracts.get_signature_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/contracts/:contractId/signature-stats'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/get_signature_stats_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/get_signature_stats_controller').default['handle']>>>
    }
  }
  'api.v1.contracts.get_docuseal_template': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/contracts/:contractId/docuseal-template'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/get_docuseal_template_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/get_docuseal_template_controller').default['handle']>>>
    }
  }
  'api.v1.contracts.upload_docuseal_template': {
    methods: ["POST"]
    pattern: '/api/v1/contracts/:contractId/docuseal-template'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contract_docuseal').uploadContractDocusealTemplateValidator)>>
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/contract_docuseal').uploadContractDocusealTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/upload_docuseal_template_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/upload_docuseal_template_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.contracts.delete_docuseal_template': {
    methods: ["DELETE"]
    pattern: '/api/v1/contracts/:contractId/docuseal-template'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/delete_docuseal_template_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/delete_docuseal_template_controller').default['handle']>>>
    }
  }
  'api.v1.contracts.payment_days.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/contracts/:contractId/payment-days'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/list_contract_payment_days_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/list_contract_payment_days_controller').default['handle']>>>
    }
  }
  'api.v1.contracts.payment_days.store': {
    methods: ["POST"]
    pattern: '/api/v1/contracts/:contractId/payment-days'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contract').createContractPaymentDayValidator)>>
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/contract').createContractPaymentDayValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/add_contract_payment_day_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/add_contract_payment_day_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.contracts.payment_days.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/contracts/:contractId/payment-days/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { contractId: ParamValue; id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/remove_contract_payment_day_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/remove_contract_payment_day_controller').default['handle']>>>
    }
  }
  'api.v1.contracts.interest_config.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/contracts/:contractId/interest-config'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/show_contract_interest_config_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/show_contract_interest_config_controller').default['handle']>>>
    }
  }
  'api.v1.contracts.interest_config.update': {
    methods: ["PUT"]
    pattern: '/api/v1/contracts/:contractId/interest-config'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contract').updateContractInterestConfigValidator)>>
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/contract').updateContractInterestConfigValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/update_contract_interest_config_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/update_contract_interest_config_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.contracts.early_discounts.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/contracts/:contractId/early-discounts'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/list_contract_early_discounts_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/list_contract_early_discounts_controller').default['handle']>>>
    }
  }
  'api.v1.contracts.early_discounts.store': {
    methods: ["POST"]
    pattern: '/api/v1/contracts/:contractId/early-discounts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contract').createContractEarlyDiscountValidator)>>
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/contract').createContractEarlyDiscountValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/add_contract_early_discount_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/add_contract_early_discount_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.contracts.early_discounts.update': {
    methods: ["PUT"]
    pattern: '/api/v1/contracts/:contractId/early-discounts/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contract').updateContractEarlyDiscountValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { contractId: ParamValue; id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/contract').updateContractEarlyDiscountValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/update_contract_early_discount_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/update_contract_early_discount_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.contracts.early_discounts.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/contracts/:contractId/early-discounts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { contractId: ParamValue; id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contracts/remove_contract_early_discount_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contracts/remove_contract_early_discount_controller').default['handle']>>>
    }
  }
  'api.v1.contract_documents.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/contract-documents'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/contract').listContractDocumentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contract-documents/list_contract_documents_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contract-documents/list_contract_documents_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.contract_documents.store': {
    methods: ["POST"]
    pattern: '/api/v1/contract-documents'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contract').createContractDocumentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/contract').createContractDocumentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contract-documents/create_contract_document_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contract-documents/create_contract_document_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.courses.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/courses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/course').listCoursesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/courses/list_courses_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/courses/list_courses_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.courses.store': {
    methods: ["POST"]
    pattern: '/api/v1/courses'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/course').createCourseValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/course').createCourseValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/courses/create_course_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/courses/create_course_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.courses.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/courses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/courses/show_course_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/courses/show_course_controller').default['handle']>>>
    }
  }
  'api.v1.courses.update': {
    methods: ["PUT"]
    pattern: '/api/v1/courses/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/course').updateCourseValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/course').updateCourseValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/courses/update_course_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/courses/update_course_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.courses.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/courses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/courses/delete_course_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/courses/delete_course_controller').default['handle']>>>
    }
  }
  'api.v1.courses.dashboard.metrics': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/courses/:courseId/academic-periods/:academicPeriodId/dashboard/metrics'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/courses/get_course_dashboard_metrics_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/courses/get_course_dashboard_metrics_controller').default['handle']>>>
    }
  }
  'api.v1.courses.dashboard.alerts': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/courses/:courseId/academic-periods/:academicPeriodId/dashboard/alerts'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/courses/get_course_alerts_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/courses/get_course_alerts_controller').default['handle']>>>
    }
  }
  'api.v1.courses.dashboard.activity_feed': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/courses/:courseId/academic-periods/:academicPeriodId/dashboard/activity-feed'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/courses/get_course_activity_feed_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/courses/get_course_activity_feed_controller').default['handle']>>>
    }
  }
  'api.v1.courses.classes': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/courses/:courseId/academic-periods/:academicPeriodId/classes'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/courses/get_course_classes_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/courses/get_course_classes_controller').default['handle']>>>
    }
  }
  'api.v1.levels.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/levels'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/levels/list_levels_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/levels/list_levels_controller').default['handle']>>>
    }
  }
  'api.v1.levels.store': {
    methods: ["POST"]
    pattern: '/api/v1/levels'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/level').createLevelValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/level').createLevelValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/levels/create_level_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/levels/create_level_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.levels.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/levels/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/levels/show_level_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/levels/show_level_controller').default['handle']>>>
    }
  }
  'api.v1.levels.update': {
    methods: ["PUT"]
    pattern: '/api/v1/levels/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/level').updateLevelValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/level').updateLevelValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/levels/update_level_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/levels/update_level_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.levels.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/levels/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/levels/delete_level_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/levels/delete_level_controller').default['handle']>>>
    }
  }
  'api.v1.course_has_academic_periods.store': {
    methods: ["POST"]
    pattern: '/api/v1/course-has-academic-periods'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/course_has_academic_period').createCourseHasAcademicPeriodValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/course_has_academic_period').createCourseHasAcademicPeriodValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/course_has_academic_periods/create_course_has_academic_period_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/course_has_academic_periods/create_course_has_academic_period_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.level_assignments.store': {
    methods: ["POST"]
    pattern: '/api/v1/level-assignments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/level_assignment').createLevelAssignmentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/level_assignment').createLevelAssignmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/level_assignments/create_level_assignment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/level_assignments/create_level_assignment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.classes.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/classes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/class').listClassesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/list_classes_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/list_classes_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.classes.store': {
    methods: ["POST"]
    pattern: '/api/v1/classes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/class').createClassValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/class').createClassValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/create_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/create_class_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.classes.store_with_teachers': {
    methods: ["POST"]
    pattern: '/api/v1/classes/with-teachers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/class').createClassWithTeachersValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/class').createClassWithTeachersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/create_class_with_teachers_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/create_class_with_teachers_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.classes.show_by_slug': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/classes/slug/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/show_class_by_slug_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/show_class_by_slug_controller').default['handle']>>>
    }
  }
  'api.v1.classes.sidebar': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/classes/sidebar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/get_classes_for_sidebar_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/get_classes_for_sidebar_controller').default['handle']>>>
    }
  }
  'api.v1.classes.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/classes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/show_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/show_class_controller').default['handle']>>>
    }
  }
  'api.v1.classes.update': {
    methods: ["PUT"]
    pattern: '/api/v1/classes/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/class').updateClassValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/class').updateClassValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/update_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/update_class_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.classes.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/classes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/delete_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/delete_class_controller').default['handle']>>>
    }
  }
  'api.v1.classes.update_with_teachers': {
    methods: ["PUT"]
    pattern: '/api/v1/classes/:id/teachers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/class').updateClassWithTeachersValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/class').updateClassWithTeachersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/update_class_with_teachers_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/update_class_with_teachers_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.classes.students': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/classes/:id/students'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/class').listClassStudentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/list_class_students_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/list_class_students_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.classes.students_count': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/classes/:id/students/count'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/classes/count_class_students_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/classes/count_class_students_controller').default['handle']>>>
    }
  }
  'api.v1.classes.student_status': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/classes/:id/student-status'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/student_status').getStudentStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/get_student_status_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/get_student_status_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.classes.subjects': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/classes/:classId/subjects'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subjects/list_subjects_for_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subjects/list_subjects_for_class_controller').default['handle']>>>
    }
  }
  'api.v1.subjects.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/subjects'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/subject').listSubjectsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subjects/list_subjects_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subjects/list_subjects_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subjects.store': {
    methods: ["POST"]
    pattern: '/api/v1/subjects'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subject').createSubjectValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/subject').createSubjectValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subjects/create_subject_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subjects/create_subject_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subjects.show_by_slug': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/subjects/slug/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subjects/show_subject_by_slug_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subjects/show_subject_by_slug_controller').default['handle']>>>
    }
  }
  'api.v1.subjects.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/subjects/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subjects/show_subject_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subjects/show_subject_controller').default['handle']>>>
    }
  }
  'api.v1.subjects.update': {
    methods: ["PUT"]
    pattern: '/api/v1/subjects/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subject').updateSubjectValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/subject').updateSubjectValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subjects/update_subject_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subjects/update_subject_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subjects.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/subjects/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subjects/delete_subject_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subjects/delete_subject_controller').default['handle']>>>
    }
  }
  'api.v1.schedules.get_class_schedule': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/schedules/class/:classId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/schedules').getClassScheduleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schedules/get_class_schedule_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schedules/get_class_schedule_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.schedules.save_class_schedule': {
    methods: ["POST"]
    pattern: '/api/v1/schedules/class/:classId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/schedules').saveClassScheduleValidator)>>
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/schedules').saveClassScheduleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schedules/save_class_schedule_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schedules/save_class_schedule_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.schedules.generate_class_schedule': {
    methods: ["POST"]
    pattern: '/api/v1/schedules/class/:classId/generate'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/schedules').generateClassScheduleValidator)>>
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/schedules').generateClassScheduleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schedules/generate_class_schedule_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schedules/generate_class_schedule_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.schedules.validate_conflict': {
    methods: ["POST"]
    pattern: '/api/v1/schedules/validate-conflict'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/schedules').validateTeacherScheduleConflictValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/schedules').validateTeacherScheduleConflictValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/schedules/validate_teacher_schedule_conflict_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/schedules/validate_teacher_schedule_conflict_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.teachers.list_teachers': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/teachers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/teacher').listTeachersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/list_teachers_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/list_teachers_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.teachers.create_teacher': {
    methods: ["POST"]
    pattern: '/api/v1/teachers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/create_teacher_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/create_teacher_controller').default['handle']>>>
    }
  }
  'api.v1.teachers.get_teachers_timesheet': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/teachers/timesheet'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/teacher_timesheet').getTeachersTimesheetValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/get_teachers_timesheet_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/get_teachers_timesheet_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.teachers.get_teacher_absences': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/teachers/absences'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/teacher_timesheet').getTeacherAbsencesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/get_teacher_absences_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/get_teacher_absences_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.teachers.approve_absence': {
    methods: ["PATCH"]
    pattern: '/api/v1/teachers/absences/approve'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/teacher_timesheet').approveAbsenceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/teacher_timesheet').approveAbsenceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/approve_absence_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/approve_absence_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.teachers.reject_absence': {
    methods: ["PATCH"]
    pattern: '/api/v1/teachers/absences/reject'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/teacher_timesheet').rejectAbsenceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/teacher_timesheet').rejectAbsenceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/reject_absence_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/reject_absence_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.teachers.show_teacher': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/teachers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/show_teacher_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/show_teacher_controller').default['handle']>>>
    }
  }
  'api.v1.teachers.update_teacher': {
    methods: ["PUT"]
    pattern: '/api/v1/teachers/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/teacher').updateTeacherValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/teacher').updateTeacherValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/update_teacher_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/update_teacher_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.teachers.delete_teacher': {
    methods: ["DELETE"]
    pattern: '/api/v1/teachers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/delete_teacher_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/delete_teacher_controller').default['handle']>>>
    }
  }
  'api.v1.teachers.list_teacher_classes': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/teachers/:id/classes'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/list_teacher_classes_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/list_teacher_classes_controller').default['handle']>>>
    }
  }
  'api.v1.teachers.list_teacher_subjects': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/teachers/:id/subjects'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/list_teacher_subjects_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/list_teacher_subjects_controller').default['handle']>>>
    }
  }
  'api.v1.teachers.update_teacher_subjects': {
    methods: ["PUT"]
    pattern: '/api/v1/teachers/:id/subjects'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/teacher').updateTeacherSubjectsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/teacher').updateTeacherSubjectsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/update_teacher_subjects_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/update_teacher_subjects_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.teachers.assign_class': {
    methods: ["POST"]
    pattern: '/api/v1/teachers/:id/classes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/teacher').assignTeacherToClassValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/teacher').assignTeacherToClassValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/assign_teacher_to_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/assign_teacher_to_class_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.teachers.remove_class': {
    methods: ["DELETE"]
    pattern: '/api/v1/teachers/:id/classes/:classId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; classId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/teachers/remove_teacher_from_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/teachers/remove_teacher_from_class_controller').default['handle']>>>
    }
  }
  'api.v1.exams.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/exams'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/exams/list_exams_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/exams/list_exams_controller').default['handle']>>>
    }
  }
  'api.v1.exams.store': {
    methods: ["POST"]
    pattern: '/api/v1/exams'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/exam').createExamValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/exam').createExamValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/exams/create_exam_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/exams/create_exam_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.exams.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/exams/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/exams/show_exam_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/exams/show_exam_controller').default['handle']>>>
    }
  }
  'api.v1.exams.history': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/exams/:id/history'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/exams/list_exam_history_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/exams/list_exam_history_controller').default['handle']>>>
    }
  }
  'api.v1.exams.update': {
    methods: ["PUT"]
    pattern: '/api/v1/exams/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/exam').updateExamValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/exam').updateExamValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/exams/update_exam_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/exams/update_exam_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.exams.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/exams/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/exams/delete_exam_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/exams/delete_exam_controller').default['handle']>>>
    }
  }
  'api.v1.exams.batch_save_grades': {
    methods: ["POST"]
    pattern: '/api/v1/exams/:id/grades/batch'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/exam').batchSaveExamGradesValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/exam').batchSaveExamGradesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/exams/batch_save_exam_grades_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/exams/batch_save_exam_grades_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.exams.grades': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/exams/:id/grades'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/exams/list_exam_grades_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/exams/list_exam_grades_controller').default['handle']>>>
    }
  }
  'api.v1.exams.grades.store': {
    methods: ["POST"]
    pattern: '/api/v1/exams/:id/grades'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/exam').saveExamGradeValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/exam').saveExamGradeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/exams/save_exam_grade_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/exams/save_exam_grade_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.exams.update_grade': {
    methods: ["PUT"]
    pattern: '/api/v1/exams/:id/grades/:gradeId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/exam').saveExamGradeValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; gradeId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/exam').saveExamGradeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/exams/update_exam_grade_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/exams/update_exam_grade_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.grades.academic_overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/grades/academic-overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/grades').getAcademicOverviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/grades/get_academic_overview_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/grades/get_academic_overview_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.grades.students': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/grades/students'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/grades').getStudentsGradesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/grades/get_students_grades_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/grades/get_students_grades_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.grades.distribution': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/grades/distribution'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/grades').getGradeDistributionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/grades/get_grade_distribution_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/grades/get_grade_distribution_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.grades.at_risk': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/grades/at-risk'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/grades').getAtRiskStudentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/grades/get_at_risk_students_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/grades/get_at_risk_students_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.grades.trends': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/grades/trends'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/grades').getGradeTrendsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/grades/get_grade_trends_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/grades/get_grade_trends_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.grades.class_subject': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/grades/class/:classId/subject/:subjectId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { classId: ParamValue; subjectId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/grades').getClassGradesBySubjectValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/grades/get_class_grades_by_subject_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/grades/get_class_grades_by_subject_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.grades.batch_save': {
    methods: ["POST"]
    pattern: '/api/v1/grades/batch'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/grades').batchSaveGradesValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/grades').batchSaveGradesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/grades/batch_save_grades_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/grades/batch_save_grades_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.attendance.overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/attendance/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getAttendanceOverviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_attendance_overview_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_attendance_overview_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.attendance.trends': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/attendance/trends'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getAttendanceTrendsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_attendance_trends_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_attendance_trends_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.attendance.chronic': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/attendance/chronic'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getChronicAbsenteeismValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_chronic_absenteeism_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_chronic_absenteeism_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.canteen.overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/canteen/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getCanteenOverviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_canteen_overview_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_canteen_overview_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.canteen.trends': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/canteen/trends'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getCanteenTrendsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_canteen_trends_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_canteen_trends_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.canteen.top_items': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/canteen/top-items'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getCanteenTopItemsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_canteen_top_items_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_canteen_top_items_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.payments.overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/payments/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getPaymentsOverviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_payments_overview_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_payments_overview_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.enrollments.overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/enrollments/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getEnrollmentsOverviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_enrollments_overview_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_enrollments_overview_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.enrollments.funnel': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/enrollments/funnel'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getFunnelStatsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_enrollment_funnel_stats_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_enrollment_funnel_stats_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.enrollments.trends': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/enrollments/trends'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getTrendsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_enrollment_trends_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_enrollment_trends_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.enrollments.by_level': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/enrollments/by-level'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getByLevelValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_enrollment_by_level_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_enrollment_by_level_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.incidents.overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/incidents/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getIncidentsOverviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_incidents_overview_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_incidents_overview_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.gamification.overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/gamification/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getGamificationOverviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_gamification_overview_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_gamification_overview_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.hr.overview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/hr/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/analytics').getHrOverviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_hr_overview_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_hr_overview_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.analytics.class_performance': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/class-performance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/analytics/get_class_performance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/analytics/get_class_performance_controller').default['handle']>>>
    }
  }
  'api.v1.events.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/event').listEventsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events/list_events_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events/list_events_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.events.store': {
    methods: ["POST"]
    pattern: '/api/v1/events'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/event').createEventValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/event').createEventValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events/create_event_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events/create_event_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.events.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/events/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events/show_event_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events/show_event_controller').default['handle']>>>
    }
  }
  'api.v1.events.update': {
    methods: ["PUT"]
    pattern: '/api/v1/events/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/event').updateEventValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/event').updateEventValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events/update_event_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events/update_event_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.events.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/events/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events/delete_event_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events/delete_event_controller').default['handle']>>>
    }
  }
  'api.v1.events.publish': {
    methods: ["POST"]
    pattern: '/api/v1/events/:id/publish'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events/publish_event_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events/publish_event_controller').default['handle']>>>
    }
  }
  'api.v1.events.cancel': {
    methods: ["POST"]
    pattern: '/api/v1/events/:id/cancel'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events/cancel_event_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events/cancel_event_controller').default['handle']>>>
    }
  }
  'api.v1.events.complete': {
    methods: ["POST"]
    pattern: '/api/v1/events/:id/complete'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events/complete_event_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events/complete_event_controller').default['handle']>>>
    }
  }
  'api.v1.events.participants.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/events/:eventId/participants'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/event').listParticipantsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/event_participants/list_event_participants_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/event_participants/list_event_participants_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.events.participants.register': {
    methods: ["POST"]
    pattern: '/api/v1/events/:eventId/participants'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/event').registerParticipantValidator)>>
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/event').registerParticipantValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/event_participants/register_participant_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/event_participants/register_participant_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.events.participants.update_status': {
    methods: ["PATCH"]
    pattern: '/api/v1/events/:eventId/participants/:participantId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/event').updateParticipantStatusValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; participantId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/event').updateParticipantStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/event_participants/update_participant_status_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/event_participants/update_participant_status_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.events.participants.cancel': {
    methods: ["DELETE"]
    pattern: '/api/v1/events/:eventId/participants/:participantId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; participantId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/event_participants/cancel_registration_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/event_participants/cancel_registration_controller').default['handle']>>>
    }
  }
  'api.v1.events.participants.confirm_attendance': {
    methods: ["POST"]
    pattern: '/api/v1/events/:eventId/participants/:participantId/confirm'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; participantId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/event_participants/confirm_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/event_participants/confirm_attendance_controller').default['handle']>>>
    }
  }
  'api.v1.consents.pending': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/parental-consents/pending'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/parental_consents/list_pending_consents_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/parental_consents/list_pending_consents_controller').default['handle']>>>
    }
  }
  'api.v1.consents.history': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/parental-consents/history'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/consent').listConsentHistoryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/parental_consents/list_consent_history_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/parental_consents/list_consent_history_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.events.consents.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/parental-consents/events/:eventId/consents'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/consent').listEventConsentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/parental_consents/list_event_consents_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/parental_consents/list_event_consents_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.events.consents.request': {
    methods: ["POST"]
    pattern: '/api/v1/parental-consents/request'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/consent').requestConsentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/consent').requestConsentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/parental_consents/request_consent_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/parental_consents/request_consent_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.consents.respond': {
    methods: ["POST"]
    pattern: '/api/v1/parental-consents/:id/respond'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/consent').respondConsentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/consent').respondConsentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/parental_consents/respond_consent_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/parental_consents/respond_consent_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.enrollment.info': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/online-enrollment/:schoolSlug/:academicPeriodSlug/:courseSlug/info'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { schoolSlug: ParamValue; academicPeriodSlug: ParamValue; courseSlug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/online-enrollment/get_school_enrollment_info_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/online-enrollment/get_school_enrollment_info_controller').default['handle']>>>
    }
  }
  'api.v1.enrollment.check_existing': {
    methods: ["POST"]
    pattern: '/api/v1/online-enrollment/check-existing'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/online_enrollment').checkExistingValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/online_enrollment').checkExistingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/online-enrollment/check_existing_student_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/online-enrollment/check_existing_student_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.enrollment.find_scholarship': {
    methods: ["POST"]
    pattern: '/api/v1/online-enrollment/find-scholarship'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/online_enrollment').findScholarshipValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/online_enrollment').findScholarshipValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/online-enrollment/find_scholarship_by_code_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/online-enrollment/find_scholarship_by_code_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.enrollment.finish': {
    methods: ["POST"]
    pattern: '/api/v1/online-enrollment/finish'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/enrollment').finishEnrollmentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/enrollment').finishEnrollmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/online-enrollment/finish_enrollment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/online-enrollment/finish_enrollment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.enrollments.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/enrollments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/enrollment').listEnrollmentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/enrollments/list_enrollments_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/enrollments/list_enrollments_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.enrollments.documents.update_status': {
    methods: ["PATCH"]
    pattern: '/api/v1/enrollments/documents/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/enrollment').updateDocumentStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/enrollment').updateDocumentStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/enrollments/update_document_status_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/enrollments/update_document_status_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.notifications.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/notification').listNotificationsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications/list_notifications_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications/list_notifications_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.notifications.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/notifications/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications/show_notification_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications/show_notification_controller').default['handle']>>>
    }
  }
  'api.v1.notifications.mark_read': {
    methods: ["POST"]
    pattern: '/api/v1/notifications/:id/read'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications/mark_notification_read_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications/mark_notification_read_controller').default['handle']>>>
    }
  }
  'api.v1.notifications.mark_all_read': {
    methods: ["POST"]
    pattern: '/api/v1/notifications/read-all'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications/mark_all_read_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications/mark_all_read_controller').default['handle']>>>
    }
  }
  'api.v1.notifications.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/notifications/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications/delete_notification_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications/delete_notification_controller').default['handle']>>>
    }
  }
  'api.v1.notification_preferences.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/notification-preferences'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notification_preferences/show_notification_preferences_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notification_preferences/show_notification_preferences_controller').default['handle']>>>
    }
  }
  'api.v1.notification_preferences.update': {
    methods: ["PUT"]
    pattern: '/api/v1/notification-preferences'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/notification').updateNotificationPreferencesValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/notification').updateNotificationPreferencesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notification_preferences/update_notification_preferences_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notification_preferences/update_notification_preferences_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_announcements.list': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-announcements'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/school_announcement').listSchoolAnnouncementsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_announcements/list_school_announcements_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_announcements/list_school_announcements_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_announcements.create': {
    methods: ["POST"]
    pattern: '/api/v1/school-announcements'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school_announcement').createSchoolAnnouncementValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/school_announcement').createSchoolAnnouncementValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_announcements/create_school_announcement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_announcements/create_school_announcement_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_announcements.details': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-announcements/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_announcements/show_school_announcement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_announcements/show_school_announcement_controller').default['handle']>>>
    }
  }
  'api.v1.school_announcements.edit_draft': {
    methods: ["PUT"]
    pattern: '/api/v1/school-announcements/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school_announcement').updateSchoolAnnouncementValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/school_announcement').updateSchoolAnnouncementValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_announcements/update_school_announcement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_announcements/update_school_announcement_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_announcements.publish_draft': {
    methods: ["POST"]
    pattern: '/api/v1/school-announcements/:id/publish'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_announcements/publish_school_announcement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_announcements/publish_school_announcement_controller').default['handle']>>>
    }
  }
  'api.v1.posts.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/posts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/post').listPostsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/posts/list_posts_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/posts/list_posts_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.posts.store': {
    methods: ["POST"]
    pattern: '/api/v1/posts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/post').createPostValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/post').createPostValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/posts/create_post_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/posts/create_post_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.posts.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/posts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/posts/show_post_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/posts/show_post_controller').default['handle']>>>
    }
  }
  'api.v1.posts.update': {
    methods: ["PUT"]
    pattern: '/api/v1/posts/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/post').updatePostValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/post').updatePostValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/posts/update_post_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/posts/update_post_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.posts.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/posts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/posts/delete_post_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/posts/delete_post_controller').default['handle']>>>
    }
  }
  'api.v1.posts.like': {
    methods: ["POST"]
    pattern: '/api/v1/posts/:id/like'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/posts/like_post_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/posts/like_post_controller').default['handle']>>>
    }
  }
  'api.v1.posts.unlike': {
    methods: ["POST"]
    pattern: '/api/v1/posts/:id/unlike'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/posts/unlike_post_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/posts/unlike_post_controller').default['handle']>>>
    }
  }
  'api.v1.posts.comments.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/posts/:postId/comments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { postId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/post').listCommentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/comments/list_post_comments_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/comments/list_post_comments_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.posts.comments.store': {
    methods: ["POST"]
    pattern: '/api/v1/posts/:postId/comments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/post').createCommentValidator)>>
      paramsTuple: [ParamValue]
      params: { postId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/post').createCommentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/comments/create_comment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/comments/create_comment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.comments.update': {
    methods: ["PUT"]
    pattern: '/api/v1/comments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/post').updateCommentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/post').updateCommentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/comments/update_comment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/comments/update_comment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.comments.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/comments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/comments/delete_comment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/comments/delete_comment_controller').default['handle']>>>
    }
  }
  'api.v1.comments.like': {
    methods: ["POST"]
    pattern: '/api/v1/comments/:id/like'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/comments/like_comment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/comments/like_comment_controller').default['handle']>>>
    }
  }
  'api.v1.extra_classes.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/extra-classes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/extra_class').listExtraClassesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/list_extra_classes_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/list_extra_classes_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.extra_classes.store': {
    methods: ["POST"]
    pattern: '/api/v1/extra-classes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/extra_class').createExtraClassValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/extra_class').createExtraClassValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/create_extra_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/create_extra_class_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.extra_classes.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/extra-classes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/show_extra_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/show_extra_class_controller').default['handle']>>>
    }
  }
  'api.v1.extra_classes.update': {
    methods: ["PUT"]
    pattern: '/api/v1/extra-classes/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/extra_class').updateExtraClassValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/extra_class').updateExtraClassValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/update_extra_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/update_extra_class_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.extra_classes.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/extra-classes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/delete_extra_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/delete_extra_class_controller').default['handle']>>>
    }
  }
  'api.v1.extra_classes.enroll': {
    methods: ["POST"]
    pattern: '/api/v1/extra-classes/:id/enroll'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/extra_class').enrollExtraClassValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/extra_class').enrollExtraClassValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/enroll_extra_class_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/enroll_extra_class_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.extra_classes.enroll.cancel': {
    methods: ["POST"]
    pattern: '/api/v1/extra-classes/:id/enroll/:enrollmentId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; enrollmentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/cancel_extra_class_enrollment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/cancel_extra_class_enrollment_controller').default['handle']>>>
    }
  }
  'api.v1.extra_classes.students': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/extra-classes/:id/students'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/list_extra_class_students_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/list_extra_class_students_controller').default['handle']>>>
    }
  }
  'api.v1.extra_classes.attendance.store': {
    methods: ["POST"]
    pattern: '/api/v1/extra-classes/:id/attendance'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/extra_class').createExtraClassAttendanceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/extra_class').createExtraClassAttendanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/create_extra_class_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/create_extra_class_attendance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.extra_classes.attendance.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/extra-classes/:id/attendance'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/list_extra_class_attendances_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/list_extra_class_attendances_controller').default['handle']>>>
    }
  }
  'api.v1.extra_classes.attendance.update': {
    methods: ["PUT"]
    pattern: '/api/v1/extra-classes/:id/attendance/:attendanceId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/extra_class').updateExtraClassAttendanceValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; attendanceId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/extra_class').updateExtraClassAttendanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/update_extra_class_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/update_extra_class_attendance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.extra_classes.attendance.summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/extra-classes/:id/attendance/summary'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extra_classes/get_extra_class_attendance_summary_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extra_classes/get_extra_class_attendance_summary_controller').default['handle']>>>
    }
  }
  'api.v1.attendance.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/attendance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/attendance').listAttendanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendance/list_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendance/list_attendance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.attendance.store': {
    methods: ["POST"]
    pattern: '/api/v1/attendance'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/attendance').createAttendanceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/attendance').createAttendanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendance/create_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendance/create_attendance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.attendance.batch': {
    methods: ["POST"]
    pattern: '/api/v1/attendance/batch'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/attendance').batchCreateAttendanceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/attendance').batchCreateAttendanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendance/batch_create_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendance/batch_create_attendance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.attendance.available_dates': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/attendance/available-dates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendance/get_attendance_available_dates_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendance/get_attendance_available_dates_controller').default['handle']>>>
    }
  }
  'api.v1.attendance.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/attendance/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendance/show_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendance/show_attendance_controller').default['handle']>>>
    }
  }
  'api.v1.attendance.update': {
    methods: ["PUT"]
    pattern: '/api/v1/attendance/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/attendance').updateAttendanceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/attendance').updateAttendanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendance/update_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendance/update_attendance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.attendance.class_students': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/attendance/class/:classId/students'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/attendance').getClassStudentsAttendanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attendance/get_class_students_attendance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attendance/get_class_students_attendance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.assignments.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/assignments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments/list_assignments_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments/list_assignments_controller').default['handle']>>>
    }
  }
  'api.v1.assignments.store': {
    methods: ["POST"]
    pattern: '/api/v1/assignments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/assignment').createAssignmentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/assignment').createAssignmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments/create_assignment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments/create_assignment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.assignments.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/assignments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments/show_assignment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments/show_assignment_controller').default['handle']>>>
    }
  }
  'api.v1.assignments.history': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/assignments/:id/history'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments/list_assignment_history_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments/list_assignment_history_controller').default['handle']>>>
    }
  }
  'api.v1.assignments.update': {
    methods: ["PUT"]
    pattern: '/api/v1/assignments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/assignment').updateAssignmentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/assignment').updateAssignmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments/update_assignment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments/update_assignment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.assignments.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/assignments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments/delete_assignment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments/delete_assignment_controller').default['handle']>>>
    }
  }
  'api.v1.assignments.submissions': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/assignments/:id/submissions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments/list_assignment_submissions_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments/list_assignment_submissions_controller').default['handle']>>>
    }
  }
  'api.v1.assignments.submit': {
    methods: ["POST"]
    pattern: '/api/v1/assignments/:id/submissions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/assignment').submitAssignmentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/assignment').submitAssignmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments/submit_assignment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments/submit_assignment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.assignments.submissions.grade': {
    methods: ["POST"]
    pattern: '/api/v1/assignments/:id/submissions/:submissionId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/assignment').gradeSubmissionValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; submissionId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/assignment').gradeSubmissionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/assignments/grade_submission_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/assignments/grade_submission_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.occurrences.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/occurrences'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/occurrence').listOccurrencesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/occurrences/list_occurrences_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/occurrences/list_occurrences_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.occurrences.store': {
    methods: ["POST"]
    pattern: '/api/v1/occurrences'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/occurrence').createOccurrenceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/occurrence').createOccurrenceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/occurrences/create_occurrence_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/occurrences/create_occurrence_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.occurrences.teacher_classes': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/occurrences/teacher-classes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/occurrences/list_occurrence_teacher_classes_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/occurrences/list_occurrence_teacher_classes_controller').default['handle']>>>
    }
  }
  'api.v1.occurrences.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/occurrences/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/occurrences/show_occurrence_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/occurrences/show_occurrence_controller').default['handle']>>>
    }
  }
  'api.v1.student_payments.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/student-payments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/student_payment').listStudentPaymentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_payments/list_student_payments_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_payments/list_student_payments_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_payments.store': {
    methods: ["POST"]
    pattern: '/api/v1/student-payments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student_payment').createStudentPaymentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/student_payment').createStudentPaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_payments/create_student_payment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_payments/create_student_payment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_payments.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/student-payments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_payments/show_student_payment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_payments/show_student_payment_controller').default['handle']>>>
    }
  }
  'api.v1.student_payments.update': {
    methods: ["PUT"]
    pattern: '/api/v1/student-payments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student_payment').updateStudentPaymentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/student_payment').updateStudentPaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_payments/update_student_payment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_payments/update_student_payment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_payments.cancel': {
    methods: ["POST"]
    pattern: '/api/v1/student-payments/:id/cancel'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student_payment').cancelStudentPaymentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/student_payment').cancelStudentPaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_payments/cancel_student_payment_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_payments/cancel_student_payment_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_payments.mark_paid': {
    methods: ["POST"]
    pattern: '/api/v1/student-payments/:id/mark-paid'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student_payment').markPaymentAsPaidValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/student_payment').markPaymentAsPaidValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_payments/mark_payment_as_paid_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_payments/mark_payment_as_paid_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_payments.asaas_charge': {
    methods: ["POST"]
    pattern: '/api/v1/student-payments/:id/asaas-charge'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/asaas').createAsaasChargeValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/asaas').createAsaasChargeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_payments/create_student_payment_asaas_charge_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_payments/create_student_payment_asaas_charge_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_payments.send_boleto': {
    methods: ["POST"]
    pattern: '/api/v1/student-payments/:id/send-boleto'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/asaas').sendAsaasBoletoEmailValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/asaas').sendAsaasBoletoEmailValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_payments/send_student_payment_boleto_email_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_payments/send_student_payment_boleto_email_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_payments.get_boleto': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/student-payments/:id/boleto'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_payments/get_student_payment_boleto_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_payments/get_student_payment_boleto_controller').default['handle']>>>
    }
  }
  'api.v1.agreements.store': {
    methods: ["POST"]
    pattern: '/api/v1/agreements'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/agreement').createAgreementValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/agreement').createAgreementValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/agreements/create_agreement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/agreements/create_agreement_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.invoices.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/invoices'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/invoice').listInvoicesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices/list_invoices_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices/list_invoices_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.invoices.mark_paid': {
    methods: ["POST"]
    pattern: '/api/v1/invoices/:id/mark-paid'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/invoice').markInvoicePaidValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/invoice').markInvoicePaidValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invoices/mark_invoice_paid_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invoices/mark_invoice_paid_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.audits.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/audits/:entityType/:entityId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { entityType: ParamValue; entityId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/audit').listAuditsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/audits/list_audits_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/audits/list_audits_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.audits.student_history': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/audits/students/:studentId/history'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/audits/list_student_audit_history_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/audits/list_student_audit_history_controller').default['handle']>>>
    }
  }
  'api.v1.student_balance_transactions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/student-balance-transactions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/student_balance_transaction').listStudentBalanceTransactionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/list_student_balance_transactions_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/list_student_balance_transactions_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_balance_transactions.store': {
    methods: ["POST"]
    pattern: '/api/v1/student-balance-transactions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student_balance_transaction').createStudentBalanceTransactionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/student_balance_transaction').createStudentBalanceTransactionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/create_student_balance_transaction_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/create_student_balance_transaction_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_balance_transactions.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/student-balance-transactions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/show_student_balance_transaction_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/show_student_balance_transaction_controller').default['handle']>>>
    }
  }
  'api.v1.student_balance_transactions.by_student': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/student-balance-transactions/:studentId/balance-transactions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/list_student_balance_by_student_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/list_student_balance_by_student_controller').default['handle']>>>
    }
  }
  'api.v1.student_balance_transactions.balance': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/student-balance-transactions/:studentId/balance'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/get_student_balance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_balance_transactions/get_student_balance_controller').default['handle']>>>
    }
  }
  'api.v1.canteens.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteens'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/canteen').listCanteensValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteens/list_canteens_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteens/list_canteens_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteens.store': {
    methods: ["POST"]
    pattern: '/api/v1/canteens'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').createCanteenValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').createCanteenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteens/create_canteen_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteens/create_canteen_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteens.meal_recurrences_by_schools': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteens/meal-recurrences-by-schools'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteens/list_meal_recurrences_by_schools_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteens/list_meal_recurrences_by_schools_controller').default['handle']>>>
    }
  }
  'api.v1.canteens.generate_recurrence_reservations': {
    methods: ["POST"]
    pattern: '/api/v1/canteens/generate-recurrence-reservations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteens/generate_recurrence_reservations_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteens/generate_recurrence_reservations_controller').default['handle']>>>
    }
  }
  'api.v1.canteens.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteens/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteens/show_canteen_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteens/show_canteen_controller').default['handle']>>>
    }
  }
  'api.v1.canteens.update': {
    methods: ["PUT"]
    pattern: '/api/v1/canteens/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').updateCanteenValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').updateCanteenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteens/update_canteen_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteens/update_canteen_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteens.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/canteens/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteens/delete_canteen_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteens/delete_canteen_controller').default['handle']>>>
    }
  }
  'api.v1.canteens.items': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteens/:canteenId/items'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { canteenId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_items/list_items_by_canteen_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_items/list_items_by_canteen_controller').default['handle']>>>
    }
  }
  'api.v1.canteens.financial_settings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteens/:canteenId/financial-settings'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { canteenId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_financial_settings/show_canteen_financial_settings_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_financial_settings/show_canteen_financial_settings_controller').default['handle']>>>
    }
  }
  'api.v1.canteens.meal_recurrences': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteens/:canteenId/meal-recurrences'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { canteenId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteens/list_canteen_meal_recurrences_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteens/list_canteen_meal_recurrences_controller').default['handle']>>>
    }
  }
  'api.v1.canteens.financial_settings.update': {
    methods: ["PUT"]
    pattern: '/api/v1/canteens/:canteenId/financial-settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').upsertCanteenFinancialSettingsValidator)>>
      paramsTuple: [ParamValue]
      params: { canteenId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').upsertCanteenFinancialSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_financial_settings/update_canteen_financial_settings_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_financial_settings/update_canteen_financial_settings_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_reports.summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-reports'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/canteen').getCanteenReportValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_reports/get_canteen_report_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_reports/get_canteen_report_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_monthly_transfers.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-monthly-transfers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/canteen').listCanteenMonthlyTransfersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_monthly_transfers/list_canteen_monthly_transfers_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_monthly_transfers/list_canteen_monthly_transfers_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_monthly_transfers.store': {
    methods: ["POST"]
    pattern: '/api/v1/canteen-monthly-transfers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').createCanteenMonthlyTransferValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').createCanteenMonthlyTransferValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_monthly_transfers/create_canteen_monthly_transfer_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_monthly_transfers/create_canteen_monthly_transfer_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_monthly_transfers.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-monthly-transfers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_monthly_transfers/show_canteen_monthly_transfer_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_monthly_transfers/show_canteen_monthly_transfer_controller').default['handle']>>>
    }
  }
  'api.v1.canteen_monthly_transfers.update_status': {
    methods: ["POST"]
    pattern: '/api/v1/canteen-monthly-transfers/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').updateCanteenMonthlyTransferStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').updateCanteenMonthlyTransferStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_monthly_transfers/update_canteen_monthly_transfer_status_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_monthly_transfers/update_canteen_monthly_transfer_status_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_items.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-items'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/canteen').listCanteenItemsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_items/list_canteen_items_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_items/list_canteen_items_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_items.store': {
    methods: ["POST"]
    pattern: '/api/v1/canteen-items'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').createCanteenItemValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').createCanteenItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_items/create_canteen_item_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_items/create_canteen_item_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_items.categories': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-items/categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_items/list_canteen_item_categories_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_items/list_canteen_item_categories_controller').default['handle']>>>
    }
  }
  'api.v1.canteen_items.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-items/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_items/show_canteen_item_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_items/show_canteen_item_controller').default['handle']>>>
    }
  }
  'api.v1.canteen_items.update': {
    methods: ["PUT"]
    pattern: '/api/v1/canteen-items/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').updateCanteenItemValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').updateCanteenItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_items/update_canteen_item_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_items/update_canteen_item_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_items.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/canteen-items/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_items/delete_canteen_item_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_items/delete_canteen_item_controller').default['handle']>>>
    }
  }
  'api.v1.canteen_items.toggle_active': {
    methods: ["PATCH"]
    pattern: '/api/v1/canteen-items/:id/toggle-active'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_items/toggle_canteen_item_active_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_items/toggle_canteen_item_active_controller').default['handle']>>>
    }
  }
  'api.v1.canteen_meals.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-meals'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/canteen').listCanteenMealsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meals/list_canteen_meals_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meals/list_canteen_meals_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_meals.store': {
    methods: ["POST"]
    pattern: '/api/v1/canteen-meals'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').createCanteenMealValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').createCanteenMealValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meals/create_canteen_meal_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meals/create_canteen_meal_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_meals.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-meals/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meals/show_canteen_meal_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meals/show_canteen_meal_controller').default['handle']>>>
    }
  }
  'api.v1.canteen_meals.update': {
    methods: ["PUT"]
    pattern: '/api/v1/canteen-meals/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').updateCanteenMealValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').updateCanteenMealValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meals/update_canteen_meal_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meals/update_canteen_meal_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_meals.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/canteen-meals/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meals/delete_canteen_meal_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meals/delete_canteen_meal_controller').default['handle']>>>
    }
  }
  'api.v1.canteen_meal_reservations.counts': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-meal-reservations/counts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/canteen').getMealReservationCountsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/get_meal_reservation_counts_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/get_meal_reservation_counts_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_meal_reservations.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-meal-reservations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/canteen').listCanteenMealReservationsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/list_canteen_meal_reservations_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/list_canteen_meal_reservations_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_meal_reservations.store': {
    methods: ["POST"]
    pattern: '/api/v1/canteen-meal-reservations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').createCanteenMealReservationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').createCanteenMealReservationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/create_canteen_meal_reservation_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/create_canteen_meal_reservation_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_meal_reservations.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-meal-reservations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/show_canteen_meal_reservation_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/show_canteen_meal_reservation_controller').default['handle']>>>
    }
  }
  'api.v1.canteen_meal_reservations.update_status': {
    methods: ["POST"]
    pattern: '/api/v1/canteen-meal-reservations/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').updateCanteenMealReservationStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').updateCanteenMealReservationStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/update_canteen_meal_reservation_status_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/update_canteen_meal_reservation_status_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_meal_reservations.cancel': {
    methods: ["DELETE"]
    pattern: '/api/v1/canteen-meal-reservations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/delete_canteen_meal_reservation_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_meal_reservations/delete_canteen_meal_reservation_controller').default['handle']>>>
    }
  }
  'api.v1.canteen_purchases.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-purchases'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/canteen').listCanteenPurchasesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_purchases/list_canteen_purchases_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_purchases/list_canteen_purchases_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_purchases.store': {
    methods: ["POST"]
    pattern: '/api/v1/canteen-purchases'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').createCanteenPurchaseValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').createCanteenPurchaseValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_purchases/create_canteen_purchase_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_purchases/create_canteen_purchase_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_purchases.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/canteen-purchases/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_purchases/show_canteen_purchase_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_purchases/show_canteen_purchase_controller').default['handle']>>>
    }
  }
  'api.v1.canteen_purchases.update_status': {
    methods: ["POST"]
    pattern: '/api/v1/canteen-purchases/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/canteen').updateCanteenPurchaseStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/canteen').updateCanteenPurchaseStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_purchases/update_canteen_purchase_status_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_purchases/update_canteen_purchase_status_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.canteen_purchases.cancel': {
    methods: ["POST"]
    pattern: '/api/v1/canteen-purchases/:id/cancel'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/canteen_purchases/cancel_canteen_purchase_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/canteen_purchases/cancel_canteen_purchase_controller').default['handle']>>>
    }
  }
  'api.v1.check_meal_recurrence': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/:studentId/meal-recurrence-check'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/student_meal_recurrence').checkMealRecurrenceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/students/check_meal_recurrence_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/students/check_meal_recurrence_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.achievements.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/achievements'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gamification').listAchievementsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/achievements/list_achievements_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/achievements/list_achievements_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.achievements.store': {
    methods: ["POST"]
    pattern: '/api/v1/achievements'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').createAchievementValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').createAchievementValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/achievements/create_achievement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/achievements/create_achievement_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.achievements.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/achievements/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/achievements/show_achievement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/achievements/show_achievement_controller').default['handle']>>>
    }
  }
  'api.v1.achievements.update': {
    methods: ["PUT"]
    pattern: '/api/v1/achievements/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').updateAchievementValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').updateAchievementValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/achievements/update_achievement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/achievements/update_achievement_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.achievements.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/achievements/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/achievements/delete_achievement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/achievements/delete_achievement_controller').default['handle']>>>
    }
  }
  'api.v1.achievements.unlock': {
    methods: ["POST"]
    pattern: '/api/v1/achievements/:id/unlock'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/achievements/unlock_achievement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/achievements/unlock_achievement_controller').default['handle']>>>
    }
  }
  'api.v1.achievements.config.update': {
    methods: ["PUT"]
    pattern: '/api/v1/achievements/:achievementId/schools/:schoolId/config'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').updateSchoolAchievementConfigValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { achievementId: ParamValue; schoolId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').updateSchoolAchievementConfigValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/achievements/update_school_achievement_config_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/achievements/update_school_achievement_config_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.stores.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/stores'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/store').listStoresValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stores/list_stores_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stores/list_stores_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.stores.store': {
    methods: ["POST"]
    pattern: '/api/v1/stores'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/store').createStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/store').createStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stores/create_store_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stores/create_store_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.stores.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/stores/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stores/show_store_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stores/show_store_controller').default['handle']>>>
    }
  }
  'api.v1.stores.update': {
    methods: ["PUT"]
    pattern: '/api/v1/stores/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/store').updateStoreValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/store').updateStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stores/update_store_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stores/update_store_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.stores.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/stores/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stores/delete_store_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stores/delete_store_controller').default['handle']>>>
    }
  }
  'api.v1.stores.financial_settings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/stores/:storeId/financial-settings'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_financial_settings/show_store_financial_settings_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_financial_settings/show_store_financial_settings_controller').default['handle']>>>
    }
  }
  'api.v1.stores.financial_settings.upsert': {
    methods: ["PUT"]
    pattern: '/api/v1/stores/:storeId/financial-settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/store').upsertStoreFinancialSettingsValidator)>>
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/store').upsertStoreFinancialSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_financial_settings/upsert_store_financial_settings_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_financial_settings/upsert_store_financial_settings_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_settlements.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-settlements'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/store').listStoreSettlementsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_settlements/list_store_settlements_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_settlements/list_store_settlements_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_settlements.store': {
    methods: ["POST"]
    pattern: '/api/v1/store-settlements'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/store').createStoreSettlementValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/store').createStoreSettlementValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_settlements/create_store_settlement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_settlements/create_store_settlement_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_settlements.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-settlements/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_settlements/show_store_settlement_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_settlements/show_store_settlement_controller').default['handle']>>>
    }
  }
  'api.v1.store_settlements.update_status': {
    methods: ["PATCH"]
    pattern: '/api/v1/store-settlements/:id/update-status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/store').updateStoreSettlementStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/store').updateStoreSettlementStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_settlements/update_store_settlement_status_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_settlements/update_store_settlement_status_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_items.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-items'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gamification').listStoreItemsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_items/list_store_items_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_items/list_store_items_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_items.store': {
    methods: ["POST"]
    pattern: '/api/v1/store-items'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').createStoreItemValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').createStoreItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_items/create_store_item_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_items/create_store_item_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_items.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-items/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_items/show_store_item_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_items/show_store_item_controller').default['handle']>>>
    }
  }
  'api.v1.store_items.update': {
    methods: ["PUT"]
    pattern: '/api/v1/store-items/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').updateStoreItemValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').updateStoreItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_items/update_store_item_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_items/update_store_item_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_items.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/store-items/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_items/delete_store_item_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_items/delete_store_item_controller').default['handle']>>>
    }
  }
  'api.v1.store_items.toggle_active': {
    methods: ["PATCH"]
    pattern: '/api/v1/store-items/:id/toggle-active'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_items/toggle_store_item_active_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_items/toggle_store_item_active_controller').default['handle']>>>
    }
  }
  'api.v1.store_orders.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gamification').listStoreOrdersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_orders/list_store_orders_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_orders/list_store_orders_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_orders.store': {
    methods: ["POST"]
    pattern: '/api/v1/store-orders'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').createStoreOrderValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').createStoreOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_orders/create_store_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_orders/create_store_order_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_orders.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-orders/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_orders/show_store_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_orders/show_store_order_controller').default['handle']>>>
    }
  }
  'api.v1.store_orders.approve': {
    methods: ["POST"]
    pattern: '/api/v1/store-orders/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_orders/approve_store_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_orders/approve_store_order_controller').default['handle']>>>
    }
  }
  'api.v1.store_orders.reject': {
    methods: ["POST"]
    pattern: '/api/v1/store-orders/:id/reject'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').rejectStoreOrderValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').rejectStoreOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_orders/reject_store_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_orders/reject_store_order_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_orders.deliver': {
    methods: ["POST"]
    pattern: '/api/v1/store-orders/:id/deliver'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').deliverStoreOrderValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').deliverStoreOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_orders/deliver_store_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_orders/deliver_store_order_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_orders.cancel': {
    methods: ["POST"]
    pattern: '/api/v1/store-orders/:id/cancel'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').cancelStoreOrderValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').cancelStoreOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_orders/cancel_store_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_orders/cancel_store_order_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_installment_rules.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-installment-rules'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/store').listStoreInstallmentRulesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_installment_rules/list_store_installment_rules_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_installment_rules/list_store_installment_rules_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_installment_rules.store': {
    methods: ["POST"]
    pattern: '/api/v1/store-installment-rules'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/store').createStoreInstallmentRuleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/store').createStoreInstallmentRuleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_installment_rules/create_store_installment_rule_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_installment_rules/create_store_installment_rule_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_installment_rules.update': {
    methods: ["PUT"]
    pattern: '/api/v1/store-installment-rules/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/store').updateStoreInstallmentRuleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/store').updateStoreInstallmentRuleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_installment_rules/update_store_installment_rule_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_installment_rules/update_store_installment_rule_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_installment_rules.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/store-installment-rules/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_installment_rules/delete_store_installment_rule_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_installment_rules/delete_store_installment_rule_controller').default['handle']>>>
    }
  }
  'api.v1.store_owner.store.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-owner/store'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/show_own_store_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/show_own_store_controller').default['handle']>>>
    }
  }
  'api.v1.store_owner.products.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-owner/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gamification').listStoreItemsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/list_own_products_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/list_own_products_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_owner.products.store': {
    methods: ["POST"]
    pattern: '/api/v1/store-owner/products'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').createStoreItemValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').createStoreItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/create_product_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/create_product_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_owner.products.update': {
    methods: ["PUT"]
    pattern: '/api/v1/store-owner/products/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').updateStoreItemValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').updateStoreItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/update_product_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/update_product_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_owner.products.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/store-owner/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/delete_product_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/delete_product_controller').default['handle']>>>
    }
  }
  'api.v1.store_owner.products.toggle_active': {
    methods: ["PATCH"]
    pattern: '/api/v1/store-owner/products/:id/toggle-active'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/toggle_product_active_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/toggle_product_active_controller').default['handle']>>>
    }
  }
  'api.v1.store_owner.orders.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-owner/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gamification').listStoreOrdersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/list_own_orders_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/list_own_orders_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_owner.orders.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-owner/orders/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/show_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/show_order_controller').default['handle']>>>
    }
  }
  'api.v1.store_owner.orders.approve': {
    methods: ["POST"]
    pattern: '/api/v1/store-owner/orders/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/approve_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/approve_order_controller').default['handle']>>>
    }
  }
  'api.v1.store_owner.orders.reject': {
    methods: ["POST"]
    pattern: '/api/v1/store-owner/orders/:id/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/reject_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/reject_order_controller').default['handle']>>>
    }
  }
  'api.v1.store_owner.orders.preparing': {
    methods: ["POST"]
    pattern: '/api/v1/store-owner/orders/:id/preparing'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/mark_preparing_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/mark_preparing_controller').default['handle']>>>
    }
  }
  'api.v1.store_owner.orders.ready': {
    methods: ["POST"]
    pattern: '/api/v1/store-owner/orders/:id/ready'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/mark_ready_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/mark_ready_controller').default['handle']>>>
    }
  }
  'api.v1.store_owner.orders.deliver': {
    methods: ["POST"]
    pattern: '/api/v1/store-owner/orders/:id/deliver'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').deliverStoreOrderValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').deliverStoreOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/deliver_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/deliver_order_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_owner.orders.cancel': {
    methods: ["POST"]
    pattern: '/api/v1/store-owner/orders/:id/cancel'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').cancelStoreOrderValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').cancelStoreOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/cancel_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/cancel_order_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_owner.financial.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-owner/financial-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/show_financial_settings_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/show_financial_settings_controller').default['handle']>>>
    }
  }
  'api.v1.store_owner.financial.update': {
    methods: ["PUT"]
    pattern: '/api/v1/store-owner/financial-settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/store').updateOwnFinancialSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/store').updateOwnFinancialSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/update_financial_settings_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/update_financial_settings_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.store_owner.settlements.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/store-owner/settlements'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/store_owner/list_settlements_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/store_owner/list_settlements_controller').default['handle']>>>
    }
  }
  'api.v1.marketplace.stores.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/marketplace/stores'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/marketplace/list_marketplace_stores_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/marketplace/list_marketplace_stores_controller').default['handle']>>>
    }
  }
  'api.v1.marketplace.stores.items': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/marketplace/stores/:storeId/items'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/marketplace/list_store_items_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/marketplace/list_store_items_controller').default['handle']>>>
    }
  }
  'api.v1.marketplace.stores.context': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/marketplace/stores/:storeId/context'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/marketplace/get_marketplace_store_context_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/marketplace/get_marketplace_store_context_controller').default['handle']>>>
    }
  }
  'api.v1.marketplace.installment_options': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/marketplace/installment-options'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/marketplace/get_installment_options_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/marketplace/get_installment_options_controller').default['handle']>>>
    }
  }
  'api.v1.marketplace.checkout': {
    methods: ["POST"]
    pattern: '/api/v1/marketplace/checkout'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/marketplace').marketplaceCheckoutValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/marketplace').marketplaceCheckoutValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/marketplace/marketplace_checkout_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/marketplace/marketplace_checkout_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.marketplace.orders.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/marketplace/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/marketplace/list_my_orders_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/marketplace/list_my_orders_controller').default['handle']>>>
    }
  }
  'api.v1.marketplace.orders.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/marketplace/orders/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/marketplace/show_my_order_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/marketplace/show_my_order_controller').default['handle']>>>
    }
  }
  'api.v1.student_gamifications.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/student-gamifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gamification').listStudentGamificationsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_gamifications/list_student_gamifications_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_gamifications/list_student_gamifications_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_gamifications.store': {
    methods: ["POST"]
    pattern: '/api/v1/student-gamifications'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/student_gamification').createStudentGamificationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/student_gamification').createStudentGamificationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_gamifications/create_student_gamification_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_gamifications/create_student_gamification_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_gamifications.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/student-gamifications/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_gamifications/show_student_gamification_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_gamifications/show_student_gamification_controller').default['handle']>>>
    }
  }
  'api.v1.student_gamifications.add_points': {
    methods: ["POST"]
    pattern: '/api/v1/student-gamifications/add-points'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').addPointsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').addPointsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_gamifications/add_points_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_gamifications/add_points_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.student_gamifications.ranking': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/student-gamifications/ranking'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gamification').getPointsRankingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_gamifications/get_points_ranking_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_gamifications/get_points_ranking_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.students.gamification_stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/students/:studentId/gamification/stats'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/student_gamifications/get_student_stats_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/student_gamifications/get_student_stats_controller').default['handle']>>>
    }
  }
  'api.v1.leaderboards.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/leaderboards'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gamification').listLeaderboardsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/leaderboards/list_leaderboards_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/leaderboards/list_leaderboards_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.leaderboards.store': {
    methods: ["POST"]
    pattern: '/api/v1/leaderboards'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').createLeaderboardValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').createLeaderboardValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/leaderboards/create_leaderboard_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/leaderboards/create_leaderboard_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.leaderboards.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/leaderboards/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/leaderboards/show_leaderboard_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/leaderboards/show_leaderboard_controller').default['handle']>>>
    }
  }
  'api.v1.leaderboards.update': {
    methods: ["PUT"]
    pattern: '/api/v1/leaderboards/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').updateLeaderboardValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').updateLeaderboardValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/leaderboards/update_leaderboard_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/leaderboards/update_leaderboard_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.leaderboards.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/leaderboards/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/leaderboards/delete_leaderboard_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/leaderboards/delete_leaderboard_controller').default['handle']>>>
    }
  }
  'api.v1.leaderboards.entries': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/leaderboards/:id/entries'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/leaderboards/list_leaderboard_entries_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/leaderboards/list_leaderboard_entries_controller').default['handle']>>>
    }
  }
  'api.v1.gamification_events.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/gamification-events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gamification').listGamificationEventsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/gamification_events/list_gamification_events_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/gamification_events/list_gamification_events_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.gamification_events.store': {
    methods: ["POST"]
    pattern: '/api/v1/gamification-events'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').createGamificationEventValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').createGamificationEventValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/gamification_events/create_gamification_event_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/gamification_events/create_gamification_event_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.gamification_events.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/gamification-events/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/gamification_events/show_gamification_event_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/gamification_events/show_gamification_event_controller').default['handle']>>>
    }
  }
  'api.v1.gamification_events.retry': {
    methods: ["POST"]
    pattern: '/api/v1/gamification-events/:id/retry'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/gamification_events/retry_gamification_event_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/gamification_events/retry_gamification_event_controller').default['handle']>>>
    }
  }
  'api.v1.challenges.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/challenges'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/gamification').listChallengesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/challenges/list_challenges_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/challenges/list_challenges_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.challenges.store': {
    methods: ["POST"]
    pattern: '/api/v1/challenges'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').createChallengeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').createChallengeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/challenges/create_challenge_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/challenges/create_challenge_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.challenges.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/challenges/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/challenges/show_challenge_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/challenges/show_challenge_controller').default['handle']>>>
    }
  }
  'api.v1.challenges.update': {
    methods: ["PUT"]
    pattern: '/api/v1/challenges/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/gamification').updateChallengeValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/gamification').updateChallengeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/challenges/update_challenge_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/challenges/update_challenge_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.challenges.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/challenges/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/challenges/delete_challenge_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/challenges/delete_challenge_controller').default['handle']>>>
    }
  }
  'api.v1.scholarships.list_scholarships': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/scholarships'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/scholarship').listScholarshipsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/scholarships/list_scholarships_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/scholarships/list_scholarships_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.scholarships.create_scholarship': {
    methods: ["POST"]
    pattern: '/api/v1/scholarships'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/scholarship').createScholarshipValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/scholarship').createScholarshipValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/scholarships/create_scholarship_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/scholarships/create_scholarship_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.scholarships.show_scholarship': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/scholarships/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/scholarships/show_scholarship_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/scholarships/show_scholarship_controller').default['handle']>>>
    }
  }
  'api.v1.scholarships.update_scholarship': {
    methods: ["PUT"]
    pattern: '/api/v1/scholarships/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/scholarship').updateScholarshipValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/scholarship').updateScholarshipValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/scholarships/update_scholarship_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/scholarships/update_scholarship_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.scholarships.toggle_scholarship_active': {
    methods: ["PATCH"]
    pattern: '/api/v1/scholarships/:id/toggle-active'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/scholarships/toggle_scholarship_active_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/scholarships/toggle_scholarship_active_controller').default['handle']>>>
    }
  }
  'api.v1.school_partners.list_school_partners': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-partners'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/school_partner').listSchoolPartnersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_partners/list_school_partners_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_partners/list_school_partners_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_partners.create_school_partner': {
    methods: ["POST"]
    pattern: '/api/v1/school-partners'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school_partner').createSchoolPartnerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/school_partner').createSchoolPartnerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_partners/create_school_partner_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_partners/create_school_partner_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_partners.show_school_partner': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-partners/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_partners/show_school_partner_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_partners/show_school_partner_controller').default['handle']>>>
    }
  }
  'api.v1.school_partners.update_school_partner': {
    methods: ["PUT"]
    pattern: '/api/v1/school-partners/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school_partner').updateSchoolPartnerValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/school_partner').updateSchoolPartnerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_partners/update_school_partner_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_partners/update_school_partner_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_partners.toggle_school_partner_active': {
    methods: ["PATCH"]
    pattern: '/api/v1/school-partners/:id/toggle-active'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_partners/toggle_school_partner_active_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_partners/toggle_school_partner_active_controller').default['handle']>>>
    }
  }
  'api.v1.school_chains.list_school_chains': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-chains'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/school_chain').listSchoolChainsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_chains/list_school_chains_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_chains/list_school_chains_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_chains.create_school_chain': {
    methods: ["POST"]
    pattern: '/api/v1/school-chains'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school_chain').createSchoolChainValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/school_chain').createSchoolChainValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_chains/create_school_chain_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_chains/create_school_chain_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_chains.show_school_chain': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-chains/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_chains/show_school_chain_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_chains/show_school_chain_controller').default['handle']>>>
    }
  }
  'api.v1.school_chains.update_school_chain': {
    methods: ["PUT"]
    pattern: '/api/v1/school-chains/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school_chain').updateSchoolChainValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/school_chain').updateSchoolChainValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_chains/update_school_chain_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_chains/update_school_chain_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_chains.delete_school_chain': {
    methods: ["DELETE"]
    pattern: '/api/v1/school-chains/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_chains/delete_school_chain_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_chains/delete_school_chain_controller').default['handle']>>>
    }
  }
  'api.v1.school_groups.list_school_groups': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-groups'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/school_group').listSchoolGroupsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_groups/list_school_groups_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_groups/list_school_groups_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_groups.create_school_group': {
    methods: ["POST"]
    pattern: '/api/v1/school-groups'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school_group').createSchoolGroupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/school_group').createSchoolGroupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_groups/create_school_group_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_groups/create_school_group_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_groups.show_school_group': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-groups/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_groups/show_school_group_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_groups/show_school_group_controller').default['handle']>>>
    }
  }
  'api.v1.school_groups.update_school_group': {
    methods: ["PUT"]
    pattern: '/api/v1/school-groups/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/school_group').updateSchoolGroupValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/school_group').updateSchoolGroupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_groups/update_school_group_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_groups/update_school_group_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.school_groups.delete_school_group': {
    methods: ["DELETE"]
    pattern: '/api/v1/school-groups/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_groups/delete_school_group_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_groups/delete_school_group_controller').default['handle']>>>
    }
  }
  'api.v1.academic_periods.list_academic_periods': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/academic-periods'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/academic_period').listAcademicPeriodsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/academic_periods/list_academic_periods_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/academic_periods/list_academic_periods_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.academic_periods.get_current_active_academic_periods': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/academic-periods/current-active'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/academic_periods/get_current_active_academic_periods_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/academic_periods/get_current_active_academic_periods_controller').default['handle']>>>
    }
  }
  'api.v1.academic_periods.show_by_slug': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/academic-periods/by-slug/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/academic_period').showAcademicPeriodBySlugQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/academic_periods/show_academic_period_by_slug_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/academic_periods/show_academic_period_by_slug_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.academic_periods.show_dashboard_by_slug': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/academic-periods/by-slug/:slug/dashboard'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/academic_periods/show_academic_period_dashboard_by_slug_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/academic_periods/show_academic_period_dashboard_by_slug_controller').default['handle']>>>
    }
  }
  'api.v1.academic_periods.create_academic_period': {
    methods: ["POST"]
    pattern: '/api/v1/academic-periods'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/academic_period').createAcademicPeriodValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/academic_period').createAcademicPeriodValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/academic_periods/create_academic_period_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/academic_periods/create_academic_period_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.academic_periods.show_academic_period': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/academic-periods/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/academic_periods/show_academic_period_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/academic_periods/show_academic_period_controller').default['handle']>>>
    }
  }
  'api.v1.academic_periods.update_academic_period': {
    methods: ["PUT"]
    pattern: '/api/v1/academic-periods/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/academic_period').updateAcademicPeriodValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/academic_period').updateAcademicPeriodValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/academic_periods/update_academic_period_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/academic_periods/update_academic_period_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.academic_periods.delete_academic_period': {
    methods: ["DELETE"]
    pattern: '/api/v1/academic-periods/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/academic_periods/delete_academic_period_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/academic_periods/delete_academic_period_controller').default['handle']>>>
    }
  }
  'api.v1.academic_periods.list_courses': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/academic-periods/:id/courses'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/academic_periods/list_academic_period_courses_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/academic_periods/list_academic_period_courses_controller').default['handle']>>>
    }
  }
  'api.v1.academic_periods.update_courses': {
    methods: ["PUT"]
    pattern: '/api/v1/academic-periods/:id/courses'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/academic_period').updateCoursesValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/academic_period').updateCoursesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/academic_periods/update_academic_period_courses_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/academic_periods/update_academic_period_courses_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.print_requests.list_print_requests': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/print-requests'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/print_request').listPrintRequestsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/print_requests/list_print_requests_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/print_requests/list_print_requests_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.print_requests.create_print_request': {
    methods: ["POST"]
    pattern: '/api/v1/print-requests'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/print_request').createPrintRequestValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/print_request').createPrintRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/print_requests/create_print_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/print_requests/create_print_request_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.print_requests.show_print_request': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/print-requests/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/print_requests/show_print_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/print_requests/show_print_request_controller').default['handle']>>>
    }
  }
  'api.v1.print_requests.approve_print_request': {
    methods: ["PATCH"]
    pattern: '/api/v1/print-requests/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/print_requests/approve_print_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/print_requests/approve_print_request_controller').default['handle']>>>
    }
  }
  'api.v1.print_requests.reject_print_request': {
    methods: ["PATCH"]
    pattern: '/api/v1/print-requests/:id/reject'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/print_request').rejectPrintRequestValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/print_request').rejectPrintRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/print_requests/reject_print_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/print_requests/reject_print_request_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.print_requests.review_print_request': {
    methods: ["PATCH"]
    pattern: '/api/v1/print-requests/:id/review'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/print_request').reviewPrintRequestValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/print_request').reviewPrintRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/print_requests/review_print_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/print_requests/review_print_request_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.print_requests.mark_print_request_printed': {
    methods: ["PATCH"]
    pattern: '/api/v1/print-requests/:id/printed'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/print_requests/mark_print_request_printed_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/print_requests/mark_print_request_printed_controller').default['handle']>>>
    }
  }
  'api.v1.platform_settings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/platform-settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/platform_settings/show_platform_settings_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/platform_settings/show_platform_settings_controller').default['handle']>>>
    }
  }
  'api.v1.platform_settings.update': {
    methods: ["PUT"]
    pattern: '/api/v1/platform-settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subscription').updatePlatformSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/subscription').updatePlatformSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/platform_settings/update_platform_settings_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/platform_settings/update_platform_settings_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscription_plans.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/subscription-plans'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/subscription').listSubscriptionPlansValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_plans/list_subscription_plans_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_plans/list_subscription_plans_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscription_plans.store': {
    methods: ["POST"]
    pattern: '/api/v1/subscription-plans'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subscription').createSubscriptionPlanValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/subscription').createSubscriptionPlanValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_plans/create_subscription_plan_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_plans/create_subscription_plan_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscription_plans.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/subscription-plans/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_plans/show_subscription_plan_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_plans/show_subscription_plan_controller').default['handle']>>>
    }
  }
  'api.v1.subscription_plans.update': {
    methods: ["PUT"]
    pattern: '/api/v1/subscription-plans/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subscription').updateSubscriptionPlanValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/subscription').updateSubscriptionPlanValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_plans/update_subscription_plan_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_plans/update_subscription_plan_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscription_plans.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/subscription-plans/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_plans/delete_subscription_plan_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_plans/delete_subscription_plan_controller').default['handle']>>>
    }
  }
  'api.v1.subscriptions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/subscriptions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/subscription').listSubscriptionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscriptions/list_subscriptions_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscriptions/list_subscriptions_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscriptions.store': {
    methods: ["POST"]
    pattern: '/api/v1/subscriptions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subscription').createSubscriptionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/subscription').createSubscriptionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscriptions/create_subscription_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscriptions/create_subscription_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscriptions.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/subscriptions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscriptions/show_subscription_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscriptions/show_subscription_controller').default['handle']>>>
    }
  }
  'api.v1.subscriptions.update': {
    methods: ["PUT"]
    pattern: '/api/v1/subscriptions/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subscription').updateSubscriptionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/subscription').updateSubscriptionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscriptions/update_subscription_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscriptions/update_subscription_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscriptions.cancel': {
    methods: ["POST"]
    pattern: '/api/v1/subscriptions/:id/cancel'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subscription').cancelSubscriptionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/subscription').cancelSubscriptionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscriptions/cancel_subscription_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscriptions/cancel_subscription_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscriptions.pause': {
    methods: ["POST"]
    pattern: '/api/v1/subscriptions/:id/pause'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subscription').pauseSubscriptionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/subscription').pauseSubscriptionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscriptions/pause_subscription_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscriptions/pause_subscription_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscriptions.reactivate': {
    methods: ["POST"]
    pattern: '/api/v1/subscriptions/:id/reactivate'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subscription').reactivateSubscriptionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/subscription').reactivateSubscriptionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscriptions/reactivate_subscription_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscriptions/reactivate_subscription_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.schools.subscription': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/schools/:schoolId/subscription'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscriptions/get_school_subscription_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscriptions/get_school_subscription_controller').default['handle']>>>
    }
  }
  'api.v1.school_chains.subscription': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-chains/:schoolChainId/subscription'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { schoolChainId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscriptions/get_chain_subscription_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscriptions/get_chain_subscription_controller').default['handle']>>>
    }
  }
  'api.v1.subscription_invoices.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/subscription-invoices'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/subscription').listSubscriptionInvoicesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_invoices/list_subscription_invoices_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_invoices/list_subscription_invoices_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscription_invoices.store': {
    methods: ["POST"]
    pattern: '/api/v1/subscription-invoices'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subscription').createSubscriptionInvoiceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/subscription').createSubscriptionInvoiceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_invoices/create_subscription_invoice_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_invoices/create_subscription_invoice_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscription_invoices.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/subscription-invoices/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_invoices/show_subscription_invoice_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_invoices/show_subscription_invoice_controller').default['handle']>>>
    }
  }
  'api.v1.subscription_invoices.update': {
    methods: ["PUT"]
    pattern: '/api/v1/subscription-invoices/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/subscription').updateSubscriptionInvoiceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/subscription').updateSubscriptionInvoiceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_invoices/update_subscription_invoice_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_invoices/update_subscription_invoice_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.subscription_invoices.mark_paid': {
    methods: ["POST"]
    pattern: '/api/v1/subscription-invoices/:id/mark-paid'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/subscription_invoices/mark_invoice_paid_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/subscription_invoices/mark_invoice_paid_controller').default['handle']>>>
    }
  }
  'api.v1.school_usage_metrics.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/school-usage-metrics'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/subscription').getSchoolUsageMetricsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/school_usage_metrics/get_school_usage_metrics_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/school_usage_metrics/get_school_usage_metrics_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.purchase_requests.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/purchase-requests'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/purchase_request').listPurchaseRequestsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_requests/list_purchase_requests_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_requests/list_purchase_requests_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.purchase_requests.store': {
    methods: ["POST"]
    pattern: '/api/v1/purchase-requests'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/purchase_request').createPurchaseRequestValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/purchase_request').createPurchaseRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_requests/create_purchase_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_requests/create_purchase_request_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.purchase_requests.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/purchase-requests/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_requests/show_purchase_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_requests/show_purchase_request_controller').default['handle']>>>
    }
  }
  'api.v1.purchase_requests.update': {
    methods: ["PUT"]
    pattern: '/api/v1/purchase-requests/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/purchase_request').updatePurchaseRequestValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/purchase_request').updatePurchaseRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_requests/update_purchase_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_requests/update_purchase_request_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.purchase_requests.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/purchase-requests/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_requests/delete_purchase_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_requests/delete_purchase_request_controller').default['handle']>>>
    }
  }
  'api.v1.purchase_requests.approve': {
    methods: ["POST"]
    pattern: '/api/v1/purchase-requests/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_requests/approve_purchase_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_requests/approve_purchase_request_controller').default['handle']>>>
    }
  }
  'api.v1.purchase_requests.reject': {
    methods: ["POST"]
    pattern: '/api/v1/purchase-requests/:id/reject'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/purchase_request').rejectPurchaseRequestValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/purchase_request').rejectPurchaseRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_requests/reject_purchase_request_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_requests/reject_purchase_request_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.purchase_requests.mark_bought': {
    methods: ["POST"]
    pattern: '/api/v1/purchase-requests/:id/mark-bought'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/purchase_request').markAsBoughtValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/purchase_request').markAsBoughtValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_requests/mark_as_bought_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_requests/mark_as_bought_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.purchase_requests.mark_arrived': {
    methods: ["POST"]
    pattern: '/api/v1/purchase-requests/:id/mark-arrived'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/purchase_request').markAsArrivedValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/purchase_request').markAsArrivedValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/purchase_requests/mark_as_arrived_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/purchase_requests/mark_as_arrived_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.config': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/insurance/config'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/insurance').getInsuranceConfigValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/get_insurance_config_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/get_insurance_config_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.update_school': {
    methods: ["PUT"]
    pattern: '/api/v1/insurance/school/:schoolId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/insurance').updateSchoolInsuranceValidator)>>
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/insurance').updateSchoolInsuranceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/update_school_insurance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/update_school_insurance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.update_chain': {
    methods: ["PUT"]
    pattern: '/api/v1/insurance/chain/:chainId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/insurance').updateSchoolChainInsuranceValidator)>>
      paramsTuple: [ParamValue]
      params: { chainId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/insurance').updateSchoolChainInsuranceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/update_school_chain_insurance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/update_school_chain_insurance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.reset_school': {
    methods: ["POST"]
    pattern: '/api/v1/insurance/school/:schoolId/reset'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/insurance').resetSchoolInsuranceValidator)>>
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/insurance').resetSchoolInsuranceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/reset_school_insurance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/reset_school_insurance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.claims.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/insurance/claims'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/insurance').listInsuranceClaimsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/list_insurance_claims_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/list_insurance_claims_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.claims.approve': {
    methods: ["POST"]
    pattern: '/api/v1/insurance/claims/:claimId/approve'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/insurance').approveInsuranceClaimValidator)>>
      paramsTuple: [ParamValue]
      params: { claimId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/insurance').approveInsuranceClaimValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/approve_insurance_claim_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/approve_insurance_claim_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.claims.reject': {
    methods: ["POST"]
    pattern: '/api/v1/insurance/claims/:claimId/reject'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/insurance').rejectInsuranceClaimValidator)>>
      paramsTuple: [ParamValue]
      params: { claimId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/insurance').rejectInsuranceClaimValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/reject_insurance_claim_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/reject_insurance_claim_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.claims.mark_paid': {
    methods: ["POST"]
    pattern: '/api/v1/insurance/claims/:claimId/mark-paid'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/insurance').markClaimPaidValidator)>>
      paramsTuple: [ParamValue]
      params: { claimId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/insurance').markClaimPaidValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/mark_claim_paid_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/mark_claim_paid_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.billings.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/insurance/billings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/insurance').listInsuranceBillingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/list_insurance_billings_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/list_insurance_billings_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.billings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/insurance/billings/:billingId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { billingId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/insurance').getBillingDetailsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/get_billing_details_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/get_billing_details_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/insurance/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/get_insurance_stats_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/get_insurance_stats_controller').default['handle']>>>
    }
  }
  'api.v1.insurance.analytics.default_rate': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/insurance/analytics/default-rate'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/insurance').getDefaultRateBySchoolValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/get_default_rate_by_school_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/get_default_rate_by_school_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.analytics.schools_without': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/insurance/analytics/schools-without'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/insurance').getSchoolsWithoutInsuranceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/get_schools_without_insurance_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/get_schools_without_insurance_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.school.stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/insurance/school/:schoolId/stats'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/insurance').getSchoolInsuranceStatsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/get_school_insurance_stats_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/get_school_insurance_stats_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.school.billings': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/insurance/school/:schoolId/billings'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/insurance').getSchoolInsuranceBillingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/get_school_insurance_billings_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/get_school_insurance_billings_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.insurance.school.claims': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/insurance/school/:schoolId/claims'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/insurance').getSchoolInsuranceClaimsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/insurance/get_school_insurance_claims_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/insurance/get_school_insurance_claims_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.impersonation.set': {
    methods: ["POST"]
    pattern: '/api/v1/admin/impersonation'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/set_impersonation_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/set_impersonation_controller').default['handle']>>>
    }
  }
  'api.v1.impersonation.clear': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/impersonation'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/clear_impersonation_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/clear_impersonation_controller').default['handle']>>>
    }
  }
  'api.v1.impersonation.status': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/impersonation/status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/get_impersonation_status_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/get_impersonation_status_controller').default['handle']>>>
    }
  }
  'api.v1.impersonation.config': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/impersonation/config'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/get_impersonation_config_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/get_impersonation_config_controller').default['handle']>>>
    }
  }
  'api.v1.admin.schools.onboarding': {
    methods: ["POST"]
    pattern: '/api/v1/admin/schools/onboarding'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/onboarding').createSchoolOnboardingValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/onboarding').createSchoolOnboardingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/create_school_onboarding_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/create_school_onboarding_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.admin.jobs.generate_missing_payments': {
    methods: ["POST"]
    pattern: '/api/v1/admin/jobs/generate-missing-payments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/trigger_missing_payments_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/trigger_missing_payments_controller').default['handle']>>>
    }
  }
  'api.v1.pedagogical_calendar.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/pedagogical-calendar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/pedagogical_calendar').listPedagogicalCalendarValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pedagogical_calendar/list_pedagogical_calendar_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pedagogical_calendar/list_pedagogical_calendar_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.pedagogical_calendar.creation_context': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/pedagogical-calendar/creation-context'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/pedagogical_calendar').getPedagogicalCreationContextValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pedagogical_calendar/get_creation_context_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pedagogical_calendar/get_creation_context_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.game.create_character': {
    methods: ["POST"]
    pattern: '/api/v1/game/characters'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/game_character').createGameCharacterValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/game_character').createGameCharacterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/game/create_game_character_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/game/create_game_character_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.escola.inquiries.inquiries.list': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/escola/inquiries'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/parent_inquiry').listInquiriesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/escola/list_inquiries_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/escola/list_inquiries_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.escola.inquiries.inquiries.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/escola/inquiries/:inquiryId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { inquiryId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/escola/show_inquiry_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/escola/show_inquiry_controller').default['handle']>>>
    }
  }
  'api.v1.escola.inquiries.inquiries.messages.create': {
    methods: ["POST"]
    pattern: '/api/v1/escola/inquiries/:inquiryId/messages'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/parent_inquiry').createMessageValidator)>>
      paramsTuple: [ParamValue]
      params: { inquiryId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/parent_inquiry').createMessageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/escola/create_inquiry_message_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/escola/create_inquiry_message_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.escola.inquiries.inquiries.resolve': {
    methods: ["POST"]
    pattern: '/api/v1/escola/inquiries/:inquiryId/resolve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { inquiryId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/escola/resolve_inquiry_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/escola/resolve_inquiry_controller').default['handle']>>>
    }
  }
  'api.v1.csp_report': {
    methods: ["POST"]
    pattern: '/api/v1/csp-report'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
}
