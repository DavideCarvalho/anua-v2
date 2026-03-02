const fs = require('fs')
const path = require('path')

const mutationsDir = '/home/dudousxd/personal/anua-v2/inertia/hooks/mutations'
const files = fs.readdirSync(mutationsDir).filter((f) => f.endsWith('.ts'))

let updatedCount = 0

function transformFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  let original = content

  // 1. Remove resolveRoute lines: const resolveXxxRoute = () => tuyau.$route(...)
  // Also: const resolveXxx = () => tuyau.$route(...)
  // And also: const resolveRoute = () => tuyau.api.v1... (already converted to new style)
  content = content.replace(/^const resolve\w+\s*=\s*\(\)\s*=>\s*tuyau\.\$route\([^)]+\)\s*$/gm, '')
  content = content.replace(/^const resolve\w+\s*=\s*\(\)\s*=>\s*tuyau\.api\.v1[^\n]+\s*$/gm, '')

  // Remove the type definitions that use resolveRoute
  content = content.replace(
    /^type\s+\w+Payload\s*=\s*InferRequestType<ReturnType<typeof\s+resolve\w+>>[^;]*;\s*$/gm,
    ''
  )
  content = content.replace(
    /^type\s+\w+Payload\s*=\s*InferRequestType<ReturnType<typeof\s+resolve\w+>\[\'\$[\w]+\'\]>\s*&?\s*\{[^}]*\}?\s*;?\s*$/gm,
    ''
  )
  content = content.replace(
    /^type\s+\w+Payload\s*=\s*InferRequestType<\s*ReturnType<typeof\s+resolve\w+>\s*\[\'\$\w+\'\]>\s*&\s*\{[^}]+\}\s*;?\s*$/gm,
    ''
  )
  content = content.replace(
    /^type\s+\w+Payload\s*=\s*InferRequestType<\s*ReturnType<typeof\s+resolve\w+>\s*>\s*;?\s*$/gm,
    ''
  )

  // 2. Replace tuyau.$route calls with new tuyau API (without .unwrap())

  // Handle multiline tuyau\n.$route pattern
  // tuyau\n  .$route('api.v1.resource.method', { id })\n  .$verb(data)
  content = content.replace(
    /tuyau\n\s*\.\$route\('api\.v1\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\n\s*\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, method, params, verb, data) => {
      return `tuyau.api.v1.${resource}(${params}).${verb}(${data})`
    }
  )

  // tuyau\n  .$route('api.v1.resource.nested.method', { id })\n  .$verb(data)
  content = content.replace(
    /tuyau\n\s*\.\$route\('api\.v1\.(\w+)\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\n\s*\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, nested, method, params, verb, data) => {
      return `tuyau.api.v1.${resource}(${params}).${nested}.${verb}(${data})`
    }
  )

  // tuyau\n  .$route('api.v1.resource.nested1.nested2.method', { id })\n  .$verb(data)
  content = content.replace(
    /tuyau\n\s*\.\$route\('api\.v1\.(\w+)\.(\w+)\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\n\s*\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, n1, n2, method, params, verb, data) => {
      return `tuyau.api.v1.${resource}(${params}).${n1}.${n2}.${verb}(${data})`
    }
  )

  // tuyau\n  .$route('api.v1.resource.method')\n  .$verb(data)
  content = content.replace(
    /tuyau\n\s*\.\$route\('api\.v1\.(\w+)\.(\w+)'\)\n\s*\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, method, verb, data) => {
      return `tuyau.api.v1.${resource}.${verb}(${data})`
    }
  )

  // tuyau\n  .$route('api.v1.resource.nested.method')\n  .$verb(data)
  content = content.replace(
    /tuyau\n\s*\.\$route\('api\.v1\.(\w+)\.(\w+)\.(\w+)'\)\n\s*\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, nested, method, verb, data) => {
      return `tuyau.api.v1.${resource}.${nested}.${verb}(${data})`
    }
  )

  // tuyau\n  .$route('api.v1.resource.method', { id })\n  .$verb()
  content = content.replace(
    /tuyau\n\s*\.\$route\('api\.v1\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\n\s*\.(\$\w+)\(\)/g,
    (match, resource, method, params, verb) => {
      return `tuyau.api.v1.${resource}(${params}).${verb}()`
    }
  )

  // tuyau\n  .$route('api.v1.resource.nested.method', { id })\n  .$verb()
  content = content.replace(
    /tuyau\n\s*\.\$route\('api\.v1\.(\w+)\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\n\s*\.(\$\w+)\(\)/g,
    (match, resource, nested, method, params, verb) => {
      return `tuyau.api.v1.${resource}(${params}).${nested}.${verb}()`
    }
  )

  // tuyau.$route('api.v1.resource.method', { id }).$verb(data)
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, method, params, verb, data) => {
      return `tuyau.api.v1.${resource}(${params}).${verb}(${data})`
    }
  )

  // tuyau.$route('api.v1.resource.nested.method', { id }).$verb(data)
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, nested, method, params, verb, data) => {
      return `tuyau.api.v1.${resource}(${params}).${nested}.${verb}(${data})`
    }
  )

  // tuyau.$route('api.v1.resource.nested1.nested2.method', { id }).$verb(data)
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, n1, n2, method, params, verb, data) => {
      return `tuyau.api.v1.${resource}(${params}).${n1}.${n2}.${verb}(${data})`
    }
  )

  // tuyau.$route('api.v1.resource.method').$verb(data)
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)'\)\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, method, verb, data) => {
      return `tuyau.api.v1.${resource}.${verb}(${data})`
    }
  )

  // tuyau.$route('api.v1.resource.nested.method').$verb(data)
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)\.(\w+)'\)\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, nested, method, verb, data) => {
      return `tuyau.api.v1.${resource}.${nested}.${verb}(${data})`
    }
  )

  // tuyau.$route('api.v1.resource.nested1.nested2.method').$verb(data)
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)\.(\w+)\.(\w+)'\)\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, n1, n2, method, verb, data) => {
      return `tuyau.api.v1.${resource}.${n1}.${n2}.${verb}(${data})`
    }
  )

  // tuyau.$route('api.v1.resource.method').$verb({})
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)'\)\.(\$\w+)\(\{\}\)/g,
    (match, resource, method, verb) => {
      return `tuyau.api.v1.${resource}.${verb}({})`
    }
  )

  // tuyau.$route('api.v1.resource.method').$verb()
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)'\)\.(\$\w+)\(\)/g,
    (match, resource, method, verb) => {
      return `tuyau.api.v1.${resource}.${verb}()`
    }
  )

  // tuyau.$route('api.v1.resource.method', { id }).$verb()
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\.(\$\w+)\(\)/g,
    (match, resource, method, params, verb) => {
      return `tuyau.api.v1.${resource}(${params}).${verb}()`
    }
  )

  // tuyau.$route('api.v1.resource.method', { id }).$verb({})
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\.(\$\w+)\(\{\}\)/g,
    (match, resource, method, params, verb) => {
      return `tuyau.api.v1.${resource}(${params}).${verb}({})`
    }
  )

  // tuyau.$route('api.v1.resource.nested.method', { id }).$verb()
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\.(\$\w+)\(\)/g,
    (match, resource, nested, method, params, verb) => {
      return `tuyau.api.v1.${resource}(${params}).${nested}.${verb}()`
    }
  )

  // tuyau.$route('api.v1.resource.nested.method', { id }).$verb({})
  content = content.replace(
    /tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\.(\$\w+)\(\{\}\)/g,
    (match, resource, nested, method, params, verb) => {
      return `tuyau.api.v1.${resource}(${params}).${nested}.${verb}({})`
    }
  )

  // tuyau.$route('api.v1.resource.method').$verb({}).unwrap() - clean up any leftover .unwrap()
  content = content.replace(/\.unwrap\(\)/g, '')

  // Chained .$route() - tuyau.xxx.$route('api.v1...', { params }).$verb()
  // First, handle: tuyau.xxx.$route('api.v1.resource.method', { id }).$verb()
  content = content.replace(
    /\.\$route\('api\.v1\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, method, params, verb, data) => {
      // This is a chained route, meaning tuyau already has a prefix
      return `(${params}).${verb}(${data})`
    }
  )

  // Handle chained without params: tuyau.xxx.$route('api.v1.resource.method').$verb()
  content = content.replace(
    /\.\$route\('api\.v1\.(\w+)\.(\w+)'\)\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, method, verb, data) => {
      return `.${verb}(${data})`
    }
  )

  // Clean up empty lines
  content = content.replace(/^\s*$/gm, '')
  content = content.replace(/\n{3,}/g, '\n\n')

  // Handle const route = tuyau.$route(...) followed by route.$post() pattern
  // First remove the const route = tuyau.$route(...) line
  content = content.replace(
    /^const\s+route\s*=\s*tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)'\)\s*$/gm,
    ''
  )
  content = content.replace(
    /^const\s+route\s*=\s*tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\s*$/gm,
    ''
  )

  // Replace route.$verb() with tuyau.api.v1.resource.$verb()
  content = content.replace(/route\.(\$\w+)\(([^)]*)\)/g, (match, verb, data) => {
    // We need to find what resource this was - but since we removed the line, we need a different approach
    // Actually, let's handle this by matching the whole block
    return ''
  })

  // Handle the case: const route = tuyau.$route(...)\nreturn route.$verb()
  content = content.replace(
    /const\s+route\s*=\s*tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)'\)\s*\n\s*return\s+route\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, method, verb, data) => {
      return `return tuyau.api.v1.${resource}.${verb}(${data})`
    }
  )

  // Handle the case: const route = tuyau.$route(..., { params })\nreturn route.$verb()
  content = content.replace(
    /const\s+route\s*=\s*tuyau\.\$route\('api\.v1\.(\w+)\.(\w+)',\s*(\{[^}]+\})\)\s*\n\s*return\s+route\.(\$\w+)\(([^)]*)\)/g,
    (match, resource, method, params, verb, data) => {
      return `return tuyau.api.v1.${resource}(${params}).${verb}(${data})`
    }
  )

  // Handle more type definitions and resolveRoute references
  // Parameters<ReturnType<typeof resolveRoute>>[0]
  content = content.replace(
    /type\s+\w+Body\s*=\s*Parameters<ReturnType<typeof\s+resolve\w+>>\[[^\]]+\]\s*;?\s*$/gm,
    ''
  )

  // InferRequestType<ReturnType<typeof resolveRoute>['$post']>
  content = content.replace(
    /InferRequestType<ReturnType<typeof\s+resolve\w+>\[\'\$[\w]+\'\]>\s*;?\s*$/gm,
    ''
  )

  // ReturnType<typeof resolveRoute>['$post']
  content = content.replace(/ReturnType<typeof\s+resolve\w+>\[\'\$[\w]+\'\]>\s*;?\s*$/gm, '')

  // resolveRoute().$post(body) pattern - replace with tuyau API
  // This handles the case where resolveRoute() is called and then $post is invoked
  content = content.replace(/resolveRoute\(\)\.(\$\w+)\(([^)]*)\)/g, (match, verb, data) => {
    // We can't determine the exact resource without more context
    // This would need manual fixing
    return ''
  })

  // More type patterns to remove
  content = content.replace(
    /NonNullable<Parameters<ReturnType<typeof\s+resolve\w+>\[\'\$[\w]+\'\]>>\[[^\]]+\]>\s*;?\s*$/gm,
    ''
  )

  // Additional type definitions
  content = content.replace(
    /^export\s+type\s+\w+\s*=\s*InferRequestType<ReturnType<typeof\s+resolve\w+>\[\'\$[\w]+\'\]>\s*&?\s*\{[^}]*\}?\s*;?\s*$/gm,
    ''
  )

  if (content !== original) {
    fs.writeFileSync(filePath, content)
    updatedCount++
    console.log(`Updated: ${path.basename(filePath)}`)
  }
}

files.forEach((file) => {
  transformFile(path.join(mutationsDir, file))
})

console.log(`\nTotal files updated: ${updatedCount}`)
