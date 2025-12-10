/**
 * Social Section
 * Componente per integrazione social media con feed e follower count
 */

import React, { useState } from 'react';
import {
  ShareIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon as ShareOutlineIcon
} from '@heroicons/react/24/outline';

const SocialSection = ({ data, onChange, onRemove, onMoveUp, onMoveDown }) => {
  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: '#1877F2',
      baseUrl: 'https://facebook.com/',
      apiUrl: 'https://graph.facebook.com/'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      baseUrl: 'https://twitter.com/',
      apiUrl: 'https://api.twitter.com/'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: '#E4405F',
      baseUrl: 'https://instagram.com/',
      apiUrl: 'https://graph.instagram.com/'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: '#0077B5',
      baseUrl: 'https://linkedin.com/company/',
      apiUrl: 'https://api.linkedin.com/'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      color: '#FF0000',
      baseUrl: 'https://youtube.com/channel/',
      apiUrl: 'https://www.googleapis.com/youtube/v3/'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: '#000000',
      baseUrl: 'https://tiktok.com/@',
      apiUrl: 'https://api.tiktok.com/'
    }
  ];

  const [newPlatform, setNewPlatform] = useState('');

  // Aggiungi piattaforma
  const addPlatform = (platformId) => {
    if (!data.platforms?.includes(platformId)) {
      onChange({
        ...data,
        platforms: [...(data.platforms || []), platformId]
      });
    }
    setNewPlatform('');
  };

  // Rimuovi piattaforma
  const removePlatform = (platformId) => {
    onChange({
      ...data,
      platforms: data.platforms?.filter(p => p !== platformId) || []
    });
  };

  // Aggiorna configurazione piattaforma
  const updatePlatformConfig = (platformId, config) => {
    onChange({
      ...data,
      platformConfigs: {
        ...(data.platformConfigs || {}),
        [platformId]: config
      }
    });
  };

  const layoutOptions = [
    { value: 'horizontal', label: 'Orizzontale', description: 'Icone in linea orizzontale' },
    { value: 'vertical', label: 'Verticale', description: 'Icone in colonna verticale' },
    { value: 'grid', label: 'Griglia', description: 'Icone in griglia 2x3' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ShareIcon className="h-6 w-6 text-purple-500 mr-3" />
          <h3 className="text-lg font-semibold">Social Media</h3>
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

      {/* Configurazione Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
          <select
            value={data.layout || 'horizontal'}
            onChange={(e) => onChange({ ...data, layout: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {layoutOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stile Icone</label>
          <select
            value={data.iconStyle || 'rounded'}
            onChange={(e) => onChange({ ...data, iconStyle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="rounded">Arrotondate</option>
            <option value="square">Quadrate</option>
            <option value="circle">Cerchio</option>
            <option value="outline">Contorno</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensione</label>
          <select
            value={data.iconSize || 'medium'}
            onChange={(e) => onChange({ ...data, iconSize: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="small">Piccola</option>
            <option value="medium">Media</option>
            <option value="large">Grande</option>
            <option value="xlarge">Molto Grande</option>
          </select>
        </div>
      </div>

      {/* Opzioni Funzionalità */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Informazioni da Mostrare</h4>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showFollowers !== false}
              onChange={(e) => onChange({ ...data, showFollowers: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Numero follower</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showFeed || false}
              onChange={(e) => onChange({ ...data, showFeed: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Feed recente</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showLikes !== false}
              onChange={(e) => onChange({ ...data, showLikes: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Like e interazioni</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.openInNewTab !== false}
              onChange={(e) => onChange({ ...data, openInNewTab: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Apri in nuova scheda</span>
          </label>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">API Keys (per dati real-time)</h4>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Facebook App ID</label>
            <input
              type="text"
              value={data.apiKeys?.facebook || ''}
              onChange={(e) => onChange({
                ...data,
                apiKeys: { ...(data.apiKeys || {}), facebook: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Facebook App ID"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Twitter Bearer Token</label>
            <input
              type="password"
              value={data.apiKeys?.twitter || ''}
              onChange={(e) => onChange({
                ...data,
                apiKeys: { ...(data.apiKeys || {}), twitter: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Bearer Token"
            />
          </div>
        </div>
      </div>

      {/* Piattaforme Selezionate */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Piattaforme Attive</h4>

        {(data.platforms || []).length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <ShareIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <div>Nessuna piattaforma selezionata</div>
            <div className="text-sm">Scegli le piattaforme da aggiungere qui sotto</div>
          </div>
        ) : (
          <div className={`grid gap-3 ${
            data.layout === 'horizontal' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' :
            data.layout === 'vertical' ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {(data.platforms || []).map(platformId => {
              const platform = socialPlatforms.find(p => p.id === platformId);
              const config = data.platformConfigs?.[platformId] || {};

              if (!platform) return null;

              return (
                <div key={platform.id} className="relative group">
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    {/* Icona e nome */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{platform.icon}</span>
                        <span className="font-medium text-sm">{platform.name}</span>
                      </div>
                      <button
                        onClick={() => removePlatform(platform.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Configurazione piattaforma */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={config.username || ''}
                        onChange={(e) => updatePlatformConfig(platform.id, { username: e.target.value })}
                        placeholder="Username/Handle"
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                      />

                      {data.showFollowers && (
                        <input
                          type="text"
                          value={config.followerCount || ''}
                          onChange={(e) => updatePlatformConfig(platform.id, { followerCount: e.target.value })}
                          placeholder="Follower (es: 10.5k)"
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                        />
                      )}

                      <input
                        type="url"
                        value={config.customUrl || ''}
                        onChange={(e) => updatePlatformConfig(platform.id, { customUrl: e.target.value })}
                        placeholder="URL personalizzato"
                        className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                      />
                    </div>

                    {/* Preview follower */}
                    {data.showFollowers && config.followerCount && (
                      <div className="mt-2 text-xs text-gray-600">
                        <HeartIcon className="h-3 w-3 inline mr-1" />
                        {config.followerCount} follower
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Aggiungi Piattaforma */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Aggiungi Piattaforma</h4>

        <div className="flex flex-wrap gap-2">
          {socialPlatforms
            .filter(platform => !(data.platforms || []).includes(platform.id))
            .map(platform => (
              <button
                key={platform.id}
                onClick={() => addPlatform(platform.id)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <span className="text-lg mr-2">{platform.icon}</span>
                <span className="text-sm font-medium">{platform.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Anteprima Layout */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Anteprima Layout</h4>

        <div className={`flex gap-2 ${
          data.layout === 'vertical' ? 'flex-col' :
          data.layout === 'grid' ? 'flex-wrap max-w-xs' :
          'flex-row'
        }`}>
          {(data.platforms || []).slice(0, 6).map(platformId => {
            const platform = socialPlatforms.find(p => p.id === platformId);
            if (!platform) return null;

            return (
              <div
                key={platform.id}
                className={`flex items-center justify-center w-10 h-10 text-white text-lg font-bold
                  ${data.iconStyle === 'circle' ? 'rounded-full' :
                    data.iconStyle === 'rounded' ? 'rounded-lg' : 'rounded'}
                  ${data.iconSize === 'large' ? 'w-12 h-12 text-xl' :
                    data.iconSize === 'xlarge' ? 'w-16 h-16 text-2xl' : ''}
                  ${data.iconStyle === 'outline' ? 'border-2' : ''}
                `}
                style={{
                  backgroundColor: data.iconStyle !== 'outline' ? platform.color : 'transparent',
                  borderColor: platform.color,
                  color: data.iconStyle === 'outline' ? platform.color : 'white'
                }}
                title={platform.name}
              >
                {platform.icon}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SocialSection;