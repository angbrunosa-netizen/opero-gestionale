/**
 * Analytics Dashboard Component
 * Dashboard per le statistiche dei siti web
 */

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  GlobeAltIcon,
  UserIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AnalyticsDashboard = ({ sites }) => {
  const [selectedSite, setSelectedSite] = useState(sites?.[0] || null);
  const [dateRange, setDateRange] = useState('7d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSite) {
      loadAnalytics(selectedSite.id, dateRange);
    }
  }, [selectedSite, dateRange]);

  const loadAnalytics = async (siteId, range) => {
    setLoading(true);
    try {
      // Simula caricamento dati analytics
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Dati mock basati sul range
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const baseVisits = range === '7d' ? 100 : range === '30d' ? 500 : 1500;

      setAnalytics({
        visits: {
          total: baseVisits + Math.floor(Math.random() * 200),
          unique: Math.floor(baseVisits * 0.7),
          pageViews: baseVisits * 2.3,
          avgDuration: Math.floor(Math.random() * 180) + 120
        },
        traffic: {
          organic: Math.floor(baseVisits * 0.4),
          direct: Math.floor(baseVisits * 0.3),
          social: Math.floor(baseVisits * 0.2),
          referral: Math.floor(baseVisits * 0.1)
        },
        devices: {
          desktop: Math.floor(baseVisits * 0.5),
          mobile: Math.floor(baseVisits * 0.4),
          tablet: Math.floor(baseVisits * 0.1)
        },
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendPercentage: Math.floor(Math.random() * 30) + 5
      });
    } catch (error) {
      console.error('Errore caricamento analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, unit = '' }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}{unit}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend === 'up' ? (
                      <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                    )}
                    <span className="ml-1">{trendValue}%</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const TrafficSourceCard = ({ source, visits, color, percentage }) => {
    const getIcon = () => {
      switch (source) {
        case 'organic': return <GlobeAltIcon className="w-5 h-5" />;
        case 'direct': return <EyeIcon className="w-5 h-5" />;
        case 'social': return <UserIcon className="w-5 h-5" />;
        case 'referral': return <ArrowTrendingUpIcon className="w-5 h-5" />;
        default: return <EyeIcon className="w-5 h-5" />;
      }
    };

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {getIcon()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 capitalize">{source}</p>
            <p className="text-xs text-gray-500">{visits} visite</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">{percentage}%</p>
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className={`${color.replace('text-', 'bg-')} h-2 rounded-full`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Siti Web</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitora le performance e le statistiche dei tuoi siti web
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Site Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sito Web
            </label>
            <select
              value={selectedSite?.id || ''}
              onChange={(e) => {
                const site = sites.find(s => s.id === parseInt(e.target.value));
                setSelectedSite(site);
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {sites?.map(site => (
                <option key={site.id} value={site.id}>
                  {site.site_title} ({site.subdomain}.operocloud.it)
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo
            </label>
            <div className="flex space-x-2">
              {['7d', '30d', '90d'].map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === '7d' ? 'Ultimi 7 giorni' :
                   range === '30d' ? 'Ultimi 30 giorni' : 'Ultimi 90 giorni'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!selectedSite ? (
        <div className="text-center py-12">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun sito selezionato</h3>
          <p className="mt-1 text-sm text-gray-500">
            Seleziona un sito web per visualizzare le analytics.
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : analytics ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Visite Totali"
              value={analytics.visits.total}
              icon={EyeIcon}
              trend={analytics.trend}
              trendValue={analytics.trendPercentage}
            />
            <StatCard
              title="Visitatori Unici"
              value={analytics.visits.unique}
              icon={UserIcon}
              trend={analytics.trend}
              trendValue={analytics.trendPercentage}
            />
            <StatCard
              title="Visualizzazioni Pagina"
              value={analytics.visits.pageViews}
              icon={ChartBarIcon}
              trend={analytics.trend}
              trendValue={analytics.trendPercentage}
            />
            <StatCard
              title="Durata Media"
              value={Math.floor(analytics.visits.avgDuration / 60)}
              unit=" min"
              icon={ClockIcon}
            />
          </div>

          {/* Traffic Sources & Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sorgenti Traffico</h3>
              <div className="space-y-3">
                {Object.entries(analytics.traffic).map(([source, visits]) => (
                  <TrafficSourceCard
                    key={source}
                    source={source}
                    visits={visits}
                    color={
                      source === 'organic' ? 'text-green-600 bg-green-100' :
                      source === 'direct' ? 'text-blue-600 bg-blue-100' :
                      source === 'social' ? 'text-purple-600 bg-purple-100' :
                      'text-orange-600 bg-orange-100'
                    }
                    percentage={Math.round((visits / analytics.visits.total) * 100)}
                  />
                ))}
              </div>
            </div>

            {/* Devices */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dispositivi</h3>
              <div className="space-y-4">
                {Object.entries(analytics.devices).map(([device, visits]) => {
                  const Icon = device === 'desktop' ? ComputerDesktopIcon : DevicePhoneMobileIcon;
                  const percentage = Math.round((visits / analytics.visits.total) * 100);

                  return (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {device === 'desktop' ? 'Desktop' : device === 'mobile' ? 'Mobile' : 'Tablet'}
                          </p>
                          <p className="text-xs text-gray-500">{visits} visite</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Pages Placeholder */}
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pagine Più Visitate</h3>
            <div className="text-center py-8">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Dettaglio delle pagine più visitate coming soon...
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun dato analytics</h3>
          <p className="mt-1 text-sm text-gray-500">
            Non ci sono dati disponibili per il periodo selezionato.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;