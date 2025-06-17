import type {
    Zone,
    ZoneCircle,
    ZoneCoordinates,
    ZonePolygon,
    ZoneRectangle,
} from "./types/ZoneChecker.type";

export default class ZoneChecker {
    zones: Zone[];
    constructor() {
        this.zones = [];
    }

    addRectangleZone(
        name: string,
        topLeft: ZoneCoordinates,
        bottomRight: ZoneCoordinates
    ) {
        this.zones.push({
            name,
            type: "rectangle",
            topLeft,
            bottomRight,
        });
    }

    addCircleZone(name: string, center: ZoneCoordinates, radius: number) {
        this.zones.push({
            name,
            type: "circle",
            center,
            radius,
        });
    }

    addPolygonZone(name: string, vertices: ZoneCoordinates[]) {
        this.zones.push({
            name,
            type: "polygon",
            vertices,
        });
    }

    isPointInRectangle(point: ZoneCoordinates, zone: ZoneRectangle) {
        const { lng, lat } = point;
        const { topLeft, bottomRight } = zone;

        return (
            lng >= topLeft.lng &&
            lng <= bottomRight.lng &&
            lat >= topLeft.lat &&
            lat <= bottomRight.lat
        );
    }

    isPointInCircle(point: ZoneCoordinates, zone: ZoneCircle) {
        const { lng, lat } = point;
        const { center, radius } = zone;

        const distance = Math.sqrt(
            Math.pow(lng - center.lng, 2) + Math.pow(lat - center.lat, 2)
        );

        return distance <= radius;
    }

    // Check if a point is inside a polygon using ray casting algorithm
    isPointInPolygon(point: ZoneCoordinates, zone: ZonePolygon) {
        const { lng: x, lat: y } = point;
        const { vertices } = zone;

        let inside = false;
        const n = vertices.length;

        for (let i = 0, j = n - 1; i < n; j = i++) {
            const xi = vertices[i].lng;
            const yi = vertices[i].lat;
            const xj = vertices[j].lng;
            const yj = vertices[j].lat;

            if (
                yi > y !== yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
            ) {
                inside = !inside;
            }
        }

        return inside;
    }

    // Check if a point is in any zone
    checkPoint(point: ZoneCoordinates) {
        const results:string[] = [];

        for (const zone of this.zones) {
            let isInside = false;

            switch (zone.type) {
                case "rectangle":
                    isInside = this.isPointInRectangle(point, zone);
                    break;
                case "circle":
                    isInside = this.isPointInCircle(point, zone);
                    break;
                case "polygon":
                    isInside = this.isPointInPolygon(point, zone);
                    break;
            }

            if (isInside) {
                results.push(zone.name);
            }
        }

        return results;
    }

    checkPoints(points: ZoneCoordinates[]) {
        const result:ZoneCoordinates[] = [];
        points.forEach((item)=>{
            this.checkPoint(item).length > 0 && result.push(item);
        })
        return result;
    }

    // Get all zones
    getZones() {
        return this.zones.map((zone) => ({
            name: zone.name,
            type: zone.type,
        }));
    }
}
