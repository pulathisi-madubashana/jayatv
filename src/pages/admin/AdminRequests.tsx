import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Check, X, Eye, MessageSquare, Loader2, RefreshCw, Trash2, Filter, MapPin, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Location/branch label mappings
const recordingLocationLabels: Record<string, { si: string; en: string }> = {
  home: { si: 'නිවස', en: 'Home' },
  temple: { si: 'විහාරස්ථානය', en: 'Temple' },
  public_place: { si: 'පොදු ස්ථානය', en: 'Public Place' },
  office: { si: 'කාර්යාලය', en: 'Office' },
  other: { si: 'වෙනත්', en: 'Other' },
};

const branchLocationLabels: Record<string, { si: string; en: string }> = {
  colombo: { si: 'කොළඹ ශාඛාව', en: 'Colombo Branch' },
  senkadagala: { si: 'සෙන්කඩගල ශාඛාව', en: 'Senkadagala Branch' },
  other: { si: 'වෙනත් ශාඛාව', en: 'Other Branch' },
};

interface DharmaRequest {
  id: string;
  program_id: string | null;
  program_name_sinhala: string;
  program_name_english: string;
  preacher_ids: string[] | null;
  preacher_names_sinhala: string[];
  preacher_names_english: string[];
  requested_date: string;
  requester_name: string;
  phone_country_code: string;
  phone_number: string;
  whatsapp_country_code: string;
  whatsapp_number: string;
  message: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  // New conditional fields
  request_type: string | null;
  recording_date: string | null;
  recording_time: string | null;
  recording_location_type: string | null;
  recording_location_other: string | null;
  branch_location: string | null;
  branch_location_other: string | null;
  // Address fields for Gamin Gamata Sadaham
  location_name: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  district: string | null;
  province: string | null;
  location_contact_phone: string | null;
}

interface Program {
  id: string;
  name_english: string;
  name_sinhala: string;
}

interface Preacher {
  id: string;
  name_english: string;
  name_sinhala: string;
}

const AdminRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<DharmaRequest[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [preachers, setPreachers] = useState<Preacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DharmaRequest | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<DharmaRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterMonk, setFilterMonk] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [requestsRes, programsRes, preachersRes] = await Promise.all([
        supabase.from('dharma_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('programs').select('id, name_english, name_sinhala'),
        supabase.from('profiles').select('id, name_english, name_sinhala'),
      ]);

      if (requestsRes.error) throw requestsRes.error;
      setRequests(requestsRes.data || []);
      setPrograms(programsRes.data || []);
      setPreachers(preachersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique preachers from all requests
  const uniquePreacherIds = useMemo(() => {
    const ids = new Set<string>();
    requests.forEach((r) => {
      r.preacher_ids?.forEach((id) => ids.add(id));
    });
    return Array.from(ids);
  }, [requests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Filter by program
      if (filterProgram !== 'all' && request.program_id !== filterProgram) {
        return false;
      }
      // Filter by monk
      if (filterMonk !== 'all' && !request.preacher_ids?.includes(filterMonk)) {
        return false;
      }
      // Filter by status
      if (filterStatus !== 'all' && request.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [requests, filterProgram, filterMonk, filterStatus]);

  const updateRequestStatus = async (requestId: string, status: 'pending' | 'approved' | 'rejected') => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('dharma_requests')
        .update({ 
          status, 
          admin_note: adminNote || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status, admin_note: adminNote } : r)
      );

      toast({
        title: 'Success',
        description: `Request ${status} successfully`,
      });

      setSelectedRequest(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteRequest) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('dharma_requests')
        .delete()
        .eq('id', deleteRequest.id);

      if (error) throw error;

      setRequests(prev => prev.filter(r => r.id !== deleteRequest.id));

      toast({
        title: 'Success',
        description: 'Request deleted successfully',
      });

      setDeleteRequest(null);
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete request',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterProgram('all');
    setFilterMonk('all');
    setFilterStatus('all');
  };

  const hasActiveFilters = filterProgram !== 'all' || filterMonk !== 'all' || filterStatus !== 'all';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
    }
  };

  const getRequestTypeBadge = (request: DharmaRequest) => {
    if (request.request_type === 'recording') {
      return <Badge variant="outline" className="text-xs">Recording</Badge>;
    } else if (request.request_type === 'branch') {
      return <Badge variant="outline" className="text-xs">Branch</Badge>;
    }
    return null;
  };

  const getLocationInfo = (request: DharmaRequest) => {
    if (request.request_type === 'recording') {
      // For recording requests, show venue name/address if available, otherwise location type
      if (request.location_name) {
        return request.location_name;
      }
      if (request.recording_location_type) {
        const label = recordingLocationLabels[request.recording_location_type];
        if (request.recording_location_type === 'other' && request.recording_location_other) {
          return request.recording_location_other;
        }
        return label?.en || request.recording_location_type;
      }
    } else if (request.request_type === 'branch' && request.branch_location) {
      const label = branchLocationLabels[request.branch_location];
      if (request.branch_location === 'other' && request.branch_location_other) {
        return request.branch_location_other;
      }
      return label?.en || request.branch_location;
    }
    return null;
  };

  // Get additional address info for tooltip or secondary display
  const getAddressPreview = (request: DharmaRequest) => {
    if (request.request_type === 'recording' && request.city) {
      return `${request.city}${request.district ? `, ${request.district}` : ''}`;
    }
    return null;
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dharma Deshana Requests</h1>
          <p className="text-muted-foreground">Manage broadcast requests from the public</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-xs">
              Clear All
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Program Filter */}
          <Select value={filterProgram} onValueChange={setFilterProgram}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Filter by Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name_english}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Monk Filter */}
          <Select value={filterMonk} onValueChange={setFilterMonk}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Filter by Monk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Monks</SelectItem>
              {preachers
                .filter((p) => uniquePreacherIds.includes(p.id))
                .map((preacher) => (
                  <SelectItem key={preacher.id} value={preacher.id}>
                    {preacher.name_english}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <p className="text-muted-foreground">
            {hasActiveFilters ? 'No requests match the selected filters' : 'No requests found'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Program</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Monk(s)</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Requester</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date / Location</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Submitted</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{request.program_name_english}</p>
                        <p className="text-sm text-muted-foreground font-sinhala">{request.program_name_sinhala}</p>
                        {getRequestTypeBadge(request)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {request.preacher_names_english.map((name, i) => (
                          <p key={i} className="text-sm text-foreground">{name}</p>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-foreground">{request.requester_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.phone_country_code} {request.phone_number}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-foreground">
                          {format(new Date(request.requested_date), 'MMM dd, yyyy')}
                        </p>
                        {request.request_type === 'recording' && request.recording_time && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {request.recording_time}
                          </p>
                        )}
                        {getLocationInfo(request) && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getLocationInfo(request)}
                          </p>
                        )}
                        {getAddressPreview(request) && (
                          <p className="text-xs text-muted-foreground/70">
                            {getAddressPreview(request)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminNote(request.admin_note || '');
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteRequest(request)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Program (English)</label>
                  <p className="font-medium text-foreground">{selectedRequest.program_name_english}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Program (Sinhala)</label>
                  <p className="font-medium text-foreground font-sinhala">{selectedRequest.program_name_sinhala}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Selected Monk(s)</label>
                <div className="mt-1 space-y-1">
                  {selectedRequest.preacher_names_english.map((name, i) => (
                    <p key={i} className="text-foreground">
                      {name} <span className="text-muted-foreground font-sinhala">({selectedRequest.preacher_names_sinhala[i]})</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Conditional Recording/Branch Information */}
              {selectedRequest.request_type === 'recording' ? (
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Recording Request</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Recording Date
                        </label>
                        <p className="font-medium text-foreground">
                          {selectedRequest.recording_date 
                            ? format(new Date(selectedRequest.recording_date), 'MMMM dd, yyyy')
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Recording Time
                        </label>
                        <p className="font-medium text-foreground">
                          {selectedRequest.recording_time || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Recording Location Type
                      </label>
                      <p className="font-medium text-foreground">
                        {selectedRequest.recording_location_type === 'other' && selectedRequest.recording_location_other
                          ? selectedRequest.recording_location_other
                          : selectedRequest.recording_location_type 
                            ? `${recordingLocationLabels[selectedRequest.recording_location_type]?.en} (${recordingLocationLabels[selectedRequest.recording_location_type]?.si})`
                            : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Venue Address Section */}
                  {selectedRequest.location_name && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">Venue Address</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-muted-foreground">Place Name</label>
                          <p className="font-medium text-foreground">{selectedRequest.location_name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Full Address</label>
                          <p className="font-medium text-foreground">
                            {selectedRequest.address_line_1}
                            {selectedRequest.address_line_2 && <>, {selectedRequest.address_line_2}</>}
                          </p>
                          <p className="text-foreground">
                            {selectedRequest.city}
                            {selectedRequest.district && <>, {selectedRequest.district}</>}
                            {selectedRequest.province && <>, {selectedRequest.province}</>}
                          </p>
                        </div>
                        {selectedRequest.location_contact_phone && (
                          <div>
                            <label className="text-sm text-muted-foreground">Venue Contact</label>
                            <p className="font-medium text-foreground">{selectedRequest.location_contact_phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedRequest.request_type === 'branch' ? (
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Branch Request</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Requested Date
                      </label>
                      <p className="font-medium text-foreground">
                        {format(new Date(selectedRequest.requested_date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Branch Location
                      </label>
                      <p className="font-medium text-foreground">
                        {selectedRequest.branch_location === 'other' && selectedRequest.branch_location_other
                          ? selectedRequest.branch_location_other
                          : selectedRequest.branch_location 
                            ? `${branchLocationLabels[selectedRequest.branch_location]?.en} (${branchLocationLabels[selectedRequest.branch_location]?.si})`
                            : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Requested Date</label>
                    <p className="font-medium text-foreground">
                      {format(new Date(selectedRequest.requested_date), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>
              )}

              {/* Status (only show if not already shown) */}
              {(selectedRequest.request_type === 'recording' || selectedRequest.request_type === 'branch') && (
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Requester Name</label>
                  <p className="font-medium text-foreground">{selectedRequest.requester_name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <p className="font-medium text-foreground">
                    {selectedRequest.phone_country_code} {selectedRequest.phone_number}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">WhatsApp</label>
                <p className="font-medium text-foreground">
                  {selectedRequest.whatsapp_number 
                    ? `${selectedRequest.whatsapp_country_code} ${selectedRequest.whatsapp_number}`
                    : 'Not provided'}
                </p>
              </div>

              {selectedRequest.message && (
                <div>
                  <label className="text-sm text-muted-foreground">Message</label>
                  <p className="text-foreground bg-muted/30 p-3 rounded-lg mt-1">
                    {selectedRequest.message}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Admin Note
                </label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note (optional)..."
                  className="bg-background"
                />
              </div>

              <div className="flex gap-3 pt-4">
                {selectedRequest.status !== 'approved' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                )}
                {selectedRequest.status !== 'rejected' && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </Button>
                )}
                {selectedRequest.status !== 'pending' && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'pending')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Reset to Pending
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRequest} onOpenChange={() => setDeleteRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this request from {deleteRequest?.requester_name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRequests;
