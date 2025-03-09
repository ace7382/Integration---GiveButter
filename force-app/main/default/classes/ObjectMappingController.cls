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

    @AuraEnabled(cacheable=true)
    public static Map<String, String> getFieldsByObject(String objectDeveloperName)
    {
        SObjectType objType = Schema.getGlobalDescribe().get(objectDeveloperName);

        Map<String,Schema.SObjectField> fields = objType.getDescribe().fields.getMap();

        Map<String, String> results = new Map<String, String>();

        for (Schema.SObjectField field : fields.values()) 
        {
            results.put(field.getDescribe().getName(), field.getDescribe().getLabel());
        }

        System.debug(results);

        return results;
    }

    @AuraEnabled(cacheable=true)
    public static List<GiveButter_Field_Mapping__c> getFieldMappingsByObjectId(String objectId)
    {
        return [
            SELECT Id, Name, Active__c, SF_Field__c
            FROM GiveButter_Field_Mapping__c
            WHERE GiveButter_Object__r.Id = :objectId
            WITH SECURITY_ENFORCED
            ORDER BY Name
        ];
    }

    //TODO: Make a generalized imperitive update function
    //      pass in generic SObject probably
    @AuraEnabled(cacheable=false)
    public static void updateObjectMappings(List<GiveButter_Object_Mapping__c> updatedMappings) 
    {
        try 
        {
            update updatedMappings;
        } 
        catch (Exception e) 
        {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=false)
    public static void updateFieldMappings(List<GiveButter_Field_Mapping__c> updatedMappings)
    {
        try 
        {
            update updatedMappings;
        } 
        catch (Exception e)
        {
            throw new AuraHandledException(e.getMessage());
        }
    }
}