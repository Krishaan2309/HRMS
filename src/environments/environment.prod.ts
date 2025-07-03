export const environment = {
    production: false,
    // apiUrl: 'http://172.20.40.25:97',
    apiUrl : 'https://hrms.asprcmsolutions.com',
    msal: {
    clientId: 'd64a6a87-af83-4103-83d1-36440bb7992f',
    authority: 'https://login.microsoftonline.com/f22c18cf-f121-4f65-bf09-22e505a6fd08',
    redirectUri: 'https://ccapp.asprcmsolutions.com/',
    scopes: ['api://061fc813-e85f-484d-bc41-ef6e187e63df/access_as_user'],
    postLogoutRedirectUri: 'https://ccapp.asprcmsolutions.com'
  }   
}
