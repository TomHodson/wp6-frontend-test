import './style.css';
// import "leaflet";
// import "georastor";
import GeoRasterLayer from "georaster-layer-for-leaflet";

var parse_georaster = require("georaster");

// var GeoRasterLayer = require("georaster-layer-for-leaflet");

// initalize leaflet map
var map = L.map('map').setView([0, 0], 5);

// add OpenStreetMap basemap
let mapLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let map_types = {
    "Land Usage" : "lu_clipped.tif",
    "Impedance Map" : "impedances_example_2.tif",
};

let baseLayers = {"osm" : mapLayer};
let layerControl = L.control.layers(baseLayers).addTo(map);

Object.keys(map_types).map(name => {
  let url = map_types[name];
  fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
        parse_georaster(arrayBuffer).then(georaster => {
        console.log("georaster:", georaster);
        var layer = new GeoRasterLayer({
            georaster: georaster,
            opacity: 0.3,
            //   pixelValuesToColorFn: values => values[0] === 42 ? '#ffffff' : '#000000',
            resolution: 128 // optional parameter for adjusting display resolution
        });
        layer.addTo(map);
        layerControl.addOverlay(layer, name);
        map.fitBounds(layer.getBounds());
    });
  });
});

[...document.getElementsByClassName("tiff-input")].map(inputElement => {
    inputElement.addEventListener("change", handleFiles, false);
});

// const inputElement = document.getElementById("file-input");
// inputElement.addEventListener("change", handleFiles, false);

function handleFiles(target) {
    console.log("handleFiles fired", target);
    const files = target.srcElement.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(file);
  
      if (!file.type.startsWith("image/")) {
        continue;
      }
  
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(e);
        const buffer = e.currentTarget.result;
        parse_georaster(buffer).then(georaster => {
            var layer = new GeoRasterLayer({
                georaster: georaster,
                opacity: 0.7,
              //   pixelValuesToColorFn: values => values[0] === 42 ? '#ffffff' : '#000000',
                resolution: 128 // optional parameter for adjusting display resolution
            });
            layerControl.addOverlay(layer, target.srcElement.name);
            layer.addTo(map);
            map.fitBounds(layer.getBounds());
      
        });
      };
      reader.readAsArrayBuffer(file);
    }
  }