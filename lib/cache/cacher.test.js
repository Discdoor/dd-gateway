const { Cacher } = require('./cacher');

// Cacher unit tests
describe("Cacher tests", ()=> {
    let cacher = new Cacher();

    // add item to cacher
    test('cacher add item', ()=>{
        cacher.update({ id: "testObject1", testProp: 1 });
        expect(cacher.get("testObject1")).not.toBeNull();
    });

    // cacher update item
    test('cacher update item', ()=>{
        cacher.update({ id: "testObject1", testProp: 2, newProp: 3 });
        const newObj = cacher.get("testObject1");
        expect(newObj).toBeDefined();
        expect(newObj).not.toBeNull();
        expect(newObj.testProp).toBe(2);
        expect(newObj.newProp).toBe(3);
    });
});