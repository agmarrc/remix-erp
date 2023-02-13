import { Map, View } from "ol";
import { OSM } from 'ol/source';
import TileLayer from "ol/layer/Tile";
import { useGeographic } from "ol/proj";
import { useEffect, useRef, useState } from "react";
import type { Coordinate } from "ol/coordinate";
import type VectorLayer from "ol/layer/Vector";
import type VectorSource from "ol/source/Vector";
import type { Point } from "ol/geom";
import { generateMarker } from "~/utils/map.client";

interface Props {
    onPickLocation: (coordinate: Coordinate) => void;
}

let marker: VectorLayer<VectorSource<Point>> | null = null;;

export default function PickerMap({ onPickLocation }: Props) {
    const mapRef = useRef(null);
    const [position, setPosition] = useState<GeolocationPosition | null>(null);

    const zoom = 13;

    useGeographic();

    useEffect(() => {
        if (!position || !mapRef.current) return;

        const { latitude, longitude } = position.coords;
        const center = [longitude, latitude];

        let options = {
            view: new View({ zoom: zoom, center: center }),
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            controls: [],
            overlays: []
        };

        let mapObject = new Map(options);
        mapObject.setTarget(mapRef.current);
        mapObject.on('click', (e) => {
            const { coordinate } = e;

            const x = coordinate[0];
            const y = coordinate[1];

            if (marker) {
                mapObject.removeLayer(marker);
                marker = null;
            }

            const vectorLayer = generateMarker(x, y);
            marker = vectorLayer;

            mapObject.addLayer(vectorLayer);

            onPickLocation(coordinate);
        })
        return () => mapObject.setTarget(undefined);
    }, [position, mapRef]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(setPosition, null);
    }, [])

    return (
        <>
            <div className="w-100 h-full" ref={mapRef}></div>
        </>
    );
}