"use strict";

const { parseAccept } = require("../lib/parsing");

describe("Parsing Test:", function () {
    describe("parseAccept:", function () {
        it("Sorting", function () {
            const acceptableMedia = parseAccept({
                "accept":
                    "text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8",
            }, ["application/xml"]);
            expect(acceptableMedia[0]).toBe("application/xml");
        });
        it("Group Alphabetically", function () {
            const acceptableMedia = parseAccept({
                "accept": "application/json, application/bebop, text/html",
            }, []);
            expect(acceptableMedia).toEqual([
                "application/bebop",
                "application/json",
                "text/html",
            ]);
        });
        it("No Explicit Weights", function () {
            const acceptableMedia = parseAccept({
                "accept":
                    "application/vnd.wap.wmlscriptc, text/vnd.wap.wml, application/vnd.wap.xhtml+xml, application/xhtml+xml, text/html, multipart/mixed, */*",
            }, []);
            expect(acceptableMedia).toEqual([
                "application/vnd.wap.wmlscriptc",
                "application/vnd.wap.xhtml+xml",
                "application/xhtml+xml",
                "multipart/mixed",
                "text/html",
                "text/vnd.wap.wml",
                "*/*",
            ]);
        });
        it("Partial Types", function () {
            const acceptableMedia = parseAccept({
                "accept": "text/*, image/*",
            }, []);
            expect(acceptableMedia).toEqual(["image/*", "text/*"]);
        });

        it("Empty Accept", function () {
            const acceptableMedia = parseAccept({
                "accept": "",
            }, []);
            expect(acceptableMedia).toEqual(["*/*"]);
        });
        it("Null Accept", function () {
            const acceptableMedia = parseAccept({
                "accept": "null",
            }, []);
            expect(acceptableMedia).toEqual([]);
        });
        it("Invalid Preference", function () {

            expect(() => {
                parseAccept({
                    "accept": "application/json, application/bebop, text/html",
                }, ["*/json"]);
            }).toThrow();

        });
    });
});
