builder.add('renderers', 'vcard.tags', function(value, data){
    if(typeof data.vcard !== 'undefined'){

        // If no value
        if(value == null || value == '' || (Array.isArray(value) && value.length === 0)){
            return '<div></div>';
        }

        // Create element
        var element = $(document.createElement('div')).addClass('d-flex flex-wrap flex-row');
        for(const [key, unique] of Object.entries(value)){
            $(document.createElement('span')).addClass('badge text-bg-warning m-1').html('<i class="me-1 bi bi-tag"></i>'+unique).css('font-size','0.8rem').appendTo(element);
        }

        // Return element
        return element.prop('outerHTML');
    }
    return '<div>' + value + '</div>';
})
builder.add('renderers', 'vcard.industries', function(value, data){
    if(typeof data.vcard !== 'undefined'){

        // If no value
        if(value == null || value == '' || (Array.isArray(value) && value.length === 0)){
            return '<div></div>';
        }

        // Create element
        var element = $(document.createElement('div')).addClass('d-flex flex-wrap flex-row');
        for(const [key, unique] of Object.entries(value)){
            $(document.createElement('span')).addClass('badge text-bg-primary m-1').html('<i class="me-1 bi bi-crosshair"></i>'+unique).css('font-size','0.8rem').appendTo(element);
        }

        // Return element
        return element.prop('outerHTML');
    }
    return '<div>' + value + '</div>';
})

builder.add('widgets','vcard', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                component: null,
            },
            mode: 'view', // 'view', 'edit' or 'upload'
            data: null,
            callback: {},
        };
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'vcard' + this._id,
            'class': '',
        });
        this._component.id = this._component.attr('id');

        // Open the appropriate modal based on mode
        if(this._properties.mode === 'view'){
            this.view();
        } else if(this._properties.mode === 'edit'){
            this.edit();
        } else if(this._properties.mode === 'upload'){
            this.upload();
        }
    }

    view(){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "person-vcard",
                title: this._builder.Locale.get("vCard"),
                color: 'primary',
                cancel: false,
                submit: false,
                size: "lg",
                callback: {
                    load: function(component, modal){
                        return new Promise((resolve, reject) => {
                            try {
                                $.ajax({
                                    url: '/api/vcards/fetch?id='+self._properties.data,
                                    type: 'GET',dataType: 'json',
                                    success: function(response) {
                                        console.log(response);

                                        // Insert the name in the title
                                        if(response.record.name){
                                            component.header.title.label.append(': ' + response.record.name);
                                        }

                                        // Check if the user is allowed to edit the vCard
                                        if(response.edit){
                                            $(document.createElement('button'))
                                                .addClass('btn btn-lg btn-link')
                                                .html('<i class="bi bi-pencil"></i>')
                                                .prependTo(component.header.tools)
                                                .click(function(){
                                                    modal.hide();
                                                    self.edit();
                                                });
                                        }

                                        // Create the vCard
                                        component.body.vcard = $(document.createElement('div')).attr({
                                            'class': 'vcard row m-0 g-0',
                                        }).appendTo(component.body)

                                        // Create the Avatar column
                                        component.body.vcard.avatar = $(document.createElement('div')).attr({
                                            'class': 'col-12 col-md-4 text-bg-gray-200 p-3 d-flex flex-row flex-lg-column justify-content-start justify-content-lg-center align-items-center',
                                            'style': 'border-bottom-left-radius: var(--bs-modal-inner-border-radius);',
                                        }).appendTo(component.body.vcard);

                                        // Create the Avatar image
                                        component.body.vcard.avatar.img = $(document.createElement('img')).attr({
                                            'class': 'avatar rounded-circle rounded-circle border border-3 cursor-pointer',
                                            'src': '/avatar?id='+response.record.id+'&size=256',
                                        }).appendTo(component.body.vcard.avatar);

                                        // Add an event listener for the avatar image
                                        component.body.vcard.avatar.img.click(function(){
                                            modal.hide();
                                            self.upload();
                                        });

                                        // Create the name column
                                        component.body.vcard.avatar.names = $(document.createElement('div')).attr({
                                            'class': 'd-flex flex-column align-items-start align-items-lg-center justify-content-center',
                                        }).appendTo(component.body.vcard.avatar);
                                        component.body.vcard.avatar.names.name = $(document.createElement('h3')).attr({
                                            'class': 'fw-lighter text-start text-lg-center',
                                        }).text(response.record.name).appendTo(component.body.vcard.avatar.names);
                                        component.body.vcard.avatar.names.dba = $(document.createElement('h4')).attr({
                                            'class': 'fw-lighter text-start text-lg-center text-muted',
                                        }).text(response.record.dba ?? '' + response.record.title ?? '').appendTo(component.body.vcard.avatar.names);

                                        // Create the Info column
                                        component.body.vcard.info = $(document.createElement('div')).attr({
                                            'class': 'col-12 col-md-8 px-2 pb-3',
                                        }).appendTo(component.body.vcard);
                                        component.body.vcard.info.row = $(document.createElement('div')).attr({
                                            'class': 'row m-0 g-3',
                                        }).appendTo(component.body.vcard.info);

                                        // Create the Info rows
                                        for(const [column, value] of Object.entries(response.record)){

                                            // Skip empty values
                                            if(!value || value === 'null' || value === '' || value === 'undefined' || (Array.isArray(value) && value.length === 0)){
                                                continue;
                                            }

                                            // Create the columns
                                            switch(column){
                                                case 'address':
                                                    if(typeof component.body.vcard.info.row.address === 'undefined'){
                                                        const string = response.record.address + (response.record.city ? ', ' + response.record.city : '') + (response.record.state.name ? ', ' + response.record.state.name : '') + (response.record.zipcode ? ', ' + response.record.zipcode : '') + (response.record.country.name ? ', ' + response.record.country.name : '');
                                                        component.body.vcard.info.row.address = $(document.createElement('div')).attr({
                                                            'class': 'col-12',
                                                        }).appendTo(component.body.vcard.info.row);
                                                        component.body.vcard.info.row.address.header = $(document.createElement('h5')).attr({
                                                            'class': 'fw-light text-muted text-capitalize',
                                                        }).text(self._builder.Locale.get('address')).appendTo(component.body.vcard.info.row.address);
                                                        component.body.vcard.info.row.address.body = $(document.createElement('p')).attr({
                                                            'class': 'm-0',
                                                        }).text(string).appendTo(component.body.vcard.info.row.address);
                                                    }
                                                    break;
                                                case 'phone':
                                                case 'mobile':
                                                case 'tollfree':
                                                case 'fax':
                                                    component.body.vcard.info.row[column] = $(document.createElement('div')).attr({
                                                        'class': 'col-12 col-lg-6',
                                                    }).appendTo(component.body.vcard.info.row);
                                                    component.body.vcard.info.row[column].header = $(document.createElement('h5')).attr({
                                                        'class': 'fw-light text-muted text-capitalize',
                                                    }).text(self._builder.Locale.get(column)).appendTo(component.body.vcard.info.row[column]);
                                                    component.body.vcard.info.row[column].body = $(document.createElement('p')).attr({
                                                        'class': 'm-0',
                                                    }).appendTo(component.body.vcard.info.row[column]);
                                                    component.body.vcard.info.row[column].link = $(document.createElement('a')).attr({
                                                        'href': 'tel:' + value,
                                                        'class': 'text-decoration-none',
                                                    }).text(value).appendTo(component.body.vcard.info.row[column].body);
                                                    component.body.vcard.info.row[column].link.i = $(document.createElement('i')).attr({
                                                        'class': 'bi bi-telephone me-1',
                                                    }).prependTo(component.body.vcard.info.row[column].link);
                                                    break;
                                                case 'email':
                                                    component.body.vcard.info.row[column] = $(document.createElement('div')).attr({
                                                        'class': 'col-12 col-lg-6',
                                                    }).appendTo(component.body.vcard.info.row);
                                                    component.body.vcard.info.row[column].header = $(document.createElement('h5')).attr({
                                                        'class': 'fw-light text-muted text-capitalize',
                                                    }).text(self._builder.Locale.get(column)).appendTo(component.body.vcard.info.row[column]);
                                                    component.body.vcard.info.row[column].body = $(document.createElement('p')).attr({
                                                        'class': 'm-0',
                                                    }).appendTo(component.body.vcard.info.row[column]);
                                                    component.body.vcard.info.row[column].link = $(document.createElement('a')).attr({
                                                        'href': 'mailto:' + value,
                                                        'class': 'text-decoration-none',
                                                    }).text(value).appendTo(component.body.vcard.info.row[column].body);
                                                    component.body.vcard.info.row[column].link.i = $(document.createElement('i')).attr({
                                                        'class': 'bi bi-envelope me-1',
                                                    }).prependTo(component.body.vcard.info.row[column].link);
                                                    break;
                                                case 'website':
                                                    component.body.vcard.info.row[column] = $(document.createElement('div')).attr({
                                                        'class': 'col-12 col-lg-6',
                                                    }).appendTo(component.body.vcard.info.row);
                                                    component.body.vcard.info.row[column].header = $(document.createElement('h5')).attr({
                                                        'class': 'fw-light text-muted text-capitalize',
                                                    }).text(self._builder.Locale.get(column)).appendTo(component.body.vcard.info.row[column]);
                                                    component.body.vcard.info.row[column].body = $(document.createElement('p')).attr({
                                                        'class': 'm-0',
                                                    }).appendTo(component.body.vcard.info.row[column]);
                                                    component.body.vcard.info.row[column].link = $(document.createElement('a')).attr({
                                                        'href': value,
                                                        'class': 'text-decoration-none',
                                                    }).text(value).appendTo(component.body.vcard.info.row[column].body);
                                                    component.body.vcard.info.row[column].link.i = $(document.createElement('i')).attr({
                                                        'class': 'bi bi-globe-americas me-1',
                                                    }).prependTo(component.body.vcard.info.row[column].link);
                                                    break;
                                                case 'locale':
                                                case 'businessNumber':
                                                case 'taxExtension':
                                                case 'importerExtension':
                                                    component.body.vcard.info.row[column] = $(document.createElement('div')).attr({
                                                        'class': 'col-12 col-lg-6',
                                                    }).appendTo(component.body.vcard.info.row);
                                                    component.body.vcard.info.row[column].header = $(document.createElement('h5')).attr({
                                                        'class': 'fw-light text-muted text-capitalize',
                                                    }).text(self._builder.Locale.get(column)).appendTo(component.body.vcard.info.row[column]);
                                                    component.body.vcard.info.row[column].body = $(document.createElement('p')).attr({
                                                        'class': 'm-0',
                                                    }).text(value).appendTo(component.body.vcard.info.row[column]);
                                                    break;
                                                case 'role':
                                                case 'tags':
                                                case 'industries':

                                                    // Create the column
                                                    component.body.vcard.info.row[column] = $(document.createElement('div')).attr({
                                                        'class': 'col-12',
                                                    }).appendTo(component.body.vcard.info.row);
                                                    component.body.vcard.info.row[column].header = $(document.createElement('h5')).attr({
                                                        'class': 'fw-light text-muted text-capitalize',
                                                    }).text(self._builder.Locale.get(column)).appendTo(component.body.vcard.info.row[column]);
                                                    component.body.vcard.info.row[column].body = $(document.createElement('p')).attr({
                                                        'class': 'm-0',
                                                    }).appendTo(component.body.vcard.info.row[column]);

                                                    // Determine the icon and color based on the column
                                                    let icon = 'exclamation-triangle';
                                                    let color = 'danger';
                                                    if(column === 'role'){
                                                        icon = 'person-badge';
                                                        color = 'light';
                                                    } else if(column === 'tags'){
                                                        icon = 'tag';
                                                        color = 'warning';
                                                    } else if(column === 'industries'){
                                                        icon = 'crosshair';
                                                        color = 'primary';
                                                    }

                                                    // Append the values as badges
                                                    for(const [key, unique] of Object.entries(value)){
                                                        $(document.createElement('span')).attr({
                                                            'class': 'badge me-1 text-capitalize text-bg-'+color,
                                                        }).html('<i class="me-1 bi bi-'+icon+'"></i>'+unique).appendTo(component.body.vcard.info.row[column].body);
                                                    }
                                                    break;
                                            }
                                        }

                                        // Resolve the promise
                                        resolve();
                                    }
                                });
                            } catch(e) { reject(e); }
                        });
                    },
                },
            },
            function(modal,component){

                // Styling
                component.body.addClass('p-0');

                // Show the modal
                modal.show();
            },
        );
    }

    upload(callback = null){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "person-vcard",
                title: this._builder.Locale.get("Upload avatar"),
                color: 'info',
                callback: {
                    onHide: function(){
                        if(self._properties.mode === 'view'){
                            self.view();
                        }
                    },
                },
            },
            function(modal,component){

                // Set the parent
                const parent = component.dialog;

                // Styling
                component.body.addClass('p-0');

                // Create the Form
                self._builder.Utility(
                    'form',
                    component.body,
                    {
                        callback: {
                            submit: function(form){

                                // Show the modal spinner
                                modal.spinner(true);

                                // Run the file promise
                                form.val().file.then(fileData => {

                                    // Retrieve the first file
                                    var file = fileData[0];

                                    // Add some properties
                                    file.checksum = self._builder.Helper.md5(file.content.split(',')[1]);
                                    file.path = 'avatars';
                                    file.isPublic = 1;
                                    file.targetTable = 'vcards';
                                    file.targetId = self._properties.data;

                                    // AJAX Request
                                    $.ajax({
                                        url: '/api/files/upload',
                                        headers: {'X-CSRF-Authorization': CSRF_KEY},
                                        type: 'POST',dataType: 'json',
                                        data: file,
                                        success: function(response) {

                                            // AJAX Request
                                            $.ajax({
                                                url: '/api/vcards/update?id='+self._properties.data,
                                                headers: {'X-CSRF-Authorization': CSRF_KEY},
                                                type: 'POST',dataType: 'json',
                                                data: {avatar: response.record.id},
                                                success: function(response) {

                                                    // Check if the callback is defined
                                                    if(typeof self._properties.callback === 'function'){
                                                        // Call the callback with the response
                                                        self._properties.callback(response);
                                                    }

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
                        }
                    },
                    function(form,component){

                        // Add event listener on the modal submit button
                        parent.content.footer.submit.click(function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            form.submit();
                        });

                        // Upload
                        form.add(
                            'file',
                            {
                                name: 'file',
                                // label: self._builder.Locale.get('Upload'),
                                placeholder: self._builder.Locale.get('Select file'),
                                class: {
                                    component: 'bg-gray-200 p-3 py-2 rounded-0',
                                },
                            }
                        );

                        // Show the modal
                        modal.show();
                    },
                );
            },
        );
    }

    edit(callback = null){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                onEnter: false,
                icon: "person-vcard",
                title: this._builder.Locale.get("vCard"),
                color: 'warning',
                size: "xl",
                callback: {
                    onHide: function(){
                        if(self._properties.mode === 'view'){
                            self.view();
                        }
                    },
                    load: function(component, modal){
                        return new Promise((resolve, reject) => {
                            try {
                                // Set the parent
                                const parent = component.dialog;

                                // Retrieve the libraries
                                $.ajax({
                                    url: '/api/library/fetch',
                                    type: 'GET',dataType: 'json',
                                    success: function(library) {

                                        // Retrieve the vCard's roles
                                        $.ajax({
                                            url: '/api/categories/fetchAll',
                                            headers: {'X-CSRF-Authorization': CSRF_KEY},
                                            type: 'POST',dataType: 'json',
                                            data: {
                                                conditions: [
                                                    {key: 'targetTable', operator: '=', value: 'vcards.role'},
                                                ]
                                            },
                                            success: function(response) {

                                                // Create Role Options
                                                const roles = [];
                                                for(const [key, record] of Object.entries(response.records)){
                                                    roles.push({id: record.name, text: builder.Locale.get(record.name)});
                                                }

                                                // Retrieve the vCard data
                                                $.ajax({
                                                    url: '/api/vcards/fetch?id='+self._properties.data,
                                                    type: 'GET',dataType: 'json',
                                                    success: function(response) {

                                                        // Insert the name in the title
                                                        if(response.record.name){
                                                            component.header.title.label.append(': ' + response.record.name);
                                                        }

                                                        // Create the Form
                                                        self._builder.Utility(
                                                            'form',
                                                            component.body,
                                                            {
                                                                class:{
                                                                    component: 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3',
                                                                },
                                                                callback: {
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

                                                                        // Show the modal spinner
                                                                        modal.spinner(true);

                                                                        // Update the vCard
                                                                        $.ajax({
                                                                            url: '/api/vcards/update?id='+response.record.id,
                                                                            headers: {'X-CSRF-Authorization': CSRF_KEY},
                                                                            type: 'POST',dataType: 'json',
                                                                            data: form.val(),
                                                                            success: function(response) {

                                                                                // Check if the callback is defined
                                                                                if(typeof self._properties.callback === 'function'){
                                                                                    // Call the callback with the response
                                                                                    self._properties.callback(response);
                                                                                }

                                                                                // Hide the modal
                                                                                modal.hide();
                                                                            }
                                                                        });
                                                                    },
                                                                }
                                                            },
                                                            function(form,component){

                                                                // Add event listener on the modal submit button
                                                                parent.content.footer.submit.click(function(e){
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    form.submit();
                                                                });

                                                                // name
                                                                form.add(
                                                                    'text',
                                                                    {
                                                                        name: 'name',
                                                                        label: self._builder.Locale.get('Name'),
                                                                        placeholder: self._builder.Locale.get('Enter name'),
                                                                        value: response.record.name,
                                                                        class: {
                                                                            component: 'col-12',
                                                                        },
                                                                    }
                                                                );
                                                                // title
                                                                if(['User','Contact'].includes(response.record.category)){
                                                                    form.add(
                                                                        'text',
                                                                        {
                                                                            name: 'title',
                                                                            label: self._builder.Locale.get('Title'),
                                                                            placeholder: self._builder.Locale.get('Enter title'),
                                                                            value: response.record.title,
                                                                            class: {
                                                                                component: 'col-12 col-md-6 col-lg-4',
                                                                            },
                                                                        }
                                                                    );
                                                                }
                                                                // role
                                                                if(['User','Contact'].includes(response.record.category)){
                                                                    form.add(
                                                                        'select2',
                                                                        {
                                                                            name: 'role',
                                                                            label: self._builder.Locale.get('Role'),
                                                                            placeholder: self._builder.Locale.get('Select role(s)'),
                                                                            value: response.record.role,
                                                                            class: {
                                                                                component: 'col-12 col-md-6 col-lg-8',
                                                                            },
                                                                            multiple: true,
                                                                            options: roles,
                                                                            allowClear: true,
                                                                        }
                                                                    );
                                                                }
                                                                // dba
                                                                if(['Organization','Lead','Client'].includes(response.record.category)){
                                                                    form.add(
                                                                        'text',
                                                                        {
                                                                            name: 'dba',
                                                                            label: self._builder.Locale.get('DBA'),
                                                                            placeholder: self._builder.Locale.get('Enter doing business as'),
                                                                            value: response.record.dba,
                                                                            class: {
                                                                                component: 'col-12',
                                                                            },
                                                                        }
                                                                    );
                                                                }
                                                                // address
                                                                form.add(
                                                                    'text',
                                                                    {
                                                                        name: 'address',
                                                                        label: self._builder.Locale.get('Address'),
                                                                        placeholder: self._builder.Locale.get('Enter address'),
                                                                        value: response.record.address,
                                                                        class: {
                                                                            component: 'col-12 col-md-6 col-lg-7',
                                                                        },
                                                                    }
                                                                );
                                                                // city
                                                                form.add(
                                                                    'text',
                                                                    {
                                                                        name: 'city',
                                                                        label: self._builder.Locale.get('City'),
                                                                        placeholder: self._builder.Locale.get('Enter city'),
                                                                        value: response.record.city,
                                                                        class: {
                                                                            component: 'col-12 col-md-6 col-lg-5',
                                                                        },
                                                                    }
                                                                );
                                                                // country
                                                                form.add(
                                                                    'select2',
                                                                    {
                                                                        name: 'country',
                                                                        label: self._builder.Locale.get('Country'),
                                                                        placeholder: self._builder.Locale.get('Select country'),
                                                                        value: response.record.country.code,
                                                                        class: {
                                                                            component: 'col-12 col-md-6 col-lg-4',
                                                                        },
                                                                        options: library.options.countries,
                                                                        callback: {
                                                                            onChange: function(input, component){

                                                                                // Check if the state input exists
                                                                                if(!form._inputs.state){
                                                                                    return;
                                                                                }

                                                                                // Clear the state select2 options
                                                                                form._inputs.state.delete();

                                                                                // Add the new options based on the selected country
                                                                                for(const [key, option] of Object.entries(library.options.states[input.val()] || [])){
                                                                                    form._inputs.state.add(option.id, option.text);
                                                                                }

                                                                                // Reset the state value
                                                                                form._inputs.state.reset();
                                                                            }
                                                                        },
                                                                    }
                                                                );
                                                                // state
                                                                form.add(
                                                                    'select2',
                                                                    {
                                                                        name: 'state',
                                                                        label: self._builder.Locale.get('State'),
                                                                        placeholder: self._builder.Locale.get('Select state'),
                                                                        value: response.record.state.code,
                                                                        class: {
                                                                            component: 'col-12 col-md-6 col-lg-4',
                                                                        },
                                                                        options: library.options.states[response.record.country.code] || [],
                                                                    }
                                                                );
                                                                // zipcode
                                                                form.add(
                                                                    'zipcode',
                                                                    {
                                                                        name: 'zipcode',
                                                                        label: self._builder.Locale.get('Zipcode'),
                                                                        placeholder: self._builder.Locale.get('Enter zipcode'),
                                                                        value: response.record.zipcode,
                                                                        class: {
                                                                            component: 'col-12 col-md-6 col-lg-4',
                                                                        },
                                                                    }
                                                                );
                                                                // email
                                                                form.add(
                                                                    'email',
                                                                    {
                                                                        name: 'email',
                                                                        label: self._builder.Locale.get('Email'),
                                                                        placeholder: self._builder.Locale.get('Enter email'),
                                                                        value: response.record.email,
                                                                        class: {
                                                                            component: 'col-12 col-md-6 col-lg-8',
                                                                        },
                                                                    }
                                                                );
                                                                // fax
                                                                form.add(
                                                                    'phone',
                                                                    {
                                                                        name: 'fax',
                                                                        label: self._builder.Locale.get('Fax'),
                                                                        placeholder: self._builder.Locale.get('Enter fax'),
                                                                        value: response.record.fax,
                                                                        class: {
                                                                            component: 'col-12 col-md-6 col-lg-4',
                                                                        },
                                                                    }
                                                                );
                                                                // phone
                                                                form.add(
                                                                    'phoneExt',
                                                                    {
                                                                        name: 'phone',
                                                                        label: self._builder.Locale.get('Phone'),
                                                                        placeholder: self._builder.Locale.get('Enter phone'),
                                                                        value: response.record.phone,
                                                                        class: {
                                                                            component: 'col-12 col-md-6 col-lg-4',
                                                                        },
                                                                    }
                                                                );
                                                                // mobile
                                                                form.add(
                                                                    'phone',
                                                                    {
                                                                        name: 'mobile',
                                                                        label: self._builder.Locale.get('Mobile'),
                                                                        placeholder: self._builder.Locale.get('Enter mobile'),
                                                                        value: response.record.mobile,
                                                                        class: {
                                                                            component: 'col-12 col-md-6 col-lg-4',
                                                                        },
                                                                    }
                                                                );
                                                                // tollfree
                                                                form.add(
                                                                    'phoneInt',
                                                                    {
                                                                        name: 'tollfree',
                                                                        label: self._builder.Locale.get('Tollfree'),
                                                                        placeholder: self._builder.Locale.get('Enter tollfree'),
                                                                        value: response.record.tollfree,
                                                                        class: {
                                                                            component: 'col-12 col-md-6 col-lg-4',
                                                                        },
                                                                    }
                                                                );
                                                                // businessNumber
                                                                if(['Organization','Lead','Client'].includes(response.record.category)){
                                                                    form.add(
                                                                        'businessNumber',
                                                                        {
                                                                            name: 'businessNumber',
                                                                            label: self._builder.Locale.get('Business Number'),
                                                                            placeholder: self._builder.Locale.get('Enter business number'),
                                                                            value: response.record.businessNumber,
                                                                            class: {
                                                                                component: 'col-12 col-md-6 col-lg-4',
                                                                            },
                                                                        }
                                                                    );
                                                                }
                                                                // importerExtension
                                                                if(['Organization','Lead','Client'].includes(response.record.category)){
                                                                    form.add(
                                                                        'importerExtension',
                                                                        {
                                                                            name: 'importerExtension',
                                                                            label: self._builder.Locale.get('Importer Extension'),
                                                                            placeholder: self._builder.Locale.get('Enter importer extension (RM000N)'),
                                                                            value: response.record.importerExtension,
                                                                            class: {
                                                                                component: 'col-12 col-md-6 col-lg-4',
                                                                            },
                                                                        }
                                                                    );
                                                                }
                                                                // taxExtension
                                                                if(['Organization','Lead','Client'].includes(response.record.category)){
                                                                    form.add(
                                                                        'taxExtension',
                                                                        {
                                                                            name: 'taxExtension',
                                                                            label: self._builder.Locale.get('Tax Extension'),
                                                                            placeholder: self._builder.Locale.get('Enter tax extension (RT000N)'),
                                                                            value: response.record.taxExtension,
                                                                            class: {
                                                                                component: 'col-12 col-md-6 col-lg-4',
                                                                            },
                                                                        }
                                                                    );
                                                                }
                                                                // locale
                                                                form.add(
                                                                    'select2',
                                                                    {
                                                                        name: 'locale',
                                                                        label: self._builder.Locale.get('Locale'),
                                                                        placeholder: self._builder.Locale.get('Select locale'),
                                                                        value: response.record.locale,
                                                                        class: {
                                                                            component: 'col-12 col-md-6',
                                                                        },
                                                                        options: library.options.locales,
                                                                    }
                                                                );
                                                                // website
                                                                form.add(
                                                                    'text',
                                                                    {
                                                                        name: 'website',
                                                                        label: self._builder.Locale.get('Website'),
                                                                        placeholder: self._builder.Locale.get('Enter website'),
                                                                        value: response.record.website,
                                                                        class: {
                                                                            component: 'col-12 col-md-6',
                                                                        },
                                                                    }
                                                                );
                                                                // industries
                                                                if(['Organization','Lead','Client'].includes(response.record.category)){
                                                                    form.add(
                                                                        'select2',
                                                                        {
                                                                            name: 'industries',
                                                                            label: self._builder.Locale.get('Industries'),
                                                                            placeholder: self._builder.Locale.get('Select industry(s)'),
                                                                            value: response.record.industries,
                                                                            class: {
                                                                                component: 'col-12',
                                                                            },
                                                                            multiple: true,
                                                                            options: library.options.industries,
                                                                            allowClear: true,
                                                                            allowNew: true,
                                                                        }
                                                                    );
                                                                }
                                                                // tags
                                                                if(['Organization','Lead','Client'].includes(response.record.category)){
                                                                    form.add(
                                                                        'select2',
                                                                        {
                                                                            name: 'tags',
                                                                            label: self._builder.Locale.get('Tags'),
                                                                            placeholder: self._builder.Locale.get('Select tag(s)'),
                                                                            value: response.record.tags,
                                                                            class: {
                                                                                component: 'col-12',
                                                                            },
                                                                            multiple: true,
                                                                            options: library.options.tags,
                                                                            allowClear: true,
                                                                            allowNew: true,
                                                                        }
                                                                    );
                                                                }

                                                                // Resolve the promise
                                                                resolve();
                                                            },
                                                        );
                                                    }
                                                });
                                            },
                                        });
                                    },
                                });
                            } catch(e) { reject(e); }
                        });
                    },
                },
            },
            function(modal,component){

                // Show the modal
                modal.show();
            },
        );
    }
});
