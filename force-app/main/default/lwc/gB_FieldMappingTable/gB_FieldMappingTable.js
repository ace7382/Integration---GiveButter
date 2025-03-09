import { LightningElement } from 'lwc';
import { api } from 'lwc';
import { wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from '@salesforce/apex';

import getFieldListForObject from '@salesforce/apex/ObjectMappingController.getFieldsByObject';
import getFieldMappings from '@salesforce/apex/ObjectMappingController.getFieldMappingsByObjectId';
import updateFieldMappings from '@salesforce/apex/ObjectMappingController.updateFieldMappings';

// import { setChanged } from 'c/utils';
import { toggleChanged } from 'c/utils';
import { activeBoxChanged } from 'c/utils';
import { sfComboboxChanged } from 'c/utils';
import { getUniqueIDs } from 'c/utils';

export default class GB_FieldMappingTable extends LightningElement 
{
    @api objectMappingInfo;
    @api currentValue; // current SF_Field dropdown value

    fieldMappings;
    fieldsForObject = [];

    error;
    t = true;
    f = false;

    isSaving = false;
    fieldsInitialized = false;

    //need for refresh apex
    wiredFieldMappingsResult;

    @wire(getFieldMappings, { objectId: '$objectMappingInfo.Id' })
    mappings(result)
    {
        console.log(this.objectMapId);

        this.wiredFieldMappingsResult = result;

        if (result.data)
        {
            this.fieldMappings = result.data;
        }
        else if (result.error)
        {
            this.error = result.error;
            this.fieldMappings = undefined;
        }
    }

    @wire(getFieldListForObject, { objectDeveloperName: '$objectMappingInfo.SF_Object__c'})
    fieldOptions({ error, data })
    {
        console.log("-------");
        console.log(data);

        if (data)
        {            
            Object.keys(data).forEach((key) => this.fieldsForObject.push({ value: key, label: data[key] }));
            this.fieldsForObject.sort((a, b) => a.label.localeCompare(b.label));

            this.fieldsForObject.unshift({ value: '', label: ' ' });

            this.fieldsInitialized = true;
        }
        else if (error)
        {
            this.error = error;
            this.fieldsForObject = undefined;
        }
    }

    handleActiveChange(event)
    {
        activeBoxChanged(event, this);
    }

    handleSFObjectChanged(event)
    {
        sfComboboxChanged(event, this.fieldMappings);
    }

    @api
    async handleSave()
    {
        if (this.isSaving) return;

        this.isSaving = true;

        const newMapSettings = [];
        const checkboxes = Array.from(this.template.querySelectorAll('lightning-input'))
        const comboBoxes = Array.from(this.template.querySelectorAll('lightning-combobox'));

        checkboxes.forEach((element) => {
            newMapSettings.push( { Id: element.name, Active__c: element.checked, SF_Field__c: "" } );
        });

        console.log("New Settings pre-combo: ");
        console.log(newMapSettings);

        comboBoxes.forEach((element) => {
            element.parentNode.classList.remove('errored');
            newMapSettings.find((x) => x.Id === element.name).SF_Field__c = element.value;
        });

        console.log(newMapSettings);

        const dupeSFObjs = getUniqueIDs(comboBoxes);

        if (dupeSFObjs.length > 0)
        {
            const evt = new ShowToastEvent({
                title: '$this.objectMappingInfo.Name + : Mappings NOT Saved',
                message: 'Each Field must be mapped to a unique Salesforce Field',
                variant: 'error',
                mode: 'dissmissable'
            });

            this.dispatchEvent(evt);

            dupeSFObjs.forEach(x => comboBoxes.find(box => box.name === x).parentNode.classList.add('errored'));
        }
        else
        {
            try {
                await updateFieldMappings({ updatedMappings: newMapSettings });

                const evt = new ShowToastEvent({
                    title: '$this.objectMappingInfo.Name + : Field Mappings saved Successfully',
                    variant: 'success',
                    mode: 'dismissable'
                });

                this.dispatchEvent(evt);

                await refreshApex(this.wiredFieldMappingsResult).then(() => {
                    const changedCells = Array.from(this.template.querySelectorAll('.changed'));

                    changedCells.forEach((element) => {
                        toggleChanged(element);
                    });
                 });
            } 
            catch (error) {
                console.log(error);
            }
        }

        this.isSaving = false;
    }
}