/**
 * Maps Section
 * Componente per mappe interattive Google Maps
 */

import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const MapsSection = ({ data, onChange, onRemove, onMoveUp, onMoveDown }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Carica Google Maps API
  useEffect(() => {
    if (!window.google && data.apiKey) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, [data.apiKey]);

  // Geocoding address
  const geocodeAddress = async (address) => {
    if (!window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();

    try {
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK') {
            resolve(results[0]);
          } else {
            reject(status);
          }
        });
      });

      const location = result.geometry.location;

      onChange({
        ...data,
        address: result.formatted_address,
        latitude: location.lat(),
        longitude: location.lng(),
        placeId: result.place_id
      });
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Search places
  const searchPlaces = async (query) => {
    if (!window.google || !window.google.maps || !query) {
      setSearchResults([]);
      return;
    }

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    service.textSearch({
      query: query,
      fields: ['place_id', 'name', 'formatted_address', 'geometry']
    }, (results, status) => {
      if (status === 'OK') {
        setSearchResults(results.slice(0, 5));
      } else {
        setSearchResults([]);
      }
    });
  };

  const mapStyles = [
    { value: 'default', label: 'Standard' },
    { value: 'satellite', label: 'Satellite' },
    { value: 'hybrid', label: 'Ibrido' },
    { value: 'terrain', label: 'Terreno' },
    { value: 'dark', label: 'Scuro' },
    { value: 'silver', label: 'Argento' }
  ];

  const mapControls = [
    { key: 'zoomControl', label: 'Zoom' },
    { key: 'mapTypeControl', label: 'Tipo mappa' },
    { key: 'streetViewControl', label: 'Street View' },
    { key: 'fullscreenControl', label: 'Schermo intero' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MapPinIcon className="h-6 w-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold">Mappa Interattiva</h3>
        </div>
        <div className="flex items-center space-x-2">
          {onMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Sposta su"
            >
              <ArrowUpIcon className="h-4 w-4" />
            </button>
          )}
          {onMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Sposta giù"
            >
              <ArrowDownIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-2 text-red-400 hover:text-red-600"
            title="Rimuovi sezione"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Google Maps API Key */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Google Maps API Key</h4>
        <div className="space-y-3">
          <input
            type="password"
            value={data.apiKey || ''}
            onChange={(e) => onChange({ ...data, apiKey: e.target.value })}
            placeholder="Inserisci la tua Google Maps API Key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="text-sm text-gray-600">
            Ottieni una API key gratuita da{' '}
            <a
              href="https://console.cloud.google.com/google-maps-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Cloud Console
            </a>
          </p>
          <p className="text-xs text-gray-500">
            Abilita le API: Maps JavaScript API e Places API
          </p>
        </div>
      </div>

      {/* Search Address */}
      {data.apiKey && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cerca Indirizzo o Luogo
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) {
                  searchPlaces(e.target.value);
                } else {
                  setSearchResults([]);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  geocodeAddress(searchQuery);
                  setSearchResults([]);
                }
              }}
              placeholder="Es: Via Roma 1, Milano, Italia"
              className="w-full px-10 py-2 border border-gray-300 rounded-md"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.place_id}
                    onClick={() => {
                      const location = result.geometry.location;
                      onChange({
                        ...data,
                        address: result.formatted_address,
                        latitude: location.lat(),
                        longitude: location.lng(),
                        placeId: result.place_id
                      });
                      setSearchResults([]);
                      setSearchQuery(result.formatted_address);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm">{result.name}</div>
                    <div className="text-xs text-gray-500">{result.formatted_address}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Address Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
        <input
          type="text"
          value={data.address || ''}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          placeholder="Via Roma 1, 20100 Milano, Italia"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          onBlur={() => {
            if (data.address && mapLoaded) {
              geocodeAddress(data.address);
            }
          }}
        />
      </div>

      {/* Map Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stile Mappa</label>
          <select
            value={data.mapStyle || 'default'}
            onChange={(e) => onChange({ ...data, mapStyle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {mapStyles.map(style => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
          <input
            type="range"
            min="1"
            max="20"
            value={data.zoom || 15}
            onChange={(e) => onChange({ ...data, zoom: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600">{data.zoom || 15}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Altezza</label>
          <select
            value={data.height || '400px'}
            onChange={(e) => onChange({ ...data, height: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="300px">Piccola (300px)</option>
            <option value="400px">Media (400px)</option>
            <option value="500px">Grande (500px)</option>
            <option value="600px">Molto Grande (600px)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Larghezza</label>
          <select
            value={data.width || '100%'}
            onChange={(e) => onChange({ ...data, width: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="100%">Completa</option>
            <option value="75%">3/4</option>
            <option value="50%">1/2</option>
            <option value="33%">1/3</option>
          </select>
        </div>
      </div>

      {/* Marker Settings */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Impostazioni Marker</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo Marker</label>
            <input
              type="text"
              value={data.markerTitle || ''}
              onChange={(e) => onChange({ ...data, markerTitle: e.target.value })}
              placeholder="Nome dell'azienda/luogo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Marker</label>
            <input
              type="text"
              value={data.markerDescription || ''}
              onChange={(e) => onChange({ ...data, markerDescription: e.target.value })}
              placeholder="Breve descrizione (visibile al click)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colore Marker</label>
            <select
              value={data.markerColor || 'red'}
              onChange={(e) => onChange({ ...data, markerColor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="red">Rosso</option>
              <option value="blue">Blu</option>
              <option value="green">Verde</option>
              <option value="yellow">Giallo</option>
              <option value="orange">Arancione</option>
              <option value="purple">Viola</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icona Marker</label>
            <select
              value={data.markerIcon || 'default'}
              onChange={(e) => onChange({ ...data, markerIcon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="default">Default</option>
              <option value="business">Attività</option>
              <option value="restaurant">Ristorante</option>
              <option value="store">Negozio</option>
              <option value="info">Informazioni</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Controlli Mappa</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mapControls.map(control => (
            <label key={control.key} className="flex items-center">
              <input
                type="checkbox"
                checked={data[control.key] !== false}
                onChange={(e) => onChange({ ...data, [control.key]: e.target.checked })}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">{control.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Features */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Funzionalità Aggiuntive</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showDirections || false}
              onChange={(e) => onChange({ ...data, showDirections: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Pulsante indicazioni</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showStreetView || false}
              onChange={(e) => onChange({ ...data, showStreetView: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Pulsante Street View</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.clustering || false}
              onChange={(e) => onChange({ ...data, clustering: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Clustering marker</span>
          </label>
        </div>
      </div>

      {/* Map Preview */}
      {data.apiKey && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Anteprima Mappa</h4>
          <div
            className="bg-gray-100 rounded-lg flex items-center justify-center"
            style={{ height: data.height || '400px', width: data.width || '100%' }}
          >
            {data.latitude && data.longitude ? (
              <div className="text-center text-gray-600">
                <MapPinIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <div className="font-medium">{data.address || 'Posizione selezionata'}</div>
                <div className="text-sm text-gray-500">
                  Lat: {data.latitude.toFixed(6)}, Lng: {data.longitude.toFixed(6)}
                </div>
                {data.markerTitle && (
                  <div className="text-sm mt-2 p-2 bg-white rounded border">
                    <div className="font-medium">{data.markerTitle}</div>
                    {data.markerDescription && (
                      <div className="text-xs text-gray-600">{data.markerDescription}</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                <div>Inserisci un indirizzo per visualizzare la mappa</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapsSection;