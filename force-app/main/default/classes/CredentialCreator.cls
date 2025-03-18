public with sharing class CredentialCreator 
{
    static final String EX_CRED_NAME   = 'GiveButter_Credential';
    // String externalCredentialLabel  = 'GiveButter API Key Credential';
    // String principalName            = 'API Key';
    // String credentialName           = 'key';
    // String headerName               = 'Authorization';
    // String apiKey                   = '5705|qmPL3XB2SWZNcWakEPXtJxE1PjWPBqef10RS5KHa';

    @AuraEnabled(cacheable=true)
    public static ConnectApi.ExternalCredential getExternalCredential()
    {
        ConnectApi.ExternalCredential cred = ConnectApi.NamedCredentials.getExternalCredential(EX_CRED_NAME);
        
        return cred;
    }
}