(function(global, m) {
    if (typeof module !== 'undefined') {
        module.exports = m;
    } else if (typeof define === 'function' && defined.amd) {
        define(m.name, [], m);
    } else {
        global[m.name] = m;
    }
})(this, (function() {
    return {
        name : 'ActiveFields',

        field : function(name, fields) {
            return {
                type : Object,
                notify : true,
                value : function() {
                    var state = {};
                    var obj = {};
                    var toNotify = this._fieldsToNotify = this._fieldsToNotify
                            || [];
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
                        toNotify.push(f);
                        Object.defineProperty(obj, field, f);
                    })
                    return obj;
                }
            }
        },

        Behavior : {

            initActiveFields : function(state) {
                this._stateSubscription = state.addListener(
                        this._onStateChange, this);
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

        }
    }
})());
