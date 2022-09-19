import {Component, OnInit} from '@angular/core';

declare const L: any;
import {GeoSearchControl} from 'leaflet-geosearch';
import * as GeoSearch from 'leaflet-geosearch';
import 'leaflet-search';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public title = 'Leaftlet Open Street Map Spike';

  private map: any;
  private defaultZoom = 16;
  private minZoom = 2;
  private MaxZoom = 19;

  public marker: any;
  public lat = '';
  public lng = '';

  constructor() {
  }

  ngOnInit() {
    this.initMap();
  }

  /**
   * Initialize the map on DOM load.
   */
  private initMap() {

    /**
     * Instance marker.
     */
    this.marker = new L.Marker(L.LatLngExpression = [0, 0]);

    /**
     * Set Open Street Map view. (Roadmap)
     */
    const osm = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: this.MaxZoom,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    );

    /**
     * Set World_Imagery view. (Satellite)
     */
    const sat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        /**
         * When zoom reaches the maxZoom, the view will change to street view.
         */
        maxZoom: 17,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, ' +
          'and the GIS User Community'
      }
    );

    /**
     * Set view options.
     */
    const baseMaps = {
      Street: osm,
      Satellite: sat
    };

    /**
     * Instance leaflet map.
     */
    this.map = L.map('map', {
      zoom: this.defaultZoom,
    }).locate({watch: true, setView: true});

    /**
     * Listen for the click event to add marker on map.
     */
    this.map.on('click', (e: any) => {
      this.setMarkerPoint(e.latlng);
    });

    /**
     * Adds view changes in the map at defined position.
     */
    L.control.layers(baseMaps, undefined, {position: 'topleft'}).addTo(this.map);

    /**
     * Set default loaded map layer at start the map view.
     */
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: this.MaxZoom,
      minZoom: this.minZoom,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    /**
     * Set the Search bottom.
     */
    this.setSearchBottom();
  }

  /**
   * Configure SearchControl
   */
  private setSearchBottom() {
    const searchControl = new (GeoSearchControl as any)({
      provider: new GeoSearch.OpenStreetMapProvider(),
      showMarker: false,
      autoComplete: true,
      autoCompleteDelay: 100,

    });
    this.map.addControl(searchControl);
  }

  /**
   * Adds the marker when user click in the map
   * using passed parameter.
   */
  private setMarkerPoint(coords: any): void {
    console.log(coords);
    this.map.removeLayer(this.marker);
    this.marker = new L.Marker([coords.lat, coords.lng], {draggable: false});
    this.lat = coords.lat;
    this.lng = coords.lng;
    this.marker.bindPopup(
      `<b>Selected Position:</b><br />Lat: ${coords.lat}<br/> Lng: ${coords.lng}`
    ).openPopup();
    this.map.addLayer(this.marker);
  }

}
