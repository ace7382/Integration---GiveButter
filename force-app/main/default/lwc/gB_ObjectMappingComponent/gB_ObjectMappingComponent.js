import { LightningElement } from 'lwc';
import { wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from '@salesforce/apex';

import getObjectList from '@salesforce/apex/ObjectMappingController.getObjectLabelsList';
import getObjectMaps from '@salesforce/apex/ObjectMappingController.getObjectMappingList';
import updateMappings from '@salesforce/apex/ObjectMappingController.updateObjectMappings';

import { toggleChanged } from 'c/utils';
import { activeBoxChanged } from 'c/utils';
import { sfComboboxChanged } from 'c/utils';
import { getUniqueIDs } from 'c/utils';

export default class GB_ObjectMappingComponent extends LightningElement 
{
    error;
    mapData;
    objectList = [];
    t = true;
    f = false;
    isSaving = false;

    //need for refresh apex
    wiredObjectMapsResult;

    @wire(getObjectList)
    objects({error, data})
    {
        if (data)
        {
            console.log(data);
            
            this.objectList = data.map(obj => ({ label: obj, value: obj }));
            this.objectList.unshift({ label: " ", value: "" });
        }
        else if (error)
        {
            this.error = error;
            this.objectList = undefined;
        }
    }

    @wire(getObjectMaps)
    maps(result)
    {
        this.wiredObjectMapsResult = result;
        if (result.data)
        {
            this.mapData = result.data;
        }
        else if (result.error)
        {
            this.error = result.error;
            this.maps = undefined;
        }
    }

    handleActiveChange(event)
    {
        activeBoxChanged(event, this);
    }

    handleSFObjectChanged(event)
    {
        sfComboboxChanged(event, this.mapData);
    }

    async handleSave()
    {
        if (this.isSaving) return;

        this.isSaving = true;

        const newMapSettings = [];
        const checkboxes = Array.from(this.template.querySelectorAll('lightning-input'))
        const comboBoxes = Array.from(this.template.querySelectorAll('lightning-combobox'));

        checkboxes.forEach((element) => {
            newMapSettings.push( { Id: element.name, Active__c: element.checked, SF_Object__c: "" } );
        });

        console.log("New Settings pre-combo: ");
        console.log(newMapSettings);

        comboBoxes.forEach((element) => {
            element.parentNode.classList.remove('errored');
            newMapSettings.find((x) => x.Id === element.name).SF_Object__c = element.value;
        });

        console.log(newMapSettings);

        //const dupeSFObjs = this.findNonUniqueSFObjects(comboBoxes);
        const dupeSFObjs = getUniqueIDs(comboBoxes);

        if (dupeSFObjs.length > 0)
        {
            const evt = new ShowToastEvent({
                title: 'Mappings NOT Saved',
                message: 'Each Object must be mapped to a unique Salesforce Object',
                variant: 'error',
                mode: 'dissmissable'
            });

            this.dispatchEvent(evt);

            dupeSFObjs.forEach(x => comboBoxes.find(box => box.name === x).parentNode.classList.add('errored'));
        }
        else
        {
            try {
                await updateMappings({ updatedMappings: newMapSettings });

                const evt = new ShowToastEvent({
                    title: 'Object Mappings saved Successfully',
                    message: 'Field Mappings may need to be adjusted now',
                    variant: 'success',
                    mode: 'dismissable'
                });

                this.dispatchEvent(evt);

                await refreshApex(this.wiredObjectMapsResult).then(() => {
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