import { LightningElement } from 'lwc';
import { wire } from 'lwc';
// import { ShowToastEvent } from "lightning/platformShowToastEvent";
// import { refreshApex } from '@salesforce/apex';

import getObjectMaps from '@salesforce/apex/ObjectMappingController.getObjectMappingList';

export default class GB_FieldMappingComponent extends LightningElement
{
    mapData;
    wiredObjectMapsResult;

    initialized = false;
    isSaving = false;

    @wire(getObjectMaps)
    maps(result)
    {
        this.wiredObjectMapsResult = result;
        if (result.data)
        {
            console.log('found ' + result.data.length + ' records');
            console.log(result.data);
            this.mapData = result.data;
            this.initialized = true;
        }
        else if (result.error)
        {
            this.error = result.error;
            this.maps = undefined;
        }
    }

    async handleSaveAll()
    {
        if (this.isSaving) return;

        this.isSaving = true;

        const objectsToSave = this.template.querySelectorAll('c-g-b_-field-mapping-table');

        try{
            objectsToSave.forEach(async obj => { await obj.handleSave(); });
        }
        catch (e)
        {
            console.log(e.message);
        }

        this.isSaving = false;
    }
}