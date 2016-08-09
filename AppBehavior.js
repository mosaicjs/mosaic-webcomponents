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
        name : 'AppBehavior',
        properties : {
            state : {
                type : Object,
                notify : true,
                value : function() {
                    return new State();
                }
            },
        },
        listeners : {
            'app-component-attached' : '_onNewComponent'
        },
        ready : function() {
        },
        detached : function() {
        },
        _onNewComponent : function(ev) {
            var component = ev.target;
            if (component.setComponentState) {
                component.setComponentState(this.state, this);
            }
        },
    }
})());
