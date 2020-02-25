const { EventBus } = require("../EventBus.js");

test('EventBus', () => {

    const bus = new EventBus();
    expect(bus).not.toBeNull();

});

test('EventBus:uniqueId', () => {

    const bus = new EventBus();

    expect(bus.uniqueId()).toEqual(0);
    expect(bus.uniqueId()).toEqual(1);
    expect(bus.uniqueId()).not.toEqual(1);

});

test('EventBus: subscribe / unsubscribe', () => {

    const bus = new EventBus();

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

});

test('EventBus: scope', () => {

    const bus = new EventBus();

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
