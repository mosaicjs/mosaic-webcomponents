(function(global, m) {
    if (typeof module !== 'undefined') {
        module.exports = m;
    } else if (typeof define === 'function' && defined.amd) {
        define(m.name, [], m);
    } else {
        global[m.name] = m;
    }
})(this, (function() {

    function ActiveFields(descriptions) {
        var result = {};
        var fields = Object.keys(descriptions);
        fields.forEach(function(field) {
            var descr = descriptions[field];
            if (typeof descr === 'object' && descr.type === Object) {
                var state = descr.state || descr.fields;
                if (state) {
                    descr.value = function() {
                        this._fieldsToNotify = this._fieldsToNotify || [];
                        var obj = defineObject(field, state,
                                this._fieldsToNotify);
                        return obj;
                    }
                }
            }
            result[field] = descr;
        });
        return result;
    }

    function defineObject(name, fields, toNotify) {
        var obj = {};
        Object.keys(fields).forEach(function(field) {
            var f = {
                path : name + '.' + field,
                field : field,
                statePath : fields[field],
                changed : false,
                _value : undefined,
                cursor : undefined,
                setState : function(state) {
                    f.cursor = state.cursor(f.statePath);
                    if (f.changed) {
                        f.cursor(f._value);
                    }
                },
                get : function() {
                    return f.cursor ? f.cursor() : f._value;
                },
                set : function(_) {
                    f.changed = true;
                    if (f.cursor) {
                        f.cursor(_);
                    } else {
                        f._value = _;
                    }
                    return f;
                }
            };
            Object.defineProperty(obj, field, f);
            toNotify.push(f);
        })
        return obj;
    }

    ActiveFields.field = function(name, fields) {
        return {
            type : Object,
            notify : true,
            value : function() {
                this._fieldsToNotify = this._fieldsToNotify || [];
                var field = defineObject(name, fields, this._fieldsToNotify);
                return field;
            }
        }
    };

    ActiveFields.Behavior = {

        initActiveFields : function(state) {
            this._stateSubscription = state.addListener(this._onStateChange,
                    this);
            if (this._fieldsToNotify) {
                this._fieldsToNotify.forEach(function(field) {
                    field.setState(state);
                })
            }
            this._refreshFields();
        },

        clearActiveFields : function(state) {
            if (this._stateSubscription) {
                this._stateSubscription();
                delete this._stateSubscription;
            }
            delete this._fieldsToNotify;
        },

        _onStateChange : function(ev) {
            this._refreshFields();
        },

        _refreshFields : function() {
            var fields = this._fieldsToNotify;
            if (!fields || !fields.length)
                return;
            fields.forEach(function(field) {
                var value = field._value;
                var newValue = field._value = field.get();
                if (newValue !== value) {
                    this.notifyPath(field.path);
                }
            }, this)
        },

        onComponentAdd : function(state) {
            this.initActiveFields(state);
        },

        onComponentRemove : function(state) {
            this.clearActiveFields(state);
        },

    };

    return ActiveFields;

})());
