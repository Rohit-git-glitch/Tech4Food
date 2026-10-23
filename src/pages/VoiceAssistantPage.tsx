import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Info,
  Layers,
  ChevronRight,
  Radio,
  ImagePlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { demoVoiceParser } from '../services/voiceParser';
import { ParsedVoiceCommand, FoodItem } from '../types';
import { detectFoodImage, parseWithGemini } from '../services/geminiService';

export const VoiceAssistantPage: React.FC = () => {
  const { inventory, addFoodItem, removeFoodItem, moveFoodItem, showToast } = useApp();

  const [inputCommand, setInputCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [parsedCommand, setParsedCommand] = useState<ParsedVoiceCommand | null>(null);
  const [commandHistory, setCommandHistory] = useState<{ text: string; time: string; success: boolean }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);
        setInputCommand(resultTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        showToast({
          type: 'warning',
          title: 'Speech Recognition Error',
          message: event.error === 'not-allowed'
            ? 'Microphone permission denied. You can still type commands.'
            : `Voice capture note: ${event.error}. Use text input as fallback.`,
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [showToast]);

  const toggleListening = () => {
    if (!speechSupported) {
      showToast({
        type: 'info',
        title: 'Browser Speech API Not Available',
        message: 'Your current browser does not support Web Speech API. Please use the text input below.',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleParseCommand = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsProcessing(true);
    try {
      setParsedCommand(await parseWithGemini(textToParse));
    } catch (error) {
      console.warn('Gemini unavailable; using local parser fallback.', error);
      setParsedCommand(demoVoiceParser.parse(textToParse, inventory));
      showToast({
        type: 'warning',
        title: 'Gemini unavailable',
        message: 'Using the local parser. Start the AI API to enable Gemini analysis.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageDetection = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    try {
      setParsedCommand(await detectFoodImage(selectedImage, inputCommand));
    } catch (error) {
      console.error('Gemini image detection failed:', error);
      showToast({
        type: 'error',
        title: 'Image analysis failed',
        message: error instanceof Error ? error.message : 'Could not analyze the image.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyAction = async () => {
    if (!parsedCommand || !parsedCommand.actionPayload) return;

    const { action, itemData, existingItemId, targetLocation } = parsedCommand.actionPayload;

    try {
      if (action === 'add' && itemData) {
        await addFoodItem(itemData as Omit<FoodItem, 'id' | 'dateAdded'>);
      } else if (action === 'remove' && existingItemId) {
        await removeFoodItem(existingItemId, 'Removed via Voice Command');
      } else if (action === 'move' && existingItemId && targetLocation) {
        await moveFoodItem(existingItemId, targetLocation);
      } else if (action === 'query') {
        showToast({
          type: 'info',
          title: 'Query Result',
          message: parsedCommand.previewSummary || 'Query processed.',
        });
      }

      setCommandHistory((prev) => [
        { text: parsedCommand.rawTranscript, time: new Date().toLocaleTimeString(), success: true },
        ...prev.slice(0, 9),
      ]);

      // Reset preview
      setParsedCommand(null);
      setInputCommand('');
      setTranscript('');
    } catch (err) {
      console.error('Failed to apply voice action:', err);
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not complete the requested inventory operation.',
      });
    }
  };

  const handleCancelAction = () => {
    setParsedCommand(null);
    showToast({
      type: 'info',
      title: 'Action Cancelled',
      message: 'Proposed command discarded without updating inventory.',
    });
  };

  const examplePrompts = [
    'Add two apples to the fridge.',
    'I am putting milk in the refrigerator.',
    'Move the chicken to the freezer.',
    'Remove the apples from the fridge.',
    'What food is expiring soon?',
  ];

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner: Demo Parser vs Gemini AI */}
      <div className="bg-slate-900 text-slate-200 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Gemini AI Food Assistant</h3>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Phase 1 Prototype
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Text commands are sent to the FastAPI <code className="text-emerald-400 bg-white/5 px-1 py-0.5 rounded">/api/v1/ai/voice-parse</code> endpoint and food images to <code className="text-emerald-400 bg-white/5 px-1 py-0.5 rounded">/api/v1/ai/image-detect</code>. Gemini extracts food details, estimates shelf life, and reads visible expiry dates. A local parser is used only as a fallback when the API is unavailable.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Voice Input & Action Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voice & Text Control Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-slate-900">Voice Command Assistant</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Press the microphone to announce food additions, removals, moves, or shelf-life queries, or type below.
              </p>
            </div>

            {/* Microphone Button with visualizer */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative">
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping"></div>
                    <div className="absolute -inset-3 rounded-full border-2 border-emerald-500/40 animate-pulse"></div>
                  </>
                )}
                <button
                  onClick={toggleListening}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isListening
                      ? 'bg-rose-500 text-white scale-105 shadow-rose-500/30 ring-4 ring-rose-200'
                      : 'bg-safegreen hover:bg-safegreen-light text-white shadow-emerald-950/20'
                  }`}
                  aria-label={isListening ? 'Stop listening' : 'Start voice recognition'}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8 animate-pulse" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              <div className="mt-3 text-center">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isListening
                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isListening ? 'Listening for speech...' : 'Click to Speak'}
                </span>
                {!speechSupported && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Speech recognition not supported in this browser. Use typed commands below.
                  </p>
                )}
              </div>
            </div>

            {/* Transcript Display if listening or just finished */}
            {(transcript || isListening) && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Live Speech Transcript:
                </span>
                <p className="text-sm font-medium italic text-slate-900">
                  "{transcript || 'Listening...'}"
                </p>
              </div>
            )}

            {/* Text Input Fallback */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Or Type Voice Command (Fallback)
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleParseCommand(inputCommand);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputCommand}
                  onChange={(e) => setInputCommand(e.target.value)}
                  placeholder="e.g. Add two apples to the fridge..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputCommand.trim() || isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-safegreen hover:bg-safegreen-light text-white font-semibold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Parse</span>
                </button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="cursor-pointer px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                  <ImagePlus className="w-4 h-4" />
                  Analyze food image
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  />
                </label>
                {selectedImage && (
                  <>
                    <span className="text-xs text-slate-500 truncate max-w-[180px]">{selectedImage.name}</span>
                    <button
                      type="button"
                      onClick={() => void handleImageDetection()}
                      disabled={isProcessing}
                      className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      {isProcessing ? 'Analyzing...' : 'Detect with Gemini'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Example Prompt Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Sample Test Commands (from Specification):
              </span>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInputCommand(prompt);
                      void handleParseCommand(prompt);
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 transition-all text-left"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Preview & Confirmation Card (Mandatory Requirement) */}
          {parsedCommand && (
            <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-lg animate-slide-in space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Command Action Preview & Confirmation
                    </h3>
                    <p className="text-xs text-slate-500">
                      Review extracted intent and entities before modifying inventory
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Intent: {parsedCommand.intent.replace('_', ' ')}
                </span>
              </div>

              {/* Clarification or Error Alert */}
              {parsedCommand.clarificationPrompt && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Clarification Needed / Parser Guidance:</span>
                    <p className="mt-1 leading-relaxed whitespace-pre-line">{parsedCommand.clarificationPrompt}</p>
                  </div>
                </div>
              )}

              {/* Parsed Entity Tags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Food Item</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {parsedCommand.foodName || '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Quantity</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {parsedCommand.quantity ? `${parsedCommand.quantity} ${parsedCommand.unit || ''}` : '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {parsedCommand.location || '—'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Target / Category</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {parsedCommand.targetLocation || parsedCommand.category || '—'}
                  </span>
                </div>
              </div>

              {/* Proposed Summary */}
              {parsedCommand.previewSummary && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 block mb-0.5">
                    Proposed Inventory Change:
                  </span>
                  <p className="font-semibold text-sm leading-relaxed">{parsedCommand.previewSummary}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancelAction}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel / Discard
                </button>
                {parsedCommand.actionPayload && (
                  <button
                    type="button"
                    onClick={handleApplyAction}
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-safegreen hover:bg-safegreen-light text-white shadow-sm flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Apply to Fridge</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Session Command History & AI Architecture */}
        <div className="space-y-6">
          {/* Session History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-slate-500" />
              Session Voice History
            </h3>

            {commandHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No voice commands processed yet in this session.
              </p>
            ) : (
              <div className="space-y-2">
                {commandHistory.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{cmd.time}</span>
                      <span className="text-emerald-700 font-semibold">Applied</span>
                    </div>
                    <p className="font-medium text-slate-800 italic">"{cmd.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Architecture Overview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Phase 2 AI Integration Pipeline
            </h4>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>1. ESP32 / Audio Capture:</strong> The physical smart fridge microphone streams audio or sends transcribed text to the backend.
              </p>
              <p>
                <strong>2. FastAPI Agent Endpoint:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] text-emerald-800">POST /api/v1/ai/voice-parse</code>
              </p>
              <p>
                <strong>3. Gemini Multimodal:</strong> Gemini 2.0 Flash performs zero-shot entity extraction, calculates standard food perishability timelines, and returns a verified JSON payload.
              </p>
              <p>
                <strong>4. Supabase Storage:</strong> Inventory records update automatically with relational audit logging.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
