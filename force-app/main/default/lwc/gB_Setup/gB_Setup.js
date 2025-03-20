import { LightningElement } from 'lwc';
import { wire } from 'lwc';
import { api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import getExternalCredential from '@salesforce/apex/CredentialCreator.getExternalCredential';
import getPrincipal from '@salesforce/apex/CredentialCreator.getPrincipal';
import getAPICredential from '@salesforce/apex/CredentialCreator.getAPICredential';

import getBaseURL from '@salesforce/apex/Utils.getBaseURL';

export default class GB_Setup extends NavigationMixin(LightningElement) 
{
    error;

    apiInputValue;

    externalCredential;
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

    @api
    get externalCredentialURL()
    {
        if (this.externalCredential)
            return this.baseUrl.data + '/lightning/setup/NamedCredential/ExternalCredential/' + this.externalCredential.id + '/view';

        return '';
    }

    handleAPIInputCange(event)
    {
        this.apiInputValue = event.detail.value;
    }

    navigateToExternalCredential()
    {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.externalCredential.Id,
                objectApiName: 'ExternalCredential',
                actionName: 'view'
            }
        });
    }
}