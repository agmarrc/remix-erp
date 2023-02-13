import { Map, View } from "ol";
import { OSM } from 'ol/source';
import TileLayer from "ol/layer/Tile";
import { useGeographic } from "ol/proj";
import { useEffect, useRef } from "react";
import { generateMarker } from "~/utils/map.client";

interface Props {
    latitude: number;
    longitude: number;
}

export default function LocationMap({latitude, longitude}: Props) {
    const mapRef = useRef(null);

    const zoom = 13;

    useGeographic();

    useEffect(() => {
        if (!mapRef.current) return;

        const center = [longitude, latitude];

        const marker = generateMarker(longitude, latitude);

        let options = {
            view: new View({ zoom: zoom, center: center }),
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                marker
            ],
            controls: [],
            overlays: []
        };

        let mapObject = new Map(options);
        mapObject.setTarget(mapRef.current);

        return () => mapObject.setTarget(undefined);
    }, [latitude, longitude, mapRef]);

    return (
        <>
            <div className="w-100 h-full" ref={mapRef}></div>
        </>
    );
}