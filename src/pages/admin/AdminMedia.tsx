import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Video, Headphones, Image, FileText, Edit, Trash2, Eye, Download, ExternalLink, Upload, Filter, LayoutGrid, List, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMediaItems, useDeleteMedia, MediaItem, MediaType, getYouTubeThumbnail } from '@/hooks/useMediaData';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MediaUploadForm from '@/components/admin/MediaUploadForm';
import VideoPlayerModal from '@/components/media/VideoPlayerModal';

const typeIcons: Record<MediaType, typeof Video> = {
  video: Video,
  audio: Headphones,
  image: Image,
  document: FileText,
};

const typeLabels: Record<MediaType, string> = {
  video: 'Video',
  audio: 'Audio',
  image: 'Image',
  document: 'Document',
};

const typeBadgeColors: Record<MediaType, string> = {
  video: 'bg-red-600 hover:bg-red-700 text-white',
  audio: 'bg-amber-600 hover:bg-amber-700 text-white',
  image: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  document: 'bg-blue-600 hover:bg-blue-700 text-white',
};

export default function AdminMedia() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [preacherFilter, setPreacherFilter] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<{ youtubeId: string; title: string } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const { data: mediaItems = [], isLoading } = useMediaItems();
  const deleteMedia = useDeleteMedia();
  const { hasPermission, isSuperAdmin } = usePermissions();

  // Fetch programs for filter
  const { data: programs = [] } = useQuery({
    queryKey: ['programs-admin-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name_sinhala, name_english')
        .order('name_english');
      if (error) throw error;
      return data;
    },
  });

  // Fetch profiles for filter
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-admin-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name_sinhala, name_english, profile_type')
        .order('name_english');
      if (error) throw error;
      return data;
    },
  });

  const canAdd = isSuperAdmin || hasPermission('media_add' as any);
  const canEdit = isSuperAdmin || hasPermission('media_edit' as any);
  const canDelete = isSuperAdmin || hasPermission('media_delete' as any);

  const filteredItems = mediaItems.filter(item => {
    if (typeFilter !== 'all' && item.media_type !== typeFilter) return false;
    if (programFilter !== 'all') {
      if (programFilter === 'other') {
        if (item.program_id) return false;
      } else if (item.program_id !== programFilter) return false;
    }
    if (preacherFilter !== 'all') {
      if (preacherFilter === 'other') {
        if (item.preachers && item.preachers.length > 0) return false;
      } else {
        const hasPreacher = item.preachers?.some(p => p.profile_id === preacherFilter);
        if (!hasPreacher) return false;
      }
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title_sinhala.toLowerCase().includes(query) ||
        (item.title_english?.toLowerCase().includes(query) ?? false) ||
        (item.program?.name_english?.toLowerCase().includes(query) ?? false) ||
        (item.program?.name_sinhala?.toLowerCase().includes(query) ?? false) ||
        item.preachers?.some(p => 
          p.profile.name_english.toLowerCase().includes(query) ||
          p.profile.name_sinhala.includes(query)
        )
      );
    }
    return true;
  });

  const getThumbnail = (item: MediaItem) => {
    if (item.thumbnail_url) return item.thumbnail_url;
    if (item.is_youtube && item.youtube_id) return getYouTubeThumbnail(item.youtube_id);
    return null;
  };

  const handleDelete = async () => {
    if (deletingItem) {
      await deleteMedia.mutateAsync(deletingItem.id);
      setDeletingItem(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setProgramFilter('all');
    setPreacherFilter('all');
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || programFilter !== 'all' || preacherFilter !== 'all';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Library Manager</h1>
          <p className="text-muted-foreground">Upload, manage, and publish media content</p>
        </div>
        {canAdd && (
          <Button 
            onClick={() => setIsUploadOpen(true)} 
            className="gap-2 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Upload className="h-5 w-5" />
            Upload Media
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className={`bg-card border-2 rounded-xl p-4 text-center cursor-pointer transition-colors ${typeFilter === 'all' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          onClick={() => setTypeFilter('all')}
        >
          <p className="text-3xl font-bold text-foreground">{mediaItems.length}</p>
          <p className="text-sm text-muted-foreground font-medium">Total Media</p>
        </motion.div>
        {(['video', 'audio', 'image', 'document'] as MediaType[]).map((type) => {
          const Icon = typeIcons[type];
          const count = mediaItems.filter(m => m.media_type === type).length;
          const isActive = typeFilter === type;
          return (
            <motion.div 
              key={type} 
              whileHover={{ scale: 1.02 }}
              className={`bg-card border-2 rounded-xl p-4 text-center cursor-pointer transition-colors ${isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
              onClick={() => setTypeFilter(type)}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-3xl font-bold text-foreground">{count}</p>
              </div>
              <p className="text-sm text-muted-foreground font-medium">{typeLabels[type]}s</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-primary hover:underline ml-2">
              Clear all
            </button>
          )}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, program, or preacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as MediaType | 'all')}>
            <SelectTrigger className="w-full lg:w-[180px] bg-background">
              <SelectValue placeholder="Media Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">
                <span className="flex items-center gap-2"><Video className="h-4 w-4" /> Videos</span>
              </SelectItem>
              <SelectItem value="audio">
                <span className="flex items-center gap-2"><Headphones className="h-4 w-4" /> Audio</span>
              </SelectItem>
              <SelectItem value="image">
                <span className="flex items-center gap-2"><Image className="h-4 w-4" /> Images</span>
              </SelectItem>
              <SelectItem value="document">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-full lg:w-[200px] bg-background">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              <SelectItem value="other" className="italic text-muted-foreground">Other (No program)</SelectItem>
              {programs.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name_english}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={preacherFilter} onValueChange={setPreacherFilter}>
            <SelectTrigger className="w-full lg:w-[200px] bg-background">
              <SelectValue placeholder="Preacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Preachers</SelectItem>
              <SelectItem value="other" className="italic text-muted-foreground">Other (No preacher)</SelectItem>
              {profiles.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name_english} ({p.profile_type === 'monk' ? 'Monk' : 'Lay Speaker'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {mediaItems.length} items
        </p>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-secondary" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No media items found</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-primary hover:underline mt-2">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = typeIcons[item.media_type];
              const thumbnail = getThumbnail(item);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-secondary relative overflow-hidden">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={item.title_sinhala}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {(item.is_youtube && item.youtube_id) && (
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => setPreviewVideo({ youtubeId: item.youtube_id!, title: item.title_english || item.title_sinhala })}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {item.file_url && (
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => window.open(item.file_url!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {canEdit && (
                        <Button size="icon" variant="secondary" onClick={() => setEditingItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button size="icon" variant="destructive" onClick={() => setDeletingItem(item)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {/* Badge */}
                    <Badge className={`absolute top-2 left-2 ${typeBadgeColors[item.media_type]}`}>
                      <Icon className="h-3 w-3 mr-1" />
                      {typeLabels[item.media_type]}
                    </Badge>
                    {item.download_enabled && (
                      <Badge className="absolute top-2 right-2 bg-emerald-600 text-white">
                        <Download className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-3 space-y-2">
                    <h3 className="font-medium text-foreground line-clamp-1 font-sinhala">{item.title_sinhala}</h3>
                    {item.title_english && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.title_english}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.program?.name_english || 'Other'}</span>
                      <span>{formatDate(item.media_date)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-semibold">Media</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Program</TableHead>
                <TableHead className="font-semibold">Preachers</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Download</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-muted-foreground">Loading media...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No media items found</p>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-primary hover:underline mt-2">
                        Clear filters
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const Icon = typeIcons[item.media_type];
                  const thumbnail = getThumbnail(item);
                  return (
                    <TableRow key={item.id} className="hover:bg-secondary/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={item.title_sinhala}
                              className="w-16 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-10 rounded-lg bg-secondary flex items-center justify-center">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground line-clamp-1 font-sinhala">{item.title_sinhala}</p>
                            {item.title_english && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{item.title_english}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeBadgeColors[item.media_type]}>
                          <Icon className="h-3 w-3 mr-1" />
                          {typeLabels[item.media_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.program ? (
                          <span className="text-sm">{item.program.name_english}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Other</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.preachers && item.preachers.length > 0 ? (
                            <>
                              {item.preachers.slice(0, 2).map((p) => (
                                <Badge key={p.id} variant="outline" className="text-xs">
                                  {p.profile.name_english}
                                </Badge>
                              ))}
                              {item.preachers.length > 2 && (
                                <Badge variant="outline" className="text-xs bg-secondary">
                                  +{item.preachers.length - 2}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(item.media_date)}
                      </TableCell>
                      <TableCell>
                        {item.download_enabled ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-600/10">
                            <Download className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Play className="h-3 w-3 mr-1" />
                            Play only
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(item.is_youtube && item.youtube_id) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setPreviewVideo({ youtubeId: item.youtube_id!, title: item.title_english || item.title_sinhala })}
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {item.file_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(item.file_url!, '_blank')}
                              title="Open file"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingItem(item)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeletingItem(item)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Upload/Edit Dialog */}
      <Dialog open={isUploadOpen || !!editingItem} onOpenChange={(open) => {
        if (!open) {
          setIsUploadOpen(false);
          setEditingItem(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Media' : 'Add New Media'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the media item details' : 'Upload a new media item to the library'}
            </DialogDescription>
          </DialogHeader>
          <MediaUploadForm
            editingItem={editingItem}
            onSuccess={() => {
              setIsUploadOpen(false);
              setEditingItem(null);
            }}
            onCancel={() => {
              setIsUploadOpen(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.title_sinhala}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video Preview Modal */}
      {previewVideo && (
        <VideoPlayerModal
          isOpen={!!previewVideo}
          onClose={() => setPreviewVideo(null)}
          youtubeId={previewVideo.youtubeId}
          title={previewVideo.title}
        />
      )}
    </motion.div>
  );
}
