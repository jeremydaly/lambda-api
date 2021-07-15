"use strict";

const prettyPrint = require("../lib/prettyPrint");

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe("PrettyPrint Tests:", function () {
  it("Minimum header widths", function () {
    expect(
      prettyPrint([
        ["GET", "/", ["unnamed"]],
        ["POST", "/", ["unnamed"]],
        ["DELETE", "/", ["unnamed"]],
      ])
    ).toBe(
      "╔══════════╤═════════╤═══════════╗\n║  \u001b[1mMETHOD\u001b[0m  │  \u001b[1mROUTE\u001b[0m  │  \u001b[1mSTACK  \u001b[0m  ║\n╟──────────┼─────────┼───────────╢\n║  GET     │  /      │  unnamed  ║\n╟──────────┼─────────┼───────────╢\n║  POST    │  /      │  unnamed  ║\n╟──────────┼─────────┼───────────╢\n║  DELETE  │  /      │  unnamed  ║\n╚══════════╧═════════╧═══════════╝"
    );
  }); // end it

  it("Adjusted header widths", function () {
    expect(
      prettyPrint([
        ["GET", "/", ["unnamed"]],
        ["POST", "/testing", ["unnamed"]],
        ["DELETE", "/long-url-path-name", ["unnamed"]],
      ])
    ).toBe(
      "╔══════════╤═══════════════════════╤═══════════╗\n║  \u001b[1mMETHOD\u001b[0m  │  \u001b[1mROUTE              \u001b[0m  │  \u001b[1mSTACK  \u001b[0m  ║\n╟──────────┼───────────────────────┼───────────╢\n║  GET     │  /                    │  unnamed  ║\n╟──────────┼───────────────────────┼───────────╢\n║  POST    │  /testing             │  unnamed  ║\n╟──────────┼───────────────────────┼───────────╢\n║  DELETE  │  /long-url-path-name  │  unnamed  ║\n╚══════════╧═══════════════════════╧═══════════╝"
    );
  }); // end it
}); // end UTILITY tests
