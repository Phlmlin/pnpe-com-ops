"use client";

import { use } from 'react';
import { EventHeader } from '@/components/evenement/EventHeader';
import { EventPartners } from '@/components/evenement/EventPartners';
import { WorkPackages } from '@/components/evenement/WorkPackages';
import { Retroplanning } from '@/components/evenement/Retroplanning';
import { notFound } from 'next/navigation';
import { useLivrables } from '@/context/LivrablesContext';

type Props = {
  params: Promise<{ id: string }>
}

export default function EvenementPage({ params }: Props) {
  const { id } = use(params);
  const { projets } = useLivrables();
  
  const projet = projets.find(p => p.id === id);

  if (!projet) {
    return <div className="p-6">Projet introuvable</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <EventHeader projet={projet} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <WorkPackages projet={projet} />
        </div>
        <div className="lg:col-span-1">
          <EventPartners projet={projet} />
        </div>
      </div>

      <Retroplanning projet={projet} />
    </div>
  );
}
