public with sharing class CredentialCreator 
{
    static final String EX_CRED_NAME            = 'GiveButter_Credential';
    //String externalCredentialLabel  = 'GiveButter API Key Credential';
    static final String PRINCIPAL_NAME          = 'API Key';
    static final String PERMISSION_SET_NAME     = 'GiveButter_API_Access';
    static final String PERMISSION_SET_LABEL    = 'GiveButter - API Key Named Credential Access';
    // String credentialName           = 'key';
    // String headerName               = 'Authorization';
    //String apiKey                   = '5705|qmPL3XB2SWZNcWakEPXtJxE1PjWPBqef10RS5KHa';

    @AuraEnabled(cacheable=true)
    public static ConnectApi.ExternalCredential getExternalCredential()
    {
        ConnectApi.ExternalCredential cred = ConnectApi.NamedCredentials.getExternalCredential(EX_CRED_NAME);
        
        return cred;
    }

    @AuraEnabled(cacheable=true)
    public static Boolean getPrincipal()
    {
        ConnectApi.ExternalCredential cred = getExternalCredential();

        if (cred == null)
        {
            return false;
        }
        else
        {
            if (cred.principals == null || cred.principals.isEmpty())
            {
                return false;
            }

            for (ConnectApi.ExternalCredentialPrincipal principal : cred.principals)
            {
                if (principal.principalName == PRINCIPAL_NAME)
                {
                    return true;
                }
            }

            return false;
        }
    }

    @AuraEnabled(cacheable=true)
    public static Boolean getAPICredential(String apiKey)
    {
        ConnectApi.Credential cred = ConnectApi.NamedCredentials.getCredential(
                                        EX_CRED_NAME
                                        , PRINCIPAL_NAME
                                        , ConnectApi.CredentialPrincipalType.NamedPrincipal);

        if (cred == null)
        {
            return false;
        }

        for (ConnectApi.CredentialValue credValue : cred.credentials.values())
        {
            if (credValue.value == apiKey)
            {
                return true;
            }
        }

        return false;
    }

    @AuraEnabled(cacheable=true)
    public static PermissionSet getPermissionSet()
    {
        List<PermissionSet> permSets =  [   SELECT 
                                                Id
                                                , Name 
                                            FROM PermissionSet 
                                            WHERE Name =: PERMISSION_SET_NAME
                                            WITH SECURITY_ENFORCED
                                            LIMIT 1
                                        ];

        if (permSets.size() > 0)
        {
            return permSets[0];
        }
        else 
        {
            return null;
        }
    }
}