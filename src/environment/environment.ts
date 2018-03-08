import { Injectable, InjectionToken } from '@angular/core'

export const ENV_PROVIDER_IT = new InjectionToken('env')
export const environment = {
  REGION: 'eu-west-1',

  USER_POOL_ID: 'eu-west-1_PtJ4NoVML',
  USER_POOL_CLIENT_ID: '1ttl3ir4v456e9ari3eqgbjsge',
  // USER_POOL_DOMAIN_NAME: string

  IDENTITY_POOL_ID: 'eu-west-1:ec035e01-6226-4cb2-88f1-9cf348916d72',

  API_ENDPOINT: 'https://edhvqd74g0.execute-api.eu-west-1.amazonaws.com/dev',
  // API_ENDPOINT: 'http://localhost:5001'

  FACEBOOK_APP_ID: '1634271429961880',
  FACEBOOK_APP_SECRET: 'ae32c38b578fe1f8cfe6715c5f4ca7e7',

  GOOGLE_CLIENT_ID: '887293527777-l9fkc42v06atg3jhcp9e6c0jceen43a1.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'KteCzqxh4rE2pUNj0u4_UeXC',

  DEVELOPER_PROVIDER_NAME: 'login.magicmirror.gavin.ie',
}
