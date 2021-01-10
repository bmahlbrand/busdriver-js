const CircularBuffer = require('circular-buffer');

class MessageBus {

    /**
     * 
     * @param {Number} maxCapacity the maximum # of messages that can be deferred before flush is called (they will be dropped)
     */
    constructor(maxCapacity = 1024) {
        this.callbacks = {};
        this.currentId = 0;
        this.queue = new CircularBuffer(maxCapacity);
        this.deferred = false;
    }

    /**
     * 
     * @param {boolean} defer defer firing events? call flush to fire
     */
    setDeferred(defer) {
        this.deferred = defer;
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
    subscribeOneShot(channel, callback, scope, ...args) {
        const id = this.uniqueId();

        if (!this.callbacks[channel])
            this.callbacks[channel] = {};

        this.callbacks[channel][id] = {callback: (args) => {
            this.unsubscribe(channel, id);
            return callback(args);
        }, scope, args};
        console.log(this.callbacks[channel][id]);
        // this.callbacks[channel][id] = (args) => {
        //     this.unsubscribe(channel, id);
        //     return callback(args);
        // };

        // TODO:
        // write test for this
        return { 
            unsubscribe: () => {
                return this.unsubscribe(channel, id);
            }
        };

    }

    // return subscribers to a channel
    subscribers(channel) {
        return Object.keys(this.callbacks[channel]);
    }

    fire(channel, ...args) {
        if (channel in this.callbacks && Object.keys(this.callbacks[channel]).length > 0) {

            for (const key in this.callbacks[channel]) {                
                const obj = this.callbacks[channel][key];
                obj.callback(...args);
                // obj.apply(event, obj.scope, ...obj.args);
                // console.log(obj);
            }
            
        } else {
            console.warn("message of type %s is not supported yet", channel);
        }
    }

    publish(channel, ...args) {
        if (this.deferred) {
            if (this.queue.size() === this.queue.capacity()) {
                console.log('dropping messages ' + this.queue.get(this.queue.size() - 1));
            }

            const event = {
                args: [...args],
                channel: channel
            };

            this.queue.enq(event);
            return;
        }

        this.fire(channel, ...args);
    }

    /**
     * flush the messages queued when defer is to `true`
     */
    flush() {
        while (this.queue.size() > 0) {
            const message = this.queue.deq();
            this.fire(message['channel'], ...message['args']);
        }
    }
};

module.exports = {
    MessageBus: MessageBus
};