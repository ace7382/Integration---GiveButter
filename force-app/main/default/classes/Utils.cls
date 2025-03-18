public with sharing class Utils 
{
    @AuraEnabled(cacheable=true)
    public static string getBaseURL()
    {
        return URL.getOrgDomainUrl().toString();
    }
}