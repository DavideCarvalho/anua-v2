/**
 * Side-effect imports — each tool file registers itself with toolRegistry at
 * module load time. We import them all here so loading this module wires up
 * the registry.
 */
import './get_school_stats.js'
import './get_student_alerts.js'
import './query_database.js'
import './format_rows.js'
import './render_result.js'
import './get_my_classes.js'
import './get_my_children.js'
import './get_students_in_class.js'
import './get_student_grades.js'
import './get_assignments.js'
import './get_exams.js'
import './get_student_attendance.js'
import './get_student_financials.js'
import './get_communications.js'
import './get_historical_comparison.js'
import './send_communication.js'
import './justify_absence.js'
import './enter_exam_grade.js'
import './register_attendance.js'
import './prepare_create_assignment.js'

export {}
