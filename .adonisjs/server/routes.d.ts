import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: { '*': ParamValue[] } }
    'server-stats.api': { paramsTuple?: []; params?: {} }
    'server-stats.debug.queries': { paramsTuple?: []; params?: {} }
    'server-stats.debug.events': { paramsTuple?: []; params?: {} }
    'server-stats.debug.routes': { paramsTuple?: []; params?: {} }
    'server-stats.debug.logs': { paramsTuple?: []; params?: {} }
    'server-stats.debug.emails': { paramsTuple?: []; params?: {} }
    'server-stats.debug.emailPreview': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.debug.traces': { paramsTuple?: []; params?: {} }
    'server-stats.debug.traceDetail': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.dashboard': { paramsTuple?: []; params?: {} }
    'server-stats.overview': { paramsTuple?: []; params?: {} }
    'server-stats.overview.chart': { paramsTuple?: []; params?: {} }
    'server-stats.requests': { paramsTuple?: []; params?: {} }
    'server-stats.requests.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.queries': { paramsTuple?: []; params?: {} }
    'server-stats.queries.grouped': { paramsTuple?: []; params?: {} }
    'server-stats.queries.explain': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.events': { paramsTuple?: []; params?: {} }
    'server-stats.routes': { paramsTuple?: []; params?: {} }
    'server-stats.logs': { paramsTuple?: []; params?: {} }
    'server-stats.emails': { paramsTuple?: []; params?: {} }
    'server-stats.emails.preview': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.traces': { paramsTuple?: []; params?: {} }
    'server-stats.traces.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.cache': { paramsTuple?: []; params?: {} }
    'server-stats.cache.show': { paramsTuple: [ParamValue]; params: { key: ParamValue } }
    'server-stats.jobs': { paramsTuple?: []; params?: {} }
    'server-stats.jobs.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.jobs.retry': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.config': { paramsTuple?: []; params?: {} }
    'server-stats.filters': { paramsTuple?: []; params?: {} }
    'server-stats.filters.create': { paramsTuple?: []; params?: {} }
    'server-stats.filters.delete': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.home': { paramsTuple?: []; params?: {} }
    'web.matriculaOnline': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { schoolSlug: ParamValue; academicPeriodSlug: ParamValue; courseSlug: ParamValue }
    }
    'web.agendar': { paramsTuple?: []; params?: {} }
    'web.auth.signIn': { paramsTuple?: []; params?: {} }
    'web.auth.login': { paramsTuple?: []; params?: {} }
    'web.dashboard': { paramsTuple?: []; params?: {} }
    'web.escola.dashboard': { paramsTuple?: []; params?: {} }
    'web.escola.periodosLetivos': { paramsTuple?: []; params?: {} }
    'web.escola.periodosLetivos.show': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'web.escola.administrativo.novoPeriodoLetivo': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.periodosLetivos.editar': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.visaoGeral': {
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas': {
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.atividades': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.provas': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.presencas': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.notas': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.situacao': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.administrativo.alunos': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.alunos.editar': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.alunos.historicoFinanceiro': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.funcionarios': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.professores': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.matriculas': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.matriculas.nova': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.contratos': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.contratos.novo': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.contratos.editar': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.contratos.assinaturas': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.contratos.docuseal': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.contratos.financeiro': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'web.escola.administrativo.bolsas': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.parceiros': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.materias': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.folhaDePonto': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.impressao': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.solicitacoesDeCompra': { paramsTuple?: []; params?: {} }
    'web.escola.notificacoes': { paramsTuple?: []; params?: {} }
    'web.escola.notificacoes.preferencias': { paramsTuple?: []; params?: {} }
    'web.escola.comunicados': { paramsTuple?: []; params?: {} }
    'web.escola.comunicados.novo': { paramsTuple?: []; params?: {} }
    'web.escola.comunicados.editar': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.eventos': { paramsTuple?: []; params?: {} }
    'web.escola.eventos.novo': { paramsTuple?: []; params?: {} }
    'web.escola.eventos.editar': { paramsTuple: [ParamValue]; params: { eventId: ParamValue } }
    'web.escola.eventos.autorizacoes': {
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
    }
    'web.escola.mural': { paramsTuple?: []; params?: {} }
    'web.escola.desempenho': { paramsTuple?: []; params?: {} }
    'web.escola.matriculas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.turmas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.grade': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.horarios': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.quadro': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.ocorrencias': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.atividades': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.atividades.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.pedagogico.atividades.edit': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.pedagogico.provas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.provas.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.pedagogico.provas.edit': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.pedagogico.presenca': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.aulasAvulsas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.cursosNiveis': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.itens': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.cardapio': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.pdv': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.pedidos': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.vendas': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.reservas': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.transferencias': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.inadimplencia': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.seguros': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.faturas': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.configuracaoPagamentos': { paramsTuple?: []; params?: {} }
    'web.escola.lojas.index': { paramsTuple?: []; params?: {} }
    'web.escola.lojas.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.gamificacao.index': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.rankings': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.conquistas': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.recompensas': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.desafios': { paramsTuple?: []; params?: {} }
    'web.escola.configuracoes': { paramsTuple?: []; params?: {} }
    'web.responsavel.dashboard': { paramsTuple?: []; params?: {} }
    'web.responsavel.notas': { paramsTuple?: []; params?: {} }
    'web.responsavel.frequencia': { paramsTuple?: []; params?: {} }
    'web.responsavel.mensalidades': { paramsTuple?: []; params?: {} }
    'web.responsavel.cantina': { paramsTuple?: []; params?: {} }
    'web.responsavel.gamificacao': { paramsTuple?: []; params?: {} }
    'web.responsavel.gamificacao.details': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'web.responsavel.comunicados': { paramsTuple?: []; params?: {} }
    'web.responsavel.autorizacoes': { paramsTuple?: []; params?: {} }
    'web.responsavel.atividades': { paramsTuple?: []; params?: {} }
    'web.responsavel.horario': { paramsTuple?: []; params?: {} }
    'web.responsavel.documentos': { paramsTuple?: []; params?: {} }
    'web.responsavel.ocorrencias': { paramsTuple?: []; params?: {} }
    'web.responsavel.perfil': { paramsTuple?: []; params?: {} }
    'web.responsavel.notificacoes': { paramsTuple?: []; params?: {} }
    'web.responsavel.credito': { paramsTuple?: []; params?: {} }
    'web.responsavel.loja': { paramsTuple?: []; params?: {} }
    'web.responsavel.loja.store': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.admin.dashboard': { paramsTuple?: []; params?: {} }
    'web.admin.escolas': { paramsTuple?: []; params?: {} }
    'web.admin.escolas.edit': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.admin.escolas.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.admin.onboarding': { paramsTuple?: []; params?: {} }
    'web.admin.billing.dashboard': { paramsTuple?: []; params?: {} }
    'web.admin.billing.faturas': { paramsTuple?: []; params?: {} }
    'web.admin.billing.subscriptions': { paramsTuple?: []; params?: {} }
    'web.admin.redes': { paramsTuple?: []; params?: {} }
    'web.admin.configuracoes': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.index': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.sinistros': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.faturamento': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.analytics': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.configuracao': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.index': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.academico': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.presenca': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.cantina': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.pagamentos': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.matriculas': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.ocorrencias': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.gamificacao': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.rh': { paramsTuple?: []; params?: {} }
    'web.loja.dashboard': { paramsTuple?: []; params?: {} }
    'web.loja.produtos': { paramsTuple?: []; params?: {} }
    'web.loja.pedidos': { paramsTuple?: []; params?: {} }
    'web.loja.financeiro': { paramsTuple?: []; params?: {} }
    'web.aluno.dashboard': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.index': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.carrinho': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.pedidos': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.pontos': { paramsTuple?: []; params?: {} }
    'web.aluno.idle': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.store': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.auth.login': { paramsTuple?: []; params?: {} }
    'api.v1.auth.send_code': { paramsTuple?: []; params?: {} }
    'api.v1.auth.verify_code': { paramsTuple?: []; params?: {} }
    'api.v1.auth.logout': { paramsTuple?: []; params?: {} }
    'api.v1.auth.me': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.escola_stats': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.escola_insights': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.escola_teacher_dashboard': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.responsavel_stats': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.student_grades': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_attendance': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_payments': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_invoices': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_balance': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_canteen_purchases': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_assignments': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_schedule': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_documents': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_occurrences': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.acknowledge_occurrence': {
      paramsTuple: [ParamValue, ParamValue]
      params: { studentId: ParamValue; occurrenceId: ParamValue }
    }
    'api.v1.responsavel.api.student_overview': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_gamification': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.notifications': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.comunicados.list': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.comunicados.pending_ack': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.comunicados.details': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.responsavel.api.comunicados.acknowledge': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.responsavel.api.update_profile': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.invoice_checkout': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.responsavel.api.create_wallet_top_up': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.list_wallet_top_ups': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.show_wallet_top_up': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.dashboard.admin_stats': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.server_stats': { paramsTuple?: []; params?: {} }
    'api.v1.asaas.webhook': { paramsTuple?: []; params?: {} }
    'api.v1.asaas.subaccounts.create': { paramsTuple?: []; params?: {} }
    'api.v1.asaas.subaccounts.status': { paramsTuple?: []; params?: {} }
    'api.v1.schools.index': { paramsTuple?: []; params?: {} }
    'api.v1.schools.store': { paramsTuple?: []; params?: {} }
    'api.v1.schools.show_by_slug': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'api.v1.schools.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.upload_logo': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.users': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.update_director': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.users.index': { paramsTuple?: []; params?: {} }
    'api.v1.users.school_employees': { paramsTuple?: []; params?: {} }
    'api.v1.users.store': { paramsTuple?: []; params?: {} }
    'api.v1.users.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.users.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.users.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.user_schools.list_user_schools': { paramsTuple?: []; params?: {} }
    'api.v1.user_schools.create_user_school': { paramsTuple?: []; params?: {} }
    'api.v1.user_schools.update_user_school': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.user_schools.delete_user_school': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.user_school_groups.list_user_school_groups': { paramsTuple?: []; params?: {} }
    'api.v1.user_school_groups.create_user_school_group': { paramsTuple?: []; params?: {} }
    'api.v1.user_school_groups.delete_user_school_group': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_switcher.get_data': { paramsTuple?: []; params?: {} }
    'api.v1.school_switcher.toggle_school': { paramsTuple?: []; params?: {} }
    'api.v1.school_switcher.toggle_group': { paramsTuple?: []; params?: {} }
    'api.v1.students.index': { paramsTuple?: []; params?: {} }
    'api.v1.students.store': { paramsTuple?: []; params?: {} }
    'api.v1.students.enroll': { paramsTuple?: []; params?: {} }
    'api.v1.students.check_document': { paramsTuple?: []; params?: {} }
    'api.v1.students.check_email': { paramsTuple?: []; params?: {} }
    'api.v1.students.lookup_responsible': { paramsTuple?: []; params?: {} }
    'api.v1.students.me.avatar.show': { paramsTuple?: []; params?: {} }
    'api.v1.students.me.avatar.update': { paramsTuple?: []; params?: {} }
    'api.v1.students.me.avatar.purchase': { paramsTuple?: []; params?: {} }
    'api.v1.students.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.full_update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.enrollments.list': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.enrollments.update': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; enrollmentId: ParamValue }
    }
    'api.v1.students.enrollments.cancel': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; enrollmentId: ParamValue }
    }
    'api.v1.students.attendance': { paramsTuple: [ParamValue]; params: { studentId: ParamValue } }
    'api.v1.students.payments': { paramsTuple: [ParamValue]; params: { studentId: ParamValue } }
    'api.v1.students.balance': { paramsTuple: [ParamValue]; params: { studentId: ParamValue } }
    'api.v1.students.balance_transactions': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsibles.list_by_student': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsibles.assign': { paramsTuple?: []; params?: {} }
    'api.v1.responsibles.update_assignment': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.responsibles.remove': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.responsible_addresses.show': {
      paramsTuple: [ParamValue]
      params: { responsibleId: ParamValue }
    }
    'api.v1.responsible_addresses.create': { paramsTuple?: []; params?: {} }
    'api.v1.contracts.index': { paramsTuple?: []; params?: {} }
    'api.v1.contracts.store': { paramsTuple?: []; params?: {} }
    'api.v1.contracts.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.contracts.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.contracts.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.contracts.get_signature_stats': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.get_docuseal_template': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.upload_docuseal_template': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.delete_docuseal_template': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.payment_days.index': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.payment_days.store': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.payment_days.destroy': {
      paramsTuple: [ParamValue, ParamValue]
      params: { contractId: ParamValue; id: ParamValue }
    }
    'api.v1.contracts.interest_config.show': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.interest_config.update': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.early_discounts.index': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.early_discounts.store': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.early_discounts.update': {
      paramsTuple: [ParamValue, ParamValue]
      params: { contractId: ParamValue; id: ParamValue }
    }
    'api.v1.contracts.early_discounts.destroy': {
      paramsTuple: [ParamValue, ParamValue]
      params: { contractId: ParamValue; id: ParamValue }
    }
    'api.v1.contract_documents.index': { paramsTuple?: []; params?: {} }
    'api.v1.contract_documents.store': { paramsTuple?: []; params?: {} }
    'api.v1.courses.index': { paramsTuple?: []; params?: {} }
    'api.v1.courses.store': { paramsTuple?: []; params?: {} }
    'api.v1.courses.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.courses.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.courses.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.courses.dashboard.metrics': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.courses.dashboard.alerts': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.courses.dashboard.activity_feed': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.courses.classes': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.levels.index': { paramsTuple?: []; params?: {} }
    'api.v1.levels.store': { paramsTuple?: []; params?: {} }
    'api.v1.levels.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.levels.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.levels.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.course_has_academic_periods.store': { paramsTuple?: []; params?: {} }
    'api.v1.level_assignments.store': { paramsTuple?: []; params?: {} }
    'api.v1.classes.index': { paramsTuple?: []; params?: {} }
    'api.v1.classes.store': { paramsTuple?: []; params?: {} }
    'api.v1.classes.store_with_teachers': { paramsTuple?: []; params?: {} }
    'api.v1.classes.show_by_slug': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'api.v1.classes.sidebar': { paramsTuple?: []; params?: {} }
    'api.v1.classes.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.update_with_teachers': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.students': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.students_count': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.student_status': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.subjects': { paramsTuple: [ParamValue]; params: { classId: ParamValue } }
    'api.v1.subjects.index': { paramsTuple?: []; params?: {} }
    'api.v1.subjects.store': { paramsTuple?: []; params?: {} }
    'api.v1.subjects.show_by_slug': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'api.v1.subjects.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subjects.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subjects.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schedules.get_class_schedule': {
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
    }
    'api.v1.schedules.save_class_schedule': {
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
    }
    'api.v1.schedules.generate_class_schedule': {
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
    }
    'api.v1.schedules.validate_conflict': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.list_teachers': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.create_teacher': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.get_teachers_timesheet': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.get_teacher_absences': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.approve_absence': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.reject_absence': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.show_teacher': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.teachers.update_teacher': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.teachers.delete_teacher': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.teachers.list_teacher_classes': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.teachers.list_teacher_subjects': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.teachers.update_teacher_subjects': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.teachers.assign_class': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.teachers.remove_class': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; classId: ParamValue }
    }
    'api.v1.exams.index': { paramsTuple?: []; params?: {} }
    'api.v1.exams.store': { paramsTuple?: []; params?: {} }
    'api.v1.exams.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.batch_save_grades': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.grades': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.grades.store': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.update_grade': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; gradeId: ParamValue }
    }
    'api.v1.grades.academic_overview': { paramsTuple?: []; params?: {} }
    'api.v1.grades.students': { paramsTuple?: []; params?: {} }
    'api.v1.grades.distribution': { paramsTuple?: []; params?: {} }
    'api.v1.grades.at_risk': { paramsTuple?: []; params?: {} }
    'api.v1.grades.class_subject': {
      paramsTuple: [ParamValue, ParamValue]
      params: { classId: ParamValue; subjectId: ParamValue }
    }
    'api.v1.grades.batch_save': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.attendance.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.attendance.trends': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.attendance.chronic': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.canteen.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.canteen.trends': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.canteen.top_items': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.payments.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.funnel': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.trends': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.by_level': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.incidents.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.gamification.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.hr.overview': { paramsTuple?: []; params?: {} }
    'api.v1.events.index': { paramsTuple?: []; params?: {} }
    'api.v1.events.store': { paramsTuple?: []; params?: {} }
    'api.v1.events.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.publish': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.complete': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.participants.index': {
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
    }
    'api.v1.events.participants.register': {
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
    }
    'api.v1.events.participants.update_status': {
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; participantId: ParamValue }
    }
    'api.v1.events.participants.cancel': {
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; participantId: ParamValue }
    }
    'api.v1.events.participants.confirm_attendance': {
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; participantId: ParamValue }
    }
    'api.v1.consents.pending': { paramsTuple?: []; params?: {} }
    'api.v1.consents.history': { paramsTuple?: []; params?: {} }
    'api.v1.events.consents.index': { paramsTuple: [ParamValue]; params: { eventId: ParamValue } }
    'api.v1.events.consents.request': { paramsTuple?: []; params?: {} }
    'api.v1.consents.respond': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.enrollment.info': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { schoolSlug: ParamValue; academicPeriodSlug: ParamValue; courseSlug: ParamValue }
    }
    'api.v1.enrollment.check_existing': { paramsTuple?: []; params?: {} }
    'api.v1.enrollment.find_scholarship': { paramsTuple?: []; params?: {} }
    'api.v1.enrollment.finish': { paramsTuple?: []; params?: {} }
    'api.v1.enrollments.index': { paramsTuple?: []; params?: {} }
    'api.v1.enrollments.documents.update_status': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.notifications.index': { paramsTuple?: []; params?: {} }
    'api.v1.notifications.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.notifications.mark_read': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.notifications.mark_all_read': { paramsTuple?: []; params?: {} }
    'api.v1.notifications.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.notification_preferences.show': { paramsTuple?: []; params?: {} }
    'api.v1.notification_preferences.update': { paramsTuple?: []; params?: {} }
    'api.v1.school_announcements.list': { paramsTuple?: []; params?: {} }
    'api.v1.school_announcements.create': { paramsTuple?: []; params?: {} }
    'api.v1.school_announcements.details': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.school_announcements.edit_draft': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_announcements.publish_draft': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.posts.index': { paramsTuple?: []; params?: {} }
    'api.v1.posts.store': { paramsTuple?: []; params?: {} }
    'api.v1.posts.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.like': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.unlike': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.comments.index': { paramsTuple: [ParamValue]; params: { postId: ParamValue } }
    'api.v1.posts.comments.store': { paramsTuple: [ParamValue]; params: { postId: ParamValue } }
    'api.v1.comments.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.comments.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.comments.like': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.index': { paramsTuple?: []; params?: {} }
    'api.v1.extra_classes.store': { paramsTuple?: []; params?: {} }
    'api.v1.extra_classes.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.enroll': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.enroll.cancel': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; enrollmentId: ParamValue }
    }
    'api.v1.extra_classes.students': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.attendance.store': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.extra_classes.attendance.index': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.extra_classes.attendance.update': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; attendanceId: ParamValue }
    }
    'api.v1.extra_classes.attendance.summary': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.attendance.index': { paramsTuple?: []; params?: {} }
    'api.v1.attendance.store': { paramsTuple?: []; params?: {} }
    'api.v1.attendance.batch': { paramsTuple?: []; params?: {} }
    'api.v1.attendance.available_dates': { paramsTuple?: []; params?: {} }
    'api.v1.attendance.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.attendance.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.attendance.class_students': {
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
    }
    'api.v1.assignments.index': { paramsTuple?: []; params?: {} }
    'api.v1.assignments.store': { paramsTuple?: []; params?: {} }
    'api.v1.assignments.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.assignments.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.assignments.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.assignments.submissions': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.assignments.submit': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.assignments.submissions.grade': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; submissionId: ParamValue }
    }
    'api.v1.occurrences.index': { paramsTuple?: []; params?: {} }
    'api.v1.occurrences.store': { paramsTuple?: []; params?: {} }
    'api.v1.occurrences.teacher_classes': { paramsTuple?: []; params?: {} }
    'api.v1.occurrences.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.index': { paramsTuple?: []; params?: {} }
    'api.v1.student_payments.store': { paramsTuple?: []; params?: {} }
    'api.v1.student_payments.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.mark_paid': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.asaas_charge': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.student_payments.send_boleto': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.get_boleto': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.agreements.store': { paramsTuple?: []; params?: {} }
    'api.v1.invoices.index': { paramsTuple?: []; params?: {} }
    'api.v1.invoices.mark_paid': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.audits.index': {
      paramsTuple: [ParamValue, ParamValue]
      params: { entityType: ParamValue; entityId: ParamValue }
    }
    'api.v1.audits.student_history': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.student_balance_transactions.index': { paramsTuple?: []; params?: {} }
    'api.v1.student_balance_transactions.store': { paramsTuple?: []; params?: {} }
    'api.v1.student_balance_transactions.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.student_balance_transactions.by_student': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.student_balance_transactions.balance': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.canteens.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteens.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteens.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteens.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteens.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteens.items': { paramsTuple: [ParamValue]; params: { canteenId: ParamValue } }
    'api.v1.canteen_reports.summary': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_monthly_transfers.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_monthly_transfers.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_monthly_transfers.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_monthly_transfers.update_status': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_items.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_items.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_items.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_items.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_items.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_items.toggle_active': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meals.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meals.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meals.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meals.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meals.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meal_reservations.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meal_reservations.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meal_reservations.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_meal_reservations.update_status': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_meal_reservations.cancel': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_purchases.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_purchases.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_purchases.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_purchases.update_status': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_purchases.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.achievements.index': { paramsTuple?: []; params?: {} }
    'api.v1.achievements.store': { paramsTuple?: []; params?: {} }
    'api.v1.achievements.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.achievements.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.achievements.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.achievements.unlock': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.achievements.config.update': {
      paramsTuple: [ParamValue, ParamValue]
      params: { achievementId: ParamValue; schoolId: ParamValue }
    }
    'api.v1.stores.index': { paramsTuple?: []; params?: {} }
    'api.v1.stores.store': { paramsTuple?: []; params?: {} }
    'api.v1.stores.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.stores.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.stores.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.stores.financial_settings.show': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.stores.financial_settings.upsert': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.store_settlements.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_settlements.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_settlements.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_settlements.update_status': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.store_items.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_items.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_items.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_items.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_items.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_items.toggle_active': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_orders.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_orders.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_orders.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_orders.approve': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_orders.reject': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_orders.deliver': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_orders.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_installment_rules.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_installment_rules.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_installment_rules.update': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.store_installment_rules.destroy': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.store_owner.store.show': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.products.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.products.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.products.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.products.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.products.toggle_active': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.store_owner.orders.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.orders.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.approve': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.reject': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.preparing': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.ready': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.deliver': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.financial.show': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.financial.update': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.settlements.index': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.stores.index': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.stores.items': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.marketplace.stores.context': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.marketplace.installment_options': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.checkout': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.orders.index': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.orders.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_gamifications.index': { paramsTuple?: []; params?: {} }
    'api.v1.student_gamifications.store': { paramsTuple?: []; params?: {} }
    'api.v1.student_gamifications.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_gamifications.add_points': { paramsTuple?: []; params?: {} }
    'api.v1.student_gamifications.ranking': { paramsTuple?: []; params?: {} }
    'api.v1.students.gamification_stats': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.leaderboards.index': { paramsTuple?: []; params?: {} }
    'api.v1.leaderboards.store': { paramsTuple?: []; params?: {} }
    'api.v1.leaderboards.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.leaderboards.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.leaderboards.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.leaderboards.entries': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.gamification_events.index': { paramsTuple?: []; params?: {} }
    'api.v1.gamification_events.store': { paramsTuple?: []; params?: {} }
    'api.v1.gamification_events.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.gamification_events.retry': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.challenges.index': { paramsTuple?: []; params?: {} }
    'api.v1.challenges.store': { paramsTuple?: []; params?: {} }
    'api.v1.challenges.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.challenges.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.challenges.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.scholarships.list_scholarships': { paramsTuple?: []; params?: {} }
    'api.v1.scholarships.create_scholarship': { paramsTuple?: []; params?: {} }
    'api.v1.scholarships.show_scholarship': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.scholarships.update_scholarship': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.scholarships.toggle_scholarship_active': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_partners.list_school_partners': { paramsTuple?: []; params?: {} }
    'api.v1.school_partners.create_school_partner': { paramsTuple?: []; params?: {} }
    'api.v1.school_partners.show_school_partner': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_partners.update_school_partner': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_partners.toggle_school_partner_active': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_chains.list_school_chains': { paramsTuple?: []; params?: {} }
    'api.v1.school_chains.create_school_chain': { paramsTuple?: []; params?: {} }
    'api.v1.school_chains.show_school_chain': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_chains.update_school_chain': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_chains.delete_school_chain': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_groups.list_school_groups': { paramsTuple?: []; params?: {} }
    'api.v1.school_groups.create_school_group': { paramsTuple?: []; params?: {} }
    'api.v1.school_groups.show_school_group': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_groups.update_school_group': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_groups.delete_school_group': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.list_academic_periods': { paramsTuple?: []; params?: {} }
    'api.v1.academic_periods.get_current_active_academic_periods': { paramsTuple?: []; params?: {} }
    'api.v1.academic_periods.show_by_slug': {
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
    }
    'api.v1.academic_periods.show_dashboard_by_slug': {
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
    }
    'api.v1.academic_periods.create_academic_period': { paramsTuple?: []; params?: {} }
    'api.v1.academic_periods.show_academic_period': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.update_academic_period': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.delete_academic_period': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.list_courses': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.update_courses': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.list_print_requests': { paramsTuple?: []; params?: {} }
    'api.v1.print_requests.create_print_request': { paramsTuple?: []; params?: {} }
    'api.v1.print_requests.show_print_request': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.approve_print_request': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.reject_print_request': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.review_print_request': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.mark_print_request_printed': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.platform_settings.show': { paramsTuple?: []; params?: {} }
    'api.v1.platform_settings.update': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_plans.index': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_plans.store': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_plans.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscription_plans.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscription_plans.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscriptions.index': { paramsTuple?: []; params?: {} }
    'api.v1.subscriptions.store': { paramsTuple?: []; params?: {} }
    'api.v1.subscriptions.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscriptions.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscriptions.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscriptions.pause': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscriptions.reactivate': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.subscription': { paramsTuple: [ParamValue]; params: { schoolId: ParamValue } }
    'api.v1.school_chains.subscription': {
      paramsTuple: [ParamValue]
      params: { schoolChainId: ParamValue }
    }
    'api.v1.subscription_invoices.index': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_invoices.store': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_invoices.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscription_invoices.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscription_invoices.mark_paid': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_usage_metrics.show': { paramsTuple?: []; params?: {} }
    'api.v1.purchase_requests.index': { paramsTuple?: []; params?: {} }
    'api.v1.purchase_requests.store': { paramsTuple?: []; params?: {} }
    'api.v1.purchase_requests.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.purchase_requests.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.purchase_requests.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.purchase_requests.approve': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.purchase_requests.reject': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.purchase_requests.mark_bought': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.purchase_requests.mark_arrived': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.insurance.config': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.update_school': {
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
    }
    'api.v1.insurance.update_chain': { paramsTuple: [ParamValue]; params: { chainId: ParamValue } }
    'api.v1.insurance.reset_school': { paramsTuple: [ParamValue]; params: { schoolId: ParamValue } }
    'api.v1.insurance.claims.index': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.claims.approve': {
      paramsTuple: [ParamValue]
      params: { claimId: ParamValue }
    }
    'api.v1.insurance.claims.reject': { paramsTuple: [ParamValue]; params: { claimId: ParamValue } }
    'api.v1.insurance.claims.mark_paid': {
      paramsTuple: [ParamValue]
      params: { claimId: ParamValue }
    }
    'api.v1.insurance.billings.index': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.billings.show': {
      paramsTuple: [ParamValue]
      params: { billingId: ParamValue }
    }
    'api.v1.insurance.stats': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.analytics.default_rate': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.analytics.schools_without': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.school.stats': { paramsTuple: [ParamValue]; params: { schoolId: ParamValue } }
    'api.v1.insurance.school.billings': {
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
    }
    'api.v1.insurance.school.claims': {
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
    }
    'api.v1.impersonation.set': { paramsTuple?: []; params?: {} }
    'api.v1.impersonation.clear': { paramsTuple?: []; params?: {} }
    'api.v1.impersonation.status': { paramsTuple?: []; params?: {} }
    'api.v1.impersonation.config': { paramsTuple?: []; params?: {} }
    'api.v1.admin.schools.onboarding': { paramsTuple?: []; params?: {} }
    'api.v1.admin.jobs.generate_missing_payments': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: { '*': ParamValue[] } }
    'server-stats.api': { paramsTuple?: []; params?: {} }
    'server-stats.debug.queries': { paramsTuple?: []; params?: {} }
    'server-stats.debug.events': { paramsTuple?: []; params?: {} }
    'server-stats.debug.routes': { paramsTuple?: []; params?: {} }
    'server-stats.debug.logs': { paramsTuple?: []; params?: {} }
    'server-stats.debug.emails': { paramsTuple?: []; params?: {} }
    'server-stats.debug.emailPreview': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.debug.traces': { paramsTuple?: []; params?: {} }
    'server-stats.debug.traceDetail': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.dashboard': { paramsTuple?: []; params?: {} }
    'server-stats.overview': { paramsTuple?: []; params?: {} }
    'server-stats.overview.chart': { paramsTuple?: []; params?: {} }
    'server-stats.requests': { paramsTuple?: []; params?: {} }
    'server-stats.requests.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.queries': { paramsTuple?: []; params?: {} }
    'server-stats.queries.grouped': { paramsTuple?: []; params?: {} }
    'server-stats.queries.explain': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.events': { paramsTuple?: []; params?: {} }
    'server-stats.routes': { paramsTuple?: []; params?: {} }
    'server-stats.logs': { paramsTuple?: []; params?: {} }
    'server-stats.emails': { paramsTuple?: []; params?: {} }
    'server-stats.emails.preview': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.traces': { paramsTuple?: []; params?: {} }
    'server-stats.traces.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.cache': { paramsTuple?: []; params?: {} }
    'server-stats.cache.show': { paramsTuple: [ParamValue]; params: { key: ParamValue } }
    'server-stats.jobs': { paramsTuple?: []; params?: {} }
    'server-stats.jobs.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.config': { paramsTuple?: []; params?: {} }
    'server-stats.filters': { paramsTuple?: []; params?: {} }
    'web.home': { paramsTuple?: []; params?: {} }
    'web.matriculaOnline': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { schoolSlug: ParamValue; academicPeriodSlug: ParamValue; courseSlug: ParamValue }
    }
    'web.agendar': { paramsTuple?: []; params?: {} }
    'web.auth.signIn': { paramsTuple?: []; params?: {} }
    'web.auth.login': { paramsTuple?: []; params?: {} }
    'web.dashboard': { paramsTuple?: []; params?: {} }
    'web.escola.dashboard': { paramsTuple?: []; params?: {} }
    'web.escola.periodosLetivos': { paramsTuple?: []; params?: {} }
    'web.escola.periodosLetivos.show': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'web.escola.administrativo.novoPeriodoLetivo': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.periodosLetivos.editar': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.visaoGeral': {
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas': {
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.atividades': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.provas': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.presencas': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.notas': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.situacao': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.administrativo.alunos': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.alunos.editar': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.alunos.historicoFinanceiro': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.funcionarios': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.professores': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.matriculas': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.matriculas.nova': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.contratos': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.contratos.novo': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.contratos.editar': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.contratos.assinaturas': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.contratos.docuseal': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.contratos.financeiro': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'web.escola.administrativo.bolsas': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.parceiros': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.materias': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.folhaDePonto': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.impressao': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.solicitacoesDeCompra': { paramsTuple?: []; params?: {} }
    'web.escola.notificacoes': { paramsTuple?: []; params?: {} }
    'web.escola.notificacoes.preferencias': { paramsTuple?: []; params?: {} }
    'web.escola.comunicados': { paramsTuple?: []; params?: {} }
    'web.escola.comunicados.novo': { paramsTuple?: []; params?: {} }
    'web.escola.comunicados.editar': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.eventos': { paramsTuple?: []; params?: {} }
    'web.escola.eventos.novo': { paramsTuple?: []; params?: {} }
    'web.escola.eventos.editar': { paramsTuple: [ParamValue]; params: { eventId: ParamValue } }
    'web.escola.eventos.autorizacoes': {
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
    }
    'web.escola.mural': { paramsTuple?: []; params?: {} }
    'web.escola.desempenho': { paramsTuple?: []; params?: {} }
    'web.escola.matriculas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.turmas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.grade': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.horarios': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.quadro': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.ocorrencias': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.atividades': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.atividades.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.pedagogico.atividades.edit': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.pedagogico.provas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.provas.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.pedagogico.provas.edit': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.pedagogico.presenca': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.aulasAvulsas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.cursosNiveis': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.itens': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.cardapio': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.pdv': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.pedidos': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.vendas': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.reservas': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.transferencias': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.inadimplencia': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.seguros': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.faturas': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.configuracaoPagamentos': { paramsTuple?: []; params?: {} }
    'web.escola.lojas.index': { paramsTuple?: []; params?: {} }
    'web.escola.lojas.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.gamificacao.index': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.rankings': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.conquistas': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.recompensas': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.desafios': { paramsTuple?: []; params?: {} }
    'web.escola.configuracoes': { paramsTuple?: []; params?: {} }
    'web.responsavel.dashboard': { paramsTuple?: []; params?: {} }
    'web.responsavel.notas': { paramsTuple?: []; params?: {} }
    'web.responsavel.frequencia': { paramsTuple?: []; params?: {} }
    'web.responsavel.mensalidades': { paramsTuple?: []; params?: {} }
    'web.responsavel.cantina': { paramsTuple?: []; params?: {} }
    'web.responsavel.gamificacao': { paramsTuple?: []; params?: {} }
    'web.responsavel.gamificacao.details': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'web.responsavel.comunicados': { paramsTuple?: []; params?: {} }
    'web.responsavel.autorizacoes': { paramsTuple?: []; params?: {} }
    'web.responsavel.atividades': { paramsTuple?: []; params?: {} }
    'web.responsavel.horario': { paramsTuple?: []; params?: {} }
    'web.responsavel.documentos': { paramsTuple?: []; params?: {} }
    'web.responsavel.ocorrencias': { paramsTuple?: []; params?: {} }
    'web.responsavel.perfil': { paramsTuple?: []; params?: {} }
    'web.responsavel.notificacoes': { paramsTuple?: []; params?: {} }
    'web.responsavel.credito': { paramsTuple?: []; params?: {} }
    'web.responsavel.loja': { paramsTuple?: []; params?: {} }
    'web.responsavel.loja.store': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.admin.dashboard': { paramsTuple?: []; params?: {} }
    'web.admin.escolas': { paramsTuple?: []; params?: {} }
    'web.admin.escolas.edit': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.admin.escolas.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.admin.onboarding': { paramsTuple?: []; params?: {} }
    'web.admin.billing.dashboard': { paramsTuple?: []; params?: {} }
    'web.admin.billing.faturas': { paramsTuple?: []; params?: {} }
    'web.admin.billing.subscriptions': { paramsTuple?: []; params?: {} }
    'web.admin.redes': { paramsTuple?: []; params?: {} }
    'web.admin.configuracoes': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.index': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.sinistros': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.faturamento': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.analytics': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.configuracao': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.index': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.academico': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.presenca': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.cantina': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.pagamentos': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.matriculas': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.ocorrencias': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.gamificacao': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.rh': { paramsTuple?: []; params?: {} }
    'web.loja.dashboard': { paramsTuple?: []; params?: {} }
    'web.loja.produtos': { paramsTuple?: []; params?: {} }
    'web.loja.pedidos': { paramsTuple?: []; params?: {} }
    'web.loja.financeiro': { paramsTuple?: []; params?: {} }
    'web.aluno.dashboard': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.index': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.carrinho': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.pedidos': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.pontos': { paramsTuple?: []; params?: {} }
    'web.aluno.idle': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.store': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.auth.me': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.escola_stats': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.escola_insights': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.escola_teacher_dashboard': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.responsavel_stats': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.student_grades': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_attendance': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_payments': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_invoices': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_balance': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_canteen_purchases': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_assignments': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_schedule': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_documents': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_occurrences': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_overview': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_gamification': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.notifications': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.comunicados.list': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.comunicados.pending_ack': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.comunicados.details': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.responsavel.api.list_wallet_top_ups': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.show_wallet_top_up': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.dashboard.admin_stats': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.server_stats': { paramsTuple?: []; params?: {} }
    'api.v1.asaas.subaccounts.status': { paramsTuple?: []; params?: {} }
    'api.v1.schools.index': { paramsTuple?: []; params?: {} }
    'api.v1.schools.show_by_slug': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'api.v1.schools.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.users': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.users.index': { paramsTuple?: []; params?: {} }
    'api.v1.users.school_employees': { paramsTuple?: []; params?: {} }
    'api.v1.users.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.user_schools.list_user_schools': { paramsTuple?: []; params?: {} }
    'api.v1.user_school_groups.list_user_school_groups': { paramsTuple?: []; params?: {} }
    'api.v1.school_switcher.get_data': { paramsTuple?: []; params?: {} }
    'api.v1.students.index': { paramsTuple?: []; params?: {} }
    'api.v1.students.check_document': { paramsTuple?: []; params?: {} }
    'api.v1.students.check_email': { paramsTuple?: []; params?: {} }
    'api.v1.students.lookup_responsible': { paramsTuple?: []; params?: {} }
    'api.v1.students.me.avatar.show': { paramsTuple?: []; params?: {} }
    'api.v1.students.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.enrollments.list': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.attendance': { paramsTuple: [ParamValue]; params: { studentId: ParamValue } }
    'api.v1.students.payments': { paramsTuple: [ParamValue]; params: { studentId: ParamValue } }
    'api.v1.students.balance': { paramsTuple: [ParamValue]; params: { studentId: ParamValue } }
    'api.v1.students.balance_transactions': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsibles.list_by_student': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsible_addresses.show': {
      paramsTuple: [ParamValue]
      params: { responsibleId: ParamValue }
    }
    'api.v1.contracts.index': { paramsTuple?: []; params?: {} }
    'api.v1.contracts.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.contracts.get_signature_stats': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.get_docuseal_template': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.payment_days.index': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.interest_config.show': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.early_discounts.index': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contract_documents.index': { paramsTuple?: []; params?: {} }
    'api.v1.courses.index': { paramsTuple?: []; params?: {} }
    'api.v1.courses.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.courses.dashboard.metrics': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.courses.dashboard.alerts': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.courses.dashboard.activity_feed': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.courses.classes': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.levels.index': { paramsTuple?: []; params?: {} }
    'api.v1.levels.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.index': { paramsTuple?: []; params?: {} }
    'api.v1.classes.show_by_slug': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'api.v1.classes.sidebar': { paramsTuple?: []; params?: {} }
    'api.v1.classes.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.students': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.students_count': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.student_status': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.subjects': { paramsTuple: [ParamValue]; params: { classId: ParamValue } }
    'api.v1.subjects.index': { paramsTuple?: []; params?: {} }
    'api.v1.subjects.show_by_slug': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'api.v1.subjects.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schedules.get_class_schedule': {
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
    }
    'api.v1.teachers.list_teachers': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.get_teachers_timesheet': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.get_teacher_absences': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.show_teacher': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.teachers.list_teacher_classes': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.teachers.list_teacher_subjects': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.exams.index': { paramsTuple?: []; params?: {} }
    'api.v1.exams.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.grades': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.grades.academic_overview': { paramsTuple?: []; params?: {} }
    'api.v1.grades.students': { paramsTuple?: []; params?: {} }
    'api.v1.grades.distribution': { paramsTuple?: []; params?: {} }
    'api.v1.grades.at_risk': { paramsTuple?: []; params?: {} }
    'api.v1.grades.class_subject': {
      paramsTuple: [ParamValue, ParamValue]
      params: { classId: ParamValue; subjectId: ParamValue }
    }
    'api.v1.analytics.attendance.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.attendance.trends': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.attendance.chronic': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.canteen.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.canteen.trends': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.canteen.top_items': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.payments.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.funnel': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.trends': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.by_level': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.incidents.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.gamification.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.hr.overview': { paramsTuple?: []; params?: {} }
    'api.v1.events.index': { paramsTuple?: []; params?: {} }
    'api.v1.events.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.participants.index': {
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
    }
    'api.v1.consents.pending': { paramsTuple?: []; params?: {} }
    'api.v1.consents.history': { paramsTuple?: []; params?: {} }
    'api.v1.events.consents.index': { paramsTuple: [ParamValue]; params: { eventId: ParamValue } }
    'api.v1.enrollment.info': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { schoolSlug: ParamValue; academicPeriodSlug: ParamValue; courseSlug: ParamValue }
    }
    'api.v1.enrollments.index': { paramsTuple?: []; params?: {} }
    'api.v1.notifications.index': { paramsTuple?: []; params?: {} }
    'api.v1.notifications.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.notification_preferences.show': { paramsTuple?: []; params?: {} }
    'api.v1.school_announcements.list': { paramsTuple?: []; params?: {} }
    'api.v1.school_announcements.details': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.index': { paramsTuple?: []; params?: {} }
    'api.v1.posts.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.comments.index': { paramsTuple: [ParamValue]; params: { postId: ParamValue } }
    'api.v1.extra_classes.index': { paramsTuple?: []; params?: {} }
    'api.v1.extra_classes.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.students': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.attendance.index': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.extra_classes.attendance.summary': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.attendance.index': { paramsTuple?: []; params?: {} }
    'api.v1.attendance.available_dates': { paramsTuple?: []; params?: {} }
    'api.v1.attendance.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.attendance.class_students': {
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
    }
    'api.v1.assignments.index': { paramsTuple?: []; params?: {} }
    'api.v1.assignments.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.assignments.submissions': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.occurrences.index': { paramsTuple?: []; params?: {} }
    'api.v1.occurrences.teacher_classes': { paramsTuple?: []; params?: {} }
    'api.v1.occurrences.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.index': { paramsTuple?: []; params?: {} }
    'api.v1.student_payments.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.get_boleto': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.invoices.index': { paramsTuple?: []; params?: {} }
    'api.v1.audits.index': {
      paramsTuple: [ParamValue, ParamValue]
      params: { entityType: ParamValue; entityId: ParamValue }
    }
    'api.v1.audits.student_history': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.student_balance_transactions.index': { paramsTuple?: []; params?: {} }
    'api.v1.student_balance_transactions.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.student_balance_transactions.by_student': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.student_balance_transactions.balance': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.canteens.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteens.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteens.items': { paramsTuple: [ParamValue]; params: { canteenId: ParamValue } }
    'api.v1.canteen_reports.summary': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_monthly_transfers.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_monthly_transfers.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_items.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_items.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meals.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meals.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meal_reservations.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meal_reservations.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_purchases.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_purchases.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.achievements.index': { paramsTuple?: []; params?: {} }
    'api.v1.achievements.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.stores.index': { paramsTuple?: []; params?: {} }
    'api.v1.stores.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.stores.financial_settings.show': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.store_settlements.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_settlements.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_items.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_items.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_orders.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_orders.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_installment_rules.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.store.show': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.products.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.orders.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.orders.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.financial.show': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.settlements.index': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.stores.index': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.stores.items': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.marketplace.stores.context': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.marketplace.installment_options': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.orders.index': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.orders.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_gamifications.index': { paramsTuple?: []; params?: {} }
    'api.v1.student_gamifications.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_gamifications.ranking': { paramsTuple?: []; params?: {} }
    'api.v1.students.gamification_stats': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.leaderboards.index': { paramsTuple?: []; params?: {} }
    'api.v1.leaderboards.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.leaderboards.entries': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.gamification_events.index': { paramsTuple?: []; params?: {} }
    'api.v1.gamification_events.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.challenges.index': { paramsTuple?: []; params?: {} }
    'api.v1.challenges.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.scholarships.list_scholarships': { paramsTuple?: []; params?: {} }
    'api.v1.scholarships.show_scholarship': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_partners.list_school_partners': { paramsTuple?: []; params?: {} }
    'api.v1.school_partners.show_school_partner': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_chains.list_school_chains': { paramsTuple?: []; params?: {} }
    'api.v1.school_chains.show_school_chain': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_groups.list_school_groups': { paramsTuple?: []; params?: {} }
    'api.v1.school_groups.show_school_group': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.list_academic_periods': { paramsTuple?: []; params?: {} }
    'api.v1.academic_periods.get_current_active_academic_periods': { paramsTuple?: []; params?: {} }
    'api.v1.academic_periods.show_by_slug': {
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
    }
    'api.v1.academic_periods.show_dashboard_by_slug': {
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
    }
    'api.v1.academic_periods.show_academic_period': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.list_courses': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.list_print_requests': { paramsTuple?: []; params?: {} }
    'api.v1.print_requests.show_print_request': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.platform_settings.show': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_plans.index': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_plans.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscriptions.index': { paramsTuple?: []; params?: {} }
    'api.v1.subscriptions.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.subscription': { paramsTuple: [ParamValue]; params: { schoolId: ParamValue } }
    'api.v1.school_chains.subscription': {
      paramsTuple: [ParamValue]
      params: { schoolChainId: ParamValue }
    }
    'api.v1.subscription_invoices.index': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_invoices.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.school_usage_metrics.show': { paramsTuple?: []; params?: {} }
    'api.v1.purchase_requests.index': { paramsTuple?: []; params?: {} }
    'api.v1.purchase_requests.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.insurance.config': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.claims.index': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.billings.index': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.billings.show': {
      paramsTuple: [ParamValue]
      params: { billingId: ParamValue }
    }
    'api.v1.insurance.stats': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.analytics.default_rate': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.analytics.schools_without': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.school.stats': { paramsTuple: [ParamValue]; params: { schoolId: ParamValue } }
    'api.v1.insurance.school.billings': {
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
    }
    'api.v1.insurance.school.claims': {
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
    }
    'api.v1.impersonation.status': { paramsTuple?: []; params?: {} }
    'api.v1.impersonation.config': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: { '*': ParamValue[] } }
    'server-stats.api': { paramsTuple?: []; params?: {} }
    'server-stats.debug.queries': { paramsTuple?: []; params?: {} }
    'server-stats.debug.events': { paramsTuple?: []; params?: {} }
    'server-stats.debug.routes': { paramsTuple?: []; params?: {} }
    'server-stats.debug.logs': { paramsTuple?: []; params?: {} }
    'server-stats.debug.emails': { paramsTuple?: []; params?: {} }
    'server-stats.debug.emailPreview': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.debug.traces': { paramsTuple?: []; params?: {} }
    'server-stats.debug.traceDetail': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.dashboard': { paramsTuple?: []; params?: {} }
    'server-stats.overview': { paramsTuple?: []; params?: {} }
    'server-stats.overview.chart': { paramsTuple?: []; params?: {} }
    'server-stats.requests': { paramsTuple?: []; params?: {} }
    'server-stats.requests.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.queries': { paramsTuple?: []; params?: {} }
    'server-stats.queries.grouped': { paramsTuple?: []; params?: {} }
    'server-stats.queries.explain': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.events': { paramsTuple?: []; params?: {} }
    'server-stats.routes': { paramsTuple?: []; params?: {} }
    'server-stats.logs': { paramsTuple?: []; params?: {} }
    'server-stats.emails': { paramsTuple?: []; params?: {} }
    'server-stats.emails.preview': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.traces': { paramsTuple?: []; params?: {} }
    'server-stats.traces.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.cache': { paramsTuple?: []; params?: {} }
    'server-stats.cache.show': { paramsTuple: [ParamValue]; params: { key: ParamValue } }
    'server-stats.jobs': { paramsTuple?: []; params?: {} }
    'server-stats.jobs.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.config': { paramsTuple?: []; params?: {} }
    'server-stats.filters': { paramsTuple?: []; params?: {} }
    'web.home': { paramsTuple?: []; params?: {} }
    'web.matriculaOnline': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { schoolSlug: ParamValue; academicPeriodSlug: ParamValue; courseSlug: ParamValue }
    }
    'web.agendar': { paramsTuple?: []; params?: {} }
    'web.auth.signIn': { paramsTuple?: []; params?: {} }
    'web.auth.login': { paramsTuple?: []; params?: {} }
    'web.dashboard': { paramsTuple?: []; params?: {} }
    'web.escola.dashboard': { paramsTuple?: []; params?: {} }
    'web.escola.periodosLetivos': { paramsTuple?: []; params?: {} }
    'web.escola.periodosLetivos.show': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'web.escola.administrativo.novoPeriodoLetivo': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.periodosLetivos.editar': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.visaoGeral': {
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas': {
      paramsTuple: [ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.atividades': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.provas': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.presencas': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.notas': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.periodosLetivos.cursos.turmas.situacao': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { slug: ParamValue; cursoSlug: ParamValue; turmaSlug: ParamValue }
    }
    'web.escola.administrativo.alunos': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.alunos.editar': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.alunos.historicoFinanceiro': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.funcionarios': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.professores': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.matriculas': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.matriculas.nova': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.contratos': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.contratos.novo': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.contratos.editar': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.contratos.assinaturas': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.contratos.docuseal': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.administrativo.contratos.financeiro': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'web.escola.administrativo.bolsas': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.parceiros': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.materias': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.folhaDePonto': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.impressao': { paramsTuple?: []; params?: {} }
    'web.escola.administrativo.solicitacoesDeCompra': { paramsTuple?: []; params?: {} }
    'web.escola.notificacoes': { paramsTuple?: []; params?: {} }
    'web.escola.notificacoes.preferencias': { paramsTuple?: []; params?: {} }
    'web.escola.comunicados': { paramsTuple?: []; params?: {} }
    'web.escola.comunicados.novo': { paramsTuple?: []; params?: {} }
    'web.escola.comunicados.editar': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.eventos': { paramsTuple?: []; params?: {} }
    'web.escola.eventos.novo': { paramsTuple?: []; params?: {} }
    'web.escola.eventos.editar': { paramsTuple: [ParamValue]; params: { eventId: ParamValue } }
    'web.escola.eventos.autorizacoes': {
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
    }
    'web.escola.mural': { paramsTuple?: []; params?: {} }
    'web.escola.desempenho': { paramsTuple?: []; params?: {} }
    'web.escola.matriculas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.turmas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.grade': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.horarios': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.quadro': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.ocorrencias': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.atividades': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.atividades.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.pedagogico.atividades.edit': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'web.escola.pedagogico.provas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.provas.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.pedagogico.provas.edit': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.pedagogico.presenca': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.aulasAvulsas': { paramsTuple?: []; params?: {} }
    'web.escola.pedagogico.cursosNiveis': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.itens': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.cardapio': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.pdv': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.pedidos': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.vendas': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.reservas': { paramsTuple?: []; params?: {} }
    'web.escola.cantina.transferencias': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.inadimplencia': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.seguros': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.faturas': { paramsTuple?: []; params?: {} }
    'web.escola.financeiro.configuracaoPagamentos': { paramsTuple?: []; params?: {} }
    'web.escola.lojas.index': { paramsTuple?: []; params?: {} }
    'web.escola.lojas.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.escola.gamificacao.index': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.rankings': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.conquistas': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.recompensas': { paramsTuple?: []; params?: {} }
    'web.escola.gamificacao.desafios': { paramsTuple?: []; params?: {} }
    'web.escola.configuracoes': { paramsTuple?: []; params?: {} }
    'web.responsavel.dashboard': { paramsTuple?: []; params?: {} }
    'web.responsavel.notas': { paramsTuple?: []; params?: {} }
    'web.responsavel.frequencia': { paramsTuple?: []; params?: {} }
    'web.responsavel.mensalidades': { paramsTuple?: []; params?: {} }
    'web.responsavel.cantina': { paramsTuple?: []; params?: {} }
    'web.responsavel.gamificacao': { paramsTuple?: []; params?: {} }
    'web.responsavel.gamificacao.details': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'web.responsavel.comunicados': { paramsTuple?: []; params?: {} }
    'web.responsavel.autorizacoes': { paramsTuple?: []; params?: {} }
    'web.responsavel.atividades': { paramsTuple?: []; params?: {} }
    'web.responsavel.horario': { paramsTuple?: []; params?: {} }
    'web.responsavel.documentos': { paramsTuple?: []; params?: {} }
    'web.responsavel.ocorrencias': { paramsTuple?: []; params?: {} }
    'web.responsavel.perfil': { paramsTuple?: []; params?: {} }
    'web.responsavel.notificacoes': { paramsTuple?: []; params?: {} }
    'web.responsavel.credito': { paramsTuple?: []; params?: {} }
    'web.responsavel.loja': { paramsTuple?: []; params?: {} }
    'web.responsavel.loja.store': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.admin.dashboard': { paramsTuple?: []; params?: {} }
    'web.admin.escolas': { paramsTuple?: []; params?: {} }
    'web.admin.escolas.edit': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.admin.escolas.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'web.admin.onboarding': { paramsTuple?: []; params?: {} }
    'web.admin.billing.dashboard': { paramsTuple?: []; params?: {} }
    'web.admin.billing.faturas': { paramsTuple?: []; params?: {} }
    'web.admin.billing.subscriptions': { paramsTuple?: []; params?: {} }
    'web.admin.redes': { paramsTuple?: []; params?: {} }
    'web.admin.configuracoes': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.index': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.sinistros': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.faturamento': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.analytics': { paramsTuple?: []; params?: {} }
    'web.admin.seguros.configuracao': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.index': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.academico': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.presenca': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.cantina': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.pagamentos': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.matriculas': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.ocorrencias': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.gamificacao': { paramsTuple?: []; params?: {} }
    'web.admin.analytics.rh': { paramsTuple?: []; params?: {} }
    'web.loja.dashboard': { paramsTuple?: []; params?: {} }
    'web.loja.produtos': { paramsTuple?: []; params?: {} }
    'web.loja.pedidos': { paramsTuple?: []; params?: {} }
    'web.loja.financeiro': { paramsTuple?: []; params?: {} }
    'web.aluno.dashboard': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.index': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.carrinho': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.pedidos': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.pontos': { paramsTuple?: []; params?: {} }
    'web.aluno.idle': { paramsTuple?: []; params?: {} }
    'web.aluno.loja.store': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.auth.me': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.escola_stats': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.escola_insights': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.escola_teacher_dashboard': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.responsavel_stats': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.student_grades': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_attendance': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_payments': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_invoices': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_balance': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_canteen_purchases': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_assignments': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_schedule': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_documents': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_occurrences': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_overview': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.student_gamification': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.notifications': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.comunicados.list': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.comunicados.pending_ack': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.comunicados.details': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.responsavel.api.list_wallet_top_ups': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsavel.api.show_wallet_top_up': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.dashboard.admin_stats': { paramsTuple?: []; params?: {} }
    'api.v1.dashboard.server_stats': { paramsTuple?: []; params?: {} }
    'api.v1.asaas.subaccounts.status': { paramsTuple?: []; params?: {} }
    'api.v1.schools.index': { paramsTuple?: []; params?: {} }
    'api.v1.schools.show_by_slug': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'api.v1.schools.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.users': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.users.index': { paramsTuple?: []; params?: {} }
    'api.v1.users.school_employees': { paramsTuple?: []; params?: {} }
    'api.v1.users.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.user_schools.list_user_schools': { paramsTuple?: []; params?: {} }
    'api.v1.user_school_groups.list_user_school_groups': { paramsTuple?: []; params?: {} }
    'api.v1.school_switcher.get_data': { paramsTuple?: []; params?: {} }
    'api.v1.students.index': { paramsTuple?: []; params?: {} }
    'api.v1.students.check_document': { paramsTuple?: []; params?: {} }
    'api.v1.students.check_email': { paramsTuple?: []; params?: {} }
    'api.v1.students.lookup_responsible': { paramsTuple?: []; params?: {} }
    'api.v1.students.me.avatar.show': { paramsTuple?: []; params?: {} }
    'api.v1.students.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.enrollments.list': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.attendance': { paramsTuple: [ParamValue]; params: { studentId: ParamValue } }
    'api.v1.students.payments': { paramsTuple: [ParamValue]; params: { studentId: ParamValue } }
    'api.v1.students.balance': { paramsTuple: [ParamValue]; params: { studentId: ParamValue } }
    'api.v1.students.balance_transactions': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsibles.list_by_student': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.responsible_addresses.show': {
      paramsTuple: [ParamValue]
      params: { responsibleId: ParamValue }
    }
    'api.v1.contracts.index': { paramsTuple?: []; params?: {} }
    'api.v1.contracts.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.contracts.get_signature_stats': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.get_docuseal_template': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.payment_days.index': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.interest_config.show': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.early_discounts.index': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contract_documents.index': { paramsTuple?: []; params?: {} }
    'api.v1.courses.index': { paramsTuple?: []; params?: {} }
    'api.v1.courses.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.courses.dashboard.metrics': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.courses.dashboard.alerts': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.courses.dashboard.activity_feed': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.courses.classes': {
      paramsTuple: [ParamValue, ParamValue]
      params: { courseId: ParamValue; academicPeriodId: ParamValue }
    }
    'api.v1.levels.index': { paramsTuple?: []; params?: {} }
    'api.v1.levels.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.index': { paramsTuple?: []; params?: {} }
    'api.v1.classes.show_by_slug': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'api.v1.classes.sidebar': { paramsTuple?: []; params?: {} }
    'api.v1.classes.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.students': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.students_count': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.student_status': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.subjects': { paramsTuple: [ParamValue]; params: { classId: ParamValue } }
    'api.v1.subjects.index': { paramsTuple?: []; params?: {} }
    'api.v1.subjects.show_by_slug': { paramsTuple: [ParamValue]; params: { slug: ParamValue } }
    'api.v1.subjects.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schedules.get_class_schedule': {
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
    }
    'api.v1.teachers.list_teachers': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.get_teachers_timesheet': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.get_teacher_absences': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.show_teacher': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.teachers.list_teacher_classes': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.teachers.list_teacher_subjects': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.exams.index': { paramsTuple?: []; params?: {} }
    'api.v1.exams.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.grades': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.grades.academic_overview': { paramsTuple?: []; params?: {} }
    'api.v1.grades.students': { paramsTuple?: []; params?: {} }
    'api.v1.grades.distribution': { paramsTuple?: []; params?: {} }
    'api.v1.grades.at_risk': { paramsTuple?: []; params?: {} }
    'api.v1.grades.class_subject': {
      paramsTuple: [ParamValue, ParamValue]
      params: { classId: ParamValue; subjectId: ParamValue }
    }
    'api.v1.analytics.attendance.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.attendance.trends': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.attendance.chronic': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.canteen.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.canteen.trends': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.canteen.top_items': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.payments.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.funnel': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.trends': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.enrollments.by_level': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.incidents.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.gamification.overview': { paramsTuple?: []; params?: {} }
    'api.v1.analytics.hr.overview': { paramsTuple?: []; params?: {} }
    'api.v1.events.index': { paramsTuple?: []; params?: {} }
    'api.v1.events.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.participants.index': {
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
    }
    'api.v1.consents.pending': { paramsTuple?: []; params?: {} }
    'api.v1.consents.history': { paramsTuple?: []; params?: {} }
    'api.v1.events.consents.index': { paramsTuple: [ParamValue]; params: { eventId: ParamValue } }
    'api.v1.enrollment.info': {
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { schoolSlug: ParamValue; academicPeriodSlug: ParamValue; courseSlug: ParamValue }
    }
    'api.v1.enrollments.index': { paramsTuple?: []; params?: {} }
    'api.v1.notifications.index': { paramsTuple?: []; params?: {} }
    'api.v1.notifications.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.notification_preferences.show': { paramsTuple?: []; params?: {} }
    'api.v1.school_announcements.list': { paramsTuple?: []; params?: {} }
    'api.v1.school_announcements.details': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.index': { paramsTuple?: []; params?: {} }
    'api.v1.posts.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.comments.index': { paramsTuple: [ParamValue]; params: { postId: ParamValue } }
    'api.v1.extra_classes.index': { paramsTuple?: []; params?: {} }
    'api.v1.extra_classes.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.students': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.attendance.index': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.extra_classes.attendance.summary': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.attendance.index': { paramsTuple?: []; params?: {} }
    'api.v1.attendance.available_dates': { paramsTuple?: []; params?: {} }
    'api.v1.attendance.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.attendance.class_students': {
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
    }
    'api.v1.assignments.index': { paramsTuple?: []; params?: {} }
    'api.v1.assignments.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.assignments.submissions': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.occurrences.index': { paramsTuple?: []; params?: {} }
    'api.v1.occurrences.teacher_classes': { paramsTuple?: []; params?: {} }
    'api.v1.occurrences.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.index': { paramsTuple?: []; params?: {} }
    'api.v1.student_payments.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.get_boleto': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.invoices.index': { paramsTuple?: []; params?: {} }
    'api.v1.audits.index': {
      paramsTuple: [ParamValue, ParamValue]
      params: { entityType: ParamValue; entityId: ParamValue }
    }
    'api.v1.audits.student_history': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.student_balance_transactions.index': { paramsTuple?: []; params?: {} }
    'api.v1.student_balance_transactions.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.student_balance_transactions.by_student': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.student_balance_transactions.balance': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.canteens.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteens.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteens.items': { paramsTuple: [ParamValue]; params: { canteenId: ParamValue } }
    'api.v1.canteen_reports.summary': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_monthly_transfers.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_monthly_transfers.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_items.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_items.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meals.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meals.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meal_reservations.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meal_reservations.show': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_purchases.index': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_purchases.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.achievements.index': { paramsTuple?: []; params?: {} }
    'api.v1.achievements.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.stores.index': { paramsTuple?: []; params?: {} }
    'api.v1.stores.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.stores.financial_settings.show': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.store_settlements.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_settlements.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_items.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_items.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_orders.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_orders.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_installment_rules.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.store.show': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.products.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.orders.index': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.orders.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.financial.show': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.settlements.index': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.stores.index': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.stores.items': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.marketplace.stores.context': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.marketplace.installment_options': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.orders.index': { paramsTuple?: []; params?: {} }
    'api.v1.marketplace.orders.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_gamifications.index': { paramsTuple?: []; params?: {} }
    'api.v1.student_gamifications.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_gamifications.ranking': { paramsTuple?: []; params?: {} }
    'api.v1.students.gamification_stats': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.leaderboards.index': { paramsTuple?: []; params?: {} }
    'api.v1.leaderboards.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.leaderboards.entries': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.gamification_events.index': { paramsTuple?: []; params?: {} }
    'api.v1.gamification_events.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.challenges.index': { paramsTuple?: []; params?: {} }
    'api.v1.challenges.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.scholarships.list_scholarships': { paramsTuple?: []; params?: {} }
    'api.v1.scholarships.show_scholarship': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_partners.list_school_partners': { paramsTuple?: []; params?: {} }
    'api.v1.school_partners.show_school_partner': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_chains.list_school_chains': { paramsTuple?: []; params?: {} }
    'api.v1.school_chains.show_school_chain': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_groups.list_school_groups': { paramsTuple?: []; params?: {} }
    'api.v1.school_groups.show_school_group': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.list_academic_periods': { paramsTuple?: []; params?: {} }
    'api.v1.academic_periods.get_current_active_academic_periods': { paramsTuple?: []; params?: {} }
    'api.v1.academic_periods.show_by_slug': {
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
    }
    'api.v1.academic_periods.show_dashboard_by_slug': {
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
    }
    'api.v1.academic_periods.show_academic_period': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.list_courses': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.list_print_requests': { paramsTuple?: []; params?: {} }
    'api.v1.print_requests.show_print_request': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.platform_settings.show': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_plans.index': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_plans.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscriptions.index': { paramsTuple?: []; params?: {} }
    'api.v1.subscriptions.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.subscription': { paramsTuple: [ParamValue]; params: { schoolId: ParamValue } }
    'api.v1.school_chains.subscription': {
      paramsTuple: [ParamValue]
      params: { schoolChainId: ParamValue }
    }
    'api.v1.subscription_invoices.index': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_invoices.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.school_usage_metrics.show': { paramsTuple?: []; params?: {} }
    'api.v1.purchase_requests.index': { paramsTuple?: []; params?: {} }
    'api.v1.purchase_requests.show': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.insurance.config': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.claims.index': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.billings.index': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.billings.show': {
      paramsTuple: [ParamValue]
      params: { billingId: ParamValue }
    }
    'api.v1.insurance.stats': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.analytics.default_rate': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.analytics.schools_without': { paramsTuple?: []; params?: {} }
    'api.v1.insurance.school.stats': { paramsTuple: [ParamValue]; params: { schoolId: ParamValue } }
    'api.v1.insurance.school.billings': {
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
    }
    'api.v1.insurance.school.claims': {
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
    }
    'api.v1.impersonation.status': { paramsTuple?: []; params?: {} }
    'api.v1.impersonation.config': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'server-stats.jobs.retry': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'server-stats.filters.create': { paramsTuple?: []; params?: {} }
    'api.v1.auth.login': { paramsTuple?: []; params?: {} }
    'api.v1.auth.send_code': { paramsTuple?: []; params?: {} }
    'api.v1.auth.verify_code': { paramsTuple?: []; params?: {} }
    'api.v1.auth.logout': { paramsTuple?: []; params?: {} }
    'api.v1.responsavel.api.acknowledge_occurrence': {
      paramsTuple: [ParamValue, ParamValue]
      params: { studentId: ParamValue; occurrenceId: ParamValue }
    }
    'api.v1.responsavel.api.comunicados.acknowledge': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.responsavel.api.invoice_checkout': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.responsavel.api.create_wallet_top_up': {
      paramsTuple: [ParamValue]
      params: { studentId: ParamValue }
    }
    'api.v1.asaas.webhook': { paramsTuple?: []; params?: {} }
    'api.v1.asaas.subaccounts.create': { paramsTuple?: []; params?: {} }
    'api.v1.schools.store': { paramsTuple?: []; params?: {} }
    'api.v1.schools.upload_logo': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.users.store': { paramsTuple?: []; params?: {} }
    'api.v1.user_schools.create_user_school': { paramsTuple?: []; params?: {} }
    'api.v1.user_school_groups.create_user_school_group': { paramsTuple?: []; params?: {} }
    'api.v1.school_switcher.toggle_school': { paramsTuple?: []; params?: {} }
    'api.v1.school_switcher.toggle_group': { paramsTuple?: []; params?: {} }
    'api.v1.students.store': { paramsTuple?: []; params?: {} }
    'api.v1.students.enroll': { paramsTuple?: []; params?: {} }
    'api.v1.students.me.avatar.purchase': { paramsTuple?: []; params?: {} }
    'api.v1.responsibles.assign': { paramsTuple?: []; params?: {} }
    'api.v1.responsible_addresses.create': { paramsTuple?: []; params?: {} }
    'api.v1.contracts.store': { paramsTuple?: []; params?: {} }
    'api.v1.contracts.upload_docuseal_template': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.payment_days.store': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.early_discounts.store': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contract_documents.store': { paramsTuple?: []; params?: {} }
    'api.v1.courses.store': { paramsTuple?: []; params?: {} }
    'api.v1.levels.store': { paramsTuple?: []; params?: {} }
    'api.v1.course_has_academic_periods.store': { paramsTuple?: []; params?: {} }
    'api.v1.level_assignments.store': { paramsTuple?: []; params?: {} }
    'api.v1.classes.store': { paramsTuple?: []; params?: {} }
    'api.v1.classes.store_with_teachers': { paramsTuple?: []; params?: {} }
    'api.v1.subjects.store': { paramsTuple?: []; params?: {} }
    'api.v1.schedules.save_class_schedule': {
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
    }
    'api.v1.schedules.generate_class_schedule': {
      paramsTuple: [ParamValue]
      params: { classId: ParamValue }
    }
    'api.v1.schedules.validate_conflict': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.create_teacher': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.assign_class': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.store': { paramsTuple?: []; params?: {} }
    'api.v1.exams.batch_save_grades': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.grades.store': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.grades.batch_save': { paramsTuple?: []; params?: {} }
    'api.v1.events.store': { paramsTuple?: []; params?: {} }
    'api.v1.events.publish': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.complete': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.participants.register': {
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
    }
    'api.v1.events.participants.confirm_attendance': {
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; participantId: ParamValue }
    }
    'api.v1.events.consents.request': { paramsTuple?: []; params?: {} }
    'api.v1.consents.respond': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.enrollment.check_existing': { paramsTuple?: []; params?: {} }
    'api.v1.enrollment.find_scholarship': { paramsTuple?: []; params?: {} }
    'api.v1.enrollment.finish': { paramsTuple?: []; params?: {} }
    'api.v1.notifications.mark_read': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.notifications.mark_all_read': { paramsTuple?: []; params?: {} }
    'api.v1.school_announcements.create': { paramsTuple?: []; params?: {} }
    'api.v1.school_announcements.publish_draft': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.posts.store': { paramsTuple?: []; params?: {} }
    'api.v1.posts.like': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.unlike': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.comments.store': { paramsTuple: [ParamValue]; params: { postId: ParamValue } }
    'api.v1.comments.like': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.store': { paramsTuple?: []; params?: {} }
    'api.v1.extra_classes.enroll': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.enroll.cancel': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; enrollmentId: ParamValue }
    }
    'api.v1.extra_classes.attendance.store': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.attendance.store': { paramsTuple?: []; params?: {} }
    'api.v1.attendance.batch': { paramsTuple?: []; params?: {} }
    'api.v1.assignments.store': { paramsTuple?: []; params?: {} }
    'api.v1.assignments.submit': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.assignments.submissions.grade': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; submissionId: ParamValue }
    }
    'api.v1.occurrences.store': { paramsTuple?: []; params?: {} }
    'api.v1.student_payments.store': { paramsTuple?: []; params?: {} }
    'api.v1.student_payments.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.mark_paid': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.asaas_charge': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.student_payments.send_boleto': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.agreements.store': { paramsTuple?: []; params?: {} }
    'api.v1.invoices.mark_paid': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_balance_transactions.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteens.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_monthly_transfers.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_monthly_transfers.update_status': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_items.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meals.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meal_reservations.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_meal_reservations.update_status': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_purchases.store': { paramsTuple?: []; params?: {} }
    'api.v1.canteen_purchases.update_status': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_purchases.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.achievements.store': { paramsTuple?: []; params?: {} }
    'api.v1.achievements.unlock': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.stores.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_settlements.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_items.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_orders.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_orders.approve': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_orders.reject': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_orders.deliver': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_orders.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_installment_rules.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.products.store': { paramsTuple?: []; params?: {} }
    'api.v1.store_owner.orders.approve': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.reject': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.preparing': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.ready': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.deliver': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.orders.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.marketplace.checkout': { paramsTuple?: []; params?: {} }
    'api.v1.student_gamifications.store': { paramsTuple?: []; params?: {} }
    'api.v1.student_gamifications.add_points': { paramsTuple?: []; params?: {} }
    'api.v1.leaderboards.store': { paramsTuple?: []; params?: {} }
    'api.v1.gamification_events.store': { paramsTuple?: []; params?: {} }
    'api.v1.gamification_events.retry': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.challenges.store': { paramsTuple?: []; params?: {} }
    'api.v1.scholarships.create_scholarship': { paramsTuple?: []; params?: {} }
    'api.v1.school_partners.create_school_partner': { paramsTuple?: []; params?: {} }
    'api.v1.school_chains.create_school_chain': { paramsTuple?: []; params?: {} }
    'api.v1.school_groups.create_school_group': { paramsTuple?: []; params?: {} }
    'api.v1.academic_periods.create_academic_period': { paramsTuple?: []; params?: {} }
    'api.v1.print_requests.create_print_request': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_plans.store': { paramsTuple?: []; params?: {} }
    'api.v1.subscriptions.store': { paramsTuple?: []; params?: {} }
    'api.v1.subscriptions.cancel': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscriptions.pause': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscriptions.reactivate': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscription_invoices.store': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_invoices.mark_paid': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.purchase_requests.store': { paramsTuple?: []; params?: {} }
    'api.v1.purchase_requests.approve': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.purchase_requests.reject': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.purchase_requests.mark_bought': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.purchase_requests.mark_arrived': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.insurance.reset_school': { paramsTuple: [ParamValue]; params: { schoolId: ParamValue } }
    'api.v1.insurance.claims.approve': {
      paramsTuple: [ParamValue]
      params: { claimId: ParamValue }
    }
    'api.v1.insurance.claims.reject': { paramsTuple: [ParamValue]; params: { claimId: ParamValue } }
    'api.v1.insurance.claims.mark_paid': {
      paramsTuple: [ParamValue]
      params: { claimId: ParamValue }
    }
    'api.v1.impersonation.set': { paramsTuple?: []; params?: {} }
    'api.v1.admin.schools.onboarding': { paramsTuple?: []; params?: {} }
    'api.v1.admin.jobs.generate_missing_payments': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'server-stats.filters.delete': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.users.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.user_schools.delete_user_school': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.user_school_groups.delete_user_school_group': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.students.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.enrollments.cancel': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; enrollmentId: ParamValue }
    }
    'api.v1.responsibles.remove': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.contracts.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.contracts.delete_docuseal_template': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.payment_days.destroy': {
      paramsTuple: [ParamValue, ParamValue]
      params: { contractId: ParamValue; id: ParamValue }
    }
    'api.v1.contracts.early_discounts.destroy': {
      paramsTuple: [ParamValue, ParamValue]
      params: { contractId: ParamValue; id: ParamValue }
    }
    'api.v1.courses.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.levels.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subjects.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.teachers.delete_teacher': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.teachers.remove_class': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; classId: ParamValue }
    }
    'api.v1.exams.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.events.participants.cancel': {
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; participantId: ParamValue }
    }
    'api.v1.notifications.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.posts.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.comments.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.assignments.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteens.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_items.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meals.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meal_reservations.cancel': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.achievements.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.stores.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_items.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_installment_rules.destroy': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.store_owner.products.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.leaderboards.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.challenges.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.school_chains.delete_school_chain': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_groups.delete_school_group': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.delete_academic_period': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.subscription_plans.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.purchase_requests.destroy': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.impersonation.clear': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'api.v1.responsavel.api.update_profile': { paramsTuple?: []; params?: {} }
    'api.v1.schools.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.schools.update_director': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.users.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.user_schools.update_user_school': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.students.me.avatar.update': { paramsTuple?: []; params?: {} }
    'api.v1.students.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.students.full_update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.contracts.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.contracts.interest_config.update': {
      paramsTuple: [ParamValue]
      params: { contractId: ParamValue }
    }
    'api.v1.contracts.early_discounts.update': {
      paramsTuple: [ParamValue, ParamValue]
      params: { contractId: ParamValue; id: ParamValue }
    }
    'api.v1.courses.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.levels.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.classes.update_with_teachers': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subjects.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.teachers.update_teacher': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.teachers.update_teacher_subjects': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.exams.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.exams.update_grade': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; gradeId: ParamValue }
    }
    'api.v1.events.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.notification_preferences.update': { paramsTuple?: []; params?: {} }
    'api.v1.school_announcements.edit_draft': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.posts.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.comments.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.extra_classes.attendance.update': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; attendanceId: ParamValue }
    }
    'api.v1.attendance.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.assignments.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.student_payments.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteens.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_items.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.canteen_meals.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.achievements.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.achievements.config.update': {
      paramsTuple: [ParamValue, ParamValue]
      params: { achievementId: ParamValue; schoolId: ParamValue }
    }
    'api.v1.stores.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.stores.financial_settings.upsert': {
      paramsTuple: [ParamValue]
      params: { storeId: ParamValue }
    }
    'api.v1.store_items.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_installment_rules.update': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.store_owner.products.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.financial.update': { paramsTuple?: []; params?: {} }
    'api.v1.leaderboards.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.challenges.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.scholarships.update_scholarship': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_partners.update_school_partner': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_chains.update_school_chain': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_groups.update_school_group': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.update_academic_period': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.academic_periods.update_courses': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.platform_settings.update': { paramsTuple?: []; params?: {} }
    'api.v1.subscription_plans.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscriptions.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.subscription_invoices.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.purchase_requests.update': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.insurance.update_school': {
      paramsTuple: [ParamValue]
      params: { schoolId: ParamValue }
    }
    'api.v1.insurance.update_chain': { paramsTuple: [ParamValue]; params: { chainId: ParamValue } }
  }
  PATCH: {
    'api.v1.students.enrollments.update': {
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; enrollmentId: ParamValue }
    }
    'api.v1.responsibles.update_assignment': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.teachers.approve_absence': { paramsTuple?: []; params?: {} }
    'api.v1.teachers.reject_absence': { paramsTuple?: []; params?: {} }
    'api.v1.events.participants.update_status': {
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; participantId: ParamValue }
    }
    'api.v1.enrollments.documents.update_status': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.canteen_items.toggle_active': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_settlements.update_status': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.store_items.toggle_active': { paramsTuple: [ParamValue]; params: { id: ParamValue } }
    'api.v1.store_owner.products.toggle_active': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.scholarships.toggle_scholarship_active': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.school_partners.toggle_school_partner_active': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.approve_print_request': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.reject_print_request': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.review_print_request': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
    'api.v1.print_requests.mark_print_request_printed': {
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
    }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}
