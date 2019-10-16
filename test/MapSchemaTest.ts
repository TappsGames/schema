import * as sinon from "sinon";
import * as assert from "assert";

import { State, Player } from "./Schema";
import { ArraySchema, MapSchema, type, Schema } from "../src";
import {applyByteMask} from "./helpers/bytemask";

describe("MapSchema", () => {

    it("should not consider changes after removing from the change tree", (done) => {
        class Item extends Schema {
            @type("number") price: number;
            constructor (price: number) {
                super();
                this.price = price;
            }
        }
        class Inventory extends Schema {
            @type({ map: Item }) slots = new MapSchema<Item>();
        }
        class Player extends Schema {
            @type("string") name: string;
            @type(Inventory) inventory = new Inventory();
            @type(Inventory) purchase = new Inventory();
        }

        class State extends Schema {
            @type({map: Player}) players = new MapSchema<Player>();
        }

        const state = new State();
        const playerOne = new Player();
        state.players['one'] = playerOne;

        playerOne.name = "One!";
        playerOne.inventory['one'] = new Item(100);
        playerOne.inventory['two'] = new Item(100);
        playerOne.inventory['three'] = new Item(100);

        state.encodeAll();

        const playerTwo = new Player();
        state.players['two'] = playerTwo
        playerTwo.name = "Two!";

        delete state.players['two'];
        playerTwo.name = "Hello";
        playerTwo.purchase['one'] = new Item(500);
        playerTwo.purchase['two'] = new Item(500);
        playerTwo.purchase['three'] = new Item(500);

        state.encode();

        playerTwo.name = "Hello";
        playerTwo.purchase['one'] = new Item(500);
        playerTwo.purchase['two'] = new Item(500);
        playerTwo.purchase['three'] = new Item(500);
        state.encode();

        const decodedState = new State();
        decodedState.decode(applyByteMask(state.encodeAll()));
        console.log(decodedState.toJSON());
        done();
    });

    it("should allow to remove and set an item in the same place", () => {
        const state = new State();
        state.mapOfPlayers = new MapSchema<Player>();
        state.mapOfPlayers['one'] = new Player("Jake");
        state.mapOfPlayers['two'] = new Player("Katarina");

        const decodedState = new State();
        decodedState.decode(applyByteMask(state.encodeAll()));

        delete state.mapOfPlayers['one'];
        state.mapOfPlayers['one'] = new Player("Jake 2");
        decodedState.decode(applyByteMask(state.encode()));

        delete state.mapOfPlayers['two'];
        state.mapOfPlayers['two'] = new Player("Katarina 2");
        decodedState.decode(applyByteMask(state.encode()));

        assert.equal(decodedState.mapOfPlayers['one'].name, "Jake 2");
        assert.equal(decodedState.mapOfPlayers['two'].name, "Katarina 2");
    });

    it("should allow any value for primitive integer types in a map", () => {
        const state = new State();
        state.mapOfInt32 = new MapSchema<number>();
        state.mapOfInt32["first"] = 192;
        state.mapOfInt32["second"] = 49344;

        const decodedState = new State();
        decodedState.decode(applyByteMask(state.encodeAll()));

        assert.strictEqual(decodedState.mapOfInt32['first'], 192);
        assert.strictEqual(decodedState.mapOfInt32['second'], 49344);
    });

});
