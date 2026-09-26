// Helper for browser SpeechSynthesis and SpeechRecognition

export function speakText(
  text: string,
  onEnd?: () => void,
  rate = 0.9,
  pitch = 1.0
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis is not supported in this browser.");
    if (onEnd) onEnd();
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown formatting symbols like asterisks for clean pronunciation
  const cleanText = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#/g, "")
    .replace(/\[|\]/g, "")
    .replace(/\(.*?\)/g, "");

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = rate; // slightly slower for literacy comprehension
  utterance.pitch = pitch;

  // Try to pick an English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((v) => v.lang.startsWith("en-GB")) ||
    voices.find((v) => v.lang.startsWith("en-US")) ||
    voices.find((v) => v.lang.startsWith("en"));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

// Browser Speech Recognition for voice-to-text
export function createSpeechRecognizer(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: any) => void,
  onEnd: () => void
) {
  if (typeof window === "undefined") return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("SpeechRecognition is not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const currentText = finalTranscript || interimTranscript;
    onResult(currentText, Boolean(finalTranscript));
  };

  recognition.onerror = (event: any) => {
    console.warn("Speech recognition error:", event.error);
    onError(event);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
