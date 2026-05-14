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

export {}
