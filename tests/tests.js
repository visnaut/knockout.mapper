var simpleObject = {
    FirstName: 'John',
    LastName: 'Doe'
};

var SimpleModel = function (data) {
    data = data || {};
    var self = this;

    self.FirstName = ko.observable(data.FirstName);
    self.LastName = ko.observable(data.LastName);

    self.FullName = ko.computed(function(){
        return self.FirstName() + " " + self.LastName();
    });
};

var simpleModel = new SimpleModel(simpleObject);

var simpleArray = [
    "Mary",
    "William"
];

var simpleArray2 = [
    "Mary",
    "Linda",
    "James"
];

var complexArray = [
    { FirstName: "Mary", Age: 20 },
    { FirstName: "William", Age: 21 }
]; 

var complexArray2 = [
    { FirstName: "Mary", Age: 22 },
    { FirstName: "Linda", Age: 23 },
    { FirstName: "James", Age: 24 }
];

describe("Knockout Mapper", function () {
    it("should accept a specific handler (from JS)", function () {
        var mapping = {
            $handler: "ignore"
        };

        var value = "Mary";

        var result = ko.mapper.fromJS(value, mapping);
        expect(result).toBe(ko.mapper.ignore);
    });

    it("should accept a specific handler (to JS)", function () {
        var mapping = {
            $handler: "ignore"
        };

        var value = "Mary";

        var result = ko.mapper.toJS(value, mapping);
        expect(result).toBe(ko.mapper.ignore);
    });

    it("should accept different handlers to map fromJS and toJS (from JS, to JS)", function () {
        var mapping = {
            $handler: {
                fromJS: "copy",
                toJS: "ignore"
            }
        };

        var value = "Mary";

        var fromJSResult = ko.mapper.fromJS(value, mapping);
        expect(fromJSResult).toBe(value);

        var toJSResult = ko.mapper.toJS(value, mapping);
        expect(toJSResult).toBe(ko.mapper.ignore);
    });

    it("should accept different options (from JS, to JS)", function () {
        var mapping = {
            $fromJS: {
                'LastName': 'ignore'
            },
            $toJS: {}
        };

        var fromJSResult = ko.mapper.fromJS(simpleObject, mapping);
        expect(fromJSResult.LastName).toBeUndefined();

        var model = new SimpleModel();
        model.FirstName("FN");
        model.LastName("LN");

        var toJSResult = ko.mapper.toJS(model, mapping);
        expect(toJSResult.LastName).toBe(model.LastName());
    });


    it("should accept a custom handler (from JS, to JS)", function () {
        var fromJSIdentifier = "fromJSHandler";
        var toJSIdentifier = "toJSHandler";

        var mapping = {
            $handler: {
                fromJS: function (value, options, target, wrap) {
                    return fromJSIdentifier;
                },
                toJS: function (value, options) {
                    return toJSIdentifier;
                }
            }
        };

        var fromJSResult = ko.mapper.fromJS(null, mapping);
        expect(fromJSResult).toBe(fromJSIdentifier);

        var toJSResult = ko.mapper.toJS(null, mapping);
        expect(toJSResult).toBe(toJSIdentifier);
    });

    it("should know that the mapper is running", function () {
        var firstData = {
            name: 'Parent',
            children: [{
                id: 1,
                name: 'Child 1'
            }]
        };

        var updatedData = {
            name: "Another Parent",
            children: [{
                id: 1,
                name: "Another Child 1"
            }]
        };

        var model = ko.mapper.fromJS(firstData);
        var executions = 0;

        model.name.subscribe(function() {
            expect(ko.mapper.isRunning()).toBeTruthy();
            executions++;
        });

        model.children()[0].name.subscribe(function() {
            expect(ko.mapper.isRunning()).toBeTruthy();
            executions++;
        });

        expect(ko.mapper.isRunning()).toBeFalsy();

        ko.mapper.fromJS(updatedData, { children: { $key: 'id' }}, model);

        expect(ko.mapper.isRunning()).toBeFalsy();

        expect(executions).toBe(2);
    });
});

describe("Auto handler", function(){
    it("should resolve to object handler (from JS)", function(){
        checkFromJSHandler({}, "object");
    });

    it("should resolve to object handler (to JS)", function () {
        checkToJSHandler({}, "object");
        checkToJSHandler(ko.observable({}), "object");
    });

    it("should resolve to array handler (from JS)", function () {
        checkFromJSHandler([], "array");
    });

    it("should resolve to array handler (to JS)", function () {
        checkToJSHandler([], "array");
        checkToJSHandler(ko.observableArray(), "array");
        checkToJSHandler(ko.observable([]), "array");
    });

    it("should resolve to value handler (from JS)", function () {
        checkFromJSHandler("Mary", "value");
        checkFromJSHandler(21, "value");
        checkFromJSHandler(21.15, "value");
        checkFromJSHandler(true, "value");
        checkFromJSHandler(false, "value");
        checkFromJSHandler(new Date(), "value");
        checkFromJSHandler(/.*/, "value");
        checkFromJSHandler(null, "value");
        checkFromJSHandler(undefined, "value");
        checkFromJSHandler(Number.NaN, "value");
    });

    it("should resolve to value handler (to JS)", function () {
        checkToJSHandler("Mary", "value");
        checkToJSHandler(21, "value");
        checkToJSHandler(21.15, "value");
        checkToJSHandler(true, "value");
        checkToJSHandler(false, "value");
        checkToJSHandler(new Date(), "value");
        checkToJSHandler(/.*/, "value");
        checkToJSHandler(null, "value");
        checkToJSHandler(undefined, "value");
        checkToJSHandler(Number.NaN, "value");

        checkToJSHandler(ko.observable("Mary"), "value");
        checkToJSHandler(ko.observable(21), "value");
        checkToJSHandler(ko.observable(21.15), "value");
        checkToJSHandler(ko.observable(true), "value");
        checkToJSHandler(ko.observable(false), "value");
        checkToJSHandler(ko.observable(new Date()), "value");
        checkToJSHandler(ko.observable(/.*/), "value");
        checkToJSHandler(ko.observable(null), "value");
        checkToJSHandler(ko.observable(undefined), "value");
        checkToJSHandler(ko.observable(Number.NaN), "value");
    });

    it("should resolve to ignore handler (from JS)", function(){
        checkFromJSHandler(function() { }, "ignore");
    });

    it("should resolve to ignore handler (to JS)", function () {
        checkToJSHandler(function() { }, "ignore");
    });

    function checkFromJSHandler(value, expectedHandler){
        var handler = ko.mapper.resolveFromJSHandler(value);
        expect(handler).toEqual(expectedHandler);
    };

    function checkToJSHandler(value, expectedHandler) {
        var handler = ko.mapper.resolveToJSHandler(value);
        expect(handler).toEqual(expectedHandler);
    };
});

describe("Object handler", function(){
    it("should wrap all properties on observables (from JS)", function(){
        var result = ko.mapper.fromJS(simpleObject);

        expect(ko.isObservable(result.FirstName)).toBeTruthy();
        expect(result.FirstName()).toBe(simpleObject.FirstName);
        expect(ko.isObservable(result.LastName)).toBeTruthy();
        expect(result.LastName()).toBe(simpleObject.LastName);
    });

    it("should create the model using a constructor function (from JS)", function(){
        var mapping = { $type: SimpleModel };

        var result = ko.mapper.fromJS(simpleObject, mapping);

        expect(ko.isComputed(result.FullName)).toBeTruthy();
        expect(result.FullName()).toBe(simpleObject.FirstName + " " + simpleObject.LastName);
    });

    it("should create the model using a custom create function (from JS)", function(){
        var mapping = {
            $create: function() {
                var obj = {};
                obj.isMyObject = true;
                return obj;
            }
        };

        var result = ko.mapper.fromJS(simpleObject, mapping);
        expect(ko.isObservable(result.FirstName)).toBeTruthy();
        expect(result.FirstName()).toBe("John");
        expect(result.isMyObject).toBeTruthy();
    });

    it("should provide context to a custom create function (from JS)", function(){
        var data = {
            name: 'John',
            children: [{
                name: 'Mary'
            }]
        }

        var createContext = null;

        var mapping = {
            'children': {
                $itemOptions: {
                    $create: function(context) {
                        createContext = context;
                        return {};
                    }
                }
            }
        };

        var model = ko.mapper.fromJS(data, mapping);
        
        expect(createContext.getParentObject(0)).toBe(model);
        expect(createContext.options).toBe(mapping.children.$itemOptions);
    });

    it("should wrap the object on an observable (from JS)", function(){
        var result = ko.mapper.fromJS(simpleObject, null, null, true);
        
        expect(ko.isObservable(result)).toBeTruthy();
    });

    it("should set the object on target observable when wrap is true (from JS)", function () {
        var observable = ko.observable();

        var result = ko.mapper.fromJS(simpleObject, null, observable, true);
        expect(result).toBe(observable);
        expect(observable()).not.toBe(simpleObject);
    });
	
	it("should set the object on target observable when wrap is not set (from JS)", function () {
        var observable = ko.observable();

        var result = ko.mapper.fromJS(simpleObject, null, observable);
        expect(result).toBe(observable);
        expect(observable()).not.toBe(simpleObject);
    });
	
	it("should not set the object on target observable when wrap is false (from JS)", function () {
        var observable = ko.observable();

        var result = ko.mapper.fromJS(simpleObject, null, observable, false);
        expect(result).not.toBe(observable);
        expect(observable()).not.toBe(simpleObject);
    });

    it("should use a default handler on all properties (from JS)", function () {
        var mapping = {
            $default: "ignore"
        };

        var result = ko.mapper.fromJS(simpleObject, mapping);
        expect(result).toEqual({});
    });

    it("should accept inner mappings (from JS)", function () {
        var mapping = {
            "FirstName": {
                $handler: "copy"
            }
        };

        var result = ko.mapper.fromJS(simpleObject, mapping);
        expect(result.FirstName).toBe(simpleObject.FirstName);
    });

    it("should unwrap object and it's properties (to JS)", function () {
        var observable = ko.observable(simpleModel);

        var result = ko.mapper.toJS(observable);
        expect(ko.isObservable(result)).toBeFalsy();
        expect(result.FirstName).toBe(observable().FirstName());
        expect(result.LastName).toBe(observable().LastName());
        expect(result.FullName).toBe(observable().FullName());
    });
});

describe("Array handler", function(){
    it("should wrap array on observableArray (from JS)", function(){
        var result = ko.mapper.fromJS(simpleArray);
        expect(ko.isObservable(result)).toBeTruthy();
        expect(result()).not.toBe(simpleArray);
        expect(result()).toEqual(simpleArray);
    });
	
    it("should replace observableArray contents when wrap is true (from JS)", function () {
        var observableArray = ko.observableArray(simpleArray.slice());

        var result = ko.mapper.fromJS(simpleArray2, null, observableArray, true);
        expect(result).toBe(observableArray);
        expect(observableArray()).toEqual(simpleArray2);
    });

    it("should replace observableArray contents when wrap is not defined (from JS)", function () {
        var observableArray = ko.observableArray(simpleArray.slice());

        var result = ko.mapper.fromJS(simpleArray2, null, observableArray);
        expect(result).toBe(observableArray);
        expect(observableArray()).toEqual(simpleArray2);
    });
	
	it("should not replace observableArray contents when wrap is false (from JS)", function () {
        var observableArray = ko.observableArray(simpleArray.slice());

        var result = ko.mapper.fromJS(simpleArray2, null, observableArray, false);
        expect(result).not.toBe(observableArray);
        expect(observableArray()).not.toEqual(simpleArray2);
    });

    it("should merge arrays (from JS)", function () {
        var observableArray = ko.observableArray(simpleArray.slice());

        var mapping = {
            $merge: true
        };

        var result = ko.mapper.fromJS(simpleArray2, mapping, observableArray);
        expect(result).toBe(observableArray);
        expect(result()).toEqual(simpleArray.concat(simpleArray2));
    });

    it("should merge complex arrays using key (from JS)", function () {
        var observableArray = ko.observableArray(complexArray.slice());

        var mapping = {
            $key: 'FirstName',
            $merge: true,
            $itemOptions: {
                $default: "copy"
            }
        };

        var result = ko.mapper.fromJS(complexArray2, mapping, observableArray);
        expect(result).toBe(observableArray);
        expect(result()).toEqual([
            complexArray2[0],
            complexArray[1],
            complexArray2[1],
            complexArray2[2]
        ]);
    });

    it("should evaluate $itemOptions functions (from JS)", function () {
        var mapping = {
            $itemOptions: function(){
                return {
                    "LastName": "ignore"
                };
            }
        };

        var result = ko.mapper.fromJS(complexArray, mapping);
        expect(result().length).toBe(complexArray.length);
        expect(result()[0].FirstName()).toBe(complexArray[0].FirstName);
        expect(result()[0].LastName).toBeUndefined();
    });

    it("should create observableArray of observableArrays (from JS)", function () {
        var array = [
            [1, 2],
            [3, 4]
        ];

        var result = ko.mapper.fromJS(array);
        expect(result()[0]()).toEqual(array[0]);
        expect(result()[1]()).toEqual(array[1]);
    });

    it("should unwrap array (to JS)", function () {
        var observableArray = ko.observableArray(complexArray);

        var result = ko.mapper.toJS(observableArray);
        expect(result).toEqual(complexArray);
    });
});

describe("Value handler", function() {

    it("should convert value to model without wrap (from JS)", function() {
        var stringValue = "value";
        var result = ko.mapper.fromJS(stringValue)
        expect(result).toBe(stringValue);
    });

    it("should wrap value on observable (from JS)", function() {
        var stringValue = "value";
        var result = ko.mapper.fromJS(stringValue, null, null, true)
    
        expect(ko.isObservable(result)).toBeTruthy();
        expect(result()).toBe(stringValue);
    });

    it("should wrap undefined value on observable (from JS)", function(){
        var value = undefined;
        var result = ko.mapper.fromJS(value, null, null, true);
        expect(ko.isObservable(result)).toBeTruthy();
        expect(result()).toBe(value);
    });

    it("should set the value on target observable when wrap is true (from JS)", function(){
        var value = "Mary";
        var observable = ko.observable();

        var result = ko.mapper.fromJS(value, null, observable, true);
        expect(result).toBe(observable);
        expect(result()).toBe(value);
    });
	
    it("should set the value on target observable when wrap is undefined (from JS)", function(){
        var value = "Mary";
        var observable = ko.observable();

        var result = ko.mapper.fromJS(value, null, observable);
        expect(result).toBe(observable);
        expect(result()).toBe(value);
    });
	
    it("should not set the value on target observable when wrap is false (from JS)", function(){
        var value = "Mary";
        var observable = ko.observable();

        var result = ko.mapper.fromJS(value, null, observable, false);
        expect(result).not.toBe(observable);
		expect(result).toBe(value);
        expect(observable()).not.toBe(value);
    });

    it("should unwrap value from observable (to JS)", function(){
        var value = "Mary";
        var observable = ko.observable(value);
        
        var result = ko.mapper.toJS(observable);
        expect(result).toBe(value);
    });
});

describe("Copy handler", function(){

    it("should copy values without wrap (from JS)", function(){
        var value = "Mary";
        var result = ko.mapper.fromJS(value, "copy", null, true);
        expect(result).toBe(value);
    });

    it("should copy value (toJS)", function () {
        var value = "Mary";
        var result = ko.mapper.toJS(value, "copy");
        expect(result).toBe(value);
    });

});

describe("Ignore handler", function () {

    it("should ignore (from JS)", function () {
        var value = "Mary";
        var result = ko.mapper.fromJS(value, "ignore");
        expect(result).toBe(ko.mapper.ignore);
    });

    it("should ignore (to JS)", function () {
        var observable = ko.observable("Mary");
        var result = ko.mapper.toJS(observable, "ignore");
        expect(result).toBe(ko.mapper.ignore);
    });

});