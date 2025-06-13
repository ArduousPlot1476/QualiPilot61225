import { create } from 'zustand';
import { ContentState, RegulatoryDocument, GeneratedDocument, Alert } from '../types';

const mockSources: RegulatoryDocument[] = [
  {
    id: '1',
    title: 'FDA 21 CFR Part 820 - Quality System Regulation',
    type: 'FDA',
    category: 'Quality Management',
    lastUpdated: new Date('2024-01-15'),
    status: 'current',
    summary: 'Current Good Manufacturing Practice (cGMP) requirements for medical devices.'
  },
  {
    id: '2',
    title: 'ISO 13485:2016 - Medical devices Quality Management',
    type: 'ISO',
    category: 'Quality Management',
    lastUpdated: new Date('2024-02-01'),
    status: 'current',
    summary: 'International standard for quality management systems in medical device industry.'
  },
  {
    id: '3',
    title: 'EU MDR 2017/745 - Medical Device Regulation',
    type: 'EU-MDR',
    category: 'Market Authorization',
    lastUpdated: new Date('2024-01-28'),
    status: 'current',
    summary: 'European Union regulation for medical devices market access.'
  },
  {
    id: '4',
    title: 'FDA Guidance: Software as Medical Device (SaMD)',
    type: 'FDA',
    category: 'Software',
    lastUpdated: new Date('2023-12-10'),
    status: 'current',
    summary: 'Clinical evaluation and quality management system software lifecycle processes.'
  }
];

const mockGeneratedDocs: GeneratedDocument[] = [
  {
    id: '1',
    title: 'FDA 510(k) Submission Checklist',
    type: 'Compliance Checklist',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    downloadUrl: '#',
    size: '2.4 MB'
  },
  {
    id: '2',
    title: 'Risk Management Plan - Device XYZ',
    type: 'Risk Analysis',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    downloadUrl: '#',
    size: '1.8 MB'
  },
  {
    id: '3',
    title: 'Clinical Evaluation Report Template',
    type: 'Clinical Documentation',
    status: 'in-progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    size: 'Generating...'
  },
  {
    id: '4',
    title: 'Quality Manual - Section 4.2',
    type: 'Quality Documentation',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    downloadUrl: '#',
    size: '3.1 MB'
  }
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'FDA Warning Letter Response Due',
    message: 'Response to FDA warning letter due in 3 days. Ensure all CAPA items are addressed.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    isRead: false,
    severity: 'high'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Design Control Review Overdue',
    message: 'Quarterly design control review is 5 days overdue. Schedule review meeting.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    isRead: false,
    severity: 'medium'
  },
  {
    id: '3',
    type: 'info',
    title: 'New ISO 13485 Guidance Published',
    message: 'ISO has published new guidance on software lifecycle processes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
    severity: 'low'
  },
  {
    id: '4',
    type: 'warning',
    title: 'Supplier Audit Due',
    message: 'Annual supplier audit for critical component manufacturer due next week.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    isRead: false,
    severity: 'medium'
  }
];

export const useContentStore = create<ContentState>((set, get) => ({
  sources: mockSources,
  generatedDocs: mockGeneratedDocs,
  alerts: mockAlerts,

  addSource: (source) =>
    set((state) => ({
      sources: [
        {
          ...source,
          id: Math.random().toString(36).substr(2, 9)
        },
        ...state.sources
      ]
    })),

  updateSource: (id, updates) =>
    set((state) => ({
      sources: state.sources.map(source =>
        source.id === id ? { ...source, ...updates } : source
      )
    })),

  deleteSource: (id) =>
    set((state) => ({
      sources: state.sources.filter(source => source.id !== id)
    })),

  addGeneratedDoc: (doc) =>
    set((state) => ({
      generatedDocs: [
        {
          ...doc,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date()
        },
        ...state.generatedDocs
      ]
    })),

  updateGeneratedDoc: (id, updates) =>
    set((state) => ({
      generatedDocs: state.generatedDocs.map(doc =>
        doc.id === id ? { ...doc, ...updates } : doc
      )
    })),

  deleteGeneratedDoc: (id) =>
    set((state) => ({
      generatedDocs: state.generatedDocs.filter(doc => doc.id !== id)
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        {
          ...alert,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        },
        ...state.alerts
      ]
    })),

  markAlertAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map(alert =>
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    })),

  deleteAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter(alert => alert.id !== id)
    })),
}));