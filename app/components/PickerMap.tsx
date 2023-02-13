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
    hasMarker?: boolean;
    longitude?: number;
    latitude?: number;
}

let marker: VectorLayer<VectorSource<Point>> | null = null;;

export default function PickerMap({ onPickLocation, hasMarker, longitude, latitude }: Props) {
    const mapRef = useRef(null);
    const [position, setPosition] = useState<Array<number> | null>(null);

    const zoom = 13;

    useGeographic();

    useEffect(() => {
        if (!position || !mapRef.current) return;

        const [ longitude, latitude ] = position;
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

        if (hasMarker) {
            const vectorLayer = generateMarker(longitude, latitude);
            marker = vectorLayer;

            mapObject.addLayer(vectorLayer);
        }

        mapObject.on('click', (e) => {
            const { coordinate } = e;

            const lon = coordinate[0];
            const lat = coordinate[1];

            if (marker) {
                mapObject.removeLayer(marker);
                marker = null;
            }

            const vectorLayer = generateMarker(lon, lat);
            marker = vectorLayer;

            mapObject.addLayer(vectorLayer);

            onPickLocation(coordinate);
        })
        return () => mapObject.setTarget(undefined);
    }, [position, mapRef]);

    useEffect(() => {
        if (latitude && longitude) {
            setPosition([longitude, latitude]);
        } else {
            navigator.geolocation.getCurrentPosition((position) => {
                const {latitude, longitude} = position.coords;
                setPosition([longitude, latitude]);
            }, null);
        }
    }, [])

    return (
        <>
            <div className="w-100 h-full" ref={mapRef}></div>
        </>
    );
}