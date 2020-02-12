// TODO:
// priority scheduling
// this + networking - linearizability...
// browser + node compatibility
// decorators
// change unique id to some hashing algorithm
// pattern matching
// prefix matching
// wildcard matching
// set matching mode in subscribe call (default: exact)

class MessageBus {

    constructor() {
        this.callbacks = {};
        this.currentId = 0;
    }

    channels() {
        return Object.keys(this.callbacks);
    }

    uniqueId() {
        return this.currentId++ % Number.MAX_SAFE_INTEGER;
    }

    unsubscribeAll() {
        this.callbacks = {};
    }

    unsubscribe(channel, id) {
        delete this.callbacks[channel][id];
        if (Object.keys(this.callbacks[channel]).length === 0) {
            delete this.callbacks[channel];
        }
    }

    subscribe(channel, callback, scope, ...args) {
        const id = this.uniqueId();

        if (!this.callbacks[channel])
            this.callbacks[channel] = {};

        this.callbacks[channel][id] = {callback, scope, args};

        return { 
            unsubscribe: () => {
                return this.unsubscribe(channel, id);
            }
        };
    }

    // useful for one-time events,
    // removes the callback after only one use
    subscribeOneShot(channel, callback) {
        const id = this.uniqueId();

        if (!this.callbacks[channel])
            this.callbacks[channel] = {};

        this.callbacks[channel][id] = (args) => {
            this.unsubscribe(channel, id);
            return callback(args);
        };

        return id;

    }

    // return subscribers to a channel
    subscribers(channel) {
        return Object.keys(this.callbacks[channel]);
    }

    publish(channel, event) {
        if (channel in this.callbacks && Object.keys(this.callbacks[channel]).length > 0) {

            for (const key in this.callbacks[channel]) {                
                const obj = this.callbacks[channel][key];
                obj.callback(event, obj.scope);
                // obj.apply(event, obj.scope, ...obj.args);
                // console.log(obj);
            }
            
        } else {
            console.warn("message of type %s is not supported yet", channel);
        }
    }
};

module.exports = EventBus;