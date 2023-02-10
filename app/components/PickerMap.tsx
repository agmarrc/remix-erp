import { Map, View } from "ol";
import { OSM } from 'ol/source';
import TileLayer from "ol/layer/Tile";
import { useGeographic } from "ol/proj";
import { useEffect, useRef, useState } from "react";
import { Coordinate } from "ol/coordinate";

interface Props {
    onPickLocation: (coordinate: Coordinate) => void;
}

export default function PickerMap({onPickLocation}: Props) {
    const mapRef = useRef(null);
    const [position, setPosition] = useState<GeolocationPosition | null>(null);

    const zoom = 13;

    useEffect(() => {
        if (!position || !mapRef.current) return;

        useGeographic();
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
            const {coordinate} = e;
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