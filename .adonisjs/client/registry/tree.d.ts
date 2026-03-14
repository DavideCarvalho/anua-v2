/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  serverStats: {
    api: typeof routes['server-stats.api']
    debug: {
      config: typeof routes['server-stats.debug.config']
      diagnostics: typeof routes['server-stats.debug.diagnostics']
      queries: typeof routes['server-stats.debug.queries']
      events: typeof routes['server-stats.debug.events']
      routes: typeof routes['server-stats.debug.routes']
      logs: typeof routes['server-stats.debug.logs']
      emails: typeof routes['server-stats.debug.emails']
      emailPreview: typeof routes['server-stats.debug.emailPreview']
      traces: typeof routes['server-stats.debug.traces']
      traceDetail: typeof routes['server-stats.debug.traceDetail']
    }
    dashboard: typeof routes['server-stats.dashboard']
    overview: typeof routes['server-stats.overview'] & {
      chart: typeof routes['server-stats.overview.chart']
    }
    requests: typeof routes['server-stats.requests'] & {
      show: typeof routes['server-stats.requests.show']
    }
    queries: typeof routes['server-stats.queries'] & {
      grouped: typeof routes['server-stats.queries.grouped']
      explain: typeof routes['server-stats.queries.explain']
    }
    events: typeof routes['server-stats.events']
    routes: typeof routes['server-stats.routes']
    logs: typeof routes['server-stats.logs']
    emails: typeof routes['server-stats.emails'] & {
      preview: typeof routes['server-stats.emails.preview']
    }
    traces: typeof routes['server-stats.traces'] & {
      show: typeof routes['server-stats.traces.show']
    }
    cache: typeof routes['server-stats.cache'] & {
      show: typeof routes['server-stats.cache.show']
      delete: typeof routes['server-stats.cache.delete']
    }
    jobs: typeof routes['server-stats.jobs'] & {
      show: typeof routes['server-stats.jobs.show']
      retry: typeof routes['server-stats.jobs.retry']
    }
    config: typeof routes['server-stats.config']
    filters: typeof routes['server-stats.filters'] & {
      create: typeof routes['server-stats.filters.create']
      delete: typeof routes['server-stats.filters.delete']
    }
  }
  web: {
    home: typeof routes['web.home']
    matriculaOnline: typeof routes['web.matriculaOnline']
    agendar: typeof routes['web.agendar']
    auth: {
      signIn: typeof routes['web.auth.signIn']
      login: typeof routes['web.auth.login']
    }
    dashboard: typeof routes['web.dashboard']
    escola: {
      dashboard: typeof routes['web.escola.dashboard']
      periodosLetivos: typeof routes['web.escola.periodosLetivos'] & {
        show: typeof routes['web.escola.periodosLetivos.show']
        cursos: {
          visaoGeral: typeof routes['web.escola.periodosLetivos.cursos.visaoGeral']
          turmas: typeof routes['web.escola.periodosLetivos.cursos.turmas'] & {
            atividades: typeof routes['web.escola.periodosLetivos.cursos.turmas.atividades']
            provas: typeof routes['web.escola.periodosLetivos.cursos.turmas.provas']
            presencas: typeof routes['web.escola.periodosLetivos.cursos.turmas.presencas']
            notas: typeof routes['web.escola.periodosLetivos.cursos.turmas.notas']
            situacao: typeof routes['web.escola.periodosLetivos.cursos.turmas.situacao']
          }
        }
      }
      administrativo: {
        novoPeriodoLetivo: typeof routes['web.escola.administrativo.novoPeriodoLetivo']
        periodosLetivos: {
          editar: typeof routes['web.escola.administrativo.periodosLetivos.editar']
        }
        alunos: typeof routes['web.escola.administrativo.alunos'] & {
          editar: typeof routes['web.escola.administrativo.alunos.editar']
          historicoFinanceiro: typeof routes['web.escola.administrativo.alunos.historicoFinanceiro']
        }
        funcionarios: typeof routes['web.escola.administrativo.funcionarios']
        professores: typeof routes['web.escola.administrativo.professores']
        matriculas: typeof routes['web.escola.administrativo.matriculas'] & {
          nova: typeof routes['web.escola.administrativo.matriculas.nova']
        }
        contratos: typeof routes['web.escola.administrativo.contratos'] & {
          novo: typeof routes['web.escola.administrativo.contratos.novo']
          editar: typeof routes['web.escola.administrativo.contratos.editar']
          assinaturas: typeof routes['web.escola.administrativo.contratos.assinaturas']
          docuseal: typeof routes['web.escola.administrativo.contratos.docuseal']
          financeiro: typeof routes['web.escola.administrativo.contratos.financeiro']
        }
        bolsas: typeof routes['web.escola.administrativo.bolsas']
        parceiros: typeof routes['web.escola.administrativo.parceiros']
        materias: typeof routes['web.escola.administrativo.materias']
        folhaDePonto: typeof routes['web.escola.administrativo.folhaDePonto']
        impressao: typeof routes['web.escola.administrativo.impressao']
        solicitacoesDeCompra: typeof routes['web.escola.administrativo.solicitacoesDeCompra']
      }
      notificacoes: typeof routes['web.escola.notificacoes'] & {
        preferencias: typeof routes['web.escola.notificacoes.preferencias']
      }
      comunicados: typeof routes['web.escola.comunicados'] & {
        novo: typeof routes['web.escola.comunicados.novo']
        editar: typeof routes['web.escola.comunicados.editar']
      }
      eventos: typeof routes['web.escola.eventos'] & {
        novo: typeof routes['web.escola.eventos.novo']
        editar: typeof routes['web.escola.eventos.editar']
        autorizacoes: typeof routes['web.escola.eventos.autorizacoes']
      }
      mural: typeof routes['web.escola.mural']
      desempenho: typeof routes['web.escola.desempenho']
      matriculas: typeof routes['web.escola.matriculas']
      pedagogico: {
        turmas: typeof routes['web.escola.pedagogico.turmas']
        grade: typeof routes['web.escola.pedagogico.grade']
        horarios: typeof routes['web.escola.pedagogico.horarios']
        quadro: typeof routes['web.escola.pedagogico.quadro']
        ocorrencias: typeof routes['web.escola.pedagogico.ocorrencias']
        atividades: typeof routes['web.escola.pedagogico.atividades'] & {
          show: typeof routes['web.escola.pedagogico.atividades.show']
          edit: typeof routes['web.escola.pedagogico.atividades.edit']
        }
        provas: typeof routes['web.escola.pedagogico.provas'] & {
          show: typeof routes['web.escola.pedagogico.provas.show']
          edit: typeof routes['web.escola.pedagogico.provas.edit']
        }
        presenca: typeof routes['web.escola.pedagogico.presenca']
        aulasAvulsas: typeof routes['web.escola.pedagogico.aulasAvulsas']
        calendario: typeof routes['web.escola.pedagogico.calendario']
        cursosNiveis: typeof routes['web.escola.pedagogico.cursosNiveis']
      }
      cantina: {
        itens: typeof routes['web.escola.cantina.itens']
        cardapio: typeof routes['web.escola.cantina.cardapio']
        pdv: typeof routes['web.escola.cantina.pdv']
        pedidos: typeof routes['web.escola.cantina.pedidos']
        vendas: typeof routes['web.escola.cantina.vendas']
        reservas: typeof routes['web.escola.cantina.reservas']
        transferencias: typeof routes['web.escola.cantina.transferencias']
      }
      financeiro: {
        inadimplencia: typeof routes['web.escola.financeiro.inadimplencia']
        seguros: typeof routes['web.escola.financeiro.seguros']
        faturas: typeof routes['web.escola.financeiro.faturas']
        configuracaoPagamentos: typeof routes['web.escola.financeiro.configuracaoPagamentos']
      }
      lojas: {
        index: typeof routes['web.escola.lojas.index']
        show: typeof routes['web.escola.lojas.show']
      }
      gamificacao: {
        index: typeof routes['web.escola.gamificacao.index']
        rankings: typeof routes['web.escola.gamificacao.rankings']
        conquistas: typeof routes['web.escola.gamificacao.conquistas']
        recompensas: typeof routes['web.escola.gamificacao.recompensas']
        desafios: typeof routes['web.escola.gamificacao.desafios']
      }
      configuracoes: typeof routes['web.escola.configuracoes']
    }
    responsavel: {
      dashboard: typeof routes['web.responsavel.dashboard']
      notas: typeof routes['web.responsavel.notas']
      frequencia: typeof routes['web.responsavel.frequencia']
      mensalidades: typeof routes['web.responsavel.mensalidades']
      cantina: typeof routes['web.responsavel.cantina']
      gamificacao: typeof routes['web.responsavel.gamificacao'] & {
        details: typeof routes['web.responsavel.gamificacao.details']
      }
      comunicados: typeof routes['web.responsavel.comunicados']
      autorizacoes: typeof routes['web.responsavel.autorizacoes']
      atividades: typeof routes['web.responsavel.atividades']
      horario: typeof routes['web.responsavel.horario']
      documentos: typeof routes['web.responsavel.documentos']
      ocorrencias: typeof routes['web.responsavel.ocorrencias']
      perfil: typeof routes['web.responsavel.perfil']
      notificacoes: typeof routes['web.responsavel.notificacoes']
      credito: typeof routes['web.responsavel.credito']
      loja: typeof routes['web.responsavel.loja'] & {
        store: typeof routes['web.responsavel.loja.store']
      }
    }
    admin: {
      dashboard: typeof routes['web.admin.dashboard']
      escolas: typeof routes['web.admin.escolas'] & {
        edit: typeof routes['web.admin.escolas.edit']
        show: typeof routes['web.admin.escolas.show']
      }
      onboarding: typeof routes['web.admin.onboarding']
      billing: {
        dashboard: typeof routes['web.admin.billing.dashboard']
        faturas: typeof routes['web.admin.billing.faturas']
        subscriptions: typeof routes['web.admin.billing.subscriptions']
      }
      redes: typeof routes['web.admin.redes']
      configuracoes: typeof routes['web.admin.configuracoes']
      seguros: {
        index: typeof routes['web.admin.seguros.index']
        sinistros: typeof routes['web.admin.seguros.sinistros']
        faturamento: typeof routes['web.admin.seguros.faturamento']
        analytics: typeof routes['web.admin.seguros.analytics']
        configuracao: typeof routes['web.admin.seguros.configuracao']
      }
      analytics: {
        index: typeof routes['web.admin.analytics.index']
        academico: typeof routes['web.admin.analytics.academico']
        presenca: typeof routes['web.admin.analytics.presenca']
        cantina: typeof routes['web.admin.analytics.cantina']
        pagamentos: typeof routes['web.admin.analytics.pagamentos']
        matriculas: typeof routes['web.admin.analytics.matriculas']
        ocorrencias: typeof routes['web.admin.analytics.ocorrencias']
        gamificacao: typeof routes['web.admin.analytics.gamificacao']
        rh: typeof routes['web.admin.analytics.rh']
      }
    }
    loja: {
      dashboard: typeof routes['web.loja.dashboard']
      produtos: typeof routes['web.loja.produtos']
      pedidos: typeof routes['web.loja.pedidos']
      financeiro: typeof routes['web.loja.financeiro']
    }
    aluno: {
      dashboard: typeof routes['web.aluno.dashboard']
      loja: {
        index: typeof routes['web.aluno.loja.index']
        carrinho: typeof routes['web.aluno.loja.carrinho']
        pedidos: typeof routes['web.aluno.loja.pedidos']
        pontos: typeof routes['web.aluno.loja.pontos']
        store: typeof routes['web.aluno.loja.store']
      }
      idle: typeof routes['web.aluno.idle']
    }
  }
  api: {
    v1: {
      auth: {
        login: typeof routes['api.v1.auth.login']
        sendCode: typeof routes['api.v1.auth.send_code']
        verifyCode: typeof routes['api.v1.auth.verify_code']
        logout: typeof routes['api.v1.auth.logout']
        me: typeof routes['api.v1.auth.me']
      }
      dashboard: {
        escolaStats: typeof routes['api.v1.dashboard.escola_stats']
        escolaInsights: typeof routes['api.v1.dashboard.escola_insights']
        escolaTeacherDashboard: typeof routes['api.v1.dashboard.escola_teacher_dashboard']
        responsavelStats: typeof routes['api.v1.dashboard.responsavel_stats']
        adminStats: typeof routes['api.v1.dashboard.admin_stats']
        serverStats: typeof routes['api.v1.dashboard.server_stats']
      }
      responsavel: {
        api: {
          studentGrades: typeof routes['api.v1.responsavel.api.student_grades']
          studentAttendance: typeof routes['api.v1.responsavel.api.student_attendance']
          studentPayments: typeof routes['api.v1.responsavel.api.student_payments']
          studentInvoices: typeof routes['api.v1.responsavel.api.student_invoices']
          studentBalance: typeof routes['api.v1.responsavel.api.student_balance']
          studentCanteenPurchases: typeof routes['api.v1.responsavel.api.student_canteen_purchases']
          studentAssignments: typeof routes['api.v1.responsavel.api.student_assignments']
          studentSchedule: typeof routes['api.v1.responsavel.api.student_schedule']
          studentDocuments: typeof routes['api.v1.responsavel.api.student_documents']
          studentOccurrences: typeof routes['api.v1.responsavel.api.student_occurrences']
          acknowledgeOccurrence: typeof routes['api.v1.responsavel.api.acknowledge_occurrence']
          studentOverview: typeof routes['api.v1.responsavel.api.student_overview']
          studentGamification: typeof routes['api.v1.responsavel.api.student_gamification']
          notifications: typeof routes['api.v1.responsavel.api.notifications']
          comunicados: {
            list: typeof routes['api.v1.responsavel.api.comunicados.list']
            pendingAck: typeof routes['api.v1.responsavel.api.comunicados.pending_ack']
            details: typeof routes['api.v1.responsavel.api.comunicados.details']
            acknowledge: typeof routes['api.v1.responsavel.api.comunicados.acknowledge']
          }
          updateProfile: typeof routes['api.v1.responsavel.api.update_profile']
          invoiceCheckout: typeof routes['api.v1.responsavel.api.invoice_checkout']
          createWalletTopUp: typeof routes['api.v1.responsavel.api.create_wallet_top_up']
          listWalletTopUps: typeof routes['api.v1.responsavel.api.list_wallet_top_ups']
          showWalletTopUp: typeof routes['api.v1.responsavel.api.show_wallet_top_up']
        }
      }
      asaas: {
        webhook: typeof routes['api.v1.asaas.webhook']
        subaccounts: {
          create: typeof routes['api.v1.asaas.subaccounts.create']
          status: typeof routes['api.v1.asaas.subaccounts.status']
        }
      }
      schools: {
        index: typeof routes['api.v1.schools.index']
        store: typeof routes['api.v1.schools.store']
        showBySlug: typeof routes['api.v1.schools.show_by_slug']
        show: typeof routes['api.v1.schools.show']
        update: typeof routes['api.v1.schools.update']
        destroy: typeof routes['api.v1.schools.destroy']
        uploadLogo: typeof routes['api.v1.schools.upload_logo']
        users: typeof routes['api.v1.schools.users']
        updateDirector: typeof routes['api.v1.schools.update_director']
        subscription: typeof routes['api.v1.schools.subscription']
      }
      users: {
        index: typeof routes['api.v1.users.index']
        schoolEmployees: typeof routes['api.v1.users.school_employees']
        store: typeof routes['api.v1.users.store']
        show: typeof routes['api.v1.users.show']
        update: typeof routes['api.v1.users.update']
        destroy: typeof routes['api.v1.users.destroy']
      }
      userSchools: {
        listUserSchools: typeof routes['api.v1.user_schools.list_user_schools']
        createUserSchool: typeof routes['api.v1.user_schools.create_user_school']
        updateUserSchool: typeof routes['api.v1.user_schools.update_user_school']
        deleteUserSchool: typeof routes['api.v1.user_schools.delete_user_school']
      }
      userSchoolGroups: {
        listUserSchoolGroups: typeof routes['api.v1.user_school_groups.list_user_school_groups']
        createUserSchoolGroup: typeof routes['api.v1.user_school_groups.create_user_school_group']
        deleteUserSchoolGroup: typeof routes['api.v1.user_school_groups.delete_user_school_group']
      }
      schoolSwitcher: {
        getData: typeof routes['api.v1.school_switcher.get_data']
        toggleSchool: typeof routes['api.v1.school_switcher.toggle_school']
        toggleGroup: typeof routes['api.v1.school_switcher.toggle_group']
      }
      students: {
        index: typeof routes['api.v1.students.index']
        store: typeof routes['api.v1.students.store']
        enroll: typeof routes['api.v1.students.enroll']
        checkDocument: typeof routes['api.v1.students.check_document']
        checkEmail: typeof routes['api.v1.students.check_email']
        lookupResponsible: typeof routes['api.v1.students.lookup_responsible']
        me: {
          avatar: {
            show: typeof routes['api.v1.students.me.avatar.show']
            update: typeof routes['api.v1.students.me.avatar.update']
            purchase: typeof routes['api.v1.students.me.avatar.purchase']
          }
        }
        show: typeof routes['api.v1.students.show']
        update: typeof routes['api.v1.students.update']
        fullUpdate: typeof routes['api.v1.students.full_update']
        destroy: typeof routes['api.v1.students.destroy']
        enrollments: {
          list: typeof routes['api.v1.students.enrollments.list']
          update: typeof routes['api.v1.students.enrollments.update']
          cancel: typeof routes['api.v1.students.enrollments.cancel']
        }
        attendance: typeof routes['api.v1.students.attendance']
        payments: typeof routes['api.v1.students.payments']
        balance: typeof routes['api.v1.students.balance']
        balanceTransactions: typeof routes['api.v1.students.balance_transactions']
        gamificationStats: typeof routes['api.v1.students.gamification_stats']
      }
      responsibles: {
        listByStudent: typeof routes['api.v1.responsibles.list_by_student']
        assign: typeof routes['api.v1.responsibles.assign']
        updateAssignment: typeof routes['api.v1.responsibles.update_assignment']
        remove: typeof routes['api.v1.responsibles.remove']
      }
      responsibleAddresses: {
        show: typeof routes['api.v1.responsible_addresses.show']
        create: typeof routes['api.v1.responsible_addresses.create']
      }
      contracts: {
        index: typeof routes['api.v1.contracts.index']
        store: typeof routes['api.v1.contracts.store']
        show: typeof routes['api.v1.contracts.show']
        update: typeof routes['api.v1.contracts.update']
        destroy: typeof routes['api.v1.contracts.destroy']
        getSignatureStats: typeof routes['api.v1.contracts.get_signature_stats']
        getDocusealTemplate: typeof routes['api.v1.contracts.get_docuseal_template']
        uploadDocusealTemplate: typeof routes['api.v1.contracts.upload_docuseal_template']
        deleteDocusealTemplate: typeof routes['api.v1.contracts.delete_docuseal_template']
        paymentDays: {
          index: typeof routes['api.v1.contracts.payment_days.index']
          store: typeof routes['api.v1.contracts.payment_days.store']
          destroy: typeof routes['api.v1.contracts.payment_days.destroy']
        }
        interestConfig: {
          show: typeof routes['api.v1.contracts.interest_config.show']
          update: typeof routes['api.v1.contracts.interest_config.update']
        }
        earlyDiscounts: {
          index: typeof routes['api.v1.contracts.early_discounts.index']
          store: typeof routes['api.v1.contracts.early_discounts.store']
          update: typeof routes['api.v1.contracts.early_discounts.update']
          destroy: typeof routes['api.v1.contracts.early_discounts.destroy']
        }
      }
      contractDocuments: {
        index: typeof routes['api.v1.contract_documents.index']
        store: typeof routes['api.v1.contract_documents.store']
      }
      courses: {
        index: typeof routes['api.v1.courses.index']
        store: typeof routes['api.v1.courses.store']
        show: typeof routes['api.v1.courses.show']
        update: typeof routes['api.v1.courses.update']
        destroy: typeof routes['api.v1.courses.destroy']
        dashboard: {
          metrics: typeof routes['api.v1.courses.dashboard.metrics']
          alerts: typeof routes['api.v1.courses.dashboard.alerts']
          activityFeed: typeof routes['api.v1.courses.dashboard.activity_feed']
        }
        classes: typeof routes['api.v1.courses.classes']
      }
      levels: {
        index: typeof routes['api.v1.levels.index']
        store: typeof routes['api.v1.levels.store']
        show: typeof routes['api.v1.levels.show']
        update: typeof routes['api.v1.levels.update']
        destroy: typeof routes['api.v1.levels.destroy']
      }
      courseHasAcademicPeriods: {
        store: typeof routes['api.v1.course_has_academic_periods.store']
      }
      levelAssignments: {
        store: typeof routes['api.v1.level_assignments.store']
      }
      classes: {
        index: typeof routes['api.v1.classes.index']
        store: typeof routes['api.v1.classes.store']
        storeWithTeachers: typeof routes['api.v1.classes.store_with_teachers']
        showBySlug: typeof routes['api.v1.classes.show_by_slug']
        sidebar: typeof routes['api.v1.classes.sidebar']
        show: typeof routes['api.v1.classes.show']
        update: typeof routes['api.v1.classes.update']
        destroy: typeof routes['api.v1.classes.destroy']
        updateWithTeachers: typeof routes['api.v1.classes.update_with_teachers']
        students: typeof routes['api.v1.classes.students']
        studentsCount: typeof routes['api.v1.classes.students_count']
        studentStatus: typeof routes['api.v1.classes.student_status']
        subjects: typeof routes['api.v1.classes.subjects']
      }
      subjects: {
        index: typeof routes['api.v1.subjects.index']
        store: typeof routes['api.v1.subjects.store']
        showBySlug: typeof routes['api.v1.subjects.show_by_slug']
        show: typeof routes['api.v1.subjects.show']
        update: typeof routes['api.v1.subjects.update']
        destroy: typeof routes['api.v1.subjects.destroy']
      }
      schedules: {
        getClassSchedule: typeof routes['api.v1.schedules.get_class_schedule']
        saveClassSchedule: typeof routes['api.v1.schedules.save_class_schedule']
        generateClassSchedule: typeof routes['api.v1.schedules.generate_class_schedule']
        validateConflict: typeof routes['api.v1.schedules.validate_conflict']
      }
      teachers: {
        listTeachers: typeof routes['api.v1.teachers.list_teachers']
        createTeacher: typeof routes['api.v1.teachers.create_teacher']
        getTeachersTimesheet: typeof routes['api.v1.teachers.get_teachers_timesheet']
        getTeacherAbsences: typeof routes['api.v1.teachers.get_teacher_absences']
        approveAbsence: typeof routes['api.v1.teachers.approve_absence']
        rejectAbsence: typeof routes['api.v1.teachers.reject_absence']
        showTeacher: typeof routes['api.v1.teachers.show_teacher']
        updateTeacher: typeof routes['api.v1.teachers.update_teacher']
        deleteTeacher: typeof routes['api.v1.teachers.delete_teacher']
        listTeacherClasses: typeof routes['api.v1.teachers.list_teacher_classes']
        listTeacherSubjects: typeof routes['api.v1.teachers.list_teacher_subjects']
        updateTeacherSubjects: typeof routes['api.v1.teachers.update_teacher_subjects']
        assignClass: typeof routes['api.v1.teachers.assign_class']
        removeClass: typeof routes['api.v1.teachers.remove_class']
      }
      exams: {
        index: typeof routes['api.v1.exams.index']
        store: typeof routes['api.v1.exams.store']
        show: typeof routes['api.v1.exams.show']
        history: typeof routes['api.v1.exams.history']
        update: typeof routes['api.v1.exams.update']
        destroy: typeof routes['api.v1.exams.destroy']
        batchSaveGrades: typeof routes['api.v1.exams.batch_save_grades']
        grades: typeof routes['api.v1.exams.grades'] & {
          store: typeof routes['api.v1.exams.grades.store']
        }
        updateGrade: typeof routes['api.v1.exams.update_grade']
      }
      grades: {
        academicOverview: typeof routes['api.v1.grades.academic_overview']
        students: typeof routes['api.v1.grades.students']
        distribution: typeof routes['api.v1.grades.distribution']
        atRisk: typeof routes['api.v1.grades.at_risk']
        classSubject: typeof routes['api.v1.grades.class_subject']
        batchSave: typeof routes['api.v1.grades.batch_save']
      }
      analytics: {
        attendance: {
          overview: typeof routes['api.v1.analytics.attendance.overview']
          trends: typeof routes['api.v1.analytics.attendance.trends']
          chronic: typeof routes['api.v1.analytics.attendance.chronic']
        }
        canteen: {
          overview: typeof routes['api.v1.analytics.canteen.overview']
          trends: typeof routes['api.v1.analytics.canteen.trends']
          topItems: typeof routes['api.v1.analytics.canteen.top_items']
        }
        payments: {
          overview: typeof routes['api.v1.analytics.payments.overview']
        }
        enrollments: {
          overview: typeof routes['api.v1.analytics.enrollments.overview']
          funnel: typeof routes['api.v1.analytics.enrollments.funnel']
          trends: typeof routes['api.v1.analytics.enrollments.trends']
          byLevel: typeof routes['api.v1.analytics.enrollments.by_level']
        }
        incidents: {
          overview: typeof routes['api.v1.analytics.incidents.overview']
        }
        gamification: {
          overview: typeof routes['api.v1.analytics.gamification.overview']
        }
        hr: {
          overview: typeof routes['api.v1.analytics.hr.overview']
        }
      }
      events: {
        index: typeof routes['api.v1.events.index']
        store: typeof routes['api.v1.events.store']
        show: typeof routes['api.v1.events.show']
        update: typeof routes['api.v1.events.update']
        destroy: typeof routes['api.v1.events.destroy']
        publish: typeof routes['api.v1.events.publish']
        cancel: typeof routes['api.v1.events.cancel']
        complete: typeof routes['api.v1.events.complete']
        participants: {
          index: typeof routes['api.v1.events.participants.index']
          register: typeof routes['api.v1.events.participants.register']
          updateStatus: typeof routes['api.v1.events.participants.update_status']
          cancel: typeof routes['api.v1.events.participants.cancel']
          confirmAttendance: typeof routes['api.v1.events.participants.confirm_attendance']
        }
        consents: {
          index: typeof routes['api.v1.events.consents.index']
          request: typeof routes['api.v1.events.consents.request']
        }
      }
      consents: {
        pending: typeof routes['api.v1.consents.pending']
        history: typeof routes['api.v1.consents.history']
        respond: typeof routes['api.v1.consents.respond']
      }
      enrollment: {
        info: typeof routes['api.v1.enrollment.info']
        checkExisting: typeof routes['api.v1.enrollment.check_existing']
        findScholarship: typeof routes['api.v1.enrollment.find_scholarship']
        finish: typeof routes['api.v1.enrollment.finish']
      }
      enrollments: {
        index: typeof routes['api.v1.enrollments.index']
        documents: {
          updateStatus: typeof routes['api.v1.enrollments.documents.update_status']
        }
      }
      notifications: {
        index: typeof routes['api.v1.notifications.index']
        show: typeof routes['api.v1.notifications.show']
        markRead: typeof routes['api.v1.notifications.mark_read']
        markAllRead: typeof routes['api.v1.notifications.mark_all_read']
        destroy: typeof routes['api.v1.notifications.destroy']
      }
      notificationPreferences: {
        show: typeof routes['api.v1.notification_preferences.show']
        update: typeof routes['api.v1.notification_preferences.update']
      }
      schoolAnnouncements: {
        list: typeof routes['api.v1.school_announcements.list']
        create: typeof routes['api.v1.school_announcements.create']
        details: typeof routes['api.v1.school_announcements.details']
        editDraft: typeof routes['api.v1.school_announcements.edit_draft']
        publishDraft: typeof routes['api.v1.school_announcements.publish_draft']
      }
      posts: {
        index: typeof routes['api.v1.posts.index']
        store: typeof routes['api.v1.posts.store']
        show: typeof routes['api.v1.posts.show']
        update: typeof routes['api.v1.posts.update']
        destroy: typeof routes['api.v1.posts.destroy']
        like: typeof routes['api.v1.posts.like']
        unlike: typeof routes['api.v1.posts.unlike']
        comments: {
          index: typeof routes['api.v1.posts.comments.index']
          store: typeof routes['api.v1.posts.comments.store']
        }
      }
      comments: {
        update: typeof routes['api.v1.comments.update']
        destroy: typeof routes['api.v1.comments.destroy']
        like: typeof routes['api.v1.comments.like']
      }
      extraClasses: {
        index: typeof routes['api.v1.extra_classes.index']
        store: typeof routes['api.v1.extra_classes.store']
        show: typeof routes['api.v1.extra_classes.show']
        update: typeof routes['api.v1.extra_classes.update']
        destroy: typeof routes['api.v1.extra_classes.destroy']
        enroll: typeof routes['api.v1.extra_classes.enroll'] & {
          cancel: typeof routes['api.v1.extra_classes.enroll.cancel']
        }
        students: typeof routes['api.v1.extra_classes.students']
        attendance: {
          store: typeof routes['api.v1.extra_classes.attendance.store']
          index: typeof routes['api.v1.extra_classes.attendance.index']
          update: typeof routes['api.v1.extra_classes.attendance.update']
          summary: typeof routes['api.v1.extra_classes.attendance.summary']
        }
      }
      attendance: {
        index: typeof routes['api.v1.attendance.index']
        store: typeof routes['api.v1.attendance.store']
        batch: typeof routes['api.v1.attendance.batch']
        availableDates: typeof routes['api.v1.attendance.available_dates']
        show: typeof routes['api.v1.attendance.show']
        update: typeof routes['api.v1.attendance.update']
        classStudents: typeof routes['api.v1.attendance.class_students']
      }
      assignments: {
        index: typeof routes['api.v1.assignments.index']
        store: typeof routes['api.v1.assignments.store']
        show: typeof routes['api.v1.assignments.show']
        history: typeof routes['api.v1.assignments.history']
        update: typeof routes['api.v1.assignments.update']
        destroy: typeof routes['api.v1.assignments.destroy']
        submissions: typeof routes['api.v1.assignments.submissions'] & {
          grade: typeof routes['api.v1.assignments.submissions.grade']
        }
        submit: typeof routes['api.v1.assignments.submit']
      }
      occurrences: {
        index: typeof routes['api.v1.occurrences.index']
        store: typeof routes['api.v1.occurrences.store']
        teacherClasses: typeof routes['api.v1.occurrences.teacher_classes']
        show: typeof routes['api.v1.occurrences.show']
      }
      studentPayments: {
        index: typeof routes['api.v1.student_payments.index']
        store: typeof routes['api.v1.student_payments.store']
        show: typeof routes['api.v1.student_payments.show']
        update: typeof routes['api.v1.student_payments.update']
        cancel: typeof routes['api.v1.student_payments.cancel']
        markPaid: typeof routes['api.v1.student_payments.mark_paid']
        asaasCharge: typeof routes['api.v1.student_payments.asaas_charge']
        sendBoleto: typeof routes['api.v1.student_payments.send_boleto']
        getBoleto: typeof routes['api.v1.student_payments.get_boleto']
      }
      agreements: {
        store: typeof routes['api.v1.agreements.store']
      }
      invoices: {
        index: typeof routes['api.v1.invoices.index']
        markPaid: typeof routes['api.v1.invoices.mark_paid']
      }
      audits: {
        index: typeof routes['api.v1.audits.index']
        studentHistory: typeof routes['api.v1.audits.student_history']
      }
      studentBalanceTransactions: {
        index: typeof routes['api.v1.student_balance_transactions.index']
        store: typeof routes['api.v1.student_balance_transactions.store']
        show: typeof routes['api.v1.student_balance_transactions.show']
        byStudent: typeof routes['api.v1.student_balance_transactions.by_student']
        balance: typeof routes['api.v1.student_balance_transactions.balance']
      }
      canteens: {
        index: typeof routes['api.v1.canteens.index']
        store: typeof routes['api.v1.canteens.store']
        show: typeof routes['api.v1.canteens.show']
        update: typeof routes['api.v1.canteens.update']
        destroy: typeof routes['api.v1.canteens.destroy']
        items: typeof routes['api.v1.canteens.items']
        financialSettings: {
          show: typeof routes['api.v1.canteens.financial_settings.show']
        }
      }
      canteenReports: {
        summary: typeof routes['api.v1.canteen_reports.summary']
      }
      canteenMonthlyTransfers: {
        index: typeof routes['api.v1.canteen_monthly_transfers.index']
        store: typeof routes['api.v1.canteen_monthly_transfers.store']
        show: typeof routes['api.v1.canteen_monthly_transfers.show']
        updateStatus: typeof routes['api.v1.canteen_monthly_transfers.update_status']
      }
      canteenItems: {
        index: typeof routes['api.v1.canteen_items.index']
        store: typeof routes['api.v1.canteen_items.store']
        categories: typeof routes['api.v1.canteen_items.categories']
        show: typeof routes['api.v1.canteen_items.show']
        update: typeof routes['api.v1.canteen_items.update']
        destroy: typeof routes['api.v1.canteen_items.destroy']
        toggleActive: typeof routes['api.v1.canteen_items.toggle_active']
      }
      canteenMeals: {
        index: typeof routes['api.v1.canteen_meals.index']
        store: typeof routes['api.v1.canteen_meals.store']
        show: typeof routes['api.v1.canteen_meals.show']
        update: typeof routes['api.v1.canteen_meals.update']
        destroy: typeof routes['api.v1.canteen_meals.destroy']
      }
      canteenMealReservations: {
        index: typeof routes['api.v1.canteen_meal_reservations.index']
        store: typeof routes['api.v1.canteen_meal_reservations.store']
        show: typeof routes['api.v1.canteen_meal_reservations.show']
        updateStatus: typeof routes['api.v1.canteen_meal_reservations.update_status']
        cancel: typeof routes['api.v1.canteen_meal_reservations.cancel']
      }
      canteenPurchases: {
        index: typeof routes['api.v1.canteen_purchases.index']
        store: typeof routes['api.v1.canteen_purchases.store']
        show: typeof routes['api.v1.canteen_purchases.show']
        updateStatus: typeof routes['api.v1.canteen_purchases.update_status']
        cancel: typeof routes['api.v1.canteen_purchases.cancel']
      }
      achievements: {
        index: typeof routes['api.v1.achievements.index']
        store: typeof routes['api.v1.achievements.store']
        show: typeof routes['api.v1.achievements.show']
        update: typeof routes['api.v1.achievements.update']
        destroy: typeof routes['api.v1.achievements.destroy']
        unlock: typeof routes['api.v1.achievements.unlock']
        config: {
          update: typeof routes['api.v1.achievements.config.update']
        }
      }
      stores: {
        index: typeof routes['api.v1.stores.index']
        store: typeof routes['api.v1.stores.store']
        show: typeof routes['api.v1.stores.show']
        update: typeof routes['api.v1.stores.update']
        destroy: typeof routes['api.v1.stores.destroy']
        financialSettings: {
          show: typeof routes['api.v1.stores.financial_settings.show']
          upsert: typeof routes['api.v1.stores.financial_settings.upsert']
        }
      }
      storeSettlements: {
        index: typeof routes['api.v1.store_settlements.index']
        store: typeof routes['api.v1.store_settlements.store']
        show: typeof routes['api.v1.store_settlements.show']
        updateStatus: typeof routes['api.v1.store_settlements.update_status']
      }
      storeItems: {
        index: typeof routes['api.v1.store_items.index']
        store: typeof routes['api.v1.store_items.store']
        show: typeof routes['api.v1.store_items.show']
        update: typeof routes['api.v1.store_items.update']
        destroy: typeof routes['api.v1.store_items.destroy']
        toggleActive: typeof routes['api.v1.store_items.toggle_active']
      }
      storeOrders: {
        index: typeof routes['api.v1.store_orders.index']
        store: typeof routes['api.v1.store_orders.store']
        show: typeof routes['api.v1.store_orders.show']
        approve: typeof routes['api.v1.store_orders.approve']
        reject: typeof routes['api.v1.store_orders.reject']
        deliver: typeof routes['api.v1.store_orders.deliver']
        cancel: typeof routes['api.v1.store_orders.cancel']
      }
      storeInstallmentRules: {
        index: typeof routes['api.v1.store_installment_rules.index']
        store: typeof routes['api.v1.store_installment_rules.store']
        update: typeof routes['api.v1.store_installment_rules.update']
        destroy: typeof routes['api.v1.store_installment_rules.destroy']
      }
      storeOwner: {
        store: {
          show: typeof routes['api.v1.store_owner.store.show']
        }
        products: {
          index: typeof routes['api.v1.store_owner.products.index']
          store: typeof routes['api.v1.store_owner.products.store']
          update: typeof routes['api.v1.store_owner.products.update']
          destroy: typeof routes['api.v1.store_owner.products.destroy']
          toggleActive: typeof routes['api.v1.store_owner.products.toggle_active']
        }
        orders: {
          index: typeof routes['api.v1.store_owner.orders.index']
          show: typeof routes['api.v1.store_owner.orders.show']
          approve: typeof routes['api.v1.store_owner.orders.approve']
          reject: typeof routes['api.v1.store_owner.orders.reject']
          preparing: typeof routes['api.v1.store_owner.orders.preparing']
          ready: typeof routes['api.v1.store_owner.orders.ready']
          deliver: typeof routes['api.v1.store_owner.orders.deliver']
          cancel: typeof routes['api.v1.store_owner.orders.cancel']
        }
        financial: {
          show: typeof routes['api.v1.store_owner.financial.show']
          update: typeof routes['api.v1.store_owner.financial.update']
        }
        settlements: {
          index: typeof routes['api.v1.store_owner.settlements.index']
        }
      }
      marketplace: {
        stores: {
          index: typeof routes['api.v1.marketplace.stores.index']
          items: typeof routes['api.v1.marketplace.stores.items']
          context: typeof routes['api.v1.marketplace.stores.context']
        }
        installmentOptions: typeof routes['api.v1.marketplace.installment_options']
        checkout: typeof routes['api.v1.marketplace.checkout']
        orders: {
          index: typeof routes['api.v1.marketplace.orders.index']
          show: typeof routes['api.v1.marketplace.orders.show']
        }
      }
      studentGamifications: {
        index: typeof routes['api.v1.student_gamifications.index']
        store: typeof routes['api.v1.student_gamifications.store']
        show: typeof routes['api.v1.student_gamifications.show']
        addPoints: typeof routes['api.v1.student_gamifications.add_points']
        ranking: typeof routes['api.v1.student_gamifications.ranking']
      }
      leaderboards: {
        index: typeof routes['api.v1.leaderboards.index']
        store: typeof routes['api.v1.leaderboards.store']
        show: typeof routes['api.v1.leaderboards.show']
        update: typeof routes['api.v1.leaderboards.update']
        destroy: typeof routes['api.v1.leaderboards.destroy']
        entries: typeof routes['api.v1.leaderboards.entries']
      }
      gamificationEvents: {
        index: typeof routes['api.v1.gamification_events.index']
        store: typeof routes['api.v1.gamification_events.store']
        show: typeof routes['api.v1.gamification_events.show']
        retry: typeof routes['api.v1.gamification_events.retry']
      }
      challenges: {
        index: typeof routes['api.v1.challenges.index']
        store: typeof routes['api.v1.challenges.store']
        show: typeof routes['api.v1.challenges.show']
        update: typeof routes['api.v1.challenges.update']
        destroy: typeof routes['api.v1.challenges.destroy']
      }
      scholarships: {
        listScholarships: typeof routes['api.v1.scholarships.list_scholarships']
        createScholarship: typeof routes['api.v1.scholarships.create_scholarship']
        showScholarship: typeof routes['api.v1.scholarships.show_scholarship']
        updateScholarship: typeof routes['api.v1.scholarships.update_scholarship']
        toggleScholarshipActive: typeof routes['api.v1.scholarships.toggle_scholarship_active']
      }
      schoolPartners: {
        listSchoolPartners: typeof routes['api.v1.school_partners.list_school_partners']
        createSchoolPartner: typeof routes['api.v1.school_partners.create_school_partner']
        showSchoolPartner: typeof routes['api.v1.school_partners.show_school_partner']
        updateSchoolPartner: typeof routes['api.v1.school_partners.update_school_partner']
        toggleSchoolPartnerActive: typeof routes['api.v1.school_partners.toggle_school_partner_active']
      }
      schoolChains: {
        listSchoolChains: typeof routes['api.v1.school_chains.list_school_chains']
        createSchoolChain: typeof routes['api.v1.school_chains.create_school_chain']
        showSchoolChain: typeof routes['api.v1.school_chains.show_school_chain']
        updateSchoolChain: typeof routes['api.v1.school_chains.update_school_chain']
        deleteSchoolChain: typeof routes['api.v1.school_chains.delete_school_chain']
        subscription: typeof routes['api.v1.school_chains.subscription']
      }
      schoolGroups: {
        listSchoolGroups: typeof routes['api.v1.school_groups.list_school_groups']
        createSchoolGroup: typeof routes['api.v1.school_groups.create_school_group']
        showSchoolGroup: typeof routes['api.v1.school_groups.show_school_group']
        updateSchoolGroup: typeof routes['api.v1.school_groups.update_school_group']
        deleteSchoolGroup: typeof routes['api.v1.school_groups.delete_school_group']
      }
      academicPeriods: {
        listAcademicPeriods: typeof routes['api.v1.academic_periods.list_academic_periods']
        getCurrentActiveAcademicPeriods: typeof routes['api.v1.academic_periods.get_current_active_academic_periods']
        showBySlug: typeof routes['api.v1.academic_periods.show_by_slug']
        showDashboardBySlug: typeof routes['api.v1.academic_periods.show_dashboard_by_slug']
        createAcademicPeriod: typeof routes['api.v1.academic_periods.create_academic_period']
        showAcademicPeriod: typeof routes['api.v1.academic_periods.show_academic_period']
        updateAcademicPeriod: typeof routes['api.v1.academic_periods.update_academic_period']
        deleteAcademicPeriod: typeof routes['api.v1.academic_periods.delete_academic_period']
        listCourses: typeof routes['api.v1.academic_periods.list_courses']
        updateCourses: typeof routes['api.v1.academic_periods.update_courses']
      }
      printRequests: {
        listPrintRequests: typeof routes['api.v1.print_requests.list_print_requests']
        createPrintRequest: typeof routes['api.v1.print_requests.create_print_request']
        showPrintRequest: typeof routes['api.v1.print_requests.show_print_request']
        approvePrintRequest: typeof routes['api.v1.print_requests.approve_print_request']
        rejectPrintRequest: typeof routes['api.v1.print_requests.reject_print_request']
        reviewPrintRequest: typeof routes['api.v1.print_requests.review_print_request']
        markPrintRequestPrinted: typeof routes['api.v1.print_requests.mark_print_request_printed']
      }
      platformSettings: {
        show: typeof routes['api.v1.platform_settings.show']
        update: typeof routes['api.v1.platform_settings.update']
      }
      subscriptionPlans: {
        index: typeof routes['api.v1.subscription_plans.index']
        store: typeof routes['api.v1.subscription_plans.store']
        show: typeof routes['api.v1.subscription_plans.show']
        update: typeof routes['api.v1.subscription_plans.update']
        destroy: typeof routes['api.v1.subscription_plans.destroy']
      }
      subscriptions: {
        index: typeof routes['api.v1.subscriptions.index']
        store: typeof routes['api.v1.subscriptions.store']
        show: typeof routes['api.v1.subscriptions.show']
        update: typeof routes['api.v1.subscriptions.update']
        cancel: typeof routes['api.v1.subscriptions.cancel']
        pause: typeof routes['api.v1.subscriptions.pause']
        reactivate: typeof routes['api.v1.subscriptions.reactivate']
      }
      subscriptionInvoices: {
        index: typeof routes['api.v1.subscription_invoices.index']
        store: typeof routes['api.v1.subscription_invoices.store']
        show: typeof routes['api.v1.subscription_invoices.show']
        update: typeof routes['api.v1.subscription_invoices.update']
        markPaid: typeof routes['api.v1.subscription_invoices.mark_paid']
      }
      schoolUsageMetrics: {
        show: typeof routes['api.v1.school_usage_metrics.show']
      }
      purchaseRequests: {
        index: typeof routes['api.v1.purchase_requests.index']
        store: typeof routes['api.v1.purchase_requests.store']
        show: typeof routes['api.v1.purchase_requests.show']
        update: typeof routes['api.v1.purchase_requests.update']
        destroy: typeof routes['api.v1.purchase_requests.destroy']
        approve: typeof routes['api.v1.purchase_requests.approve']
        reject: typeof routes['api.v1.purchase_requests.reject']
        markBought: typeof routes['api.v1.purchase_requests.mark_bought']
        markArrived: typeof routes['api.v1.purchase_requests.mark_arrived']
      }
      insurance: {
        config: typeof routes['api.v1.insurance.config']
        updateSchool: typeof routes['api.v1.insurance.update_school']
        updateChain: typeof routes['api.v1.insurance.update_chain']
        resetSchool: typeof routes['api.v1.insurance.reset_school']
        claims: {
          index: typeof routes['api.v1.insurance.claims.index']
          approve: typeof routes['api.v1.insurance.claims.approve']
          reject: typeof routes['api.v1.insurance.claims.reject']
          markPaid: typeof routes['api.v1.insurance.claims.mark_paid']
        }
        billings: {
          index: typeof routes['api.v1.insurance.billings.index']
          show: typeof routes['api.v1.insurance.billings.show']
        }
        stats: typeof routes['api.v1.insurance.stats']
        analytics: {
          defaultRate: typeof routes['api.v1.insurance.analytics.default_rate']
          schoolsWithout: typeof routes['api.v1.insurance.analytics.schools_without']
        }
        school: {
          stats: typeof routes['api.v1.insurance.school.stats']
          billings: typeof routes['api.v1.insurance.school.billings']
          claims: typeof routes['api.v1.insurance.school.claims']
        }
      }
      impersonation: {
        set: typeof routes['api.v1.impersonation.set']
        clear: typeof routes['api.v1.impersonation.clear']
        status: typeof routes['api.v1.impersonation.status']
        config: typeof routes['api.v1.impersonation.config']
      }
      admin: {
        schools: {
          onboarding: typeof routes['api.v1.admin.schools.onboarding']
        }
        jobs: {
          generateMissingPayments: typeof routes['api.v1.admin.jobs.generate_missing_payments']
        }
      }
      pedagogicalCalendar: {
        index: typeof routes['api.v1.pedagogical_calendar.index']
        creationContext: typeof routes['api.v1.pedagogical_calendar.creation_context']
      }
      cspReport: typeof routes['api.v1.csp_report']
    }
  }
}
