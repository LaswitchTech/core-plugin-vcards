// vCards
const vCardForm = function(form,values = {},modal = null){

    // Initialize Values
    var Values = {
        category: null,
        name: null,
        dba: null,
        title: null,
        role: null,
        email: null,
        address: null,
        city: null,
        country: null,
        state: null,
        zipcode: null,
        tollfree: null,
        phone: null,
        mobile: null,
        fax: null,
        website: null,
        tags: null,
        industries: null,
        businessNumber: null,
        taxExtension: null,
        importerExtension: null,
        locale: null,
    };

    // Set Values
    if(values){
        for(const [key, value] of Object.entries(values)){
            if(typeof Values[key] !== 'undefined'){
                switch(key){
                    case 'country':
                    case 'state':
                        Values[key] = value;
                        if(typeof value.code !== 'undefined') Values[key] = value.code;
                        break;
                    default:
                        Values[key] = value;
                        break;
                }
            }
        }
    }

    // name
    form.add(
        {
            name: 'name',
            label: builder.Locale.get('Name'),
            icon: 'hash',
            type: 'text',
            value: Values.name,
            class: {
                field: 'col-12',
                label: 'text-bg-primary',
            },
        }
    );

    // Check the category
    if(['Organization','Lead','Client'].includes(Values.category)){

        // dba
        form.add(
            {
                name: 'dba',
                label: builder.Locale.get('Doing Business As'),
                icon: 'hash',
                type: 'text',
                value: Values.dba,
                class: {
                    field: 'col-12',
                },
            },
        );
    } else {

        // title
        form.add(
            {
                name: 'title',
                label: builder.Locale.get('Title'),
                icon: 'hash',
                type: 'text',
                value: Values.title,
                class: {
                    field: 'col-6',
                },
            }
        );

        // role
        form.add(
            {
                name: 'role',
                label: builder.Locale.get('Role'),
                icon: 'hash',
                type: 'select2',
                multiple: true,
                options: [
                    {id: 'General', text: builder.Locale.get('General')},
                    {id: 'Billing', text: builder.Locale.get('Billing')},
                    {id: 'Documents', text: builder.Locale.get('Documents')},
                    {id: 'Delegation', text: builder.Locale.get('Delegation')},
                    {id: 'Signatory', text: builder.Locale.get('Signatory')},
                    {id: 'Administrator', text: builder.Locale.get('Administrator')},
                    {id: 'Owner', text: builder.Locale.get('Owner')},
                    {id: 'Other', text: builder.Locale.get('Other')},
                ],
                value: Values.role,
                class: {
                    field: 'col-6',
                },
            }
        );
    }

    // address
    form.add(
        {
            name: 'address',
            label: builder.Locale.get('Address'),
            icon: 'pin-map',
            type: 'text',
            value: Values.address,
            class: {
                field: 'col-7',
            },
        }
    );

    // city
    form.add(
        {
            name: 'city',
            label: builder.Locale.get('City'),
            icon: 'geo-alt',
            type: 'text',
            value: Values.city,
            class: {
                field: 'col-5',
            },
        }
    );

    // country
    form.add(
        {
            name: 'country',
            label: 'Country',
            icon: 'geo-alt',
            type: 'country',
            value: Values.country,
            modal: modal,
            class: {
                field: 'col',
            },
        }
    );

    // state
    form.add(
        {
            name: 'state',
            label: 'State',
            icon: 'geo-alt',
            type: 'state',
            value: Values.state,
            modal: modal,
            class: {
                field: 'col',
            },
        }
    );

    // zipcode
    form.add(
        {
            name: 'zipcode',
            label: builder.Locale.get('Zip Code'),
            icon: 'geo',
            type: 'zipcode',
            value: Values.zipcode,
            class: {
                field: 'col',
            },
        }
    );

    // email
    form.add(
        {
            name: 'email',
            label: builder.Locale.get('E-Mail'),
            icon: 'at',
            type: 'email',
            value: Values.email,
            class: {
                field: 'col-8',
                label: 'text-bg-primary',
            },
        }
    );

    // fax
    form.add(
        {
            name: 'fax',
            label: builder.Locale.get('Fax'),
            icon: 'telephone-outbound',
            type: 'phone',
            value: Values.fax,
            class: {
                field: 'col',
            },
        }
    );

    // phone
    form.add(
        {
            name: 'phone',
            label: builder.Locale.get('Phone'),
            icon: 'telephone',
            type: 'phone-extension',
            value: Values.phone,
            class: {
                field: 'col',
                label: 'text-bg-primary',
            },
        }
    );

    // mobile
    form.add(
        {
            name: 'mobile',
            label: builder.Locale.get('Mobile'),
            icon: 'telephone',
            type: 'phone-extension',
            value: Values.mobile,
            class: {
                field: 'col',
            },
        }
    );

    // tollfree
    form.add(
        {
            name: 'tollfree',
            label: builder.Locale.get('Toll Free'),
            icon: 'telephone-inbound',
            type: 'phone-international',
            value: Values.tollfree,
            class: {
                field: 'col',
            },
        }
    );

    // locale
    form.add(
        {
            name: 'locale',
            label: builder.Locale.get('Language'),
            icon: 'globe-americas',
            type: 'locale',
            value: Values.locale,
            modal: modal,
            class: {
                field: 'col-6',
                label: 'text-bg-primary',
            },
        },
        function(input,form){
            if(!['Organization','Lead','Client'].includes(Values.category)){
                input.removeClass('mb-3');
            }
        },
    );

    // website
    form.add(
        {
            name: 'website',
            label: builder.Locale.get('Website'),
            icon: 'globe2',
            type: 'text',
            value: Values.website,
            class: {
                field: 'col-6',
            },
        },
        function(input,form){
            if(!['Organization','Lead','Client'].includes(Values.category)){
                input.removeClass('mb-3');
            }
        },
    );

    // Check the category
    if(['Organization','Lead','Client'].includes(Values.category)){

        // businessNumber
        form.add(
            {
                name: 'businessNumber',
                label: builder.Locale.get('Busniness Number'),
                icon: 'hash',
                type: 'text',
                value: Values.businessNumber,
                class: {
                    field: 'col-4',
                },
            }
        );

        // taxExtension
        form.add(
            {
                name: 'taxExtension',
                label: builder.Locale.get('Tax Extension'),
                icon: 'hash',
                type: 'text',
                value: Values.taxExtension,
                class: {
                    field: 'col-4',
                },
            }
        );

        // importerExtension
        form.add(
            {
                name: 'importerExtension',
                label: builder.Locale.get('Importer Extension'),
                icon: 'hash',
                type: 'text',
                value: Values.importerExtension,
                class: {
                    field: 'col-4',
                },
            }
        );

        // tags
        form.add(
            {
                name: 'tags',
                label: builder.Locale.get('Tags'),
                icon: 'tags',
                type: 'tags',
                value: Values.tags ?? [],
                modal: modal,
                class: {
                    field: 'col-12',
                },
            }
        );

        // industries
        form.add(
            {
                name: 'industries',
                label: builder.Locale.get('Industries'),
                icon: 'building',
                type: 'industries',
                value: Values.industries ?? [],
                modal: modal,
                class: {
                    field: 'col-12',
                },
            },
            function(input,form){
                input.removeClass('mb-3');
            },
        );
    }
}
const vCardModal = function(id){
    $.ajax({
        url: '/api/vcards/fetch?id='+id,
        type: 'GET',dataType: 'json',
        success: function(response) {
            builder.Component(
                "modal",
                null,
                {
                    onEnter: false,
                    destroy: true,
                    icon: "person-vcard",
                    title: response.record.name,
                    body: response.preview,
                    cancel: false,
                    submit: false,
                    size: "lg",
                },
                function(modal,component){
                    component.addClass('modal-primary');
                    component.body.addClass('rounded-bottom');
                    component.footer.remove();
                    // Check if response.record.category is in the list of categories [Lead, Customer, Supplier, Contact]
                    if(response.edit){
                        $(document.createElement('button'))
                            .addClass('btn btn-lg btn-link')
                            .html('<i class="bi bi-pencil"></i>')
                            .prependTo(component.header.tools)
                            .click(function(){
                                modal.hide();
                                vCardModalEdit(response.record);
                            });
                    }
                    component.body.find('button[data-type="avatar"][data-vcard="'+id+'"]').click(function(){
                        vCardModalAvatar(response.record);
                    });
                    modal.show();
                },
            );
        }
    });
}
const vCardModalAvatar = function(vcard){
    builder.Component(
        "modal",
        {
            onEnter: false,
            destroy: true,
            icon: "upload",
            title: builder.Locale.get("Upload Picture"),
            cancel: false,
            submit: true,
            callback: {
                submit: function(element,modal){
                    element.form.submit();
                },
            },
        },
        function(modal,component){
            const componentModal = component;
            component.addClass('modal-info');
            component.footer.submit.addClass('btn-info').removeClass('btn-link').attr({
                "style": "border-bottom-right-radius: var(--bs-modal-inner-border-radius) !important;border-bottom-left-radius: var(--bs-modal-inner-border-radius) !important;",
            }).text(builder.Locale.get('Upload'));
            component.footer.submit.icon = $(document.createElement('i')).addClass('bi bi-upload me-1').prependTo(component.footer.submit);
            component.form = builder.Component(
                'form',
                component.body,
                {
                    class:{
                        form: 'row',
                        field: 'col',
                    },
                    callback:{
                        submit: function(form){

                            // Get the values
                            var values = form.val();

                            // Run the file promise
                            values.file.then(fileData => {

                                // Retrieve the first file
                                var file = fileData[0];

                                // Add some properties
                                file.checksum = builder.Helper.md5(file.content.split(',')[1]);
                                file.path = 'avatars';
                                file.isPublic = 1;
                                file.targetTable = 'vcards';
                                file.targetId = vcard.id;

                                // AJAX Request
                                $.ajax({
                                    url: '/api/files/upload',
                                    headers: {'X-CSRF-Authorization': CSRF_KEY},
                                    type: 'POST',dataType: 'json',
                                    data: file,
                                    success: function(response) {

                                        // Setup vCard update
                                        var vCardData = {
                                            avatar: response.record.id,
                                        };

                                        // AJAX Request
                                        $.ajax({
                                            url: '/api/vcards/update?id='+vcard.id,
                                            headers: {'X-CSRF-Authorization': CSRF_KEY},
                                            type: 'POST',dataType: 'json',
                                            data: vCardData,
                                            success: function(response) {

                                                // Update all the avatars
                                                $('img[data-type="avatar"][data-vcard="'+vcard.id+'"]').each(function(){
                                                    var img = $(this);
                                                    img.attr('src', window.location.origin + '/files/get?uuid=' + response.record.avatar.uuid);
                                                });

                                                // Close the modal
                                                modal.hide();
                                            }
                                        });
                                    }
                                });
                            }).catch(error => {
                                console.error('Error reading files:', error);
                            });
                        },
                    },
                },
                function(form,component){

                    // file
                    form.add(
                        {
                            name: 'file',
                            label: builder.Locale.get('Upload'),
                            icon: 'upload',
                            type: 'file',
                        },
                    );

                    // Open the modal
                    modal.show();
                },
            );
        },
    );
}
const vCardModalEdit = function(vcard){
    builder.Component(
        "modal",
        null,
        {
            onEnter: false,
            destroy: true,
            icon: "person-vcard",
            title: vcard.name,
            cancel: false,
            submit: true,
            size: "xl",
            callback: {
                submit: function(element,modal){
                    element.form.submit();
                },
                onHide: function(component,modal){
                    vCardModal(vcard.id, vcard.name);
                },
            },
        },
        function(modal,component){
            const componentModal = component;
            component.addClass('modal-warning');
            component.body.addClass('rounded-bottom');
            component.footer.submit.addClass('btn-success').removeClass('btn-link').attr({
                "style": "border-bottom-right-radius: var(--bs-modal-inner-border-radius) !important;border-bottom-left-radius: var(--bs-modal-inner-border-radius) !important;",
            });
            component.footer.submit.icon = $(document.createElement('i')).addClass('bi bi-save me-1').prependTo(component.footer.submit);
            component.form = builder.Component(
                'form',
                component.body,
                {
                    class:{
                        form: 'row row-cols-3',
                        field: 'mb-3 col',
                    },
                    callback:{
                        val: function(values){
                            // Check if the industries array is empty
                            if(typeof values.tags !== "undefined" && values.tags.length === 0){
                                values.tags = '[]';
                            }
                            // Check if the industries array is empty
                            if(typeof values.industries !== "undefined" && values.industries.length === 0){
                                values.industries = '[]';
                            }
                            return values;
                        },
                        submit: function(form){
                            $.ajax({
                                url: '/api/vcards/update?id='+vcard.id,
                                headers: {'X-CSRF-Authorization': CSRF_KEY},
                                type: 'POST',dataType: 'json',
                                data: form.val(),
                                success: function(response) {
                                    modal.hide();
                                }
                            });
                        },
                    },
                },
                function(form,component){
                    vCardForm(form,vcard,componentModal);
                    modal.show();
                },
            );
        },
    );
}

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
