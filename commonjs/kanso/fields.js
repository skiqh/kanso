var validators = require('./validators'),
    widgets = require('./widgets');


var Field = exports.Field = function (options) {
    options = options || {};

    this.omit_empty = options.omit_empty;
    this.default_value = options.default_value;
    this.label = options.label;
    this.widget = options.widget || widgets.text();
    this.required = ('required' in options) ? options.required: true;
    this.validators = ('validators' in options) ? options.validators: [];
    this.parse = options.parse || function (raw) {
        return raw;
    };
};

Field.prototype.errorHTML = function (errors) {
    if (errors && errors.length) {
        var html = '<ul class="errors">';
        for (var i = 0; i < errors.length; i++) {
            html += '<li class="error_msg">' +
                (errors[i].message || errors[i].toString()) +
            '</li>';
        }
        html += '</ul>';
        return html;
    }
    return '';
};

Field.prototype.labelText = function (name) {
    if (this.label) {
        return this.label;
    }
    return name.substr(0, 1).toUpperCase() + name.substr(1).replace(/_/g, ' ');
};

Field.prototype.labelHTML = function (name, id) {
    return '<label for="' + (id || 'id_' + name) + '">' +
        this.labelText(name, id) +
    '</label>';
};

Field.prototype.classes = function (errors) {
    var r = ['field'];
    if (errors && errors.length) {
        r.push('error');
    }
    if (this.required) {
        r.push('required');
    }
    return r;
};

Field.prototype.validate = function (doc, value) {
    if (value === '' || value === null || value === undefined) {
        // don't validate empty fields, but check if required
        if (this.required) {
            throw new Error('required field');
        }
    }
    else {
        for (var i = 0; i < this.validators.length; i++) {
            this.validators[i](doc, value);
        }
    }
};


exports.string = function (options) {
    options = options || {};

    options.parse = function (raw) {
        return '' + raw;
    };
    return new Field(options);
};


exports.number = function (options) {
    options = options || {};

    options.parse = function (raw) {
        if (raw === null || raw === '') {
            return '';
        }
        return Number(raw);
    };
    if (!options.validators) {
        options.validators = [];
    }
    options.validators.unshift(function (doc, value) {
        if (isNaN(value)) {
            throw new Error('Not a number');
        }
    });
    return new Field(options);
};


exports.boolean = function (options) {
    options = options || {};

    options.parse = function (raw) {
        return Boolean(raw);
    };
    return new Field(options);
};


exports.url = function (options) {
    options = options || {};

    if (!options.validators) {
        options.validators = [];
    }
    options.validators.unshift(validators.url());
    return exports.string(options);
};


exports.email = function (options) {
    options = options || {};

    if (!options.validators) {
        options.validators = [];
    }
    options.validators.unshift(validators.email());
    return exports.string(options);
};