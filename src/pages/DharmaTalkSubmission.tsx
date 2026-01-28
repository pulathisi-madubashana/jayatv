import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Send, Check, Tv, Loader2, Phone, MessageCircle, User, FileText, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Comprehensive country codes list
const countryCodes = [
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
];

// Recording location options for Gamin Gamata Sadaham
const recordingLocationOptions = [
  { value: 'home', labelSi: 'නිවස', labelEn: 'Home' },
  { value: 'temple', labelSi: 'විහාරස්ථානය', labelEn: 'Temple' },
  { value: 'public_place', labelSi: 'පොදු ස්ථානය', labelEn: 'Public Place' },
  { value: 'office', labelSi: 'කාර්යාලය', labelEn: 'Office' },
  { value: 'other', labelSi: 'වෙනත්', labelEn: 'Other' },
];

// Branch location options for other programs
const branchLocationOptions = [
  { value: 'colombo', labelSi: 'කොළඹ ශාඛාව', labelEn: 'Colombo Branch' },
  { value: 'senkadagala', labelSi: 'සෙංකඩගල ශාඛාව', labelEn: 'Senkadagala Branch' },
  { value: 'other', labelSi: 'වෙනත් ශාඛාව', labelEn: 'Other Branch' },
];

// Time options for recording
const timeOptions = Array.from({ length: 24 }, (_, hour) => {
  const h = hour.toString().padStart(2, '0');
  return [
    { value: `${h}:00`, label: `${h}:00` },
    { value: `${h}:30`, label: `${h}:30` },
  ];
}).flat();

// WhatsApp contact number for success message
const JAYA_TV_WHATSAPP = '+94 71 628 0166';
const JAYA_TV_WHATSAPP_LINK = 'https://wa.me/94716280166';

// Program name to check for special handling
const GAMIN_GAMATA_PROGRAM_NAME = 'Gamin Gamata Sadaham';

interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
  allow_deshana_request: boolean;
}

interface Preacher {
  id: string;
  name_sinhala: string;
  name_english: string;
  photo_url: string | null;
  profile_type: string;
}


// Sri Lanka provinces for address
const sriLankaProvinces = [
  { value: 'western', labelSi: 'බස්නාහිර පළාත', labelEn: 'Western Province' },
  { value: 'central', labelSi: 'මධ්‍යම පළාත', labelEn: 'Central Province' },
  { value: 'southern', labelSi: 'දකුණු පළාත', labelEn: 'Southern Province' },
  { value: 'northern', labelSi: 'උතුරු පළාත', labelEn: 'Northern Province' },
  { value: 'eastern', labelSi: 'නැගෙනහිර පළාත', labelEn: 'Eastern Province' },
  { value: 'north_western', labelSi: 'වයඹ පළාත', labelEn: 'North Western Province' },
  { value: 'north_central', labelSi: 'උතුරු මැද පළාත', labelEn: 'North Central Province' },
  { value: 'uva', labelSi: 'ඌව පළාත', labelEn: 'Uva Province' },
  { value: 'sabaragamuwa', labelSi: 'සබරගමුව පළාත', labelEn: 'Sabaragamuwa Province' },
];

// Sri Lanka districts
const sriLankaDistricts = [
  { value: 'colombo', labelSi: 'කොළඹ', labelEn: 'Colombo' },
  { value: 'gampaha', labelSi: 'ගම්පහ', labelEn: 'Gampaha' },
  { value: 'kalutara', labelSi: 'කළුතර', labelEn: 'Kalutara' },
  { value: 'kandy', labelSi: 'මහනුවර', labelEn: 'Kandy' },
  { value: 'matale', labelSi: 'මාතලේ', labelEn: 'Matale' },
  { value: 'nuwara_eliya', labelSi: 'නුවරඑළිය', labelEn: 'Nuwara Eliya' },
  { value: 'galle', labelSi: 'ගාල්ල', labelEn: 'Galle' },
  { value: 'matara', labelSi: 'මාතර', labelEn: 'Matara' },
  { value: 'hambantota', labelSi: 'හම්බන්තොට', labelEn: 'Hambantota' },
  { value: 'jaffna', labelSi: 'යාපනය', labelEn: 'Jaffna' },
  { value: 'kilinochchi', labelSi: 'කිලිනොච්චි', labelEn: 'Kilinochchi' },
  { value: 'mannar', labelSi: 'මන්නාරම', labelEn: 'Mannar' },
  { value: 'vavuniya', labelSi: 'වවුනියාව', labelEn: 'Vavuniya' },
  { value: 'mullaitivu', labelSi: 'මුලතිව්', labelEn: 'Mullaitivu' },
  { value: 'batticaloa', labelSi: 'මඩකලපුව', labelEn: 'Batticaloa' },
  { value: 'ampara', labelSi: 'අම්පාර', labelEn: 'Ampara' },
  { value: 'trincomalee', labelSi: 'ත්‍රිකුණාමලය', labelEn: 'Trincomalee' },
  { value: 'kurunegala', labelSi: 'කුරුණෑගල', labelEn: 'Kurunegala' },
  { value: 'puttalam', labelSi: 'පුත්තලම', labelEn: 'Puttalam' },
  { value: 'anuradhapura', labelSi: 'අනුරාධපුරය', labelEn: 'Anuradhapura' },
  { value: 'polonnaruwa', labelSi: 'පොළොන්නරුව', labelEn: 'Polonnaruwa' },
  { value: 'badulla', labelSi: 'බදුල්ල', labelEn: 'Badulla' },
  { value: 'monaragala', labelSi: 'මොණරාගල', labelEn: 'Monaragala' },
  { value: 'ratnapura', labelSi: 'රත්නපුර', labelEn: 'Ratnapura' },
  { value: 'kegalle', labelSi: 'කෑගල්ල', labelEn: 'Kegalle' },
];

const DharmaTalkSubmission: React.FC = () => {
  const { language, t } = useLanguage();
  const { toast } = useToast();

  // Data from database
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allPreachers, setAllPreachers] = useState<Preacher[]>([]);
  const [programPreacherMap, setProgramPreacherMap] = useState<Record<string, string[]>>({});
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Form state
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedPreachers, setSelectedPreachers] = useState<string[]>([]);
  const [requestedDate, setRequestedDate] = useState<Date>();
  const [requesterName, setRequesterName] = useState<string>('');
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>('+94');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState<string>('+94');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Conditional fields for Gamin Gamata Sadaham
  const [recordingDate, setRecordingDate] = useState<Date>();
  const [recordingTime, setRecordingTime] = useState<string>('');
  const [recordingLocationType, setRecordingLocationType] = useState<string>('');
  const [recordingLocationOther, setRecordingLocationOther] = useState<string>('');

  // Address fields for Gamin Gamata Sadaham
  const [locationName, setLocationName] = useState<string>('');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [locationContactPhone, setLocationContactPhone] = useState<string>('');

  // Conditional fields for other programs
  const [branchLocation, setBranchLocation] = useState<string>('');
  const [branchLocationOther, setBranchLocationOther] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if selected program is "Gamin Gamata Sadaham"
  const isGaminGamataProgram = useMemo(() => {
    if (!selectedProgram) return false;
    const program = programs.find((p) => p.id === selectedProgram);
    return program?.name_english === GAMIN_GAMATA_PROGRAM_NAME;
  }, [selectedProgram, programs]);

  // Fetch programs and preachers from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, preachersRes, mappingRes] = await Promise.all([
          supabase
            .from('programs')
            .select('id, name_sinhala, name_english, allow_deshana_request')
            .eq('allow_deshana_request', true),
          supabase.from('profiles').select('id, name_sinhala, name_english, photo_url, profile_type'),
          supabase.from('program_preachers').select('program_id, profile_id'),
        ]);

        if (programsRes.data) setPrograms(programsRes.data);
        if (preachersRes.data) setAllPreachers(preachersRes.data);

        // Build program-preacher mapping
        if (mappingRes.data) {
          const map: Record<string, string[]> = {};
          mappingRes.data.forEach((m) => {
            if (!map[m.program_id]) map[m.program_id] = [];
            map[m.program_id].push(m.profile_id);
          });
          setProgramPreacherMap(map);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset conditional fields when program changes
  useEffect(() => {
    // Reset recording fields
    setRecordingDate(undefined);
    setRecordingTime('');
    setRecordingLocationType('');
    setRecordingLocationOther('');
    // Reset address fields
    setLocationName('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setDistrict('');
    setProvince('');
    setLocationContactPhone('');
    // Reset branch fields
    setBranchLocation('');
    setBranchLocationOther('');
    // Reset requested date (since it's replaced by recording date for Gamin Gamata)
    if (isGaminGamataProgram) {
      setRequestedDate(undefined);
    }
  }, [selectedProgram, isGaminGamataProgram]);

  // Get selected program details
  const selectedProgramDetails = useMemo(() => {
    if (!selectedProgram) return null;
    return programs.find((p) => p.id === selectedProgram) || null;
  }, [selectedProgram, programs]);

  // Get suggested preachers for selected program
  const suggestedPreachers = useMemo<Preacher[]>(() => {
    if (!selectedProgram) return [];
    const preacherIds = programPreacherMap[selectedProgram] || [];
    return allPreachers.filter((p) => preacherIds.includes(p.id));
  }, [selectedProgram, programPreacherMap, allPreachers]);

  // Check if program has no monks assigned (like Aloka)
  const hasNoMonksAssigned = useMemo(() => {
    if (!selectedProgram) return false;
    const preacherIds = programPreacherMap[selectedProgram] || [];
    return preacherIds.length === 0;
  }, [selectedProgram, programPreacherMap]);

  // Check if program has only one monk (should be auto-selected)
  const hasSingleMonk = suggestedPreachers.length === 1;

  // Toggle preacher selection
  const togglePreacher = (preacherId: string) => {
    // If single monk, don't allow deselection
    if (hasSingleMonk) return;
    
    setSelectedPreachers((prev) =>
      prev.includes(preacherId)
        ? prev.filter((id) => id !== preacherId)
        : [...prev, preacherId]
    );
  };

  // Clear/auto-select preacher when program changes
  useEffect(() => {
    if (hasSingleMonk && suggestedPreachers.length === 1) {
      // Auto-select the single monk
      setSelectedPreachers([suggestedPreachers[0].id]);
    } else {
      setSelectedPreachers([]);
    }
  }, [selectedProgram, hasSingleMonk, suggestedPreachers]);

  // Validate phone number (only digits)
  const handlePhoneChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const cleaned = value.replace(/\D/g, '');
    setter(cleaned);
  };

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const baseValid = selectedProgram && requesterName.trim() && phoneNumber;
    
    if (isGaminGamataProgram) {
      // For Gamin Gamata: need recording date, time, location type, and address fields
      const locationTypeValid = recordingLocationType && (recordingLocationType !== 'other' || recordingLocationOther.trim());
      // Address is required for Gamin Gamata
      const addressValid = locationName.trim() && addressLine1.trim() && city.trim() && district;
      return baseValid && recordingDate && recordingTime && locationTypeValid && addressValid;
    } else if (selectedProgram) {
      // For other programs: need branch location and requested date
      const branchValid = branchLocation && (branchLocation !== 'other' || branchLocationOther.trim());
      return baseValid && requestedDate && branchValid;
    }
    
    return false;
  }, [
    selectedProgram, requesterName, phoneNumber, isGaminGamataProgram,
    recordingDate, recordingTime, recordingLocationType, recordingLocationOther,
    locationName, addressLine1, city, district,
    requestedDate, branchLocation, branchLocationOther
  ]);

  // Submit to database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast({
        title: t('deshana.errorTitle'),
        description: t('deshana.errorMessage'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Get selected preacher details
    const selectedPreacherDetails = allPreachers.filter((p) => selectedPreachers.includes(p.id));

    // Handle case where no monks are assigned (preacher will be assigned later)
    const preacherNamesSinhala = hasNoMonksAssigned 
      ? ['පසුව පවරනු ලැබේ'] 
      : selectedPreacherDetails.map((p) => p.name_sinhala);
    const preacherNamesEnglish = hasNoMonksAssigned 
      ? ['To be assigned later'] 
      : selectedPreacherDetails.map((p) => p.name_english);

    // Build submission data based on program type
    const submissionData = {
      program_id: selectedProgram,
      program_name_sinhala: selectedProgramDetails?.name_sinhala || '',
      program_name_english: selectedProgramDetails?.name_english || '',
      preacher_ids: selectedPreachers,
      preacher_names_sinhala: preacherNamesSinhala,
      preacher_names_english: preacherNamesEnglish,
      requester_name: requesterName.trim(),
      phone_country_code: phoneCountryCode,
      phone_number: phoneNumber,
      whatsapp_country_code: whatsappCountryCode,
      whatsapp_number: whatsappNumber || '',
      message: message.trim() || null,
      language_used: language,
      status: 'pending',
      request_type: isGaminGamataProgram ? 'recording' : 'branch',
      requested_date: isGaminGamataProgram 
        ? format(recordingDate!, 'yyyy-MM-dd') 
        : format(requestedDate!, 'yyyy-MM-dd'),
      recording_date: isGaminGamataProgram ? format(recordingDate!, 'yyyy-MM-dd') : null,
      recording_time: isGaminGamataProgram ? recordingTime : null,
      recording_location_type: isGaminGamataProgram ? recordingLocationType : null,
      recording_location_other: isGaminGamataProgram && recordingLocationType === 'other' 
        ? recordingLocationOther.trim() 
        : null,
      // Address fields for Gamin Gamata Sadaham
      location_name: isGaminGamataProgram ? locationName.trim() : null,
      address_line_1: isGaminGamataProgram ? addressLine1.trim() : null,
      address_line_2: isGaminGamataProgram && addressLine2.trim() ? addressLine2.trim() : null,
      city: isGaminGamataProgram ? city.trim() : null,
      district: isGaminGamataProgram ? district : null,
      province: isGaminGamataProgram && province ? province : null,
      location_contact_phone: isGaminGamataProgram && locationContactPhone.trim() ? locationContactPhone.trim() : null,
      branch_location: !isGaminGamataProgram ? branchLocation : null,
      branch_location_other: !isGaminGamataProgram && branchLocation === 'other' 
        ? branchLocationOther.trim() 
        : null,
    };

    try {
      const { error } = await supabase.from('dharma_requests').insert(submissionData);

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: t('deshana.errorTitle'),
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleNewRequest = () => {
    setSelectedProgram('');
    setSelectedPreachers([]);
    setRequestedDate(undefined);
    setRequesterName('');
    setPhoneNumber('');
    setWhatsappNumber('');
    setPhoneCountryCode('+94');
    setWhatsappCountryCode('+94');
    setMessage('');
    // Reset conditional fields
    setRecordingDate(undefined);
    setRecordingTime('');
    setRecordingLocationType('');
    setRecordingLocationOther('');
    // Reset address fields
    setLocationName('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setDistrict('');
    setProvince('');
    setLocationContactPhone('');
    setBranchLocation('');
    setBranchLocationOther('');
    setIsSubmitted(false);
  };

  const isSinhala = language === 'si';

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('deshana.pageTitle')} | {isSinhala ? 'ජය ටීවී' : 'Jaya TV'}</title>
        <meta name="description" content={t('deshana.pageSubtitle')} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className={cn(
                "text-4xl md:text-5xl font-bold text-foreground mb-4",
                isSinhala && "font-sinhala"
              )}>
                {t('deshana.pageTitle')}
              </h1>
              <p className={cn(
                "text-lg text-muted-foreground max-w-2xl mx-auto",
                isSinhala && "font-sinhala"
              )}>
                {t('deshana.pageSubtitle')}
              </p>
            </motion.div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-8 md:p-14 shadow-xl"
            >
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-10"
                  >
                    {/* 1. Program Selection */}
                    <div className="space-y-4">
                      <label className={cn(
                        "text-lg font-semibold text-foreground flex items-center gap-3",
                        isSinhala && "font-sinhala"
                      )}>
                        <Tv className="w-6 h-6 text-primary" />
                        {t('deshana.selectProgram')}
                        <span className="text-destructive">*</span>
                      </label>
                      <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                        <SelectTrigger className="w-full h-16 text-lg bg-background border-border rounded-xl">
                          <SelectValue placeholder={t('deshana.selectProgramPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border z-50 max-h-80">
                          {programs.map((program) => (
                            <SelectItem
                              key={program.id}
                              value={program.id}
                              className="cursor-pointer py-4 text-base"
                            >
                              <span className={cn("font-medium", isSinhala && "font-sinhala")}>
                                {isSinhala ? program.name_sinhala : program.name_english}
                              </span>
                              <span className="text-muted-foreground ml-2 text-sm">
                                ({isSinhala ? program.name_english : program.name_sinhala})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 2. Preacher Multi-Select */}
                    <div className="space-y-4">
                      <label className={cn(
                        "text-lg font-semibold text-foreground flex items-center gap-3",
                        isSinhala && "font-sinhala"
                      )}>
                        <User className="w-6 h-6 text-primary" />
                        {t('deshana.suggestedPreachers')}
                        <span className="text-muted-foreground text-sm font-normal ml-2">
                          ({language === 'si' ? 'බහු තේරීම' : 'Multi-select'})
                        </span>
                      </label>

                      <AnimatePresence mode="wait">
                        {hasNoMonksAssigned ? (
                          // No monk assigned yet - show info message
                          <motion.div
                            key="no-monk-assigned"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center"
                          >
                            <p className={cn(
                              "text-amber-600 dark:text-amber-400 font-medium",
                              isSinhala && "font-sinhala"
                            )}>
                              {isSinhala 
                                ? 'මෙම වැඩසටහන සඳහා ස්වාමින් වහන්සේ පසුව පත් කරනු ලැබේ'
                                : 'Preacher will be assigned later by Admin'}
                            </p>
                          </motion.div>
                        ) : suggestedPreachers.length > 0 ? (
                          <motion.div
                            key="preachers"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            {hasSingleMonk && (
                              <p className={cn(
                                "text-sm text-muted-foreground mb-2",
                                isSinhala && "font-sinhala"
                              )}>
                                {isSinhala 
                                  ? 'මෙම වැඩසටහන සඳහා පහත ස්වාමින් වහන්සේ ස්වයංක්‍රීයව තෝරා ඇත'
                                  : 'This preacher is auto-selected for this program'}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4">
                              {suggestedPreachers.map((preacher) => {
                                const isSelected = selectedPreachers.includes(preacher.id);
                                return (
                                  <motion.button
                                    key={preacher.id}
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => togglePreacher(preacher.id)}
                                    disabled={hasSingleMonk}
                                    className={cn(
                                      "flex items-center gap-4 rounded-2xl p-4 pr-6 transition-all border-2",
                                      isSelected
                                        ? "bg-primary/10 border-primary"
                                        : "bg-muted/30 border-transparent hover:border-primary/50",
                                      hasSingleMonk 
                                        ? "cursor-default" 
                                        : "cursor-pointer"
                                    )}
                                  >
                                    <div className="relative">
                                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                                        {preacher.photo_url ? (
                                          <img
                                            src={preacher.photo_url}
                                            alt={preacher.name_english}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-primary/20">
                                            <User className="w-8 h-8 text-primary" />
                                          </div>
                                        )}
                                      </div>
                                      {isSelected && (
                                        <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                                          <Check className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-left">
                                      <p className={cn(
                                        "font-medium text-foreground",
                                        isSinhala && "font-sinhala"
                                      )}>
                                        {isSinhala ? preacher.name_sinhala : preacher.name_english}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {isSinhala ? preacher.name_english : preacher.name_sinhala}
                                      </p>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.p
                            key="no-preachers"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                              "text-muted-foreground bg-muted/30 rounded-xl p-6 text-center",
                              isSinhala && "font-sinhala"
                            )}
                          >
                            {t('deshana.noPreachers')}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Conditional Fields Based on Program */}
                    <AnimatePresence mode="wait">
                      {isGaminGamataProgram ? (
                        /* Recording Details for Gamin Gamata Sadaham */
                        <motion.div
                          key="recording-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-8 overflow-hidden"
                        >
                          {/* Recording Date */}
                          <div className="space-y-4">
                            <label className={cn(
                              "text-lg font-semibold text-foreground flex items-center gap-3",
                              isSinhala && "font-sinhala"
                            )}>
                              <Calendar className="w-6 h-6 text-primary" />
                              {isSinhala ? 'පටිගත කිරීමේ දිනය' : 'Recording Date'}
                              <span className="text-destructive">*</span>
                            </label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-16 justify-start text-left text-lg font-normal bg-background border-border rounded-xl",
                                    !recordingDate && "text-muted-foreground"
                                  )}
                                >
                                  <Calendar className="mr-4 h-6 w-6" />
                                  {recordingDate ? (
                                    format(recordingDate, "yyyy MMMM dd")
                                  ) : (
                                    <span className={isSinhala ? "font-sinhala" : ""}>
                                      {isSinhala ? 'දිනයක් තෝරන්න' : 'Select a date'}
                                    </span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={recordingDate}
                                  onSelect={setRecordingDate}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Recording Time */}
                          <div className="space-y-4">
                            <label className={cn(
                              "text-lg font-semibold text-foreground flex items-center gap-3",
                              isSinhala && "font-sinhala"
                            )}>
                              <Clock className="w-6 h-6 text-primary" />
                              {isSinhala ? 'පටිගත කිරීමේ වේලාව' : 'Recording Time'}
                              <span className="text-destructive">*</span>
                            </label>
                            <Select value={recordingTime} onValueChange={setRecordingTime}>
                              <SelectTrigger className="w-full h-16 text-lg bg-background border-border rounded-xl">
                                <SelectValue placeholder={isSinhala ? 'වේලාවක් තෝරන්න' : 'Select a time'} />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border z-50 max-h-72">
                                {timeOptions.map((time) => (
                                  <SelectItem
                                    key={time.value}
                                    value={time.value}
                                    className="cursor-pointer py-3"
                                  >
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Recording Location Type */}
                          <div className="space-y-4">
                            <label className={cn(
                              "text-lg font-semibold text-foreground flex items-center gap-3",
                              isSinhala && "font-sinhala"
                            )}>
                              <MapPin className="w-6 h-6 text-primary" />
                              {isSinhala ? 'පටිගත කිරීමේ ස්ථාන වර්ගය' : 'Recording Location Type'}
                              <span className="text-destructive">*</span>
                            </label>
                            <Select value={recordingLocationType} onValueChange={setRecordingLocationType}>
                              <SelectTrigger className="w-full h-16 text-lg bg-background border-border rounded-xl">
                                <SelectValue placeholder={isSinhala ? 'ස්ථාන වර්ගයක් තෝරන්න' : 'Select location type'} />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border z-50">
                                {recordingLocationOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="cursor-pointer py-4"
                                  >
                                    <span className={cn(isSinhala && "font-sinhala")}>
                                      {isSinhala ? option.labelSi : option.labelEn}
                                    </span>
                                    <span className="text-muted-foreground ml-2 text-sm">
                                      ({isSinhala ? option.labelEn : option.labelSi})
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Other Location Input */}
                            <AnimatePresence>
                              {recordingLocationType === 'other' && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <Input
                                    type="text"
                                    value={recordingLocationOther}
                                    onChange={(e) => setRecordingLocationOther(e.target.value)}
                                    className={cn(
                                      "h-14 text-lg bg-background border-border rounded-xl mt-3",
                                      isSinhala && "font-sinhala"
                                    )}
                                    placeholder={isSinhala ? 'ස්ථානය සඳහන් කරන්න' : 'Specify the location'}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Address Section for Gamin Gamata Sadaham */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6 bg-muted/30 rounded-2xl p-6 border border-border"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <MapPin className="w-6 h-6 text-primary" />
                              <h3 className={cn(
                                "text-lg font-semibold text-foreground",
                                isSinhala && "font-sinhala"
                              )}>
                                {isSinhala ? 'දේශනාව පැවැත්වෙන ස්ථානයේ ලිපිනය' : 'Venue Address for Dhamma Talk'}
                              </h3>
                            </div>

                            {/* Place Name */}
                            <div className="space-y-2">
                              <label className={cn(
                                "text-sm font-medium text-foreground flex items-center gap-2",
                                isSinhala && "font-sinhala"
                              )}>
                                {isSinhala ? 'ස්ථානයේ නම' : 'Place Name'}
                                <span className="text-destructive">*</span>
                              </label>
                              <Input
                                type="text"
                                value={locationName}
                                onChange={(e) => setLocationName(e.target.value)}
                                className={cn(
                                  "h-14 text-lg bg-background border-border rounded-xl",
                                  isSinhala && "font-sinhala"
                                )}
                                placeholder={isSinhala ? 'උදා: විහාරස්ථානය / නිවස / පොදු ස්ථානය' : 'e.g., Temple / Home / Public Place'}
                              />
                            </div>

                            {/* Address Line 1 */}
                            <div className="space-y-2">
                              <label className={cn(
                                "text-sm font-medium text-foreground flex items-center gap-2",
                                isSinhala && "font-sinhala"
                              )}>
                                {isSinhala ? 'ලිපිනය - පළමු පේළිය' : 'Address Line 1'}
                                <span className="text-destructive">*</span>
                              </label>
                              <Input
                                type="text"
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
                                className={cn(
                                  "h-14 text-lg bg-background border-border rounded-xl",
                                  isSinhala && "font-sinhala"
                                )}
                                placeholder={isSinhala ? 'වීථි ලිපිනය / අංකය' : 'Street address / Number'}
                              />
                            </div>

                            {/* Address Line 2 (Optional) */}
                            <div className="space-y-2">
                              <label className={cn(
                                "text-sm font-medium text-foreground flex items-center gap-2",
                                isSinhala && "font-sinhala"
                              )}>
                                {isSinhala ? 'ලිපිනය - දෙවන පේළිය' : 'Address Line 2'}
                                <span className="text-muted-foreground text-xs ml-1">({isSinhala ? 'අවශ්‍ය නැත' : 'Optional'})</span>
                              </label>
                              <Input
                                type="text"
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
                                className={cn(
                                  "h-14 text-lg bg-background border-border rounded-xl",
                                  isSinhala && "font-sinhala"
                                )}
                                placeholder={isSinhala ? 'අමතර ලිපින තොරතුරු' : 'Additional address details'}
                              />
                            </div>

                            {/* City / Village */}
                            <div className="space-y-2">
                              <label className={cn(
                                "text-sm font-medium text-foreground flex items-center gap-2",
                                isSinhala && "font-sinhala"
                              )}>
                                {isSinhala ? 'නගරය / ගම්මානය' : 'City / Village'}
                                <span className="text-destructive">*</span>
                              </label>
                              <Input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className={cn(
                                  "h-14 text-lg bg-background border-border rounded-xl",
                                  isSinhala && "font-sinhala"
                                )}
                                placeholder={isSinhala ? 'නගරය හෝ ගම්මානයේ නම' : 'City or village name'}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* District */}
                              <div className="space-y-2">
                                <label className={cn(
                                  "text-sm font-medium text-foreground flex items-center gap-2",
                                  isSinhala && "font-sinhala"
                                )}>
                                  {isSinhala ? 'දිස්ත්‍රික්කය' : 'District'}
                                  <span className="text-destructive">*</span>
                                </label>
                                <Select value={district} onValueChange={setDistrict}>
                                  <SelectTrigger className="w-full h-14 text-lg bg-background border-border rounded-xl">
                                    <SelectValue placeholder={isSinhala ? 'දිස්ත්‍රික්කය තෝරන්න' : 'Select district'} />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover border-border z-50 max-h-72">
                                    {sriLankaDistricts.map((d) => (
                                      <SelectItem
                                        key={d.value}
                                        value={d.value}
                                        className="cursor-pointer py-3"
                                      >
                                        <span className={cn(isSinhala && "font-sinhala")}>
                                          {isSinhala ? d.labelSi : d.labelEn}
                                        </span>
                                        <span className="text-muted-foreground ml-2 text-sm">
                                          ({isSinhala ? d.labelEn : d.labelSi})
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Province (Optional) */}
                              <div className="space-y-2">
                                <label className={cn(
                                  "text-sm font-medium text-foreground flex items-center gap-2",
                                  isSinhala && "font-sinhala"
                                )}>
                                  {isSinhala ? 'පළාත' : 'Province'}
                                  <span className="text-muted-foreground text-xs ml-1">({isSinhala ? 'අවශ්‍ය නැත' : 'Optional'})</span>
                                </label>
                                <Select value={province} onValueChange={setProvince}>
                                  <SelectTrigger className="w-full h-14 text-lg bg-background border-border rounded-xl">
                                    <SelectValue placeholder={isSinhala ? 'පළාත තෝරන්න' : 'Select province'} />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover border-border z-50 max-h-72">
                                    {sriLankaProvinces.map((p) => (
                                      <SelectItem
                                        key={p.value}
                                        value={p.value}
                                        className="cursor-pointer py-3"
                                      >
                                        <span className={cn(isSinhala && "font-sinhala")}>
                                          {isSinhala ? p.labelSi : p.labelEn}
                                        </span>
                                        <span className="text-muted-foreground ml-2 text-sm">
                                          ({isSinhala ? p.labelEn : p.labelSi})
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Contact Phone (Optional) */}
                            <div className="space-y-2">
                              <label className={cn(
                                "text-sm font-medium text-foreground flex items-center gap-2",
                                isSinhala && "font-sinhala"
                              )}>
                                {isSinhala ? 'ස්ථානයේ සම්බන්ධතා දුරකථන අංකය' : 'Venue Contact Phone'}
                                <span className="text-muted-foreground text-xs ml-1">({isSinhala ? 'අවශ්‍ය නැත' : 'Optional'})</span>
                              </label>
                              <Input
                                type="tel"
                                value={locationContactPhone}
                                onChange={(e) => handlePhoneChange(e.target.value, setLocationContactPhone)}
                                className={cn(
                                  "h-14 text-lg bg-background border-border rounded-xl"
                                )}
                                placeholder={isSinhala ? 'ස්ථානයේ දුරකථන අංකය' : 'Venue contact number'}
                              />
                            </div>
                          </motion.div>
                        </motion.div>
                      ) : selectedProgram ? (
                        /* Branch Location for Other Programs */
                        <motion.div
                          key="branch-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-8 overflow-hidden"
                        >
                          {/* Requested Date (Vikasana Date) */}
                          <div className="space-y-4">
                            <label className={cn(
                              "text-lg font-semibold text-foreground flex items-center gap-3",
                              isSinhala && "font-sinhala"
                            )}>
                              <Calendar className="w-6 h-6 text-primary" />
                              {t('deshana.requestedDate')}
                              <span className="text-destructive">*</span>
                            </label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-16 justify-start text-left text-lg font-normal bg-background border-border rounded-xl",
                                    !requestedDate && "text-muted-foreground"
                                  )}
                                >
                                  <Calendar className="mr-4 h-6 w-6" />
                                  {requestedDate ? (
                                    format(requestedDate, "yyyy MMMM dd")
                                  ) : (
                                    <span className={isSinhala ? "font-sinhala" : ""}>
                                      {t('deshana.selectDate')}
                                    </span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={requestedDate}
                                  onSelect={setRequestedDate}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Branch Location */}
                          <div className="space-y-4">
                            <label className={cn(
                              "text-lg font-semibold text-foreground flex items-center gap-3",
                              isSinhala && "font-sinhala"
                            )}>
                              <MapPin className="w-6 h-6 text-primary" />
                              {isSinhala ? 'පැතිගත කිරීමට බලා පොරොත්තු වන ස්ථානය' : 'Expected Broadcast Location'}
                              <span className="text-destructive">*</span>
                            </label>
                            <Select value={branchLocation} onValueChange={setBranchLocation}>
                              <SelectTrigger className="w-full h-16 text-lg bg-background border-border rounded-xl">
                                <SelectValue placeholder={isSinhala ? 'ශාඛාවක් තෝරන්න' : 'Select a branch'} />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border z-50">
                                {branchLocationOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="cursor-pointer py-4"
                                  >
                                    <span className={cn(isSinhala && "font-sinhala")}>
                                      {isSinhala ? option.labelSi : option.labelEn}
                                    </span>
                                    <span className="text-muted-foreground ml-2 text-sm">
                                      ({isSinhala ? option.labelEn : option.labelSi})
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Other Branch Input */}
                            <AnimatePresence>
                              {branchLocation === 'other' && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <Input
                                    type="text"
                                    value={branchLocationOther}
                                    onChange={(e) => setBranchLocationOther(e.target.value)}
                                    className={cn(
                                      "h-14 text-lg bg-background border-border rounded-xl mt-3",
                                      isSinhala && "font-sinhala"
                                    )}
                                    placeholder={isSinhala ? 'ශාඛාව සඳහන් කරන්න' : 'Specify the branch'}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    {/* 4. Requester Name */}
                    <div className="space-y-4">
                      <label className={cn(
                        "text-lg font-semibold text-foreground flex items-center gap-3",
                        isSinhala && "font-sinhala"
                      )}>
                        <User className="w-6 h-6 text-primary" />
                        {t('deshana.yourName')}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="text"
                        value={requesterName}
                        onChange={(e) => setRequesterName(e.target.value)}
                        className={cn(
                          "h-16 text-lg bg-background border-border rounded-xl",
                          isSinhala && "font-sinhala"
                        )}
                        placeholder={t('deshana.namePlaceholder')}
                      />
                    </div>

                    {/* 5. Phone Number */}
                    <div className="space-y-4">
                      <label className={cn(
                        "text-lg font-semibold text-foreground flex items-center gap-3",
                        isSinhala && "font-sinhala"
                      )}>
                        <Phone className="w-6 h-6 text-primary" />
                        {t('deshana.phoneNumber')}
                        <span className="text-destructive">*</span>
                      </label>
                      <div className="flex gap-3">
                        <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                          <SelectTrigger className="w-36 h-16 bg-background border-border rounded-xl text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border z-50 max-h-72">
                            {countryCodes.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                                className="cursor-pointer py-3"
                              >
                                <span className="mr-2">{country.flag}</span>
                                {country.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          value={phoneNumber}
                          onChange={(e) => handlePhoneChange(e.target.value, setPhoneNumber)}
                          className="flex-1 h-16 text-lg bg-background border-border rounded-xl"
                          placeholder="771234567"
                        />
                      </div>
                    </div>

                    {/* 6. WhatsApp Number (Optional) */}
                    <div className="space-y-4">
                      <label className={cn(
                        "text-lg font-semibold text-foreground flex items-center gap-3",
                        isSinhala && "font-sinhala"
                      )}>
                        <MessageCircle className="w-6 h-6 text-primary" />
                        {t('deshana.whatsappNumber')}
                        <span className="text-muted-foreground text-sm font-normal ml-2">
                          ({t('deshana.optional')})
                        </span>
                      </label>
                      <div className="flex gap-3">
                        <Select value={whatsappCountryCode} onValueChange={setWhatsappCountryCode}>
                          <SelectTrigger className="w-36 h-16 bg-background border-border rounded-xl text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border z-50 max-h-72">
                            {countryCodes.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                                className="cursor-pointer py-3"
                              >
                                <span className="mr-2">{country.flag}</span>
                                {country.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          value={whatsappNumber}
                          onChange={(e) => handlePhoneChange(e.target.value, setWhatsappNumber)}
                          className="flex-1 h-16 text-lg bg-background border-border rounded-xl"
                          placeholder="771234567"
                        />
                      </div>
                    </div>

                    {/* 7. Additional Message (Optional) */}
                    <div className="space-y-4">
                      <label className={cn(
                        "text-lg font-semibold text-foreground flex items-center gap-3",
                        isSinhala && "font-sinhala"
                      )}>
                        <FileText className="w-6 h-6 text-primary" />
                        {t('deshana.additionalMessage')}
                        <span className="text-muted-foreground text-sm font-normal ml-2">
                          ({t('deshana.optional')})
                        </span>
                      </label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={cn(
                          "min-h-32 text-lg bg-background border-border rounded-xl resize-none",
                          isSinhala && "font-sinhala"
                        )}
                        placeholder={t('deshana.messagePlaceholder')}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className={cn(
                        "w-full h-16 text-xl font-semibold rounded-xl transition-all",
                        isSinhala && "font-sinhala"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          {t('deshana.submitting')}
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6 mr-3" />
                          {t('deshana.submitRequest')}
                        </>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  /* Success Message */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="mb-8">
                      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-14 h-14 text-green-500" />
                      </div>
                      <h2 className={cn(
                        "text-3xl font-bold text-foreground mb-4",
                        isSinhala && "font-sinhala"
                      )}>
                        {t('deshana.successTitle')}
                      </h2>
                      <p className={cn(
                        "text-lg text-muted-foreground mb-6",
                        isSinhala && "font-sinhala"
                      )}>
                        {t('deshana.successMessage')}
                      </p>
                      
                      {/* WhatsApp Contact Info */}
                      <div className="bg-muted/50 rounded-2xl p-6 mb-8">
                        <p className={cn(
                          "text-muted-foreground mb-3",
                          isSinhala && "font-sinhala"
                        )}>
                          {t('deshana.whatsappContact')}
                        </p>
                        <a
                          href={JAYA_TV_WHATSAPP_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          {JAYA_TV_WHATSAPP}
                        </a>
                      </div>
                    </div>

                    <Button
                      onClick={handleNewRequest}
                      variant="outline"
                      className={cn(
                        "h-14 px-8 text-lg rounded-xl",
                        isSinhala && "font-sinhala"
                      )}
                    >
                      {t('deshana.newRequest')}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DharmaTalkSubmission;
