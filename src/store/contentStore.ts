import { create } from 'zustand';
import { ContentState, RegulatoryDocument, GeneratedDocument, Alert } from '../types';

export const useContentStore = create<ContentState>((set, get) => ({
  sources: [],
  generatedDocs: [],
  alerts: [],

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