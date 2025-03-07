public with sharing class ObjectMappingController 
{
    @AuraEnabled(cacheable=true)
    public static List<GiveButter_Object_Mapping__c> getObjectMappingList() 
    {
        return [
            SELECT Id, Name, Active__c, SF_Object__c
            FROM GiveButter_Object_Mapping__c
            WITH SECURITY_ENFORCED
            ORDER BY Name
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getObjectLabelsList() 
    {
        List<String> objectNames = new List<String>();

        for (Schema.SObjectType objType : Schema.getGlobalDescribe().values()) 
        {
            objectNames.add(objType.getDescribe().getName());
        }

        objectNames.sort();

        return objectNames;
    }

    @AuraEnabled(cacheable=false)
    public static void updateObjectMappings(List<GiveButter_Object_Mapping__c> updatedMappings) 
    {
        try {
            update updatedMappings;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}