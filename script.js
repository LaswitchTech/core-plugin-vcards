// Check if the task has a vCard property
function process_function_hasvCardProperty(task, value, callback = null){

    // Loop through the contact list
    if(typeof task.target !== 'undefined' && typeof task.target.vcard !== 'undefined'){

        // AJAX Request
        API.endpoint('/vcards/fetch?id='+task.target.vcard.id).execute(function(response){

            // Check if the vCard has the property
            if(typeof response.record[value] !== 'undefined' && response.record[value] !== null && response.record[value] !== ''){

                // Execute Callback
                if(typeof callback === "function"){
                    callback(task);
                }
            }
        });
    }
}
function process_meta_hasvCardProperty(key = null){
    const metadata = {
        label: "Check vCard Property",
        description: "Check if the vCard has a property",
        placeholder: "Select an option",
        type: "select",
        options: [
            {id: 'category', text: builder.Locale.get('Category')},
            {id: 'name', text: builder.Locale.get('Name')},
            {id: 'dba', text: builder.Locale.get('Doing Business As')},
            {id: 'title', text: builder.Locale.get('Title')},
            {id: 'role', text: builder.Locale.get('Role')},
            {id: 'address', text: builder.Locale.get('Address')},
            {id: 'city', text: builder.Locale.get('City')},
            {id: 'state', text: builder.Locale.get('State')},
            {id: 'country', text: builder.Locale.get('Country')},
            {id: 'zipcode', text: builder.Locale.get('Zipcode')},
            {id: 'email', text: builder.Locale.get('Email')},
            {id: 'tollfree', text: builder.Locale.get('Tollfree')},
            {id: 'phone', text: builder.Locale.get('Phone')},
            {id: 'mobile', text: builder.Locale.get('Mobile')},
            {id: 'fax', text: builder.Locale.get('Fax')},
            {id: 'website', text: builder.Locale.get('Website')},
            {id: 'locale', text: builder.Locale.get('Locale')},
            {id: 'tags', text: builder.Locale.get('Tags')},
            {id: 'industries', text: builder.Locale.get('Industries')},
            {id: 'businessNumber', text: builder.Locale.get('Business Number')},
            {id: 'taxExtension', text: builder.Locale.get('Tax Extension')},
            {id: 'importerExtension', text: builder.Locale.get('Importer Extension')},
            {id: 'avatar', text: builder.Locale.get('Avatar')},
            {id: 'organization', text: builder.Locale.get('Organization')},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}
