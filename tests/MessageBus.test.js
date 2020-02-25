const { MessageBus } = require("../MessageBus.js");

test('MessageBus', () => {

    const bus = new MessageBus();
    expect(bus).not.toBeNull();

});

test('MessageBus:uniqueId', () => {

    const bus = new MessageBus();

    expect(bus.uniqueId()).toEqual(0);
    expect(bus.uniqueId()).toEqual(1);
    expect(bus.uniqueId()).not.toEqual(1);

});

test('MessageBus: subscribe / unsubscribe', () => {

    const bus = new MessageBus();

    const platformToken1 = bus.subscribe("platform", (json) => {});

    const tickToken = bus.subscribe("tick", (json) => {});

    expect(bus.channels().sort()).toEqual(["platform", "tick"].sort());

    const subscribers1 = bus.subscribers("tick");
    expect(subscribers1).toEqual(["1"]);

    tickToken.unsubscribe();

    expect(bus.channels().sort()).toEqual(["platform"].sort());

    const subscribers2 = bus.subscribers("platform");
    expect(subscribers2).toEqual(["0"]);

    const platformToken2 = bus.subscribe("platform", (json) => {});

    const subscribers3 = bus.subscribers("platform");
    expect(subscribers3).toEqual(["0", "2"]);

    platformToken1.unsubscribe();

    const subscribers4 = bus.subscribers("platform");
    expect(subscribers4).toEqual(["2"]);

    const oneshotToken = bus.subscribeOneShot("platform", (json) => {
        console.log("had");
    });

    const subscribers5 = bus.subscribers("platform");
    console.log(subscribers5);
    oneshotToken.unsubscribe();

    expect(subscribers5).toEqual(["2"]);

});

test('MessageBus: scope', () => {

    const bus = new MessageBus();

    class Class1 {
        constructor() {
            this.className = "Class1";
            bus.subscribe("a", this.callback, this);
        }

        callback(event, scope) {
            console.log(scope.className + " / event: " + event);
        }
    }
    
    class Class2 {
        constructor() {
            this.className = "Class2";
        }

        fire() {
            bus.publish("a", this);
        }
    }
    
    let t1 = new Class1();
    let t2 = new Class2();
    t2.fire();
});

