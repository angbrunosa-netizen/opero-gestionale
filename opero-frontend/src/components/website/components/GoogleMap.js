/**
 * GoogleMap Component
 * Componente per l'integrazione di Google Maps con configurazione address personalizzata
 */

import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const GoogleMap = ({
  site,
  sectionData,
  onSectionUpdate,
  isEditing = false,
  previewMode = false
}) => {
  const [mapData, setMapData] = useState({
    title: sectionData?.title || 'Contattaci',
    subtitle: sectionData?.subtitle || 'Vieni a trovarci',
    address: sectionData?.address || site?.indirizzo_sede || '',
    coordinates: sectionData?.coordinates || null,
    zoom: sectionData?.zoom || 15,
    map_style: sectionData?.map_style || 'roadmap',
    show_marker: sectionData?.show_marker !== false,
    marker_color: sectionData?.marker_color || '#3B82F6',
    show_info_window: sectionData?.show_info_window !== false,
    info_window_content: sectionData?.info_window_content || site?.ragione_sociale || '',
    show_directions: sectionData?.show_directions !== false,
    directions_text: sectionData?.directions_text || 'Ottieni Indicazioni',
    show_street_view: sectionData?.show_street_view === true,
    height: sectionData?.height || '400px',
    custom_styles: sectionData?.custom_styles || null
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapPreview, setMapPreview] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const mapStyles = [
    { id: 'roadmap', name: 'Standard', description: 'Mappa stradale standard' },
    { id: 'satellite', name: 'Satellite', description: 'Vista satellitare' },
    { id: 'hybrid', name: 'Ibrido', description: 'Satellite con etichette' },
    { id: 'terrain', name: 'Terreno', description: 'Mappa con rilievi' }
  ];

  const markerColors = [
    { id: '#3B82F6', name: 'Blu', class: 'bg-blue-500' },
    { id: '#10B981', name: 'Verde', class: 'bg-green-500' },
    { id: '#F59E0B', name: 'Arancione', class: 'bg-yellow-500' },
    { id: '#EF4444', name: 'Rosso', class: 'bg-red-500' },
    { id: '#8B5CF6', name: 'Viola', class: 'bg-purple-500' },
    { id: '#6B7280', name: 'Grigio', class: 'bg-gray-500' }
  ];

  useEffect(() => {
    if (sectionData) {
      setMapData(prev => ({ ...prev, ...sectionData }));
    }
  }, [sectionData]);

  const handleAddressSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Utilizza Google Maps Geocoding API
      const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyDummyKey';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${googleMapsApiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0];
        const coords = location.geometry.location;

        const updatedData = {
          ...mapData,
          address: location.formatted_address,
          coordinates: { lat: coords.lat, lng: coords.lng }
        };

        setMapData(updatedData);
        handleSectionUpdate(updatedData);
      } else {
        alert('Indirizzo non trovato. Prova a essere più specifico.');
      }
    } catch (error) {
      console.error('Errore ricerca indirizzo:', error);
      alert('Errore durante la ricerca dell\'indirizzo');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding per ottenere l'indirizzo
          try {
            const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyDummyKey';
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
            );

            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
              const location = data.results[0];
              const updatedData = {
                ...mapData,
                address: location.formatted_address,
                coordinates: { lat: latitude, lng: longitude }
              };

              setMapData(updatedData);
              handleSectionUpdate(updatedData);
            }
          } catch (error) {
            console.error('Errore reverse geocoding:', error);
          }
        },
        (error) => {
          alert('Impossibile ottenere la posizione corrente');
        }
      );
    } else {
      alert('Geolocalizzazione non supportata dal browser');
    }
  };

  const handleSectionUpdate = (updatedData) => {
    setMapData(updatedData);
    if (onSectionUpdate) {
      onSectionUpdate(updatedData);
    }
  };

  const generateMapIframe = () => {
    if (!mapData.coordinates) {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <MapPinIcon className="h-12 w-12 mx-auto mb-4" />
            <p>Configura un indirizzo per visualizzare la mappa</p>
          </div>
        </div>
      );
    }

    const { lat, lng } = mapData.coordinates;
    const zoom = mapData.zoom;
    const maptype = mapData.map_style;

    // Google Maps embed URL
    const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=${maptype}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

    return (
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Maps"
      />
    );
  };

  const handleGetDirections = () => {
    if (mapData.address) {
      const encodedAddress = encodeURIComponent(mapData.address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    }
  };

  if (previewMode) {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{mapData.title}</h2>
          {mapData.subtitle && (
            <p className="text-gray-600 mt-2">{mapData.subtitle}</p>
          )}
        </div>

        <div style={{ height: mapData.height }} className="relative">
          {generateMapIframe()}
        </div>

        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">{mapData.address}</p>
              <p className="text-sm text-gray-600 mt-1">Clicca sulla mappa per ingrandire</p>
            </div>
            {mapData.show_directions && (
              <button
                onClick={handleGetDirections}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <MapPinIcon className="h-4 w-4 mr-2" />
                {mapData.directions_text}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Mappa Google Maps</h3>
          <p className="text-sm text-gray-600">Configura la mappa con l'indirizzo della tua sede</p>
        </div>

        {isEditing && (
          <button
            onClick={() => setIsConfiguring(!isConfiguring)}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            {isConfiguring ? 'Chiudi Configurazione' : 'Configura Mappa'}
          </button>
        )}
      </div>

      {/* Configuration Panel */}
      {isEditing && isConfiguring && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          {/* Address Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cerca Indirizzo
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                  placeholder="Inserisci indirizzo o nome località"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={handleAddressSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSearching ? 'Ricerca...' : 'Cerca'}
              </button>
              <button
                onClick={handleCurrentLocation}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                title="Usa posizione attuale"
              >
                <MapPinIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Current Address Display */}
          {mapData.address && (
            <div className="bg-white p-3 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-1">Indirizzo configurato:</p>
              <p className="text-sm text-gray-600">{mapData.address}</p>
              {mapData.coordinates && (
                <p className="text-xs text-gray-500 mt-1">
                  Coordinate: {mapData.coordinates.lat.toFixed(6)}, {mapData.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
          )}

          {/* Map Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stile Mappa
            </label>
            <div className="grid grid-cols-2 gap-2">
              {mapStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleSectionUpdate({ ...mapData, map_style: style.id })}
                  className={`p-3 rounded-md border-2 transition-colors ${
                    mapData.map_style === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{style.name}</p>
                  <p className="text-xs text-gray-600">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom ({mapData.zoom})
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={mapData.zoom}
              onChange={(e) => handleSectionUpdate({ ...mapData, zoom: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Lontano</span>
              <span>Vicino</span>
            </div>
          </div>

          {/* Height Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Altezza Mappa
            </label>
            <select
              value={mapData.height}
              onChange={(e) => handleSectionUpdate({ ...mapData, height: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="300px">Piccola (300px)</option>
              <option value="400px">Media (400px)</option>
              <option value="500px">Grande (500px)</option>
              <option value="600px">Extra Grande (600px)</option>
            </select>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mapData.show_marker}
                onChange={(e) => handleSectionUpdate({ ...mapData, show_marker: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Mostra marker</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mapData.show_info_window}
                onChange={(e) => handleSectionUpdate({ ...mapData, show_info_window: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Mostra finestra informativa</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mapData.show_directions}
                onChange={(e) => handleSectionUpdate({ ...mapData, show_directions: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Mostra pulsante indicazioni</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mapData.show_street_view}
                onChange={(e) => handleSectionUpdate({ ...mapData, show_street_view: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Abilita Street View</span>
            </label>
          </div>

          {/* Info Window Content */}
          {mapData.show_info_window && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testo Finestra Informativa
              </label>
              <input
                type="text"
                value={mapData.info_window_content}
                onChange={(e) => handleSectionUpdate({ ...mapData, info_window_content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Testo visualizzato nel marker"
              />
            </div>
          )}

          {/* Directions Text */}
          {mapData.show_directions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testo Pulsante Indicazioni
              </label>
              <input
                type="text"
                value={mapData.directions_text}
                onChange={(e) => handleSectionUpdate({ ...mapData, directions_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Testo per il pulsante indicazioni"
              />
            </div>
          )}
        </div>
      )}

      {/* Map Preview */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        {mapData.title && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{mapData.title}</h2>
            {mapData.subtitle && (
              <p className="text-gray-600 mt-2">{mapData.subtitle}</p>
            )}
          </div>
        )}

        <div style={{ height: mapData.height }} className="relative">
          {generateMapIframe()}
        </div>

        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">
                {mapData.address || 'Nessun indirizzo configurato'}
              </p>
              {mapData.address && (
                <p className="text-sm text-gray-600 mt-1">Clicca sulla mappa per interagire</p>
              )}
            </div>
            {mapData.show_directions && mapData.address && !previewMode && (
              <button
                onClick={handleGetDirections}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <MapPinIcon className="h-4 w-4 mr-2" />
                {mapData.directions_text}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;