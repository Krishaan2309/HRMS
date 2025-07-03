import { LogLevel, Configuration, BrowserCacheLocation } from '@azure/msal-browser';
import { environment } from 'src/environments/environment';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

export const msalConfig: Configuration = {
    auth: {
        clientId: environment.msal.clientId,
        authority: environment.msal.authority,
        redirectUri: environment.msal.redirectUri,
        postLogoutRedirectUri: environment.msal.postLogoutRedirectUri
    },
    cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: isIE,
    },
    system: {
        loggerOptions: {
            loggerCallback: (logLevel, message, containsPii) => {
                if (containsPii) return;
                switch (logLevel) {
                    case LogLevel.Error:
                        console.error(message);
                        break;
                    case LogLevel.Info:
                        console.info(message);
                        break;
                    case LogLevel.Verbose:
                        console.debug(message);
                        break;
                    case LogLevel.Warning:
                        console.warn(message);
                        break;
                }
            },
            logLevel: LogLevel.Verbose
        }
    }
};

export const protectedResources = {
    api: {
        endpoint: "https://your-api-endpoint.com/api", // Replace with your actual API endpoint
        scopes: ["api://061fc813-e85f-484d-bc41-ef6e187e63df/access_as_user"] // Must match exactly with Blazer
    },
    graph: {
        endpoint: "https://graph.microsoft.com/v1.0/me",
        scopes: ["User.Read"]
    }
};

export const loginRequest = {
    scopes: ["openid", "profile", "email", "User.Read"]
};