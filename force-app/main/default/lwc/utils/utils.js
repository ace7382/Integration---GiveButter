//TODO: The data tables should be generalized and these
//      functions can be moved into a general data row class
//      instead of being utility functions

const setChanged = (element, isChanged) =>
{
    element.classList.remove('errored');

    if (isChanged)
        element.classList.add('changed');
    else
        element.classList.remove('changed');
}

const toggleChanged = (element) =>
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

const activeBoxChanged = (event, owner) =>
{
    const comboBoxes = Array.from(owner.template.querySelectorAll('lightning-combobox'));

    comboBoxes
        .filter((element) => element.name === event.target.name)
        .forEach((element) => 
        {
            element.disabled = !event.target.checked;
        });

    toggleChanged(event.target.parentNode);
}

const sfComboboxChanged = (event, mappings) => 
{
    const mapVal = mappings.find((x) => x.Id === event.target.name).SF_Object__c;

    setChanged(event.target.parentNode, mapVal !== event.target.value);
}

const getUniqueIDs = (comboBoxes) =>
{
    let objectValCount = {};
    let nonUniqueIds = [];

    comboBoxes.forEach(box => 
    {
        if (!box.value || box.value.trim() === '') 
            return;
        
        if (objectValCount[box.value]) 
            objectValCount[box.value] += 1;
        else 
            objectValCount[box.value] = 1;
    });

    comboBoxes.forEach(box => 
    {
        if (objectValCount[box.value] > 1) 
            nonUniqueIds.push(box.name);
    });

    return nonUniqueIds;
}

export { 
    setChanged
    , toggleChanged
    , activeBoxChanged
    , sfComboboxChanged
    , getUniqueIDs
};