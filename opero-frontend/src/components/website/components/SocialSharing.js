/**
 * SocialSharing Component
 * Componente per la condivisione sui social media con Open Graph optimization
 */

import React, { useState, useEffect } from 'react';
import {
  ShareIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  LinkIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SocialSharing = ({
  page,
  site,
  sectionData,
  onSectionUpdate,
  isEditing = false,
  previewMode = false
}) => {
  const [socialData, setSocialData] = useState({
    enabled: sectionData?.enabled !== false,
    platforms: sectionData?.platforms || ['facebook', 'linkedin', 'twitter', 'whatsapp'],
    show_follow_buttons: sectionData?.show_follow_buttons !== false,
    share_text: sectionData?.share_text || `Scopri di più su ${site?.ragione_sociale || 'questa azienda'}`,
    hashtags: sectionData?.hashtags || '',
    custom_title: sectionData?.custom_title || page?.meta_title || page?.titolo,
    custom_description: sectionData?.custom_description || page?.meta_description,
    custom_image: sectionData?.custom_image || site?.logo_url,
    show_share_count: sectionData?.show_share_count === true,
    button_style: sectionData?.button_style || 'horizontal',
    button_size: sectionData?.button_size || 'medium',
    show_native_buttons: sectionData?.show_native_buttons === true,
    follow_config: sectionData?.follow_config || {
      facebook: site?.facebook_url || '',
      twitter: site?.twitter_url || '',
      linkedin: site?.linkedin_url || '',
      instagram: site?.instagram_url || ''
    }
  });

  const [isConfiguring, setIsConfiguring] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
      shareUrl: (url, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      followUrl: (handle) => `https://facebook.com/${handle}`,
      dimensions: { width: 600, height: 400 }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      color: 'bg-sky-500 hover:bg-sky-600',
      shareUrl: (url, text, hashtags) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}&hashtags=${hashtags}`,
      followUrl: (handle) => `https://twitter.com/${handle}`,
      dimensions: { width: 550, height: 420 }
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: 'bg-blue-700 hover:bg-blue-800',
      shareUrl: (url, title) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      followUrl: (handle) => `https://linkedin.com/company/${handle}`,
      dimensions: { width: 550, height: 550 }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      shareUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      followUrl: (handle) => `https://wa.me/${handle}`,
      dimensions: null // Mobile app, no popup
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
        </svg>
      ),
      color: 'bg-pink-600 hover:bg-pink-700',
      shareUrl: null, // Instagram doesn't support direct sharing
      followUrl: (handle) => `https://instagram.com/${handle}`,
      dimensions: null
    }
  ];

  const buttonStyles = [
    { id: 'horizontal', name: 'Orizzontale', description: 'Pulsanti affiancati' },
    { id: 'vertical', name: 'Verticale', description: 'Pulsanti in colonna' },
    { id: 'floating', name: 'Fluttuante', description: 'Pulsanti fissi sul lato' }
  ];

  const buttonSizes = [
    { id: 'small', name: 'Piccolo', class: 'px-3 py-1.5 text-sm' },
    { id: 'medium', name: 'Medio', class: 'px-4 py-2 text-sm' },
    { id: 'large', name: 'Grande', class: 'px-6 py-3 text-base' }
  ];

  useEffect(() => {
    if (sectionData) {
      setSocialData(prev => ({ ...prev, ...sectionData }));
    }
  }, [sectionData]);

  useEffect(() => {
    // Simula fetch del conteggio condivisioni
    const fetchShareCount = async () => {
      // In una implementazione reale, questo chiamerebbe un'API
      setShareCount(Math.floor(Math.random() * 100));
    };
    fetchShareCount();
  }, []);

  const handleSectionUpdate = (updatedData) => {
    setSocialData(updatedData);
    if (onSectionUpdate) {
      onSectionUpdate(updatedData);
    }
  };

  const handleShare = (platform) => {
    const pageUrl = `https://${site?.subdomain}.operocloud.it/${page?.slug}`;
    const shareText = socialData.share_text;
    const hashtags = socialData.hashtags;

    if (platform.shareUrl) {
      const url = platform.shareUrl(pageUrl, shareText, hashtags);
      if (platform.dimensions) {
        window.open(url, 'share', `width=${platform.dimensions.width},height=${platform.dimensions.height},resizable=yes`);
      } else {
        window.open(url, '_blank');
      }
    } else if (platform.id === 'instagram') {
      // Instagram non supporta condivisione diretta
      navigator.clipboard.writeText(pageUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleCopyLink = () => {
    const pageUrl = `https://${site?.subdomain}.operocloud.it/${page?.slug}`;
    navigator.clipboard.writeText(pageUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const renderShareButtons = () => {
    const sizeClass = buttonSizes.find(s => s.id === socialData.button_size)?.class || buttonSizes[1].class;
    const enabledPlatforms = socialPlatforms.filter(p => socialData.platforms.includes(p.id));

    if (socialData.button_style === 'floating') {
      return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 space-y-3">
          {enabledPlatforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handleShare(platform)}
              className={`${sizeClass} ${platform.color} text-white rounded-full shadow-lg flex items-center justify-center w-12 h-12`}
              title={`Condividi su ${platform.name}`}
            >
              {platform.icon}
            </button>
          ))}
        </div>
      );
    }

    const directionClass = socialData.button_style === 'vertical' ? 'flex-col space-y-3' : 'flex-row space-x-3 flex-wrap';

    return (
      <div className={`flex ${directionClass} justify-center items-center`}>
        {enabledPlatforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handleShare(platform)}
            className={`${sizeClass} ${platform.color} text-white rounded-md flex items-center space-x-2 transition-colors`}
          >
            {platform.icon}
            <span>{platform.name}</span>
          </button>
        ))}

        <button
          onClick={handleCopyLink}
          className={`${sizeClass} bg-gray-600 hover:bg-gray-700 text-white rounded-md flex items-center space-x-2 transition-colors`}
        >
          {isCopied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>Copiato!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              <span>Copia Link</span>
            </>
          )}
        </button>
      </div>
  );
  };

  const renderFollowButtons = () => {
    const followConfig = socialData.follow_config;
    const enabledPlatforms = socialPlatforms.filter(p => {
      const handle = followConfig[p.id];
      return handle && handle.trim() !== '';
    });

    if (enabledPlatforms.length === 0) return null;

    return (
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Seguici sui Social</h4>
        <div className="flex flex-wrap gap-4">
          {enabledPlatforms.map((platform) => {
            const handle = followConfig[platform.id];
            const followUrl = platform.followUrl(handle.replace('@', ''));

            return (
              <a
                key={platform.id}
                href={followUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
              >
                {platform.icon}
                <span>{platform.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  if (!socialData.enabled) {
    return null;
  }

  if (previewMode) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Condividi questa pagina</h3>
          {renderShareButtons()}
          {socialData.show_share_count && (
            <p className="mt-4 text-sm text-gray-600">
              {shareCount} persone hanno condiviso questa pagina
            </p>
          )}
        </div>
        {socialData.show_follow_buttons && renderFollowButtons()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Social Sharing</h3>
          <p className="text-sm text-gray-600">
            Configura la condivisione sui social media
            {socialData.show_share_count && ` • ${shareCount} condivisioni`}
          </p>
        </div>

        {isEditing && (
          <button
            onClick={() => setIsConfiguring(!isConfiguring)}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            {isConfiguring ? 'Chiudi Configurazione' : 'Configura'}
          </button>
        )}
      </div>

      {/* Configuration Panel */}
      {isEditing && isConfiguring && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          {/* Enable/Disable */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={socialData.enabled}
              onChange={(e) => handleSectionUpdate({ ...socialData, enabled: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="ml-2 text-sm font-medium text-gray-700">
              Abilita condivisione social
            </label>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Piattaforme abilitate
            </label>
            <div className="grid grid-cols-2 gap-2">
              {socialPlatforms.map((platform) => (
                <label key={platform.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={socialData.platforms.includes(platform.id)}
                    onChange={(e) => {
                      const platforms = e.target.checked
                        ? [...socialData.platforms, platform.id]
                        : socialData.platforms.filter(p => p !== platform.id);
                      handleSectionUpdate({ ...socialData, platforms });
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 flex items-center space-x-2">
                    {platform.icon}
                    <span>{platform.name}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Share Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testo condivisione
            </label>
            <input
              type="text"
              value={socialData.share_text}
              onChange={(e) => handleSectionUpdate({ ...socialData, share_text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Testo visualizzato quando si condivide"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtag (separati da virgola)
            </label>
            <input
              type="text"
              value={socialData.hashtags}
              onChange={(e) => handleSectionUpdate({ ...socialData, hashtags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="azienda, settore, servizi"
            />
          </div>

          {/* Button Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stile pulsanti
            </label>
            <select
              value={socialData.button_style}
              onChange={(e) => handleSectionUpdate({ ...socialData, button_style: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {buttonStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name} - {style.description}
                </option>
              ))}
            </select>
          </div>

          {/* Button Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensione pulsanti
            </label>
            <div className="grid grid-cols-3 gap-2">
              {buttonSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleSectionUpdate({ ...socialData, button_size: size.id })}
                  className={`p-2 rounded-md border-2 text-sm ${
                    socialData.button_size === size.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={socialData.show_share_count}
                onChange={(e) => handleSectionUpdate({ ...socialData, show_share_count: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Mostra contatore condivisioni</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={socialData.show_follow_buttons}
                onChange={(e) => handleSectionUpdate({ ...socialData, show_follow_buttons: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Mostra pulsanti follow</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={socialData.show_native_buttons}
                onChange={(e) => handleSectionUpdate({ ...socialData, show_native_buttons: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Usa pulsanti nativi (se disponibile)</span>
            </label>
          </div>

          {/* Open Graph Settings */}
          <div className="border-t border-blue-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Open Graph Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Titolo personalizzato</label>
                <input
                  type="text"
                  value={socialData.custom_title}
                  onChange={(e) => handleSectionUpdate({ ...socialData, custom_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Titolo per social media"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descrizione personalizzata</label>
                <textarea
                  value={socialData.custom_description}
                  onChange={(e) => handleSectionUpdate({ ...socialData, custom_description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Descrizione per social media"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="bg-white rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Condividi questa pagina</h3>
          {renderShareButtons()}
        </div>
        {socialData.show_follow_buttons && renderFollowButtons()}
      </div>
    </div>
  );
};

export default SocialSharing;