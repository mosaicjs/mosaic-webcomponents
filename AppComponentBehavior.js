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
        name : 'AppComponentBehavior',

        attached : function() {
            this.fire('app-component-attached', {});
        },
        detached : function() {
            if (this.state) {
                this.onComponentRemove(this.state, this.stateContainer);
                delete this.state;
                delete this.stateContainer;
            }
        },
        setComponentState : function(state, stateContainer) {
            this.state = state;
            this.stateContainer = stateContainer;
            if (this.state) {
                this.onComponentAdd(this.state, this.stateContainer);
            }
        },

        onComponentAdd : function(state, stateContainer) {
        },

        onComponentRemove : function(state, stateContainer) {
        },

    }
})());
