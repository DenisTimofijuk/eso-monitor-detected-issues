export type ZoneCoordinates = {
    lng: number;
    lat: number;
};

type ZoneBase = {
    name: string;
};

export type ZoneRectangle = ZoneBase & {
    type: "rectangle";
    topLeft: ZoneCoordinates;
    bottomRight: ZoneCoordinates;
};

export type ZoneCircle = ZoneBase & {
    type: "circle";
    center: ZoneCoordinates;
    radius: number;
};

export type ZonePolygon = ZoneBase & {
    type: "polygon";
    vertices: ZoneCoordinates[];
};

export type Zone = ZoneRectangle | ZoneCircle | ZonePolygon;
