'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { ExternalLink, Handshake, Loader2, Plus, Power, Trash2 } from 'lucide-react';

type Sponsor = {
  _id: string;
  name: string;
  logoDataUri: string;
  websiteUrl?: string;
  active: boolean;
  displayOrder: number;
  createdAt: string;
};

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busySponsorId, setBusySponsorId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    websiteUrl: '',
    displayOrder: '0',
    active: true,
  });
  const [logo, setLogo] = useState<File | null>(null);

  const fetchSponsors = async () => {
    try {
      const response = await fetch('/api/admin/sponsors');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch sponsors');
      }

      setSponsors(data.data);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      setMessage(error instanceof Error ? error.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    if (!logo) {
      setMessage('Veuillez ajouter le logo du sponsor.');
      return;
    }

    setIsSaving(true);

    try {
      const body = new FormData();
      body.append('name', formState.name);
      body.append('websiteUrl', formState.websiteUrl);
      body.append('displayOrder', formState.displayOrder);
      body.append('active', String(formState.active));
      body.append('logo', logo);

      const response = await fetch('/api/admin/sponsors', {
        method: 'POST',
        body,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create sponsor');
      }

      setSponsors((current) =>
        [...current, data.data].sort((a, b) => a.displayOrder - b.displayOrder)
      );
      setFormState({ name: '', websiteUrl: '', displayOrder: '0', active: true });
      setLogo(null);
      event.currentTarget.reset();
      setMessage('Sponsor ajouté avec succès.');
    } catch (error) {
      console.error('Error creating sponsor:', error);
      setMessage(error instanceof Error ? error.message : 'Échec de la création du sponsor');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSponsor = async (sponsorId: string, updates: Partial<Sponsor>) => {
    setBusySponsorId(sponsorId);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/sponsors/${sponsorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update sponsor');
      }

      setSponsors((current) =>
        current
          .map((sponsor) => (sponsor._id === sponsorId ? data.data : sponsor))
          .sort((a, b) => a.displayOrder - b.displayOrder)
      );
    } catch (error) {
      console.error('Error updating sponsor:', error);
      setMessage(error instanceof Error ? error.message : 'Échec de la mise à jour');
    } finally {
      setBusySponsorId(null);
    }
  };

  const deleteSponsor = async (sponsorId: string) => {
    if (!confirm('Supprimer ce sponsor ?')) {
      return;
    }

    setBusySponsorId(sponsorId);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/sponsors/${sponsorId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete sponsor');
      }

      setSponsors((current) => current.filter((sponsor) => sponsor._id !== sponsorId));
      setMessage('Sponsor supprimé.');
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      setMessage(error instanceof Error ? error.message : 'Échec de la suppression');
    } finally {
      setBusySponsorId(null);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="mx-auto max-w-7xl px-3 pt-4 sm:px-4 sm:pt-6 lg:px-8 lg:pt-8">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-black text-gold">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-montserrat text-2xl font-bold text-black sm:text-3xl lg:text-4xl">
                Sponsoring
              </h1>
              <p className="text-sm text-gray-600">
                Ajoutez les logos des sponsors visibles sur la page d'accueil.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[24rem_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6"
          >
            <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-black">
              <Plus className="h-5 w-5" />
              Ajouter un sponsor
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nom du sponsor *
                </label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Nom de la marque"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Logo *
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  required
                  onChange={(event) => setLogo(event.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                />
                <p className="mt-2 text-xs text-gray-500">PNG, JPG, WEBP ou SVG. Maximum 1MB.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Lien du sponsor
                </label>
                <input
                  type="text"
                  value={formState.websiteUrl}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, websiteUrl: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  min="0"
                  value={formState.displayOrder}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      displayOrder: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formState.active}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, active: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                />
                Visible sur le site
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-black shadow-md transition-colors hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isSaving ? 'Ajout...' : 'Ajouter le sponsor'}
              </button>
            </div>

            {message && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {message}
              </div>
            )}
          </form>

          <div className="rounded-xl border border-gray-100 bg-white shadow-lg">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-black">Sponsors existants</h2>
            </div>

            {isLoading ? (
              <div className="flex min-h-[16rem] items-center justify-center text-gray-600">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Chargement des sponsors...
              </div>
            ) : sponsors.length === 0 ? (
              <div className="px-6 py-16 text-center text-gray-500">
                Aucun sponsor pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sponsors.map((sponsor) => (
                  <div
                    key={sponsor._id}
                    className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:px-6"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 bg-white p-3">
                      <img
                        src={sponsor.logoDataUri}
                        alt={sponsor.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-black">{sponsor.name}</h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            sponsor.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {sponsor.active ? 'Visible' : 'Masqué'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Ordre: {sponsor.displayOrder}</p>
                      {sponsor.websiteUrl && (
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Voir le lien
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busySponsorId === sponsor._id}
                        onClick={() => updateSponsor(sponsor._id, { active: !sponsor.active })}
                        className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                        title={sponsor.active ? 'Masquer' : 'Afficher'}
                      >
                        <Power className="h-5 w-5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        defaultValue={sponsor.displayOrder}
                        disabled={busySponsorId === sponsor._id}
                        onBlur={(event) =>
                          updateSponsor(sponsor._id, {
                            displayOrder: Number(event.target.value || 0),
                          })
                        }
                        className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gold"
                        aria-label="Ordre d'affichage"
                      />
                      <button
                        type="button"
                        disabled={busySponsorId === sponsor._id}
                        onClick={() => deleteSponsor(sponsor._id)}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        title="Supprimer"
                      >
                        {busySponsorId === sponsor._id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
