import { LightningElement } from 'lwc';
import { wire } from 'lwc';
// import { ShowToastEvent } from "lightning/platformShowToastEvent";
// import { refreshApex } from '@salesforce/apex';

//import getObjectList from '@salesforce/apex/ObjectMappingController.getObjectLabelsList';
import getObjectMaps from '@salesforce/apex/ObjectMappingController.getObjectMappingList';
// import updateMappings from '@salesforce/apex/ObjectMappingController.updateObjectMappings';

export default class GB_FieldMappingComponent extends LightningElement
{
    mapData;
    wiredObjectMapsResult;
    
    @wire(getObjectMaps)
    maps(result)
    {
        this.wiredObjectMapsResult = result;
        if (result.data)
        {
            console.log('found ' + result.data.length + ' records');
            console.log(result.data);
            this.mapData = result.data;
        }
        else if (result.error)
        {
            this.error = result.error;
            this.maps = undefined;
        }
    }
}