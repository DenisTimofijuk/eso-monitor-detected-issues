import { describe, it, expect, beforeEach } from "vitest";
import ZoneChecker from "./ZoneChecker";
import type { ZoneCoordinates } from "./types/ZoneChecker.type";

describe("ZoneChecker", () => {
    let zoneChecker: ZoneChecker;

    beforeEach(() => {
        zoneChecker = new ZoneChecker();
    });

    describe("Constructor", () => {
        it("should initialize with empty zones array", () => {
            expect(zoneChecker.zones).toEqual([]);
            expect(zoneChecker.getZones()).toEqual([]);
        });
    });

    describe("Rectangle Zone Tests", () => {
        const topLeft: ZoneCoordinates = {
            lat: 55.363480869216595,
            lng: 24.321106992608996,
        };
        const bottomRight: ZoneCoordinates = {
            lat: 54.498960590750656,
            lng: 25.179308470701606,
        };

        beforeEach(() => {
            zoneChecker.addRectangleZone("Vilnius Area", topLeft, bottomRight);
        });

        it("should add rectangle zone correctly", () => {
            const zones = zoneChecker.getZones();
            expect(zones).toHaveLength(1);
            expect(zones[0]).toEqual({
                name: "Vilnius Area",
                type: "rectangle",
            });
        });

        it("should detect point inside rectangle", () => {
            // Point in the center of Vilnius
            const centerPoint: ZoneCoordinates = {
                lat: 54.67735825301103,
                lng: 24.62513352444934,
            };
            const result = zoneChecker.checkPoint(centerPoint);
            expect(result).toEqual(["Vilnius Area"]);
        });

        it("should detect point at rectangle boundaries", () => {
            // Test exact corner points
            const topLeftPoint = { ...topLeft };
            const bottomRightPoint = { ...bottomRight };

            expect(zoneChecker.checkPoint(topLeftPoint)).toEqual([
                "Vilnius Area",
            ]);
            expect(zoneChecker.checkPoint(bottomRightPoint)).toEqual([
                "Vilnius Area",
            ]);
        });

        it("should detect point outside rectangle", () => {
            // Point clearly outside the rectangle (north of Vilnius)
            const outsidePoint: ZoneCoordinates = { lat: 56.0, lng: 24.0 };
            const result = zoneChecker.checkPoint(outsidePoint);
            expect(result).toEqual([]);
        });

        it("should detect multiple points inside rectangle", () => {
            const pointsInside: ZoneCoordinates[] = [
                { lat: 54.9, lng: 24.95 },
                { lat: 54.85, lng: 24.4 },
                { lat: 55.0, lng: 25.1 },
            ];

            const result = zoneChecker.checkPoints(pointsInside);
            expect(result).toHaveLength(3);
            expect(result).toEqual(pointsInside);
        });

        it("should filter out points outside rectangle", () => {
            const mixedPoints: ZoneCoordinates[] = [
                { lat: 54.9, lng: 24.95 }, // Inside
                { lat: 51.0, lng: 26.0 }, // Outside (north)
                { lat: 54.85, lng: 24.4 }, // Inside
                { lat: 57.0, lng: 21.0 }, // Outside (south-west)
            ];

            const result = zoneChecker.checkPoints(mixedPoints);
            expect(result).toHaveLength(2);
            expect(result).toEqual([
                { lat: 54.9, lng: 24.95 },
                { lat: 54.85, lng: 24.4 },
            ]);
        });
    });

    describe("Circle Zone Tests", () => {
        const center: ZoneCoordinates = { lat: 54.9, lng: 23.95 };
        const radius = 0.1; // Approximately 10km

        beforeEach(() => {
            zoneChecker.addCircleZone("Vilnius Center", center, radius);
        });

        it("should add circle zone correctly", () => {
            const zones = zoneChecker.getZones();
            expect(zones).toHaveLength(1);
            expect(zones[0]).toEqual({
                name: "Vilnius Center",
                type: "circle",
            });
        });

        it("should detect point inside circle", () => {
            const insidePoint: ZoneCoordinates = { lat: 54.91, lng: 23.96 };
            const result = zoneChecker.checkPoint(insidePoint);
            expect(result).toEqual(["Vilnius Center"]);
        });

        it("should detect point at circle center", () => {
            const result = zoneChecker.checkPoint(center);
            expect(result).toEqual(["Vilnius Center"]);
        });

        it("should detect point outside circle", () => {
            const outsidePoint: ZoneCoordinates = { lat: 55.1, lng: 24.2 };
            const result = zoneChecker.checkPoint(outsidePoint);
            expect(result).toEqual([]);
        });

        it("should detect point at circle boundary", () => {
            const boundaryPoint: ZoneCoordinates = {
                lat: center.lat + radius,
                lng: center.lng,
            };
            const result = zoneChecker.checkPoint(boundaryPoint);
            expect(result).toEqual(["Vilnius Center"]);
        });
    });

    describe("Polygon Zone Tests", () => {
        const triangleVertices: ZoneCoordinates[] = [
            { lat: 54.9, lng: 23.9 },
            { lat: 54.95, lng: 24.0 },
            { lat: 54.85, lng: 24.0 },
        ];

        beforeEach(() => {
            zoneChecker.addPolygonZone("Triangle Zone", triangleVertices);
        });

        it("should add polygon zone correctly", () => {
            const zones = zoneChecker.getZones();
            expect(zones).toHaveLength(1);
            expect(zones[0]).toEqual({
                name: "Triangle Zone",
                type: "polygon",
            });
        });

        it("should detect point inside polygon", () => {
            const insidePoint: ZoneCoordinates = { lat: 54.91, lng: 23.97 };
            const result = zoneChecker.checkPoint(insidePoint);
            expect(result).toEqual(["Triangle Zone"]);
        });

        it("should detect point outside polygon", () => {
            const outsidePoint: ZoneCoordinates = { lat: 54.8, lng: 23.8 };
            const result = zoneChecker.checkPoint(outsidePoint);
            expect(result).toEqual([]);
        });

        it("should handle complex polygon", () => {
            const complexPolygon: ZoneCoordinates[] = [
                { lng: 25.1501942, lat: 54.7654683 },
                { lng: 25.1501942, lat: 54.7654683 },
                { lng: 25.1530695, lat: 54.7650969 },
                { lng: 25.1573181, lat: 54.7654683 },
                { lng: 25.1604509, lat: 54.7667557 },
                { lng: 25.1630688, lat: 54.7686373 },
                { lng: 25.1540565, lat: 54.7761627 },
                { lng: 25.1550007, lat: 54.7844539 },
                { lng: 25.1485205, lat: 54.7894278 },
                { lng: 25.168047, lat: 54.7956134 },
                { lng: 25.1735401, lat: 54.8031338 },
                { lng: 25.1773167, lat: 54.810356 },
                { lng: 25.1757288, lat: 54.8154009 },
                { lng: 25.1495934, lat: 54.8165631 },
                { lng: 25.141654, lat: 54.8080559 },
                { lng: 25.1278353, lat: 54.8029359 },
                { lng: 25.116334, lat: 54.7948217 },
                { lng: 25.120368, lat: 54.7917784 },
                { lng: 25.1201534, lat: 54.7881906 },
                { lng: 25.1392078, lat: 54.7775736 },
                { lng: 25.1501513, lat: 54.765493 },
                { lng: 25.1501942, lat: 54.7654683 },
            ];

            zoneChecker.addPolygonZone("Complex Zone", complexPolygon);

            const centerPoint: ZoneCoordinates = { lat: 54.775269857364925, lng: 25.149185438364594 }; 
            const result = zoneChecker.checkPoint(centerPoint);
            expect(result).toContain("Complex Zone");
        });
    });

    describe("Multiple Zones Tests", () => {
        beforeEach(() => {
            // Add rectangle zone
            zoneChecker.addRectangleZone(
                "Large Area",
                { lat: 55.0, lng: 23.8 },
                { lat: 54.8, lng: 24.2 }
            );

            // Add circle zone that overlaps with rectangle
            zoneChecker.addCircleZone(
                "Center Circle",
                { lat: 54.9, lng: 24.0 },
                0.05
            );

            // Add polygon zone
            zoneChecker.addPolygonZone("Triangle", [
                { lat: 54.92, lng: 23.9 },
                { lat: 54.94, lng: 23.95 },
                { lat: 54.88, lng: 23.95 },
            ]);
        });

        it("should return multiple zone names for overlapping zones", () => {
            const pointInMultipleZones: ZoneCoordinates = {
                lat: 54.9,
                lng: 24.0,
            };
            const result = zoneChecker.checkPoint(pointInMultipleZones);

            expect(result).toContain("Large Area");
            expect(result).toContain("Center Circle");
            expect(result.length).toBeGreaterThanOrEqual(2);
        });

        it("should return empty array for point in no zones", () => {
            const pointInNoZones: ZoneCoordinates = { lat: 55.5, lng: 25.0 };
            const result = zoneChecker.checkPoint(pointInNoZones);
            expect(result).toEqual([]);
        });

        it("should return all zones info", () => {
            const zones = zoneChecker.getZones();
            expect(zones).toHaveLength(3);

            const zoneNames = zones.map((z) => z.name);
            expect(zoneNames).toContain("Large Area");
            expect(zoneNames).toContain("Center Circle");
            expect(zoneNames).toContain("Triangle");
        });
    });

    describe("Edge Cases", () => {
        it("should handle point with same coordinates as rectangle corner", () => {
            const corner: ZoneCoordinates = { lat: 55.0, lng: 24.0 };
            zoneChecker.addRectangleZone("Test", corner, {
                lat: 54.0,
                lng: 25.0,
            });

            const result = zoneChecker.checkPoint(corner);
            expect(result).toEqual(["Test"]);
        });

        it("should handle very small circle radius", () => {
            zoneChecker.addCircleZone("Tiny", { lat: 54.9, lng: 24.0 }, 0.001);

            const insidePoint: ZoneCoordinates = { lat: 54.9, lng: 24.0 };
            const outsidePoint: ZoneCoordinates = { lat: 54.91, lng: 24.01 };

            expect(zoneChecker.checkPoint(insidePoint)).toEqual(["Tiny"]);
            expect(zoneChecker.checkPoint(outsidePoint)).toEqual([]);
        });

        it("should handle polygon with duplicate vertices", () => {
            const vertices: ZoneCoordinates[] = [
                { lat: 54.9, lng: 23.9 },
                { lat: 54.95, lng: 24.0 },
                { lat: 54.95, lng: 24.0 }, // Duplicate
                { lat: 54.85, lng: 24.0 },
            ];

            zoneChecker.addPolygonZone("Duplicate Vertices", vertices);
            const result = zoneChecker.checkPoint({ lat: 54.91, lng: 23.97 });
            expect(result).toEqual(["Duplicate Vertices"]);
        });

        it("should handle empty points array", () => {
            zoneChecker.addRectangleZone(
                "Test",
                { lat: 55.0, lng: 24.0 },
                { lat: 54.0, lng: 25.0 }
            );
            const result = zoneChecker.checkPoints([]);
            expect(result).toEqual([]);
        });
    });

    describe("Real World Vilnius Coordinates", () => {
        beforeEach(() => {
            // Your production coordinates
            zoneChecker.addRectangleZone(
                "Production Zone",
                { lat: 54.76310359627653, lng: 25.1391334379127 },
                { lat: 54.58531072114089, lng: 25.46876734048961 }
            );
        });

        it("should detect Vilnius city center", () => {
            const vilniusCityCenter: ZoneCoordinates = {
                lat: 54.69398563523757,
                lng: 25.275572610609277,
            };
            const result = zoneChecker.checkPoint(vilniusCityCenter);
            expect(result).toEqual(["Production Zone"]);
        });

        it("should detect Vilnius Old Town", () => {
            const oldTown: ZoneCoordinates = { lat: 54.6872, lng: 25.2797 };
            const result = zoneChecker.checkPoint(oldTown);
            expect(result).toEqual(["Production Zone"]);
        });

        it("should reject coordinates outside Lithuania", () => {
            const outsideLithuania: ZoneCoordinates = {
                lat: 52.52,
                lng: 13.405,
            }; // Berlin
            const result = zoneChecker.checkPoint(outsideLithuania);
            expect(result).toEqual([]);
        });

        it("should handle multiple real locations", () => {
            const realLocations: ZoneCoordinates[] = [
                { lat: 54.687157, lng: 25.279652 }, // Vilnius center
                { lat: 54.898521, lng: 23.903853 }, // Vilnius area
                { lat: 52.52, lng: 13.405 }, // Berlin (outside)
                { lat: 54.896211, lng: 23.884003 }, // Another Vilnius point
            ];

            const result = zoneChecker.checkPoints(realLocations);
            expect(result.length).toBeGreaterThan(0);
            expect(result.length).toBeLessThan(realLocations.length);
        });
    });
});
