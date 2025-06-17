export type MapdataDataAreaItem = {
    lng: number;
    lat: number;
}
export type MapdataData = {
    area: MapdataDataAreaItem[][];
    lat: string;
    lng: string;
    pas_id: string;
    point_url: string;
    type: string;
};

export type Mapdata = {
    data: MapdataData[];
    success: boolean;
    message: string;
    timestamp: number;
};
