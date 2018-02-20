import { Injectable, InjectionToken } from '@angular/core'

export const ENV_PROVIDER_IT = new InjectionToken('env')
export const environment = {
  USER_POOL_ID: 'eu-west-1_PtJ4NoVML',
  // USER_POOL_DOMAIN_NAME: string
  USER_POOL_CLIENT_ID: '1ttl3ir4v456e9ari3eqgbjsge',
  IDENTITY_POOL_ID: 'eu-west-1:ec035e01-6226-4cb2-88f1-9cf348916d72',
  REGION: 'eu-west-1',
  // API_ENDPOINT: 'https://edhvqd74g0.execute-api.eu-west-1.amazonaws.com/dev',
  API_ENDPOINT: 'http://localhost:5001'
}
