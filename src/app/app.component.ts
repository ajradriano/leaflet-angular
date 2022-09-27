import {Component, OnInit} from '@angular/core';

declare const L: any;
import 'leaflet-search';
import { HttpClient } from '@angular/common/http';
import { LatLng } from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public title = 'Leaftlet Open Street Map Spike';

  private map: any;
  private defaultLocation: any[] = [-11.628717, -52.703753];

  private defaultZoom = 16;
  private minZoom = 4;
  private MaxZoom = 19;

  public marker: any;
  public lat = '';
  public lon = '';
  query = [];
  logradouro = '';
  cidade = '';
  cep = '';
  bairro = '';
  numero = '';

  loading = false;
  addressList;

  constructor(
      private http: HttpClient,
  ) {
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
        minZoom: this.minZoom,
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
        minZoom: this.minZoom,
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
    }).setView(this.defaultLocation, this.minZoom);

    /**
     * Listen for the click event to add marker on map.
     */
    this.map.on('click', (e: any) => {
      this.setMarkerPoint(e.latlng.lat, e.latlng.lng);
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
  }

  /**
   * Adds the marker when user click in the map
   * using passed parameter.
   */
  private setMarkerPoint(lat, lon): void {
    this.map.removeLayer(this.marker);
    this.marker = new L.Marker([lat, lon], {draggable: false});
    this.lat = lat;
    this.lon = lon;
    this.marker.bindPopup(
      `<b>Selected Position:</b><br />Lat: ${lat}<br/> Lng: ${lon}`
    ).openPopup();
    this.map.addLayer(this.marker);
    this.searchAddress('reverse', `lat=${this.lat}&lon=${this.lon}&zoom=18`)
  }

  /**
   * Metodo para busca do endereço na API Nominatim.
   */
  public searchAddress(type, event: string = '') {
    let isReverse = (type == 'reverse') ? 'true' : false;
    this.loading = true;
    const url = `https://nominatim.openstreetmap.org/${type}?${event}&format=json`;
    this.http.get(url).subscribe(
        (success) => {
          if (isReverse) {
            this.setPosition(success);
            this.flyToPosition(success['lat'], success['lon']);
            return;
          }
          if (!success[0]) {
            console.error('Não Encontrado')
            return;
          }
          
          this.setPosition(success[0]);
        },
        (error) => {
          console.error(error);
        }
    );
  }

  /**
   * Sets the position based on selected latitude and longitude in the search results.
   */
  public setPosition(address) {
    this.setFields(address);
    // this.setMarkerPoint(address.lat, address.lon);
    delete this.addressList;
    this.loading = false;
  }

  flyToPosition(lat, lon) {
    this.map.flyTo(new LatLng(lat, lon), 18, {duration: 2, animate: true});
  }

  setFields(address) {
    this.cep = address.address.postcode || '';
    this.cidade = address.address.town || address.address.city;
    this.logradouro = address.address.road;
    this.bairro = address.address.suburb;
    this.lat = address.lat;
    this.lon = address.lon;

  }

  public async changeSearch(param, value) {
    switch (param) {
      case 'cep':
        this.cep = value;
        this.cidade = '';
        this.logradouro = '';
        this.bairro = '';

        break;
      case 'cidade':
        this.cidade = value;
        this.logradouro = '';
        this.bairro = '';

        break;
      case 'logradouro':
        this.logradouro = value;
        this.bairro = '';

        break;
      case 'bairro':
        this.bairro = value;
        break;
    
      default:
        break;
    };
    
    this.searchAddress(
      'search',
      `postalcode=${this.cep}&city=${this.cidade}&street=${this.logradouro}&suburb=${this.bairro}`
    )    
  }

  locate() {
    (this.map.locate({setView: true, watch: true}));
  }

}
