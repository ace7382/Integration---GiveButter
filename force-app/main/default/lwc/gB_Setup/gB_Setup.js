import { LightningElement } from 'lwc';
import { wire } from 'lwc';
import { api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import getExternalCredential from '@salesforce/apex/CredentialCreator.getExternalCredential';
import getPrincipal from '@salesforce/apex/CredentialCreator.getPrincipal';

import getBaseURL from '@salesforce/apex/Utils.getBaseURL';

export default class GB_Setup extends NavigationMixin(LightningElement) 
{
    error;

    externalCredential;
    principalFound;

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
        if (this.externalCredential && data)
        {
            this.principalFound = true;
        }
        else if (error)
        {
            this.error = error;
            this.principalFound = false;
        }

        console.log('principal found ' + this.principalFound);
    }

    @api
    get externalCredentialURL()
    {
        return this.baseUrl.data + '/lightning/setup/NamedCredential/ExternalCredential/' + this.externalCredential.id + '/view';
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