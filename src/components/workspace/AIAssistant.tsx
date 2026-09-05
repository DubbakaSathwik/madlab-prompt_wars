import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowLeftRight, 
  HelpCircle, 
  AlertCircle,
  Search
} from 'lucide-react';
import { Patient, ClinicalReport, LabResult, AIMessage } from '../../types/medical';
import { AIService } from '../../services/aiService';
import { AIMessageItem } from './AIMessageItem';

interface AIAssistantProps {
  patient: Patient;
  activeReport?: ClinicalReport;
  selectedTest?: LabResult;
  onClearSelectedTest?: () => void;
  autoQuery?: { id: string; prompt: string } | null;
  onClearAutoQuery?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  patient,
  activeReport,
  selectedTest,
  onClearSelectedTest,
  autoQuery,
  onClearAutoQuery
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      structuredResponse: {
        record: `Patient record active: ${patient.name} (${patient.patientId}) · ${patient.reports.length} Clinical Reports loaded into Medical JSON.`,
        source: `Active Context: ${activeReport?.sourceDocument || 'Laboratory Record'}`,
        explanation: `I am MedLabs AI, connected to your extracted clinical records, reference ranges, and provenance metadata. I can explain documented test findings and answer your questions without formulating clinical diagnoses.`,
        note: `MedLens is strictly informational. Always discuss specific lab results and medical decisions with a qualified healthcare professional.`
      },
      suggestedFollowUps: [
        'Explain my latest report.',
        'Which results are outside the provided reference ranges?',
        'What information is missing?'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle incoming automated query from the "Ask AI" button on test items (Task 6)
  useEffect(() => {
    if (autoQuery && autoQuery.prompt) {
      handleSend(autoQuery.prompt);
      onClearAutoQuery?.();
    }
  }, [autoQuery?.id]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isTyping) return;

    // Add user message
    const userMsg: AIMessage = {
      id: `usr-msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const { response, followUps, structuredSummary } = await AIService.query(
        textToSend,
        patient,
        activeReport,
        selectedTest
      );

      const aiMsg: AIMessage = {
        id: `ai-msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        structuredResponse: response,
        structuredSummary,
        suggestedFollowUps: followUps
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: AIMessage = {
        id: `err-msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: 'An error occurred while evaluating the query against the clinical record. Please try again.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        structuredResponse: {
          record: `Patient record active: ${patient.name} (${patient.patientId}).`,
          source: `${activeReport?.sourceDocument || 'Laboratory Record'}`,
          explanation: `How can I assist you with understanding this clinical record today?`,
          note: `MedLens is strictly informational and non-diagnostic.`
        },
        suggestedFollowUps: [
          'Explain my latest report.',
          'What should I ask my doctor?'
        ]
      }
    ]);
  };

  const suggestedPrompts = [
    'Explain my latest report.',
    'What changed from my previous report?',
    'Which results are outside the provided reference ranges?',
    'What information is missing?',
    'What should I ask my doctor?',
    'Where did this information come from?'
  ];

  return (
    <aside className="w-full h-full bg-[#F8FAFB] border-l border-slate-200/90 flex flex-col justify-between overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200/90 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#218DAE]">
              <Sparkles className="w-5 h-5 text-[#2BBBD7]" />
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                ✦ MedLens AI
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Source-grounded clinical intelligence
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="mt-3 grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100">
          <button
            onClick={() => handleSend('Explain my latest report in clear, patient-friendly language.')}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-50 hover:bg-[#eaf9fc] hover:text-[#186d88] border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Explain active report in plain language"
          >
            <FileText className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Explain</span>
          </button>

          <button
            onClick={() => handleSend('What changed from my previous report?')}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-50 hover:bg-[#eaf9fc] hover:text-[#186d88] border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Compare with prior longitudinal baseline"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Compare</span>
          </button>

          <button
            onClick={() => handleSend(selectedTest ? `Where in ${selectedTest.provenance.sourceDocument} was this test found?` : 'Where did this information come from?')}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-50 hover:bg-[#eaf9fc] hover:text-[#186d88] border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Trace source document provenance"
          >
            <Search className="w-3.5 h-3.5 text-[#218DAE]" />
            <span>Find Source</span>
          </button>

          <button
            onClick={() => handleSend('Generate structured clinical summary')}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-50 hover:bg-[#eaf9fc] hover:text-[#186d88] border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Generate comprehensive structured summary (Section 24)"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2BBBD7]" />
            <span>Summarize</span>
          </button>

          <button
            onClick={() => handleSend('What should I ask my doctor about these results?')}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-50 hover:bg-[#eaf9fc] hover:text-[#186d88] border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Generate recommended questions for your physician"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Questions</span>
          </button>

          <button
            onClick={() => handleSend('What information is missing from this record set?')}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-50 hover:bg-[#eaf9fc] hover:text-[#186d88] border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Identify missing allergies, symptoms, or undocumented tests"
          >
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Missing Info</span>
          </button>
        </div>

        {/* Active Test Context Banner */}
        {selectedTest && (
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#e8f4f8] to-[#eaf9fc] border border-[#218DAE]/40 flex items-center justify-between text-sm shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2BBBD7] shrink-0 animate-pulse" />
              <div className="min-w-0">
                <span className="text-xs text-slate-500 uppercase font-black tracking-wider block">Selected Context</span>
                <span className="font-extrabold text-slate-900 truncate block text-sm">
                  {selectedTest.testName}: {selectedTest.value} {selectedTest.unit} [{selectedTest.status}]
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleSend(`Why is it ${selectedTest.status.toLowerCase()}?`)}
                className="text-xs font-extrabold text-[#186d88] hover:underline bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs"
              >
                Why is it {selectedTest.status.toLowerCase()}?
              </button>
              {onClearSelectedTest && (
                <button
                  onClick={onClearSelectedTest}
                  className="text-slate-400 hover:text-slate-600 text-sm px-1 font-bold"
                  title="Clear test focus"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <AIMessageItem
            key={msg.id}
            message={msg}
            onFollowUpClick={prompt => handleSend(prompt)}
          />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-200 w-fit shadow-xs">
            <Sparkles className="w-4 h-4 text-[#2BBBD7] animate-spin" />
            <span className="font-semibold">Evaluating structured clinical record and provenance...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips (Scrollable horizontal row) */}
      <div className="px-4 py-2.5 border-t border-slate-200/80 bg-white shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-[#eaf9fc] text-slate-700 hover:text-[#186d88] border border-slate-200 hover:border-[#2BBBD7] transition-all cursor-pointer text-xs font-bold shrink-0 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-200/90 shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder={
              selectedTest 
                ? `Ask about ${selectedTest.testName} (e.g. "Why is it ${selectedTest.status.toLowerCase()}?")...`
                : "Ask about this patient record..."
            }
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#218DAE] focus:bg-white transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className={`p-3 rounded-2xl text-white transition-all cursor-pointer ${
              inputQuery.trim() && !isTyping
                ? 'bg-[#218DAE] hover:bg-[#186d88] shadow-sm shadow-[#218DAE]/25'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-slate-400 text-center mt-2.5 font-medium">
          Strict non-diagnostic clinical assistant. Governed by MedLens safety protocols.
        </p>
      </div>
    </aside>
  );
};
