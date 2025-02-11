import * as assert from "assert";
import * as nanoid from "nanoid";
import { MapSchema, Schema, type, ArraySchema } from "../src";

import { State, Player } from "./Schema";

describe("Edge cases", () => {

    xit("NIL check should not collide", () => {
        class State extends Schema {
            @type("int32") num: number;
            @type({ map: "int32" }) mapOfNum = new MapSchema<number>();
            @type(["int32"]) arrayOfNum = new ArraySchema<number>();
        }

        const state = new State();
        state.num = 3519;
        state.mapOfNum['one'] = 3519;
        state.arrayOfNum[0] = 3519;

        const decodedState = new State();
        decodedState.decode(state.encode());

        /**
         * 3520 is encoded as [192, 13, 0, 0]
         * (192 is the NIL byte indicator)
         */
        state.num = 3520;
        state.mapOfNum['one'] = 3520;
        state.arrayOfNum[0] = 3520;

        decodedState.decode(state.encode());

        assert.deepEqual(decodedState.toJSON(), {
            num: 3520,
            mapOfNum: { one: 3520 },
            arrayOfNum: [3520]
        });
    });

    it("string: containing specific UTF-8 characters", () => {
        let bytes: number[];

        const state = new State();
        const decodedState = new State();

        state.fieldString = "гхб";
        bytes = state.encode();
        decodedState.decode(bytes);
        assert.equal("гхб", decodedState.fieldString);

        state.fieldString = "Пуредоминаце";
        bytes = state.encode();
        decodedState.decode(bytes);
        assert.equal("Пуредоминаце", decodedState.fieldString);

        state.fieldString = "未知の選手";
        bytes = state.encode();
        decodedState.decode(bytes);
        assert.equal("未知の選手", decodedState.fieldString);

        state.fieldString = "알 수없는 플레이어";
        bytes = state.encode();
        decodedState.decode(bytes);
        assert.equal("알 수없는 플레이어", decodedState.fieldString);
    });

    it("MapSchema: index with high number of items should be preserved", () => {
        const state = new State();
        state.mapOfPlayers = new MapSchema<Player>();

        let i = 0;

        // add 20 players
        // for (let i = 0; i < 2; i++) { state.mapOfPlayers[nanoid(8)] = new Player("Player " + i, i * 2, i * 2); }

        state.encodeAll();

        const decodedState1 = new State();
        decodedState1.decode(state.encodeAll());
        state.mapOfPlayers[nanoid(8)] = new Player("Player " + i++, i++, i++);

        const decodedState2 = new State();
        state.mapOfPlayers[nanoid(8)] = new Player("Player " + i++, i++, i++);
        decodedState2.decode(state.encodeAll());

        const decodedState3 = new State();
        decodedState3.decode(state.encodeAll());
        state.mapOfPlayers[nanoid(8)] = new Player("Player " + i++, i++, i++);

        // // add 20 players
        // for (let i = 0; i < 2; i++) { state.mapOfPlayers[nanoid(8)] = new Player("Player " + i, i * 2, i * 2); }

        const encoded = state.encode();
        decodedState1.decode(encoded);
        decodedState2.decode(encoded);
        decodedState3.decode(encoded);

        const decodedState4 = new State();
        state.mapOfPlayers[nanoid(8)] = new Player("Player " + i++, i++, i++);
        decodedState4.decode(state.encodeAll());

        assert.equal(JSON.stringify(decodedState1), JSON.stringify(decodedState2));
        assert.equal(JSON.stringify(decodedState2), JSON.stringify(decodedState3));

        decodedState3.decode(state.encode());
        assert.equal(JSON.stringify(decodedState3), JSON.stringify(decodedState4));
    });
});
