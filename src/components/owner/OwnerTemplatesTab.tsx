import React from 'react';
import { TemplateManager } from '@/components/templates/TemplateManager';

interface OwnerTemplatesTabProps {
  clinicId: string;
}

export default function OwnerTemplatesTab({ clinicId }: OwnerTemplatesTabProps) {
  return <TemplateManager clinicId={clinicId} />;
}