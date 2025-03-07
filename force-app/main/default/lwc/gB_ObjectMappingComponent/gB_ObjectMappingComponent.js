import { LightningElement } from 'lwc';
import { wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from '@salesforce/apex';

import getObjectList from '@salesforce/apex/ObjectMappingController.getObjectLabelsList';
import getObjectMaps from '@salesforce/apex/ObjectMappingController.getObjectMappingList';
import updateMappings from '@salesforce/apex/ObjectMappingController.updateObjectMappings';

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

    handleActiveChange(event)
    {
        const comboBoxes = Array.from(this.template.querySelectorAll('lightning-combobox'));

        comboBoxes
            .filter((element) => element.name === event.target.name)
            .forEach((element) => 
            {
                element.disabled = !event.target.checked;
            });

        this.toggleChanged(event.target.parentNode);
    }

    handleSFObjectChanged(event)
    {
        const mapVal = this.mapData.find((x) => x.Id === event.target.name).SF_Object__c;

        this.setChanged(event.target.parentNode, mapVal !== event.target.value);
    }

    setChanged(element, isChanged)
    {
        element.classList.remove('errored');

        if (isChanged)
            element.classList.add('changed');
        else
            element.classList.remove('changed');
    }

    toggleChanged(element)
    {
        if (!element.classList.contains('changed'))
        {
            element.classList.add('changed')
        }
        else
        {
            element.classList.remove('changed')
        }
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

        const dupeSFObjs = this.findNonUniqueSFObjects(comboBoxes);

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
                        this.toggleChanged(element);
                    });
                 });
            } 
            catch (error) {
                console.log(error);
            }
        }

        this.isSaving = false;
    }

    findNonUniqueSFObjects(comboBoxes) 
    {
        let objectValCount = {};
        let nonUniqueIds = [];

        comboBoxes.forEach(box => 
        {
            if (!box.value || box.value.trim() === '') 
            {
                return;
            }
            
            if (objectValCount[box.value]) 
            {
                objectValCount[box.value] += 1;
            }
            else 
            {
                objectValCount[box.value] = 1;
            }
        });

        comboBoxes.forEach(box => 
        {
            if (objectValCount[box.value] > 1) 
            {
                nonUniqueIds.push(box.name);
            }
        });

        return nonUniqueIds;
    }
}