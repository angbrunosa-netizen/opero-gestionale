/**
 * Contact Block Component
 * Blocco contatti con form e informazioni aziendali
 */

import React, { useState } from 'react';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ContactBlock = ({ content, onChange, preview = false }) => {
  const [data, setData] = useState({
    showForm: true,
    showInfo: true,
    title: 'Contattaci',
    subtitle: 'Siamo a tua disposizione per qualsiasi informazione',
    email: '',
    phone: '',
    address: '',
    workingHours: 'Lun-Ven: 9:00-18:00',
    formFields: ['name', 'email', 'phone', 'message'],
    submitText: 'Invia Messaggio',
    successMessage: 'Messaggio inviato con successo!',
    ...content
  });

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const toggleFormField = (field) => {
    const newFields = data.formFields.includes(field)
      ? data.formFields.filter(f => f !== field)
      : [...data.formFields, field];
    handleChange('formFields', newFields);
  };

  if (preview) {
    return (
      <div className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h2>
            <p className="text-xl text-gray-600">{data.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form contatti */}
            {data.showForm && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-6">Invia un messaggio</h3>
                <form className="space-y-4">
                  {data.formFields.includes('name') && (
                    <input
                      type="text"
                      placeholder="Nome completo"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    />
                  )}
                  {data.formFields.includes('email') && (
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    />
                  )}
                  {data.formFields.includes('phone') && (
                    <input
                      type="tel"
                      placeholder="Telefono"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    />
                  )}
                  {data.formFields.includes('message') && (
                    <textarea
                      placeholder="Il tuo messaggio"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    />
                  )}
                  <button
                    type="submit"
                    disabled
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {data.submitText}
                  </button>
                </form>
              </div>
            )}

            {/* Informazioni contatto */}
            {data.showInfo && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-6">Informazioni</h3>

                  {data.email && (
                    <div className="flex items-center space-x-3 mb-4">
                      <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                      <span className="text-gray-700">{data.email}</span>
                    </div>
                  )}

                  {data.phone && (
                    <div className="flex items-center space-x-3 mb-4">
                      <PhoneIcon className="h-6 w-6 text-blue-600" />
                      <span className="text-gray-700">{data.phone}</span>
                    </div>
                  )}

                  {data.address && (
                    <div className="flex items-start space-x-3 mb-4">
                      <MapPinIcon className="h-6 w-6 text-blue-600 mt-1" />
                      <span className="text-gray-700">{data.address}</span>
                    </div>
                  )}

                  {data.workingHours && (
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="h-6 w-6 text-blue-600" />
                      <span className="text-gray-700">{data.workingHours}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titolo Sezione
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Contattaci"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sottotitolo
        </label>
        <textarea
          value={data.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Siamo a tua disposizione..."
        />
      </div>

      {/* Opzioni visibilità */}
      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.showForm}
            onChange={(e) => handleChange('showForm', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Mostra form contatti</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.showInfo}
            onChange={(e) => handleChange('showInfo', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Mostra informazioni contatto</span>
        </label>
      </div>

      {/* Campi form */}
      {data.showForm && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Campi del Form</h4>
          <div className="space-y-2">
            {['name', 'email', 'phone', 'message'].map((field) => (
              <label key={field} className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.formFields.includes(field)}
                  onChange={() => toggleFormField(field)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {field === 'name' ? 'Nome' : field === 'email' ? 'Email' : field === 'phone' ? 'Telefono' : 'Messaggio'}
                </span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Testo Bottone Invio
            </label>
            <input
              type="text"
              value={data.submitText}
              onChange={(e) => handleChange('submitText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Informazioni contatto */}
      {data.showInfo && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Informazioni Aziendali</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="info@azienda.it"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefono
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="+39 012 3456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Indirizzo
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Via Roma 1, 00100 Roma (RM)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orari Lavorativi
            </label>
            <input
              type="text"
              value={data.workingHours}
              onChange={(e) => handleChange('workingHours', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Lun-Ven: 9:00-18:00"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactBlock;