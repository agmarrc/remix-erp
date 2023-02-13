import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";

export const generateMarker = (x: number, y: number) => {
    const iconStyle = new Style({
        image: new Icon({
            anchor: [0.5, 512],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            width: 40,
            src: "/assets/img/marker.png"
        })
    });

    const iconFeature = new Feature({
        geometry: new Point([x, y])
    });

    iconFeature.setStyle(iconStyle);

    const vectorSource = new VectorSource({
        features: [iconFeature]
    });

    const vectorLayer = new VectorLayer({
        source: vectorSource
    });

    return vectorLayer;
}