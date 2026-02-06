import { defineConfig } from '@stouder-io/adonis-auditing'

export default defineConfig({
  userResolver: () => import('#audit_resolvers/user_resolver'),
  resolvers: {
    ip_address: () => import('#audit_resolvers/ip_address_resolver'),
    user_agent: () => import('#audit_resolvers/user_agent_resolver'),
    url: () => import('#audit_resolvers/url_resolver'),
    source: () => import('#audit_resolvers/source_resolver'),
    user_name: () => import('#audit_resolvers/user_name_resolver'),
  },
})
