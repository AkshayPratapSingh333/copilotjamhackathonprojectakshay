declare module 'simple-peer' {
  export interface SignalData {
    type?: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp?: string;
    candidate?: RTCIceCandidateInit;
    renegotiate?: boolean;
    transceiverRequest?: {
      kind: string;
      init: RTCRtpTransceiverInit;
    };
    [key: string]: any;
  }

  export default class SimplePeer {
    constructor(opts?: SimplePeer.Options);
    
    signal(data: SignalData): void;
    send(data: string | Buffer | ArrayBufferView): void;
    destroy(): void;
    
    on(event: 'signal', listener: (data: SignalData) => void): this;
    on(event: 'connect', listener: () => void): this;
    on(event: 'data', listener: (data: Buffer) => void): this;
    on(event: 'stream', listener: (stream: MediaStream) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    
    readonly destroyed: boolean;
    readonly _pc: RTCPeerConnection;
    
    static WEBRTC_SUPPORT: boolean;
  }

  namespace SimplePeer {
    export interface Options {
      initiator?: boolean;
      channelConfig?: RTCDataChannelInit;
      channelName?: string;
      config?: RTCConfiguration;
      constraints?: MediaStreamConstraints;
      offerConstraints?: RTCOfferOptions;
      answerConstraints?: RTCAnswerOptions;
      sdpTransform?: (sdp: string) => string;
      stream?: MediaStream;
      streams?: MediaStream[];
      trickle?: boolean;
      allowHalfTrickle?: boolean;
      iceCompleteTimeout?: number;
    }

    export interface Instance {
      signal(data: SignalData): void;
      send(data: string | Buffer | ArrayBufferView): void;
      destroy(): void;
      
      on(event: 'signal', listener: (data: SignalData) => void): this;
      on(event: 'connect', listener: () => void): this;
      on(event: 'data', listener: (data: Buffer) => void): this;
      on(event: 'stream', listener: (stream: MediaStream) => void): this;
      on(event: 'close', listener: () => void): this;
      on(event: 'error', listener: (err: Error) => void): this;
      
      readonly destroyed: boolean;
      readonly _pc: RTCPeerConnection;
    }
  }

  export = SimplePeer;
}