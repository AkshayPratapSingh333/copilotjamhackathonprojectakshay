export class SpeechProcessor {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      this.onTranscript(transcript);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start(); // Continue listening
      }
    };
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, voiceName?: string): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceName) {
      const voices = this.synthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Capture speech events for lip sync
    utterance.onstart = () => {
      document.dispatchEvent(new CustomEvent('speechStart', { detail: text }));
    };

    utterance.onend = () => {
      document.dispatchEvent(new CustomEvent('speechEnd'));
    };

    this.synthesis.speak(utterance);
  }

  private onTranscript(transcript: string) {
    // Dispatch event for new transcript
    document.dispatchEvent(new CustomEvent('userSpeech', { detail: transcript }));
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }
}