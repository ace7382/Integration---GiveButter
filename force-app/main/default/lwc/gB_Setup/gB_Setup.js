import { LightningElement } from 'lwc';
import { wire } from 'lwc';
import { api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import getExternalCredential from '@salesforce/apex/CredentialCreator.getExternalCredential';
import getPrincipal from '@salesforce/apex/CredentialCreator.getPrincipal';
import getAPICredential from '@salesforce/apex/CredentialCreator.getAPICredential';
import getPermissionSet from '@salesforce/apex/CredentialCreator.getPermissionSet';

import getBaseURL from '@salesforce/apex/Utils.getBaseURL';

export default class GB_Setup extends NavigationMixin(LightningElement) 
{
    error;

    apiInputValue;

    externalCredential;
    permissionSet;

    principalFound;
    apiCredentialFound;

    @wire(getBaseURL)
    baseUrl;

    @wire(getExternalCredential)
    ec({error, data})
    {
        if (data)
        { 
            this.externalCredential = data;
        }
        else if (error)
        {
            this.error = error;
            this.externalCredential = undefined;
        }
    }

    @wire(getPrincipal)
    prin({error, data})
    {
        if (data)
        {
            this.principalFound = true;
        }
        else if (error)
        {
            this.error = error;
            this.principalFound = false;
        }
    }

    @wire(getAPICredential, { apiKey: '$apiInputValue' })
    apiCred({error, data})
    {
        console.log('Looking for api credential with key: ' + this.apiInputValue + '...');
        console.log(data);

        if (data)
        {
            this.apiCredentialFound = true;
        }
        else if (!data)
        {
            this.apiCredentialFound = false;
        }
        else if (error)
        {
            this.error = error;
            this.apiCredentialFound = false;
        }

        console.log(this.apiCredentialFound);
    }

    @wire(getPermissionSet)
    permSet({error, data})
    {
        if (data)
        {
            console.log('perm set');
            console.log(data);

            this.permissionSet = data;
        }
        else if (error)
        {
            this.error = error;
            this.permissionSet = undefined;
        }
    }

    @api
    get externalCredentialURL()
    {
        if (this.externalCredential)
            return this.baseUrl.data + '/lightning/setup/NamedCredential/ExternalCredential/' + this.externalCredential.id + '/view';

        return '';
    }

    handleAPIInputChange(event)
    {
        this.apiInputValue = event.detail.value;
    }

    navigateToPermissionSet()
    {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.permissionSet.Id,
                objectApiName: 'PermissionSet',
                actionName: 'view'
            }
        }).then(url => 
            {
                window.open(url, "_blank");
            }
        );
    }
}