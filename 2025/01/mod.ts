import { FileSystem } from 'npm:@effect/platform';
import { NodeContext, NodeRuntime } from 'npm:@effect/platform-node';
import { Console, Effect, Number, Schema, Stream } from "npm:effect";
import { pipe } from "npm:effect/Function";

const Instruction = Schema.Union(
    Schema.TemplateLiteralParser(Schema.Literal("L"), Schema.Number),
    Schema.TemplateLiteralParser(Schema.Literal("R"), Schema.Number)
)
type Instruction = Schema.Schema.Type<typeof Instruction>

const getTurns = (
    [direction, count]: Instruction
) => direction === "L" ? -count : count

const DIAL_MIN = 0;
const DIAL_MAX = 99;

type DialChange = { current: number; turns: number }
type DialSetup = { min: number; max: number }
const turnDial = (
    { min, max }: DialSetup,
) => (
    { current, turns }: DialChange
) => pipe(
    current + turns,
    Number.remainder(max + 1),
    position => position > min - 1 ? position : max + 1 + position
)

const countZeroPasses =
    ({ min, max }: DialSetup) =>
        ({
            position,
            turns
        }: {
            position: number;
            turns: number;
        }) => {
            const offset = turns > 0 ? max - position + 1 : position - min + 1;
            const absTurns = Math.abs(turns);

            if (absTurns < offset) {
                return 0;
            }

            const cycle = max - min + 1;
            return 1 + Math.floor((absTurns - offset) / cycle);
        }

const part1 = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const getDialPosition = turnDial({ min: DIAL_MIN, max: DIAL_MAX })

    const { zeroCount } = yield* fs.stream('./input.txt').pipe(
        Stream.decodeText(),
        Stream.splitLines,
        Stream.mapEffect(Schema.decodeUnknown(Instruction)),
        Stream.map(getTurns),
        Stream.runFold({ zeroCount: 0, position: 50 }, (acc, change) => {
            const newPosition = getDialPosition({ current: acc.position, turns: change })
            return {
                zeroCount: newPosition === 0 ? acc.zeroCount + 1 : acc.zeroCount,
                position: newPosition
            }
        })
    )

    return zeroCount

})

const part2 = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const getDialPosition = turnDial({ min: DIAL_MIN, max: DIAL_MAX })
    const getZeroPasses = countZeroPasses({ min: DIAL_MIN, max: DIAL_MAX })

    const { zeroPasses } = yield* fs.stream('./input.txt').pipe(
        Stream.decodeText(),
        Stream.splitLines,
        Stream.mapEffect(Schema.decodeUnknown(Instruction)),
        Stream.map(getTurns),
        Stream.runFold({ zeroPasses: 0, position: 50 }, (acc, change) => {
            const newPosition = getDialPosition({ current: acc.position, turns: change })
            const zeroPasses = getZeroPasses({ position: acc.position, turns: change })
            console.log({ change, newPosition, zeroPasses })
            return {
                zeroPasses: acc.zeroPasses + zeroPasses,
                position: newPosition
            }
        })
    )

    return zeroPasses

})

const program = Effect.gen(function* () {
    yield* part1.pipe(
        Effect.tap(Console.log)
    )
    yield* part2.pipe(
        Effect.tap(Console.log)
    )

}).pipe(
    Effect.provide(NodeContext.layer)
)

NodeRuntime.runMain(program)
