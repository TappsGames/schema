import * as assert from "assert";
import { type } from "../src/annotations";
import { State, Player, DeepState, DeepMap, DeepChild, Position, DeepEntity } from "./Schema";
import { Schema, ArraySchema, MapSchema } from "../src";
import {applyByteMask} from "./helpers/bytemask";

describe("Schema", () => {

    describe("declaration", () => {
        it("default values", () => {
            class DataObject extends Schema {
                @type("string")
                stringValue = "initial value";

                @type("number")
                intValue = 300;
            }

            let data = new DataObject();
            assert.equal(data.stringValue, "initial value");
            assert.equal(data.intValue, 300);
            assert.deepEqual((DataObject as any)._schema, {
                stringValue: 'string',
                intValue: 'number',
            });
            assert.deepEqual(data.encode(), [0, 173, 105, 110, 105, 116, 105, 97, 108, 32, 118, 97, 108, 117, 101, 1, 205, 300, 1]);
        });

        it("uint8", () => {
            class Data extends Schema { @type("uint8") uint8 = 255; }

            let data = new Data();
            assert.equal(data.uint8, 255);

            data.uint8 = 127;
            let encoded = data.encode();

            assert.deepEqual(encoded, [0, 127]);

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(encoded)));
            assert.equal(decoded.uint8, 127);
        });

        it("uint16", () => {
            class Data extends Schema { @type("uint16") uint16; }

            let data = new Data();
            data.uint16 = 65500;

            let encoded = data.encode();
            assert.deepEqual(encoded, [ 0, 65500, 255 ]);

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(encoded)));
            assert.equal(decoded.uint16, 65500);
        });

        it("uint32", () => {
            class Data extends Schema { @type("uint32") uint32; }

            let data = new Data();
            data.uint32 = 4294967290;

            let encoded = data.encode();
            assert.deepEqual(encoded, [0, 4294967290, -1, -1, -1]);

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(encoded)));
            assert.equal(decoded.uint32, 4294967290);
        });

        it("uint64", () => {
            class Data extends Schema { @type("uint64") uint64; }

            let data = new Data();
            data.uint64 = Number.MAX_SAFE_INTEGER;

            const encoded = data.encode();
            console.log(encoded)

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(encoded)));
            assert.equal(decoded.uint64, Number.MAX_SAFE_INTEGER);
        });

        it("int8", () => {
            class Data extends Schema { @type("int8") int8; }

            let data = new Data();
            data.int8 = -128;

            let encoded = data.encode();
            assert.deepEqual(encoded, [0, -128]);

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(encoded)));
            assert.equal(decoded.int8, -128);
        });

        it("int16", () => {
            class Data extends Schema { @type("int16") int16; }

            let data = new Data();
            data.int16 = -32768;

            let encoded = data.encode();
            // assert.deepEqual(encoded, []);

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(encoded)));
            assert.equal(decoded.int16, -32768);
        });

        it("int32", () => {
            class Data extends Schema { @type("int32") int32; }

            let data = new Data();
            data.int32 = -2147483648;

            let encoded = data.encode();
            // assert.deepEqual(encoded, [0, 4294967290, -1, -1, -1]);

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(encoded)));
            assert.equal(decoded.int32, -2147483648);
        });

        it("int64", () => {
            class Data extends Schema { @type("int64") int64; }

            let data = new Data();
            data.int64 = -9223372036854775808;

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(data.encode())));
            assert.equal(decoded.int64, -9223372036854775808);
        });

        it("float32", () => {
            class Data extends Schema { @type("float32") float32; }

            let data = new Data();
            data.float32 = 24.5;

            let encoded = data.encode();
            assert.deepEqual(encoded, [ 0, 1103364096, 4310016, 16836, 65 ]);

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(encoded)));
            assert.equal(decoded.float32, 24.5);
        });

        it("float64", () => {
            class Data extends Schema { @type("float64") float64; }

            let data = new Data();
            data.float64 = 24.5;

            let encoded = data.encode();
            assert.deepEqual(encoded, [ 0, 0, 0, 0, 0, 1077444608, 4208768, 16440, 64 ]);

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(encoded)));
            assert.equal(decoded.float64, 24.5);
        });

        it("varint", () => {
            class Data extends Schema {
                @type("number") varint_int8 = -128;
                @type("number") varint_uint8 = 255;
                @type("number") varint_int16 = -32768;
                @type("number") varint_uint16 = 65535;
                @type("number") varint_int32 = -2147483648;
                @type("number") varint_uint32 = 4294967295;
                @type("number") varint_int64 = -9223372036854775808;
                @type("number") varint_uint64 = Number.MAX_SAFE_INTEGER; // 9007199254740991
                @type("number") varint_float32 = -3.40282347e+38;
                @type("number") varint_float64 = 1.7976931348623157e+308;
            }

            const data = new Data();
            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(data.encode())));

            assert.equal(decoded.varint_int8, -128);
            assert.equal(decoded.varint_uint8, 255);
            assert.equal(decoded.varint_int16, -32768);
            assert.equal(decoded.varint_uint16, 65535);
            assert.equal(decoded.varint_int32, -2147483648);
            assert.equal(decoded.varint_uint32, 4294967295);
            assert.equal(decoded.varint_int64, -9223372036854775808);
            assert.equal(decoded.varint_uint64, Number.MAX_SAFE_INTEGER);
            assert.equal(decoded.varint_float32, -3.40282347e+38);
            assert.equal(decoded.varint_float64, 1.7976931348623157e+308);
        });

        it("boolean", () => {
            class Data extends Schema { @type("boolean") bool; }

            let data = new Data();
            data.bool = false;

            let decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(data.encode())));
            assert.equal(decoded.bool, false);

            data.bool = true;
            decoded.decode(applyByteMask(applyByteMask(data.encode())));
            assert.equal(decoded.bool, true);
        });

        it("string", () => {
            class Data extends Schema { @type("string") str; }

            let data = new Data();
            data.str = "";

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(data.encode())));
            assert.equal(decoded.str, "");

            data.str = "Hello world!";
            decoded.decode(applyByteMask(applyByteMask(data.encode())));
            assert.equal(decoded.str, "Hello world!");
        });

        it("string with utf8", () => {
            class Data extends Schema { @type("string") utf8; }

            let data = new Data();
            data.utf8 = "🚀ॐ漢字♤♧♥♢®⚔";

            let encoded = data.encode();
            assert.deepEqual(encoded, [0, 190, 240, 159, 154, 128, 224, 165, 144, 230, 188, 162, 229, 173, 151, 226, 153, 164, 226, 153, 167, 226, 153, 165, 226, 153, 162, 194, 174, 226, 154, 148]);

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(encoded)));
            assert.equal(decoded.utf8, "🚀ॐ漢字♤♧♥♢®⚔");
        });

        it("long string", () => {
            class Data extends Schema { @type("string") longstring; }

            const longstring = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ac justo quis massa ultricies dictum cursus at tellus. Curabitur laoreet ipsum eu risus convallis rutrum. Integer bibendum hendrerit nisl, eget vestibulum nisi interdum sed. Pellentesque lacus risus, luctus a iaculis non, vulputate eget massa. Nunc aliquet venenatis lorem, id viverra lectus rutrum a. Nulla nunc mauris, euismod a est nec, scelerisque maximus felis. Sed vel lobortis velit, non congue lectus. In eget lectus at sem bibendum vestibulum in non turpis.";

            let data = new Data();
            data.longstring = longstring;

            const decoded = new Data();
            decoded.decode(applyByteMask(applyByteMask(data.encode())));
            assert.equal(decoded.longstring, longstring);
        });

    });

    describe("API", () => {
        it("should allow deleting non-existing items", () => {
            assert.doesNotThrow(() => {
                const state = new State();
                state.mapOfPlayers = new MapSchema<Player>();
                delete state.mapOfPlayers['jake']
            });
        });

        it("should allow to clone Schema instances", () => {
            const CONSTANT_PLAYER = new Player("Cloned", 100, 100);
            const state = new State();
            state.player = CONSTANT_PLAYER.clone();
            state.mapOfPlayers = new MapSchema<Player>();
            state.mapOfPlayers['one'] = CONSTANT_PLAYER.clone();
            state.arrayOfPlayers = new ArraySchema<Player>();
            state.arrayOfPlayers.push(CONSTANT_PLAYER.clone());

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(state.player.name, "Cloned");
            assert.equal(state.mapOfPlayers['one'].name, "Cloned");
            assert.equal(state.arrayOfPlayers[0].name, "Cloned");
        });
    });

    describe("encoding/decoding", () => {
        it("should encode/decode STRING", () => {
            const state = new State();
            state.fieldString = "Hello world";

            let encoded = state.encode();
            assert.deepEqual(encoded, [0, 171, 72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]);

            const decodedState = new State();
            decodedState.decode(applyByteMask(encoded));

            assert.equal(decodedState.fieldString, "Hello world");
        });

        it("should encode/decode INT", () => {
            const state = new State();
            state.fieldNumber = 50;

            const decodedState = new State();

            let encoded = state.encode();
            assert.deepEqual(encoded, [1, 50]);

            decodedState.decode(applyByteMask(encoded));

            assert.equal(decodedState.fieldNumber, 50);

            state.fieldNumber = 100;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.fieldNumber, 100);

            state.fieldNumber = 300;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.fieldNumber, 300);

            state.fieldNumber = 500;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.fieldNumber, 500);

            state.fieldNumber = 1000;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.fieldNumber, 1000);

            state.fieldNumber = 2000;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.fieldNumber, 2000);

            state.fieldNumber = 999999;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.fieldNumber, 999999);
        });

        it("should encode/decode empty Schema reference", () => {
            const state = new State();
            state.player = new Player();

            const decodedState = new State();
            const encoded = state.encode();
            decodedState.decode(applyByteMask(encoded));

            assert.deepEqual(encoded, [2, 193]);
            assert.ok(decodedState.player instanceof Player);
        });

        it("should encode/decode Schema reference with its properties", () => {
            const state = new State();
            state.player = new Player();
            state.player.name = "Jake";
            state.player.x = 100;
            state.player.y = 200;

            const decodedState = new State();
            const encoded = state.encode();
            decodedState.decode(applyByteMask(encoded));

            assert.deepEqual(encoded, [2, 0, 164, 74, 97, 107, 101, 1, 100, 2, 204, 200, 193]);
            assert.ok(decodedState.player instanceof Player);
            assert.equal(decodedState.player.x, 100);
            assert.equal(decodedState.player.y, 200);
        });

        it("should re-use child Schema instance when decoding multiple times", () => {
            const state = new State();
            state.player = new Player();
            state.player.name = "Guest";

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));

            const playerReference = decodedState.player;
            assert.ok(playerReference instanceof Player);
            assert.equal(playerReference.name, "Guest");

            state.player.name = "Jake";
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.player, playerReference);
            assert.equal(playerReference.name, "Jake");
        });

        it("should encode empty array", () => {
            const state = new State();
            state.arrayOfPlayers = new ArraySchema();

            const decodedState = new State();
            const encoded = state.encode();
            decodedState.decode(applyByteMask(encoded));

            assert.deepEqual(encoded, [3, 0, 0]);
            assert.deepEqual(decodedState.arrayOfPlayers, []);
        });

        it("should encode array with two values", () => {
            const state = new State();
            state.arrayOfPlayers = new ArraySchema(
                new Player("Jake Badlands"),
                new Player("Snake Sanders"),
            );

            const decodedState = new State();
            let encoded = state.encode();
            // assert.deepEqual(encoded, [3, 2, 2, 0, 0, 173, 74, 97, 107, 101, 32, 66, 97, 100, 108, 97, 110, 100, 115, 193, 1, 0, 173, 83, 110, 97, 107, 101, 32, 83, 97, 110, 100, 101, 114, 115, 193]);

            decodedState.decode(applyByteMask(encoded));

            const jake = decodedState.arrayOfPlayers[0];
            const snake = decodedState.arrayOfPlayers[1];

            assert.equal(decodedState.arrayOfPlayers.length, 2);
            assert.equal(jake.name, "Jake Badlands");
            assert.equal(snake.name, "Snake Sanders");

            state.arrayOfPlayers.push(new Player("Katarina Lyons"));
            decodedState.decode(applyByteMask(state.encode()));

            const tarquinn = decodedState.arrayOfPlayers[2];

            assert.equal(decodedState.arrayOfPlayers.length, 3);
            assert.equal(decodedState.arrayOfPlayers[0], jake);
            assert.equal(decodedState.arrayOfPlayers[1], snake);
            assert.equal(tarquinn.name, "Katarina Lyons");

            state.arrayOfPlayers.pop();
            state.arrayOfPlayers[0].name = "Tarquinn"

            encoded = state.encode();
            assert.deepEqual(encoded, [3, 2, 1, 0, 0, 168, 84, 97, 114, 113, 117, 105, 110, 110, 193]);

            decodedState.decode(applyByteMask(encoded));

            assert.equal(decodedState.arrayOfPlayers.length, 2);
            assert.equal(decodedState.arrayOfPlayers[0], jake);
            assert.equal(decodedState.arrayOfPlayers[0].name, "Tarquinn");
            assert.equal(decodedState.arrayOfPlayers[1], snake);
            assert.equal(decodedState.arrayOfPlayers[2], undefined);
        });

        it("should allow to `pop` an array", () => {
            const state = new State();
            state.arrayOfPlayers = new ArraySchema(new Player("Jake"), new Player("Snake"), new Player("Player 3"));

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));

            assert.equal(decodedState.arrayOfPlayers.length, 3);
            state.arrayOfPlayers.pop();

            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.arrayOfPlayers.length, 2);
            assert.deepEqual(decodedState.arrayOfPlayers.map(p => p.name), ["Jake", "Snake"]);
        });

        it("should allow to `pop` an array of numbers", () => {
            class State extends Schema {
                @type(["number"]) arrayOfNumbers = new ArraySchema<number>();
                @type("string") str: string;
            }

            const state = new State();
            state.arrayOfNumbers.push(1);
            state.arrayOfNumbers.push(2);
            state.arrayOfNumbers.push(3);
            state.arrayOfNumbers.push(4);

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));

            assert.equal(decodedState.arrayOfNumbers.length, 4);
            assert.equal(JSON.stringify(decodedState.arrayOfNumbers), '[1,2,3,4]');

            state.arrayOfNumbers.pop();
            state.str = "hello!";
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.arrayOfNumbers.length, 3);
            assert.equal(JSON.stringify(decodedState.arrayOfNumbers), '[1,2,3]');
            assert.equal(decodedState.str, 'hello!');
        });

        it("should not encode a higher number of items than array actually have", () => {
            // Thanks @Ramus on Discord
            class State extends Schema {
                @type(["number"]) arrayOfNumbers = new ArraySchema<number>();
                @type(["number"]) anotherOne = new ArraySchema<number>();
            }

            const state = new State();

            state.arrayOfNumbers.push(0, 0, 0, 1, 1, 1, 2, 2, 2);
            assert.equal(state.arrayOfNumbers.length, 9);
            state.arrayOfNumbers = new ArraySchema<number>(...[0, 0, 0, 1, 1, 1, 2, 2, 2]);
            assert.equal(state.arrayOfNumbers.length, 9);
            state.anotherOne.push(state.arrayOfNumbers.pop());
            state.anotherOne.push(state.arrayOfNumbers.pop());
            state.anotherOne.push(state.arrayOfNumbers.pop());
            state.anotherOne.push(state.arrayOfNumbers.pop());
            state.anotherOne.push(state.arrayOfNumbers.pop());

            assert.equal(state.arrayOfNumbers.length, 4);
            assert.equal(state.anotherOne.length, 5);

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.arrayOfNumbers.length, 4);
            assert.equal(decodedState.anotherOne.length, 5);
        });

        it("should allow to `shift` an array", () => {
            const state = new State();
            state.arrayOfPlayers = new ArraySchema(new Player("Jake"), new Player("Snake"), new Player("Cyberhawk"));

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.arrayOfPlayers.length, 3);

            const snake = decodedState.arrayOfPlayers[1];
            const cyberhawk = decodedState.arrayOfPlayers[2];

            state.arrayOfPlayers.shift();

            let encoded = state.encode();
            decodedState.decode(applyByteMask(encoded));

            assert.equal(decodedState.arrayOfPlayers.length, 2);
            assert.equal(decodedState.arrayOfPlayers[0].name, "Snake");
            assert.equal(decodedState.arrayOfPlayers[1].name, "Cyberhawk");
            assert.equal(snake, decodedState.arrayOfPlayers[0]);
            assert.equal(cyberhawk, decodedState.arrayOfPlayers[1]);
        });

        it("should allow to `splice` an array", () => {
            const state = new State();
            state.arrayOfPlayers = new ArraySchema(new Player("Jake"), new Player("Snake"), new Player("Cyberhawk"));

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.arrayOfPlayers.length, 3);

            const jake = decodedState.arrayOfPlayers[0];

            state.arrayOfPlayers.splice(1);
            decodedState.decode(applyByteMask(state.encode()));

            assert.equal(decodedState.arrayOfPlayers.length, 1);
            assert.equal(decodedState.arrayOfPlayers[0].name, "Jake");
            assert.equal(jake, decodedState.arrayOfPlayers[0]);
        });

        it("should allow to `push` and `shift` an array", () => {
            const state = new State();
            state.arrayOfPlayers = new ArraySchema(new Player("Jake"), new Player("Snake"), new Player("Cyberhawk"));

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.arrayOfPlayers.length, 3);

            // first `push`, then `shift`
            state.arrayOfPlayers.push(new Player("Katarina Lyons"));
            state.arrayOfPlayers.shift();

            let encoded = state.encode();
            decodedState.decode(applyByteMask(encoded));

            assert.equal(decodedState.arrayOfPlayers.length, 3);
            assert.equal(decodedState.arrayOfPlayers[0].name, "Snake");
            assert.equal(decodedState.arrayOfPlayers[1].name, "Cyberhawk");
            assert.equal(decodedState.arrayOfPlayers[2].name, "Katarina Lyons");
        });

        it("should allow to `shift` and `push` an array", () => {
            const state = new State();
            state.arrayOfPlayers = new ArraySchema(new Player("Jake"), new Player("Snake"), new Player("Cyberhawk"));

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.arrayOfPlayers.length, 3);

            // first `shift`, then `push`
            state.arrayOfPlayers.shift();
            state.arrayOfPlayers.push(new Player("Katarina Lyons"));

            let encoded = state.encode();
            decodedState.decode(applyByteMask(encoded));

            assert.equal(decodedState.arrayOfPlayers.length, 3);
            assert.equal(decodedState.arrayOfPlayers[0].name, "Snake");
            assert.equal(decodedState.arrayOfPlayers[1].name, "Cyberhawk");
            assert.equal(decodedState.arrayOfPlayers[2].name, "Katarina Lyons");
        });

        it("should encode map of objects", () => {
            const state = new State();
            state.mapOfPlayers = new MapSchema({
                "one": new Player("Jake Badlands"),
                "two": new Player("Snake Sanders")
            });

            let encoded = state.encode();
            assert.deepEqual(encoded, [4, 2, 163, 111, 110, 101, 0, 173, 74, 97, 107, 101, 32, 66, 97, 100, 108, 97, 110, 100, 115, 193, 163, 116, 119, 111, 0, 173, 83, 110, 97, 107, 101, 32, 83, 97, 110, 100, 101, 114, 115, 193]);

            const decodedState = new State();
            decodedState.decode(applyByteMask(encoded));

            const playerOne = decodedState.mapOfPlayers['one'];
            const playerTwo = decodedState.mapOfPlayers['two'];

            assert.deepEqual(Object.keys(decodedState.mapOfPlayers), ["one", "two"]);
            assert.equal(playerOne.name, "Jake Badlands");
            assert.equal(playerTwo.name, "Snake Sanders");

            state.mapOfPlayers['one'].name = "Tarquinn";

            encoded = state.encode();
            assert.deepEqual(encoded, [4, 1, 0, 0, 168, 84, 97, 114, 113, 117, 105, 110, 110, 193]);

            decodedState.decode(applyByteMask(encoded));

            assert.equal(playerOne, decodedState.mapOfPlayers['one']);
            assert.equal(decodedState.mapOfPlayers['one'].name, "Tarquinn");
        });

        it("should allow adding and removing items from map", () => {
            const state = new State();
            state.mapOfPlayers = new MapSchema();

            state.mapOfPlayers['one'] = new Player("Jake Badlands");
            state.mapOfPlayers['two'] = new Player("Snake Sanders");

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));

            assert.deepEqual(Object.keys(decodedState.mapOfPlayers), ["one", "two"]);
            assert.equal(decodedState.mapOfPlayers['one'].name, "Jake Badlands");
            assert.equal(decodedState.mapOfPlayers['two'].name, "Snake Sanders");

            delete state.mapOfPlayers['two'];
            decodedState.decode(applyByteMask(state.encode()));
            assert.deepEqual(Object.keys(decodedState.mapOfPlayers), ["one"]);
        });

        it("should allow moving items from one map key to another", () => {
            const state = new State();
            state.mapOfPlayers = new MapSchema();

            state.mapOfPlayers['one'] = new Player("Jake Badlands");
            state.mapOfPlayers['two'] = new Player("Snake Sanders");

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encode()));

            const decodedJake = decodedState.mapOfPlayers['one'];
            const decodedSnake = decodedState.mapOfPlayers['two'];
            assert.deepEqual(Object.keys(decodedState.mapOfPlayers), ["one", "two"]);

            // swap Jake / Snake keys
            const jake = state.mapOfPlayers['one'];
            const snake = state.mapOfPlayers['two'];
            state.mapOfPlayers['one'] = snake;
            state.mapOfPlayers['two'] = jake;

            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.mapOfPlayers['one'], decodedSnake);
            assert.equal(decodedState.mapOfPlayers['two'], decodedJake);
        });

        it("should allow maps with numeric indexes", () => {
            const state = new State();
            state.mapOfPlayers = new MapSchema({
                '2': new Player("Jake Badlands"),
                '1': new Player("Snake Sanders")
            });

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encodeAll()));

            assert.deepEqual(Object.keys(decodedState.mapOfPlayers), ['1', '2']);
            assert.equal(decodedState.mapOfPlayers['1'].name, "Snake Sanders");
            assert.equal(decodedState.mapOfPlayers['2'].name, "Jake Badlands");

            state.mapOfPlayers['1'].name = "New name";
            decodedState.decode(applyByteMask(state.encodeAll()));

            assert.deepEqual(decodedState.mapOfPlayers['1'].name, "New name");
            assert.deepEqual(decodedState.mapOfPlayers['2'].name, "Jake Badlands");
        });

        it("should encode changed values", () => {
            const state = new State();
            state.fieldString = "Hello world!";
            state.fieldNumber = 50;

            state.player = new Player();
            state.player.name = "Jake Badlands";
            state.player.y = 50;

            const encoded = state.encode();
            assert.deepEqual(encoded, [0, 172, 72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33, 1, 50, 2, 0, 173, 74, 97, 107, 101, 32, 66, 97, 100, 108, 97, 110, 100, 115, 2, 50, 193]);

            // SHOULD PRESERVE VALUES AFTER SERIALIZING
            assert.equal(state.fieldString, "Hello world!");
            assert.equal(state.fieldNumber, 50);
            assert.ok(state.player instanceof Player);
            assert.equal((state.player as any).$changes.parent, (state as any).$changes);
            assert.equal(state.player.name, "Jake Badlands");
            assert.equal(state.player.x, undefined);
            assert.equal(state.player.y, 50);

            const decodedState = new State();
            decodedState.decode(applyByteMask(encoded));

            const decodedPlayerReference = decodedState.player;

            assert.equal(decodedState.fieldString, "Hello world!");
            assert.equal(decodedState.fieldNumber, 50);

            assert.ok(decodedPlayerReference instanceof Player);
            assert.equal(decodedState.player.name, "Jake Badlands");
            assert.equal(decodedState.player.x, undefined, "unset variable should be undefined");
            assert.equal(decodedState.player.y, 50);

            /**
             * Lets encode a single change now
             */

            // are Player and State unchanged?
            assert.equal((state.player as any).$changed, false);
            assert.equal((state as any).$changed, false);

            state.player.x = 30;

            // Player and State should've changes!
            assert.equal((state.player as any).$changed, true);
            assert.equal((state as any).$changed, true);

            const serializedChanges = state.encode();

            decodedState.decode(applyByteMask(serializedChanges));
            assert.equal(decodedPlayerReference, decodedState.player, "should re-use the same Player instance");
            assert.equal(decodedState.player.name, "Jake Badlands");
            assert.equal(decodedState.player.x, 30);
            assert.equal(decodedState.player.y, 50);
        });

        it("should support array of strings", () => {
            class MyState extends Schema {
                @type(["string"])
                arrayOfStrings: ArraySchema<string>;
            }

            const state = new MyState();
            state.arrayOfStrings = new ArraySchema("one", "two", "three");

            let encoded = state.encode();
            assert.deepEqual(encoded, [0, 3, 3, 0, 163, 111, 110, 101, 1, 163, 116, 119, 111, 2, 165, 116, 104, 114, 101, 101]);

            const decodedState = new MyState();
            decodedState.decode(applyByteMask(encoded));
            assert.deepEqual(decodedState.arrayOfStrings, ["one", "two", "three"]);

            // mutate array
            state.arrayOfStrings.push("four")
            encoded = state.encode();
            assert.deepEqual(encoded, [ 0, 4, 1, 3, 164, 102, 111, 117, 114 ]);

            decodedState.decode(applyByteMask(encoded));
            assert.deepEqual(decodedState.arrayOfStrings, ["one", "two", "three", "four"]);
        });

        it("should support array of numbers", () => {
            class MyState extends Schema {
                @type(["number"])
                arrayOfNumbers: ArraySchema<number>;
            }

            const state = new MyState();
            state.arrayOfNumbers = new ArraySchema(0, 144, 233, 377, 610, 987, 1597, 2584);

            let encoded = state.encode();
            assert.deepEqual(encoded, [ 0, 8, 8, 0, 0, 1, 204, 144, 2, 204, 233, 3, 205, 377, 1, 4, 205, 610, 2, 5, 205, 987, 3, 6, 205, 1597, 6, 7, 205, 2584, 10 ] );

            const decodedState = new MyState();
            decodedState.decode(applyByteMask(encoded));

            assert.deepEqual(decodedState.arrayOfNumbers, [0, 144, 233, 377, 610, 987, 1597, 2584]);

            // mutate array
            state.arrayOfNumbers.push(999999);
            encoded = state.encode();
            assert.deepEqual(encoded, [ 0, 9, 1, 8, 206, 999999, 3906, 15, 0 ]);

            decodedState.decode(applyByteMask(encoded));
            assert.deepEqual(decodedState.arrayOfNumbers, [0, 144, 233, 377, 610, 987, 1597, 2584, 999999]);
        });

        it("should support map of numbers", () => {
            class MyState extends Schema {
                @type({ map: "number" })
                mapOfNumbers: MapSchema<number>;
            }

            const state = new MyState();
            state.mapOfNumbers = new MapSchema<number>({ 'zero': 0, 'one': 1, 'two': 2 });

            let encoded = state.encode();
            // assert.deepEqual(encoded, []);

            const decodedState = new MyState();
            decodedState.decode(applyByteMask(encoded));
            assert.deepEqual(decodedState.mapOfNumbers, { 'zero': 0, 'one': 1, 'two': 2 });

            // mutate map
            state.mapOfNumbers['three'] = 3;
            encoded = state.encode();
            // assert.deepEqual(encoded, []);

            decodedState.decode(applyByteMask(encoded));
            assert.deepEqual(decodedState.mapOfNumbers, { 'zero': 0, 'one': 1, 'two': 2, 'three': 3 });
        });

        describe("no changes", () => {
            it("empty state", () => {
                const state = new State();
                assert.deepEqual(state.encode(), []);

                const decodedState = new State();
                assert.doesNotThrow(() => decodedState.decode(applyByteMask(state.encode())));

                state.arrayOfPlayers = new ArraySchema();
                state.mapOfPlayers = new MapSchema();
                assert.doesNotThrow(() => decodedState.decode(applyByteMask(state.encode())));
            });

            it("updating with same value", () => {
                const state = new State();
                state.mapOfPlayers = new MapSchema<Player>({
                    jake: new Player("Jake Badlands", 50, 50)
                });
                assert.ok(state.encode().length > 0);

                state.mapOfPlayers['jake'].x = 50;
                state.mapOfPlayers['jake'].y = 50;
                state.mapOfPlayers['jake'].thisPropDoesntExist = 100;

                const encoded = state.encode();
                assert.ok(encoded.length === 0, "updates with same value shouldn't trigger change.");
            });
        });
    });

    describe("limitations", () => {
        it("should encode null string as empty", () => {
            class MyState extends Schema {
                @type("string")
                myString: string = "hello";
            };

            class AToStringClass {
                toJSON (){
                    return "I'm a json!";
                }
                toString () {
                    return "I'm not a string!";
                }
            }

            const state = new MyState();
            const decodedState = new MyState();
            decodedState.decode(applyByteMask(state.encodeAll()));

            assert.equal(decodedState.myString, "hello");

            state.myString = null;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.myString, "");

            assert.throws(() => {
                (state as any).myString = {};
                decodedState.decode(applyByteMask(state.encode()));
            }, /a 'string' was expected/ig);

            assert.throws(() => {
                (state as any).myString = new AToStringClass();
                decodedState.decode(applyByteMask(state.encode()));
            }, /a 'string' was expected, but '"I'm a json!"' \(AToStringClass\) was provided./ig);
        });

        it("should not encode null numbers", () => {
            class MyState extends Schema {
                @type("number")
                myNumber: number = 1;

                @type("uint8")
                uint8: number = 50;
            };

            const state = new MyState();
            const decodedState = new MyState();
            decodedState.decode(applyByteMask(state.encodeAll()));

            assert.equal(decodedState.myNumber, 1);

            assert.throws(() => {
                state.myNumber = null;
                decodedState.decode(applyByteMask(state.encode()));
            }, /a 'number' was expected/ig);

            state.myNumber = Infinity;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.myNumber, Number.MAX_SAFE_INTEGER);

            state.myNumber = -Infinity;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.myNumber, -Number.MAX_SAFE_INTEGER);

            state.myNumber = NaN;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.myNumber, 0);

            assert.throws(() => {
                state.uint8 = null;
                decodedState.decode(applyByteMask(state.encode()));
            }, /a 'number' was expected/ig);

            assert.throws(() => {
                (state as any).myNumber = {};
                decodedState.decode(applyByteMask(state.encode()));
            }, /a 'number' was expected/ig);
        });

        it("should trigger error when assigning incompatible Schema type", () => {
            class Entity extends Schema {
                @type("number") x: number;
                @type("number") y: number;

                constructor (x?: number, y?: number) {
                    super();
                    this.x = x;
                    this.y = y;
                }
            }

            class Player extends Entity {
                @type("string") name: string;

                constructor (name?: string, x?: number, y?: number) {
                    super(x, y);
                    this.name = name;
                }
            }

            class MyState extends Schema {
                @type(Player) player = new Player();
                @type(Entity) entity = new Entity();
                @type([Player]) arrayOfPlayers = new ArraySchema<Player>();
                @type({ map: Player }) mapOfPlayers = new MapSchema<Player>();
            }

            assert.throws(() => {
                const state = new MyState();
                (state as any).player = {};
                state.encode();
            }, /a 'player' was expected/ig);

            assert.throws(() => {
                const state = new MyState();
                state.arrayOfPlayers.push({} as Player);
                state.encode();
            }, /a 'player' was expected/ig);

            assert.throws(() => {
                const state = new MyState();
                state.mapOfPlayers['one'] = new Entity();
                state.encode();
            }, /a 'player' was expected/ig);

            assert.throws(() => {
                const state = new MyState();
                state.mapOfPlayers['one'] = {};
                state.encode();
            }, /a 'player' was expected/ig);

            assert.throws(() => {
                const state = new MyState();
                (state as any).player = new Entity();
                state.encode();
            }, /a 'player' was expected/ig);

            assert.throws(() => {
                const state = new MyState();
                (state as any).player = new Entity(100, 100);
                state.encode();
            }, /a 'Player' was expected, but 'Entity' was provided/ig);

            assert.doesNotThrow(() => {
                const state = new MyState();
                state.entity = new Player("Player name", 50, 50);
                state.encode();
            });

            const state = new MyState();
            (state as any).player = new Player("Name", 100, 100);

            const decodedState = new MyState();
            decodedState.decode(applyByteMask(state.encodeAll()));
            assert.equal(decodedState.player.name, "Name");
            assert.equal(decodedState.player.x, 100);
            assert.equal(decodedState.player.y, 100);
        });

        it("should trigger error when assigning plain maps or arrays", () => {
            class MyState extends Schema {
                @type({ map: "string" }) map = new MapSchema<string>();
                @type([ "string" ]) array = new ArraySchema<string>();
            }

            assert.throws(() => {
                const state = new MyState();
                (state as any).map = {};
                state.encode();
            }, /a 'MapSchema' was expected/ig);

            assert.throws(() => {
                const state = new MyState();
                (state as any).array = [];
                state.encode();
            }, /a 'ArraySchema' was expected/ig);
        });
    })

    describe("encodeAll", () => {
        it('should encode everything again', () => {
            const state = new State();
            state.mapOfPlayers = new MapSchema<Player>({
                jake: new Player("Jake"),
                katarina: new Player("Katarina"),
            });
            state.encode();

            const decodedState = new State();
            decodedState.decode(applyByteMask(state.encodeAll()));
            assert.deepEqual(Object.keys(decodedState.mapOfPlayers), ['jake', 'katarina']);

            let jakeX = Math.random() * 2000;
            state.mapOfPlayers['jake'].x = jakeX;
            decodedState.decode(applyByteMask(state.encode()));
            assert.equal(decodedState.mapOfPlayers['jake'].x, jakeX);

            delete state.mapOfPlayers['jake'];
        });

        it('should discard deleted map items', () => {
            class Player extends Schema {
                @type("number")
                xp: number;

                constructor (xp: number) {
                    super();
                    this.xp = xp;
                }
            }
            class MyState extends Schema {
                @type({map: Player})
                players = new MapSchema<Player>();

                @type("number")
                n = 100;
            }

            const state = new MyState();
            state.players['one'] = new Player(100);
            state.players['two'] = new Player(100);

            const decodedState1 = new MyState();
            decodedState1.decode(applyByteMask(state.encodeAll()));
            assert.deepEqual(Object.keys(decodedState1.players), ['one', 'two']);
            assert.equal(decodedState1.n, 100);

            delete state.players['two'];

            const decodedState2 = new MyState();
            decodedState2.decode(applyByteMask(state.encodeAll()));
            assert.deepEqual(Object.keys(decodedState2.players), ['one']);
            assert.equal(decodedState2.n, 100);
        });
    });

    describe("deep structures / re-assignents", () => {
        it("should allow re-assigning child schema type", () => {
            const state = new DeepState();
            const deepMap = new DeepMap();

            const deepChild = new DeepChild();
            deepChild.entity.name = "Player one";
            deepChild.entity.another.position = new Position(100, 200, 300);
            deepMap.arrayOfChildren.push(deepChild);

            state.map['one'] = deepMap;

            const decodedState = new DeepState();
            decodedState.decode(applyByteMask(state.encodeAll()));

            assert.equal(decodedState.map['one'].arrayOfChildren[0].entity.name, "Player one");
            assert.equal(decodedState.map['one'].arrayOfChildren[0].entity.another.position.x, 100);
            assert.equal(decodedState.map['one'].arrayOfChildren[0].entity.another.position.y, 200);
            assert.equal(decodedState.map['one'].arrayOfChildren[0].entity.another.position.z, 300);


            const decodedState2 = new DeepState();
            decodedState2.decode(applyByteMask(state.encodeAll()));
            assert.equal(decodedState2.map['one'].arrayOfChildren[0].entity.name, "Player one");
            assert.equal(decodedState2.map['one'].arrayOfChildren[0].entity.another.position.x, 100);
            assert.equal(decodedState2.map['one'].arrayOfChildren[0].entity.another.position.y, 200);
            assert.equal(decodedState2.map['one'].arrayOfChildren[0].entity.another.position.z, 300);
        });
    });

    describe("toJSON()", () => {
        it("should return child structures as JSON", () => {
            const state = new State();
            state.fieldString = "string";
            state.fieldNumber = 10;

            state.player = new Player();
            state.player.name = "Jake";
            state.player.x = 10;

            state.mapOfPlayers = new MapSchema();
            state.mapOfPlayers['one'] = new Player("Cyberhalk", 100, 50);

            state.arrayOfPlayers = new ArraySchema();
            state.arrayOfPlayers.push(new Player("Katarina"));

            assert.deepEqual(state.toJSON(), {
                fieldString: 'string',
                fieldNumber: 10,
                player: { name: 'Jake', x: 10 },
                arrayOfPlayers: [{ name: 'Katarina' }],
                mapOfPlayers: { one: { name: 'Cyberhalk', x: 100, y: 50 } }
            })
        });

    });
});
