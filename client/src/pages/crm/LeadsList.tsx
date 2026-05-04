import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Phone, Mail, MoreVertical, LayoutGrid, List as ListIcon, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  stage: string;
  createdAt: string;
}

const STAGES = ['New Lead', 'Contacted', 'Quote Sent', 'Booking', 'Completed'];

const LeadsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const queryClient = useQueryClient();

  const { data: leads, isLoading, error } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data } = await api.get('/leads');
      return data;
    }
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string, stage: string }) => {
      const { data } = await api.put(`/leads/${id}`, { stage });
      return data;
    },
    onSuccess: () => {
      // Background refetch is handled automatically by optimistic update, but we can invalidate to be safe
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err, variables, context: any) => {
      toast.error('Failed to update lead stage');
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
    }
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New Lead': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Contacted': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Quote Sent': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Booking': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStageBorder = (stage: string) => {
    switch (stage) {
      case 'New Lead': return 'border-t-blue-500';
      case 'Contacted': return 'border-t-amber-500';
      case 'Quote Sent': return 'border-t-purple-500';
      case 'Booking': return 'border-t-emerald-500';
      case 'Completed': return 'border-t-gray-500';
      default: return 'border-t-gray-500';
    }
  };

  const filteredLeads = leads?.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  ) || [];

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId;
    const leadId = draggableId;

    // Optimistic Update
    const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
    if (previousLeads) {
      const updatedLeads = previousLeads.map(l => 
        l._id === leadId ? { ...l, stage: newStage } : l
      );
      queryClient.setQueryData(['leads'], updatedLeads);
    }

    updateLeadStageMutation.mutate({ id: leadId, stage: newStage });
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="text-red-500">Error loading leads</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your inquiries and pipeline</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              <ListIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'board' ? 'bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
            <Plus size={18} className="mr-2" /> Add Lead
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden flex-shrink-0">
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search leads by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <button className="flex items-center px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
            <Filter size={16} className="mr-2" /> Filter
          </button>
        </div>
      </div>

      {/* BOARD VIEW */}
      {viewMode === 'board' && (
        <div className="flex-1 overflow-x-auto pb-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 min-w-max h-full items-start">
              {STAGES.map(stage => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage);
                
                return (
                  <div key={stage} className="w-80 flex flex-col bg-gray-50 dark:bg-zinc-950/50 rounded-xl border border-gray-200 dark:border-zinc-800/50 max-h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800/50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200">{stage}</h3>
                      <span className="bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full border border-gray-200 dark:border-zinc-700">
                        {stageLeads.length}
                      </span>
                    </div>
                    
                    <Droppable droppableId={stage}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                          {stageLeads.map((lead, index) => (
                            <Draggable key={lead._id} draggableId={lead._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-4 border-t-4 ${getStageBorder(lead.stage)} ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 opacity-90' : 'hover:border-gray-300 dark:hover:border-zinc-600'}`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{lead.name}</h4>
                                    <GripVertical className="text-gray-300 dark:text-zinc-600 h-4 w-4" />
                                  </div>
                                  <div className="space-y-1 mb-3">
                                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                      <Phone size={12} className="mr-1.5" /> {lead.phone}
                                    </div>
                                    {lead.email && (
                                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                        <Mail size={12} className="mr-1.5" /> {lead.email}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-md">
                                      {lead.source}
                                    </span>
                                    <span className="text-gray-400 dark:text-gray-500">
                                      {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            {filteredLeads && filteredLeads.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-zinc-950">
                  <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-zinc-800">
                    <th className="px-6 py-4 font-medium">Lead Name</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Source</th>
                    <th className="px-6 py-4 font-medium">Stage</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <Phone size={14} className="mr-2 text-gray-400 dark:text-gray-500" /> {lead.phone}
                        </div>
                        {lead.email && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Mail size={14} className="mr-2 text-gray-400 dark:text-gray-500" /> {lead.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {lead.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <LayoutGrid size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No leads found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Get started by creating a new lead.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;
